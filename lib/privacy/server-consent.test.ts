import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as receipts from "./receipt";
import * as transitions from "./consent-transition";
import { CONSENT_LIFETIME_MS, CONSENT_VERSION } from "./consent";

const key = Buffer.alloc(32, 7);
type SessionRow = transitions.SessionRow;
type ReceiptRow = transitions.ReceiptRow;
function load(filename: string, dependencies: Record<string, unknown>) {
  const exports: Record<string, (...args: any[]) => Promise<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, { exports, Date, Buffer, require(id: string) {
    if (!(id in dependencies)) throw new Error("Forbidden dependency: " + id);
    return dependencies[id];
  } });
  return exports;
}
function harness() {
  let row: SessionRow | undefined;
  const records = new Map<string, ReceiptRow>();
  const attributed = new Set<string>();
  let writes = 0, reads = 0, unavailable = false;
  let afterSessionLock: (() => void) | undefined;
  const db = {
    async $queryRaw(sql: TemplateStringsArray, ...values: unknown[]) {
      if (unavailable) throw new Error("offline"); reads++;
      const query = sql.join("?");
      if (query.includes('FROM "AdvertisingConsentSession"')) {
        afterSessionLock?.();
        if (!row || row.id !== values[0]) return [];
        if (values.length > 1 && (row.revision !== values[1] || row.activeReceiptId !== values[2])) return [];
        return [{ ...row }];
      }
      if (query.includes('FROM "AdvertisingConsent"')) {
        const r = records.get(values[0] as string);
        if (!r) return [];
        if (query.includes('"revokedAt" IS NULL') && (r.revokedAt || r.expiresAt.getTime() <= Date.now() ||
          r.sessionId !== values[1] || r.revision !== values[2] || r.version !== values[3] ||
          r.issuedAt.getTime() !== (values[4] as Date).getTime() || r.expiresAt.getTime() !== (values[5] as Date).getTime())) return [];
        return [{ ...r }];
      }
      throw new Error("Unexpected query " + query);
    },
    async $executeRaw(sql: TemplateStringsArray, ...v: unknown[]) {
      if (unavailable) throw new Error("offline"); writes++;
      const query = sql.join("?");
      if (query.startsWith('INSERT INTO "AdvertisingConsentSession"')) row = { id: v[0] as string, revision: 0, activeReceiptId: null, lastGrantAt: null };
      else if (query.startsWith('INSERT INTO "AdvertisingConsent"')) records.set(v[0] as string, {
        id: v[0] as string, sessionId: v[1] as string, revision: v[2] as number, version: v[3] as string,
        issuedAt: v[4] as Date, expiresAt: v[5] as Date, revokedAt: null,
      });
      else if (query.startsWith('UPDATE "AdvertisingConsentSession"')) row = { id: v[3] as string, revision: v[0] as number, activeReceiptId: v[1] as string | null, lastGrantAt: v[2] as Date | null };
      else if (query.startsWith('UPDATE "AdvertisingConsent"')) records.get(v[1] as string)!.revokedAt = v[0] as Date;
      else throw new Error("Unexpected write " + query);
      return 1;
    },
    portalLead: { async updateMany({ where }: { where: { id: number } }) { attributed.add("lead:" + where.id); } },
    whatsAppLeadIntent: { async updateMany({ where }: { where: { id: number } }) { attributed.add("whatsapp:" + where.id); } },
    async $transaction(fn: (tx: unknown) => Promise<unknown>) { if (unavailable) throw new Error("offline"); return fn(db); },
  };
  const api = load("lib/privacy/server-consent.ts", {
    "./receipt": { ...receipts, signingKey: () => key }, "./consent-transition": transitions, "../prisma": { prisma: db },
  });
  const route = load("app/api/privacy/consent/route.ts", {
    "next/server": { NextResponse: { json(body: unknown, init: unknown) {
      const cookies: unknown[][] = [];
      return { body, ...(init as object), cookies: { set: (...args: unknown[]) => cookies.push(args) }, cookieWrites: cookies };
    } } },
    "../../../../lib/privacy/server-consent": api,
    "../../../../lib/privacy/consent-transition": transitions,
    "../../../../lib/privacy/receipt": { ...receipts, signingKey: () => key },
    "../../../../lib/privacy/consent": { CONSENT_VERSION },
  });
  return { api, route, attributed, writes: () => writes, reads: () => reads, offline: () => { unavailable = true; },
    afterSessionLock: (action: () => void) => { afterSessionLock = action; } };
}
const request = (session?: receipts.ConsentSession, token?: string, body?: object, origin = "https://portal.test") => ({
  nextUrl: new URL("https://portal.test/api/privacy/consent"),
  headers: { get: (name: string) => name === "origin" ? origin : null },
  cookies: { get: (name: string) => {
    const value = name === receipts.SESSION_COOKIE && session ? receipts.signPayload(session, key) : name === receipts.RECEIPT_COOKIE ? token : undefined;
    return value ? { value } : undefined;
  } },
  json: async () => body,
});

test("server integration reuses grant, revokes and blocks replay without renewal", async () => {
  const h = harness(); const session = receipts.newSession();
  const grant = await h.api.changeConsent(session, true, 0);
  const writes = h.writes();
  const repeated = await h.api.changeConsent(grant.session, true, grant.session.revision);
  assert.equal(repeated.issued.token, grant.issued.token); assert.equal(h.writes(), writes);
  const fields = { advertisingConsent: true, gclid: "click" };
  await h.api.attachAttribution(request(grant.session, grant.issued.token), fields, "lead", 1);
  await h.api.attachAttribution(request(grant.session, grant.issued.token), fields, "whatsapp", 2);
  assert.equal(h.attributed.size, 2);
  const current = await h.api.readConsent(grant.session, grant.issued.token);
  assert.equal(current.receipt.id, grant.issued.receipt.id); assert.equal(h.writes(), writes);
  const denied = await h.api.changeConsent(session, false, 0);
  const revokedWrites = h.writes();
  await h.api.changeConsent(denied.session, false, denied.session.revision);
  assert.equal(h.writes(), revokedWrites);
  await h.api.attachAttribution(request(grant.session, grant.issued.token), fields, "lead", 3);
  assert.equal(h.attributed.size, 2);
  assert.equal((await h.api.readConsent(grant.session, grant.issued.token)).receipt, null);
});
test("missing, forged, mismatched and locally denied tokens never reach database", async () => {
  const h = harness(); const s = receipts.newSession(); const grant = receipts.issueReceipt(key, Date.now(), s);
  const past = Date.now() - CONSENT_LIFETIME_MS - 1;
  const expired = receipts.issueReceipt(key, past, receipts.newSession(past));
  for (const req of [request(), request(s, "forged"), request(s, expired.token), request(receipts.newSession(), grant.token), request({ ...s, revision: 1 }, grant.token)])
    await h.api.attachAttribution(req, { advertisingConsent: true, gclid: "x" }, "lead", 1);
  await h.api.attachAttribution(request(s, grant.token), { advertisingConsent: false, gclid: "x" }, "lead", 1);
  await h.api.attachAttribution(request(s, grant.token), { advertisingConsent: true }, "lead", 1);
  assert.equal(h.reads(), 0); assert.equal(h.writes(), 0);
});
test("offline attribution is suppressed and changes are not confirmed", async () => {
  const h = harness(); const grant = await h.api.changeConsent(receipts.newSession(), true, 0);
  h.offline();
  await h.api.attachAttribution(request(grant.session, grant.issued.token), { advertisingConsent: true, gclid: "x" }, "lead", 1);
  assert.equal(h.attributed.size, 0);
  await assert.rejects(h.api.changeConsent(grant.session, false, 1));
  await assert.rejects(h.api.readConsent(grant.session, grant.issued.token));
});

test("session expiring while waiting for the database lock cannot authorize attribution", async () => {
  const h = harness();
  const now = Date.now();
  const session = receipts.newSession(now - CONSENT_LIFETIME_MS + 1000);
  const grant = await h.api.changeConsent(session, true, 0);
  const originalNow = Date.now;
  h.afterSessionLock(() => { Date.now = () => now + 1001; });
  try {
    await h.api.attachAttribution(request(grant.session, grant.issued.token),
      { advertisingConsent: true, gclid: "expired-session" }, "lead", 1);
    assert.equal(h.attributed.size, 0);
  } finally { Date.now = originalNow; }
});
test("endpoint bootstrap is write-free; signed session, origin, revisions and cookies are enforced", async () => {
  const h = harness(); const bootstrap = await h.route.GET(request());
  assert.equal(bootstrap.status, 200); assert.equal(h.reads(), 0); assert.equal(h.writes(), 0);
  const s = receipts.verifySession(bootstrap.body.sessionToken, key)!;
  assert.equal(bootstrap.body.advertising, false);
  assert.equal(bootstrap.cookieWrites.length, 1);
  assert.equal(bootstrap.cookieWrites[0][0], receipts.SESSION_COOKIE);
  assert.equal(bootstrap.cookieWrites[0][1], bootstrap.body.sessionToken);
  const body = { advertising: true, version: CONSENT_VERSION, expectedRevision: 0, sessionToken: bootstrap.body.sessionToken };
  assert.equal((await h.route.POST(request(s, undefined, body, "https://evil.test"))).status, 403);
  assert.equal((await h.route.POST(request(s, undefined, { ...body, expectedRevision: -1 }))).status, 400);
  assert.equal((await h.route.POST(request(receipts.newSession(), undefined, body))).status, 409);
  assert.equal((await h.route.POST(request(undefined, undefined, body))).status, 409);
  const grant = await h.route.POST(request(s, undefined, body));
  assert.equal(grant.status, 200); assert.equal(grant.body.revision, 1);
  for (const cookie of grant.cookieWrites) { assert.equal(cookie[2].httpOnly, true); assert.equal(cookie[2].secure, true); assert.equal(cookie[2].sameSite, "lax"); }
  assert.equal((await h.route.POST(request(s, undefined, body))).status, 409);
  h.offline();
  const failure = await h.route.POST(request(s, undefined, { ...body, advertising: false }));
  assert.equal(failure.status, 503); assert.equal(failure.cookieWrites.length, 0);
});
