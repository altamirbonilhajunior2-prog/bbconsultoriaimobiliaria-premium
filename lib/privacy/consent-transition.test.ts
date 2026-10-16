import assert from "node:assert/strict";
import test from "node:test";
import { ConsentConflict, transitionConsent, type SessionRow, type ReceiptRow, type TransitionStore } from "./consent-transition";
import { newSession, verifyCurrentReceipt, verifyReceipt, verifySession, signPayload, issueReceipt, type ConsentSession } from "./receipt";
import { CONSENT_LIFETIME_MS } from "./consent";

const key = Buffer.alloc(32, 7);
const now = 100000;
function harness() {
  const session = newSession(now);
  let row: SessionRow = { id: session.id, revision: 0, activeReceiptId: null, lastGrantAt: null };
  let receipts = new Map<string, ReceiptRow>();
  let writes = 0;
  let fail = "";
  let queue = Promise.resolve();
  const step = (name: string) => { if (fail === name) throw new Error(name); };
  const store: TransitionStore = {
    async lock() { step("lock"); return { ...row }; },
    async receipt(id) { step("receipt"); return receipts.get(id) ?? null; },
    async revoke(id, at) { step("revoke"); receipts.get(id)!.revokedAt = at; writes++; },
    async create(r) { step("create"); receipts.set(r.id, { ...r, issuedAt: new Date(r.issuedAt), expiresAt: new Date(r.expiresAt), revokedAt: null }); writes++; },
    async update(id, revision, activeReceiptId, lastGrantAt) { step("update"); row = { id, revision, activeReceiptId, lastGrantAt }; writes++; },
  };
  function run(s: ConsentSession, advertising: boolean, time = now) {
    const work = queue.then(async () => {
      const snapshot = structuredClone({ row, receipts, writes });
      try { return await transitionConsent(store, s, advertising, s.revision, key, time); }
      catch (error) { ({ row, receipts, writes } = snapshot); throw error; }
    });
    queue = work.then(() => {}, () => {});
    return work;
  }
  return { session, run, row: () => row, receipts: () => receipts, writes: () => writes, fail: (name: string) => { fail = name; } };
}

test("initial denial fences a late grant; repeated denials do not write", async () => {
  const h = harness();
  const denied = await h.run(h.session, false);
  assert.equal(denied.session.revision, 1);
  await h.run(h.session, false);
  await h.run(denied.session, false);
  assert.equal(h.writes(), 1);
  await assert.rejects(h.run(h.session, true), ConsentConflict);
});
test("grant then stale revocation is denied regardless of response delivery order", async () => {
  const h = harness();
  const [grant, denied] = await Promise.all([h.run(h.session, true), h.run(h.session, false)]);
  assert.ok(grant.issued);
  assert.equal(denied.session.revision, 2);
  assert.equal(verifyCurrentReceipt(grant.issued.token, key, grant.session, h.row(), now), null);
  assert.ok(h.receipts().get(grant.issued.receipt.id)!.revokedAt);
  await assert.rejects(h.run(h.session, true), ConsentConflict);
});
test("concurrent grants produce one receipt; reuse preserves expiry and does not write", async () => {
  const h = harness();
  const results = await Promise.allSettled([h.run(h.session, true), h.run(h.session, true)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  const first = results[0]; assert.equal(first.status, "fulfilled");
  const writes = h.writes();
  const repeated = await h.run(first.value.session, true, now + 1000);
  assert.deepEqual(repeated.issued, first.value.issued);
  assert.equal(h.writes(), writes);
});
test("regrant requires current revision and cooldown, never revives old receipt", async () => {
  const h = harness(); const grant = await h.run(h.session, true);
  const denied = await h.run(grant.session, false);
  await assert.rejects(h.run(denied.session, true), (e: unknown) => e instanceof ConsentConflict && e.status === 429);
  const next = await h.run(denied.session, true, now + 30000);
  assert.ok(next.issued); assert.ok(grant.issued);
  assert.notEqual(next.issued.receipt.id, grant.issued.receipt.id);
  assert.equal(verifyCurrentReceipt(grant.issued.token, key, next.session, h.row(), now + 30000), null);
});
for (const failure of ["lock", "create", "update"]) test(`grant failure at ${failure} rolls back and never confirms`, async () => {
  const h = harness(); h.fail(failure);
  await assert.rejects(h.run(h.session, true));
  assert.equal(h.row().revision, 0); assert.equal(h.receipts().size, 0); assert.equal(h.writes(), 0);
});
for (const failure of ["receipt", "revoke", "update"]) test(`revocation failure at ${failure} rolls back and allows retry`, async () => {
  const h = harness(); const grant = await h.run(h.session, true); h.fail(failure);
  await assert.rejects(h.run(grant.session, false));
  assert.equal(h.row().revision, 1); assert.equal(h.receipts().get(grant.issued!.receipt.id)!.revokedAt, null);
  h.fail(""); await h.run(grant.session, false); assert.equal(h.row().activeReceiptId, null);
});
test("signed receipts require session, revision, active id, lifetime and authentic signature", async () => {
  const h = harness(); const grant = await h.run(h.session, true); const token = grant.issued!.token;
  assert.ok(verifyCurrentReceipt(token, key, grant.session, h.row(), now));
  assert.equal(verifyCurrentReceipt(token, key, newSession(now), h.row(), now), null);
  assert.equal(verifyCurrentReceipt(token, key, grant.session, { ...h.row(), activeReceiptId: null }, now), null);
  assert.equal(verifyCurrentReceipt(token, key, h.session, h.row(), now), null);
  assert.equal(verifyReceipt(token, key, now + CONSENT_LIFETIME_MS), null);
  assert.equal(verifyReceipt(token, key, now - 1), null);
  assert.equal(verifyReceipt(token + "x", key, now), null);
  assert.equal(verifyReceipt(token, Buffer.alloc(32, 8), now), null);
  assert.equal(verifySession(token, key, now), null);
  assert.equal(verifyReceipt(signPayload(grant.session, key), key, now), null);
  for (const invalid of [{ id: "-".repeat(36) }, { sessionId: "invalid" }, { revision: -1 }, { revision: 0.5 },
    { purpose: "other" }, { version: "old" }, { expiresAt: now + 1 }, { issuedAt: now + 1 }]) {
    const malformed = { ...grant.issued!.receipt, ...invalid };
    assert.equal(verifyReceipt(signPayload(malformed as NonNullable<typeof grant.issued>["receipt"], key), key, now), null);
  }
  assert.throws(() => issueReceipt(key, now + CONSENT_LIFETIME_MS, h.session));
});
