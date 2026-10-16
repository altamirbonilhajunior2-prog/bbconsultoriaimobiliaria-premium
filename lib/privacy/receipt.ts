import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { CONSENT_LIFETIME_MS, CONSENT_VERSION } from "./consent";

export const RECEIPT_COOKIE = "bb_consent_receipt";
export const SESSION_COOKIE = "__Host-bb_consent_session";
export type ConsentSession = { id: string; revision: number; issuedAt: number; expiresAt: number; purpose: "consent-session" };
export type Receipt = { id: string; sessionId: string; revision: number; version: string; purpose: "advertising"; issuedAt: number; expiresAt: number };
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function validPayload(value: unknown, now: number): value is Receipt | ConsentSession {
  if (!value || typeof value !== "object" || !Number.isSafeInteger(now) || now < 0) return false;
  const r = value as Receipt | ConsentSession;
  return typeof r.id === "string" && UUID.test(r.id) &&
    Number.isSafeInteger(r.revision) && r.revision >= 0 &&
    Number.isSafeInteger(r.issuedAt) && Number.isSafeInteger(r.expiresAt) &&
    r.issuedAt >= 0 && r.issuedAt <= now && r.expiresAt > now &&
    r.expiresAt - r.issuedAt === CONSENT_LIFETIME_MS;
}
/** Shape/lifetime validation only. Callers must authenticate incoming session tokens. */
export function isValidSession(value: unknown, now = Date.now()): value is ConsentSession {
  return validPayload(value, now) && value.purpose === "consent-session";
}
export function signingKey(value = process.env.BB_CONSENT_SIGNING_KEY): Buffer {
  if (!value || !/^[a-fA-F0-9]{64}$/.test(value)) throw new Error("Consent signing unavailable");
  return Buffer.from(value, "hex");
}
export function signPayload(payload: Receipt | ConsentSession, key: Buffer): string {
  if (key.length !== 32) throw new Error("Consent signing unavailable");
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return encoded + "." + createHmac("sha256", key).update(encoded).digest("base64url");
}
export function newSession(now = Date.now()): ConsentSession {
  return { id: randomUUID(), revision: 0, issuedAt: now, expiresAt: now + CONSENT_LIFETIME_MS, purpose: "consent-session" };
}
export function issueReceipt(key: Buffer, now = Date.now(), session = newSession(now)): { receipt: Receipt; token: string } {
  if (!isValidSession(session, now)) throw new Error("Invalid consent session");
  const receipt: Receipt = { id: randomUUID(), sessionId: session.id, revision: session.revision, version: CONSENT_VERSION, purpose: "advertising",
    issuedAt: now, expiresAt: now + CONSENT_LIFETIME_MS };
  return { receipt, token: signPayload(receipt, key) };
}
function verifiedPayload(token: string | undefined, key: Buffer, now: number): Receipt | ConsentSession | null {
  try {
    if (key.length !== 32 || !token || token.length > 1024) return null;
    const parts = token.split(".");
    if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[1])) return null;
    const expected = createHmac("sha256", key).update(parts[0]).digest();
    const actual = Buffer.from(parts[1], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const r = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as Receipt | ConsentSession;
    if (!validPayload(r, now)) return null;
    return r;
  } catch { return null; }
}
export function verifySession(token: string | undefined, key: Buffer, now = Date.now()): ConsentSession | null {
  const value = verifiedPayload(token, key, now);
  return value?.purpose === "consent-session" ? value : null;
}
export function verifyReceipt(token: string | undefined, key: Buffer, now = Date.now()): Receipt | null {
  const value = verifiedPayload(token, key, now);
  return value?.purpose === "advertising" && value.version === CONSENT_VERSION &&
    typeof value.sessionId === "string" && UUID.test(value.sessionId) ? value : null;
}

/**
 * A signature alone is not authorization. State must come from the locked,
 * authoritative session row, never from an old response or the browser.
 * Keep that lock through the protected action; this check does not acquire it.
 */
export function verifyCurrentReceipt(token: string | undefined, key: Buffer, session: ConsentSession,
  state: { id: string; revision: number; activeReceiptId: string | null }, now = Date.now()): Receipt | null {
  const receipt = verifyReceipt(token, key, now);
  if (!isValidSession(session, now) || !receipt || state.id !== session.id ||
    state.revision !== session.revision || receipt.sessionId !== session.id ||
    receipt.revision !== state.revision || receipt.id !== state.activeReceiptId ||
    receipt.issuedAt < session.issuedAt) return null;
  return receipt;
}
