import assert from "node:assert/strict";
import test from "node:test";
import { createChoice, parseChoice } from "./consent";
import { issueReceipt, verifyReceipt } from "./receipt";

test("browser clock tolerance is bounded and preserves the original timestamps", () => {
  const now = 1_800_000_000_000;
  for (const ahead of [52_000, 300_000]) {
    const choice = createChoice(true, now + ahead);
    assert.deepEqual(parseChoice(JSON.stringify(choice), now), choice);
  }
  assert.equal(parseChoice(JSON.stringify(createChoice(true, now + 300_001)), now), null);
  const choice = createChoice(true, now);
  assert.equal(parseChoice(JSON.stringify(choice), choice.expiresAt), null);
  assert.equal(parseChoice(JSON.stringify({ ...choice, expiresAt: choice.expiresAt + 1 }), now), null);
  assert.equal(parseChoice(JSON.stringify({ ...choice, decidedAt: -1 }), now), null);
});

test("browser tolerance does not relax server verification of signed receipts", () => {
  const now = 1_800_000_000_000;
  const key = Buffer.alloc(32, 7);
  const future = issueReceipt(key, now + 52_000);
  assert.equal(verifyReceipt(future.token, key, now), null);
  const current = issueReceipt(key, now);
  assert.ok(verifyReceipt(current.token, key, now));
  assert.equal(verifyReceipt(current.token, key, current.receipt.expiresAt), null);
});
