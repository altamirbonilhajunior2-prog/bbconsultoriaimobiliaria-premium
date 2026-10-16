import assert from "node:assert/strict";
import test from "node:test";

import { matchesGrantConfirmation } from "./advertising";
import { createChoice } from "./consent";

test("release interlock requires valid advertising confirmation", () => {
  const choice = createChoice(true);
  const pending = { requestId: "request-1", revision: choice.revision };
  assert.equal(matchesGrantConfirmation(
    { requestId: pending.requestId, status: "granted" }, pending, choice,
    "/comprar", choice.revision,
  ), true);
});

test("only the current correlated grant can be confirmed", () => {
  const choice = createChoice(true);
  const pending = { requestId: "request-2", revision: choice.revision };
  const confirm = (detail: unknown, current = choice, path = "/comprar") =>
    matchesGrantConfirmation(detail, pending, current, path, choice.revision, true);
  assert.equal(confirm({ requestId: "request-2", status: "granted" }), true);
  assert.equal(confirm({ requestId: "request-1", status: "granted" }), false);
  assert.equal(confirm({ requestId: "request-2", status: "denied" }), false);
  assert.equal(confirm({ requestId: "request-2", status: "granted" }, createChoice(false)), false);
  assert.equal(confirm({ requestId: "request-2", status: "granted" }, createChoice(true)), false);
  assert.equal(confirm({ requestId: "request-2", status: "granted" }, choice, "/admin"), false);
  assert.equal(confirm({ requestId: "request-2", status: "granted" }, choice, "/login-admin"), false);
  assert.equal(matchesGrantConfirmation(
    { requestId: "request-2", status: "granted" }, null, choice,
    "/comprar", choice.revision, true,
  ), false);
});
