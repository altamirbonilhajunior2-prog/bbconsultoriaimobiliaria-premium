import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

import { operationalSource, sanitizeWhatsAppTarget } from "./attribution";

function loadRoute(
  filename: string,
  prisma: Record<string, unknown>,
  attachAttribution: (...args: unknown[]) => Promise<void> = async () => {},
): Record<string, (...args: never[]) => Promise<unknown>> {
  const source = readFileSync(path.join(process.cwd(), filename), "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  const exports: Record<string, (...args: never[]) => Promise<unknown>> = {};
  const context = {
    exports,
    process,
    URL,
    Date,
    Set,
    require(id: string) {
      if (id === "next/server") return {
        NextResponse: {
          json(body: unknown, init?: { status?: number }) {
            return { body, status: init?.status ?? 200 };
          },
          redirect(url: URL, status: number) {
            return { status, location: url.toString(), headers: { set() {} } };
          },
        },
      };
      if (id.endsWith("/privacy/server-consent")) return { attachAttribution, emptyAttribution: { referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, gclid: null } };
      if (id.endsWith("/privacy/whatsapp-intent")) return {
        interactionId: () => "00000000-0000-4000-8000-000000000001",
        recordWhatsAppIntent: async (input: { sourcePage: string }) => {
          const db = prisma as { whatsAppLeadIntent: { create: (args: unknown) => Promise<{ id: number }> } };
          const row = await db.whatsAppLeadIntent.create({ data: { sourcePage: operationalSource(input.sourcePage),
            referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, gclid: null } });
          return { ...row, created: true };
        },
      };
      if (id.endsWith("/prisma")) return { prisma };
      if (id.endsWith("/leads/consent")) return {
        PORTAL_LEAD_CONSENT_VERSION: "contact-v1",
        PORTAL_LEAD_CONSENT_TEXT: "Contact permission",
      };
      if (id.endsWith("/privacy/attribution")) {
        return { operationalSource, sanitizeWhatsAppTarget };
      }
      throw new Error("Unexpected dependency: " + id);
    },
  };
  vm.runInNewContext(compiled, context, { filename });
  return exports;
}

test("operational page excludes campaign parameters and nonpublic paths", () => {
  assert.equal(operationalSource("/imovel/abc?gclid=secret&utm_source=ads"), "/imovel/abc");
  assert.equal(operationalSource("/admin/clientes?gclid=secret"), "/");
  assert.equal(operationalSource("https://other.example/imovel/abc?gclid=secret"), "/");
  assert.equal(operationalSource("/comprar?utm_campaign=test"), "/comprar");
});

test("lead API keeps contact and operational page without consent does not persist attribution", async () => {
  let saved: Record<string, unknown> | undefined;
  const tx = {
    $queryRawUnsafe: async () => undefined,
    agent: { findMany: async () => [] },
    portalLead: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        saved = data;
        return { id: 7 };
      },
    },
  };
  const prisma = {
    portalLead: { findFirst: async () => null },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback(tx),
  };
  const route = loadRoute("app/api/leads/route.ts", prisma);
  const request = {
    headers: { get: () => null },
    nextUrl: new URL("https://www.bbconsultoriaimoveis.com.br/api/leads"),
    json: async () => ({
      name: "Maria Silva", phone: "12978140636", consent: true,
      sourcePage: "/comprar?utm_campaign=private&gclid=private",
      referrer: "https://ad.example/?gclid=private",
      utmSource: "private", utmMedium: "private", utmCampaign: "private",
      utmTerm: "private", utmContent: "private", gclid: "private",
    }),
  };
  const result = await route.POST(request as never) as { status: number };
  assert.equal(result.status, 201);
  assert.equal(saved?.name, "Maria Silva");
  assert.equal(saved?.phone, "5512978140636");
  assert.equal(saved?.sourcePage, "/comprar");
  for (const key of ["referrer", "utmSource", "utmMedium", "utmCampaign",
    "utmTerm", "utmContent", "gclid"]) assert.equal(saved?.[key], null, key);
});

test("WhatsApp API retains operational CRM intent and strips campaign data", async () => {
  let saved: Record<string, unknown> | undefined;
  let duplicateSource: unknown;
  const prisma = {
    property: { findFirst: async () => null },
    whatsAppLeadIntent: {
      findFirst: async ({ where }: { where: { sourcePage: string } }) => {
        duplicateSource = where.sourcePage;
        return null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        saved = data;
        return { id: 8 };
      },
    },
  };
  const route = loadRoute("app/api/whatsapp-redirect/route.ts", prisma);
  const target = encodeURIComponent("https://wa.me/5512978140636?text=Oi&utm_source=ads&gclid=secret");
  const nextUrl = new URL("https://www.bbconsultoriaimoveis.com.br/api/whatsapp-redirect?target=" +
    target + "&sourcePage=" + encodeURIComponent("/comprar?gclid=secret") +
    "&referrer=private&utmSource=private&utmMedium=private&utmCampaign=private" +
    "&utmTerm=private&utmContent=private&gclid=private");
  const result = await route.GET({ nextUrl } as never) as {
    status: number; location: string;
  };
  assert.equal(result.status, 307);
  assert.equal(saved?.sourcePage, "/comprar");
  assert.equal(duplicateSource, undefined); // Never merge by page or visitor.
  for (const key of ["referrer", "utmSource", "utmMedium", "utmCampaign",
    "utmTerm", "utmContent", "gclid"]) assert.equal(saved?.[key], null, key);
  assert.equal(new URL(result.location).searchParams.get("text"), "Oi");
  assert.equal(new URL(result.location).searchParams.has("gclid"), false);
  assert.equal(new URL(result.location).searchParams.has("utm_source"), false);
});

test("invalid WhatsApp destination is still rejected", async () => {
  const route = loadRoute("app/api/whatsapp-redirect/route.ts", {});
  const result = await route.GET({
    nextUrl: new URL("https://www.bbconsultoriaimoveis.com.br/api/whatsapp-redirect?target=https://evil.example/"),
  } as never) as { status: number };
  assert.equal(result.status, 400);
});

test("sanitizer retains message, phone, and approved host only", () => {
  const result = sanitizeWhatsAppTarget("https://api.whatsapp.com/send?phone=5512978140636&text=Oi&gclid=secret");
  assert.ok(result);
  assert.equal(new URL(result).searchParams.get("phone"), "5512978140636");
  assert.equal(new URL(result).searchParams.has("gclid"), false);
});

test("lead route submits campaigns to the server verifier only after operational creation", async () => {
  let created = false;
  let verified = false;
  const tx = {
    $queryRawUnsafe: async () => undefined,
    agent: { findMany: async () => [] },
    portalLead: { findFirst: async () => null, create: async () => { created = true; return { id: 19 }; } },
  };
  const route = loadRoute("app/api/leads/route.ts", {
    portalLead: { findFirst: async () => null },
    $transaction: async (fn: (tx: unknown) => unknown) => fn(tx),
  }, async (_request, body, kind, id) => {
    assert.ok(created); assert.equal(kind, "lead"); assert.equal(id, 19);
    assert.equal((body as Record<string, unknown>).gclid, "google-click"); verified = true;
  });
  const result = await route.POST({
    headers: { get: () => null }, nextUrl: new URL("https://portal.test/api/leads"),
    json: async () => ({ name: "Maria Silva", phone: "12978140636", consent: true,
      sourcePage: "/comprar", advertisingConsent: true, gclid: "google-click" }),
  } as never) as { status: number };
  assert.equal(result.status, 201); assert.ok(verified);
});

test("WhatsApp redirect passes campaigns to verifier and still redirects on database failure", async () => {
  let verified = false;
  const request = { nextUrl: new URL("https://portal.test/api/whatsapp-redirect?target=https://wa.me/5511999999999&advertisingConsent=true&gclid=google-click") };
  const route = loadRoute("app/api/whatsapp-redirect/route.ts", {
    whatsAppLeadIntent: { findFirst: async () => null, create: async () => ({ id: 20 }) },
  }, async (_request, body, kind, id) => {
    assert.equal(kind, "whatsapp"); assert.equal(id, 20);
    assert.equal((body as Record<string, unknown>).gclid, "google-click"); verified = true;
  });
  assert.equal((await route.GET(request as never) as { status: number }).status, 307);
  assert.ok(verified);
  const offline = loadRoute("app/api/whatsapp-redirect/route.ts", {
    whatsAppLeadIntent: { create: async () => { throw new Error("offline"); } },
  });
  assert.equal((await offline.GET(request as never) as { status: number }).status, 307);
});

test("WhatsApp POST cannot bypass consent by sending raw campaign fields", async () => {
  let saved: Record<string, unknown> | undefined;
  let checked = false;
  const route = loadRoute("app/api/whatsapp-intents/route.ts", {
    whatsAppLeadIntent: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => { saved = data; return { id: 21 }; },
    },
  }, async () => { checked = true; });
  const result = await route.POST({
    headers: { get: () => null }, nextUrl: new URL("https://portal.test/api/whatsapp-intents"),
    json: async () => ({ sourcePage: "/comprar?gclid=secret", gclid: "secret", utmCampaign: "secret" }),
  } as never) as { status: number };
  assert.equal(result.status, 201); assert.ok(checked);
  assert.equal(saved?.sourcePage, "/comprar"); assert.equal(saved?.gclid, null);
  assert.equal(saved?.utmCampaign, null);
});
