import assert from "node:assert/strict";
import test from "node:test";
import { BrowserConsent, DENIAL_EPOCH, REVOCATION_PENDING } from "./browser-consent";
import { CONSENT_KEY, CONSENT_LIFETIME_MS } from "./consent";

function harness() {
  const map = new Map<string, string>();
  let broken = false, offline = false, posts = 0, gets = 0, revision = 0, advertising = false;
  let pause: (() => Promise<void>) | undefined;
  const issuedAt = Date.now();
  const storage: Storage = {
    get length() { return map.size; }, clear: () => map.clear(), key: i => [...map.keys()][i] ?? null,
    getItem: k => map.get(k) ?? null,
    setItem(k, v) { if (broken) throw new Error("quota"); map.set(k, v); },
    removeItem(k) { if (broken) throw new Error("quota"); map.delete(k); },
  };
  let queue: Promise<unknown> = Promise.resolve();
  const dependencies = {
    storage,
    async lock<T>(fn: () => Promise<T>): Promise<T> {
      const work = queue.then(fn); queue = work.catch(() => {}); return work;
    },
    async request(method: "GET" | "POST", body?: object) {
      if (offline) throw new Error("offline");
      if (method === "GET") gets++;
      if (method === "POST") {
        posts++; revision++; advertising = (body as { advertising: boolean }).advertising;
        await pause?.();
      }
      return { success: true as const, sessionId: "session", sessionToken: "signed", revision, advertising,
        sessionExpiresAt: issuedAt + CONSENT_LIFETIME_MS,
        issuedAt, expiresAt: issuedAt + CONSENT_LIFETIME_MS };
    },
  };
  return { a: new BrowserConsent(dependencies), b: new BrowserConsent(dependencies), map, dependencies,
    breakStorage: () => { broken = true; }, offline: () => { offline = true; }, posts: () => posts, gets: () => gets,
    pause: (fn: () => Promise<void>) => { pause = fn; } };
}
test("stored preference alone cannot enable collection; synchronization is read-only", async () => {
  const h = harness(); await h.a.save(true);
  assert.ok(h.a.current()); assert.equal(h.b.current(), null);
  await h.b.sync(); assert.ok(h.b.current()); assert.equal(h.posts(), 1);
});
test("late grant response never overrides denial from another tab", async () => {
  const h = harness(); let release!: () => void, arrived!: () => void;
  const started = new Promise<void>(r => { arrived = r; });
  h.pause(async () => { arrived(); await new Promise<void>(r => { release = r; }); });
  const grant = h.a.save(true); const rejected = assert.rejects(grant);
  await started;
  const denied = h.b.save(false);
  assert.equal(h.a.current(), null); assert.ok(h.map.get(DENIAL_EPOCH));
  h.pause(async () => {}); release();
  await rejected; await denied;
  assert.equal(h.a.current(), null); assert.equal(h.b.current(), null);
  assert.equal(JSON.parse(h.map.get(CONSENT_KEY)!).advertising, false);
});
test("storage write failure cannot revive an old grant and still attempts server revocation", async () => {
  const h = harness(); await h.a.save(true); h.breakStorage();
  await assert.rejects(h.a.save(false));
  assert.equal(h.a.current(), null); assert.equal(h.posts(), 2);
  await assert.rejects(h.a.save(true)); assert.equal(h.posts(), 2);
  await h.a.sync(); assert.equal(h.a.current(), null);
});
test("revocation notice stays blocked on focus even if the server still has an old grant", async () => {
  const h = harness(); await h.a.save(true); await h.b.sync();
  h.b.block(true); await h.b.sync(); assert.equal(h.b.current(), null);
});
test("network failure leaves the denial fence and blocks both tabs", async () => {
  const h = harness(); await h.a.save(true); await h.b.sync(); h.offline();
  await assert.rejects(h.a.save(false));
  assert.equal(h.a.current(), null); assert.equal(h.b.current(), null);
  assert.ok(h.map.get(REVOCATION_PENDING));
});
test("blocked access to localStorage still permits server revocation attempt", async () => {
  const h = harness(); const controller = new BrowserConsent({ ...h.dependencies,
    get storage(): Storage { throw new Error("blocked storage getter"); } });
  await assert.rejects(controller.save(false)); assert.equal(h.posts(), 1);
  assert.equal(controller.current(), null);
});
test("changed epoch invalidates a late choice even if a pending marker is cleared", async () => {
  const h = harness(); await h.a.save(true);
  h.map.set(DENIAL_EPOCH, "later-denial"); h.map.delete(REVOCATION_PENDING);
  assert.equal(h.a.current(), null); await h.b.sync(); assert.equal(h.b.current(), null);
});

test("overlapping synchronizations share one request and never write a new grant", async () => {
  const h = harness(); await h.a.save(true);
  const gets = h.gets();
  await Promise.all([h.b.sync(), h.b.sync(), h.b.sync()]);
  assert.equal(h.gets(), gets + 1); assert.equal(h.posts(), 1);
  assert.ok(h.b.current());
});

test("session expiration blocks collection even when the receipt has not expired", async () => {
  const h = harness();
  const expiresAt = Date.now() + 1000;
  const controller = new BrowserConsent({ ...h.dependencies, async request(method, body) {
    return { ...await h.dependencies.request(method, body), sessionExpiresAt: expiresAt };
  } });
  await controller.save(true); assert.ok(controller.current());
  const originalNow = Date.now;
  try {
    Date.now = () => expiresAt;
    assert.equal(controller.current(), null);
  } finally { Date.now = originalNow; }
});

test("revocation invalidates synchronization already waiting for its response", async () => {
  const h = harness(); await h.a.save(true);
  let arrived!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { arrived = resolve; });
  const controller = new BrowserConsent({ ...h.dependencies, async request(method, body) {
    const snapshot = await h.dependencies.request(method, body);
    if (method === "GET") { arrived(); await new Promise<void>(resolve => { release = resolve; }); }
    return snapshot;
  } });
  const syncing = controller.sync(); await started;
  const denial = h.a.save(false);
  release(); await syncing; await denial;
  assert.equal(controller.current(), null);
  await controller.sync(); assert.equal(controller.current(), null);
});
