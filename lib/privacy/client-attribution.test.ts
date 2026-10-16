import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createChoice, type Choice } from "./consent";

test("attribution requires verified in-memory choice, caches without repeated writes and clears on denial", () => {
  let choice: Choice | null = null, writes = 0, broken = false;
  const stored = new Map<string, string>();
  const browser = { location: { href: "https://portal.test/comprar?utm_source=google&gclid=click" }, sessionStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem(key: string, value: string) { if (broken) throw new Error("quota"); writes++; stored.set(key, value); },
    removeItem: (key: string) => stored.delete(key),
  } };
  const exports: { clientAttribution?: () => Record<string, string> } = {};
  const compiled = ts.transpileModule(readFileSync("lib/privacy/client-attribution.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, { exports, window: browser, URL, require(id: string) {
    if (id === "./browser-consent") return { browserConsent: () => ({ current: () => choice }) };
    throw new Error("Forbidden dependency: " + id);
  } });
  const collect = exports.clientAttribution!;
  assert.equal(Object.keys(collect()).length, 0);
  choice = createChoice(true);
  assert.equal(collect().gclid, "click"); assert.equal(writes, 1);
  collect(); assert.equal(writes, 1);
  browser.location.href = "https://portal.test/imovel/123";
  assert.equal(collect().utmSource, "google");
  choice = null;
  assert.equal(Object.keys(collect()).length, 0); assert.equal(stored.size, 0);
  choice = createChoice(true); broken = true;
  browser.location.href = "https://portal.test/comprar?gclid=new";
  assert.equal(Object.keys(collect()).length, 0);
});
