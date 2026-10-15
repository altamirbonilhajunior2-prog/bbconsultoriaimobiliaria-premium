import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("WhatsApp clicks keep destination and property, reuse retries, and separate buyers", () => {
  type Click = { defaultPrevented: boolean; currentTarget: { href: string } };
  type Anchor = { href: string; onClick: (event: Click) => void };
  const exports = {} as { default: (props: { href: string }) => Anchor };
  const browser = { location: { href: "https://portal.test/imovel/bb1" } };
  let fields: Record<string, string> = {}, events = 0;
  const compiled = ts.transpileModule(readFileSync("app/components/TrackedWhatsAppLink.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(compiled, { exports, window: browser, URL, URLSearchParams, Date,
    crypto: { randomUUID }, require(id: string) {
      if (id === "react") return { useRef: () => ({ current: null }) };
      if (id === "react/jsx-runtime") return { jsx: (_tag: string, props: Anchor) => props };
      if (id.endsWith("/client-attribution")) return { clientAttribution: () => fields };
      if (id === "./whatsappTracking") return { trackWhatsAppClick: () => { events++; } };
      throw new Error("Forbidden dependency: " + id);
    } });
  const href = "https://wa.me/5511999999999?text=Ol%C3%A1&gclid=untrusted";
  const first = exports.default({ href });
  function click(anchor: Anchor) {
    const event = { defaultPrevented: false, currentTarget: { href: anchor.href } };
    anchor.onClick(event);
    return new URL(event.currentTarget.href, "https://portal.test");
  }
  const a = click(first), retry = click(first), buyer = click(exports.default({ href }));
  assert.equal(a.searchParams.get("interactionId"), retry.searchParams.get("interactionId"));
  assert.notEqual(a.searchParams.get("interactionId"), buyer.searchParams.get("interactionId"));
  assert.equal(events, 2);
  assert.equal(a.searchParams.get("propertyCode"), "BB1");
  assert.equal(a.searchParams.has("gclid"), false);
  const target = new URL(a.searchParams.get("target")!);
  assert.equal(target.hostname, "wa.me"); assert.equal(target.searchParams.get("text"), "Olá");
  assert.equal(target.searchParams.has("gclid"), false);
  browser.location.href = "https://portal.test/imovel/bb2";
  fields = { advertisingConsent: "true", gclid: "consented-click" };
  const otherProperty = click(first);
  assert.notEqual(otherProperty.searchParams.get("interactionId"), a.searchParams.get("interactionId"));
  assert.equal(otherProperty.searchParams.get("propertyCode"), "BB2");
  assert.equal(otherProperty.searchParams.get("gclid"), "consented-click");
});
