import { CONSENT_VERSION } from "./consent";
import { isValidSession, issueReceipt, signPayload, verifyCurrentReceipt, type ConsentSession, type Receipt } from "./receipt";

export type SessionRow = { id: string; revision: number; activeReceiptId: string | null; lastGrantAt: Date | null };
export type ReceiptRow = { id: string; sessionId: string; revision: number; version: string; issuedAt: Date; expiresAt: Date; revokedAt: Date | null };
export interface TransitionStore {
  lock(id: string): Promise<SessionRow>;
  receipt(id: string): Promise<ReceiptRow | null>;
  revoke(id: string, now: Date): Promise<void>;
  create(receipt: Receipt): Promise<void>;
  update(id: string, revision: number, activeReceiptId: string | null, lastGrantAt: Date | null): Promise<void>;
}
export class ConsentConflict extends Error {
  constructor(public revision: number, public status = 409) { super("Consent revision changed"); }
}

// Caller must authenticate session and hold one transaction throughout this function.
// The store must serialize by session and roll back ALL writes if any step fails.
// A returned receipt is a snapshot, not authorization: recheck authoritative state
// with verifyCurrentReceipt under lock before using it after an asynchronous delay.
export async function transitionConsent(store: TransitionStore, session: ConsentSession,
  advertising: boolean, expectedRevision: number, key: Buffer, now = Date.now()) {
  if (!isValidSession(session, now) || typeof advertising !== "boolean" || key.length !== 32 ||
    !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision !== session.revision)
    throw new Error("Invalid consent transition");
  const row = await store.lock(session.id);
  if (row.id !== session.id || !Number.isSafeInteger(row.revision) || row.revision < session.revision)
    throw new Error("Invalid consent state");
  if (advertising && row.revision !== expectedRevision) throw new ConsentConflict(row.revision);
  const current = row.activeReceiptId ? await store.receipt(row.activeReceiptId) : null;
  if (row.activeReceiptId && (!current || current.id !== row.activeReceiptId ||
    current.sessionId !== row.id || current.revision !== row.revision)) throw new Error("Invalid receipt binding");
  if (advertising && current && !current.revokedAt && current.expiresAt.getTime() > now && current.version === CONSENT_VERSION) {
    const receipt: Receipt = { id: current.id, sessionId: current.sessionId, revision: current.revision,
      version: current.version, purpose: "advertising", issuedAt: current.issuedAt.getTime(), expiresAt: current.expiresAt.getTime() };
    const token = signPayload(receipt, key);
    if (!verifyCurrentReceipt(token, key, session, row, now)) throw new Error("Invalid active receipt");
    // Repeated clicks reuse the same receipt and original expiry, with no writes.
    return { session: { ...session, revision: row.revision }, issued: { receipt, token } };
  }
  if (advertising && row.lastGrantAt && now - row.lastGrantAt.getTime() < 30_000)
    throw new ConsentConflict(row.revision, 429);
  // The first denial advances revision 0 to fence off a concurrent initial grant.
  // Once denied, retries (including current-revision retries) require no writes.
  if (!advertising && !row.activeReceiptId && row.revision > 0)
    return { session: { ...session, revision: row.revision }, issued: null };
  if (row.revision === Number.MAX_SAFE_INTEGER) throw new Error("Consent revision exhausted");
  const next = { ...session, revision: row.revision + 1 };
  const issued = advertising ? issueReceipt(key, now, next) : null;
  if (row.activeReceiptId) await store.revoke(row.activeReceiptId, new Date(now));
  if (issued) await store.create(issued.receipt);
  await store.update(row.id, next.revision, issued?.receipt.id ?? null, advertising ? new Date(now) : row.lastGrantAt);
  return { session: next, issued };
}
