import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { operationalSource } from "./attribution";
import { interactionId } from "./whatsapp-intent";

test("WhatsApp retries share one record while unrelated interactions remain distinct", async () => {
  const records = new Map<string, { id: number; sourcePage: string; propertyId: number; propertyCode: string }>();
  let propertyReads = 0;
  let queue: Promise<unknown> = Promise.resolve();
  const tx = {
    property: { async findFirst({ where }: { where: { code: string } }) {
      propertyReads++; return { id: where.code === "BB1" ? 1 : 2, code: where.code };
    } },
    async $queryRaw(sql: TemplateStringsArray, ...values: unknown[]) {
      const query = sql.join("?");
      if (query.includes("pg_advisory_xact_lock")) return [];
      const key = values[0] as string;
      if (query.startsWith("SELECT")) return records.has(key) ? [records.get(key)] : [];
      if (!query.startsWith("INSERT")) throw new Error("Unexpected query");
      assert.equal(records.has(key), false);
      const record = { id: records.size + 1, sourcePage: values[3] as string,
        propertyId: values[1] as number, propertyCode: values[2] as string };
      records.set(key, record); return [record];
    },
  };
  const db = { $transaction(fn: (tx: unknown) => Promise<unknown>) {
    const work = queue.then(() => fn(tx)); queue = work.catch(() => {}); return work;
  } };
  const exports: { recordWhatsAppIntent?: (input: { interactionId: string; sourcePage: string; propertyCode: string }) => Promise<{ id: number; created: boolean }> } = {};
  const compiled = ts.transpileModule(readFileSync("lib/privacy/whatsapp-intent.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, { exports, require(id: string) {
    if (id === "node:crypto") return { randomUUID };
    if (id === "./attribution") return { operationalSource };
    if (id === "../prisma") return { prisma: db };
    throw new Error("Forbidden dependency " + id);
  } });
  const input = { interactionId: randomUUID(), sourcePage: "/comprar?gclid=secret", propertyCode: "BB1" };
  const [a, b] = await Promise.all([exports.recordWhatsAppIntent!(input), exports.recordWhatsAppIntent!(input)]);
  assert.equal(a.id, b.id); assert.equal(a.created, true); assert.equal(b.created, false);
  const other = await exports.recordWhatsAppIntent!({ ...input, interactionId: randomUUID() });
  assert.notEqual(other.id, a.id); assert.equal(records.size, 2); assert.equal(propertyReads, 2);
  assert.ok([...records.values()].every(r => r.sourcePage === "/comprar"));
  assert.ok([...records.values()].every(r => r.propertyId === 1 && r.propertyCode === "BB1"));
  const otherProperty = { ...input, interactionId: randomUUID(), propertyCode: "BB2", sourcePage: "/imovel/bb2" };
  await exports.recordWhatsAppIntent!(otherProperty);
  assert.equal(records.get(otherProperty.interactionId)?.propertyId, 2);
  assert.equal(records.get(otherProperty.interactionId)?.propertyCode, "BB2");
  assert.equal(records.get(input.interactionId)?.propertyId, 1);
  assert.equal(records.size, 3);
});
test("interaction ids reject malformed input and never derive identity from source page", () => {
  const id = randomUUID(); assert.equal(interactionId(id.toUpperCase()), id);
  assert.notEqual(interactionId(undefined), interactionId(undefined));
  for (const value of ["/comprar", "-".repeat(36), 7, {}]) assert.throws(() => interactionId(value));
});
