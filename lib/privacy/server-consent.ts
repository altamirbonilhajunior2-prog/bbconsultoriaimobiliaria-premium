import type { NextRequest } from "next/server";
import type { Prisma } from "../../generated/prisma/client";
import { RECEIPT_COOKIE, SESSION_COOKIE, signingKey, verifyReceipt, verifySession, verifyCurrentReceipt, type ConsentSession } from "./receipt";
import { transitionConsent, type SessionRow, type ReceiptRow } from "./consent-transition";

// Lazy loading keeps missing configuration and absent consent off the database path.
async function database() { return (await import("../prisma")).prisma; }
export async function changeConsent(session: ConsentSession, advertising: boolean, expectedRevision: number) {
  const key = signingKey();
  const db = await database();
  return db.$transaction(async (tx) => transitionConsent({
    async lock(id) {
      let rows = await tx.$queryRaw<SessionRow[]>`SELECT * FROM "AdvertisingConsentSession" WHERE "id" = ${id}::uuid FOR UPDATE`;
      if (!rows.length) {
        await tx.$executeRaw`INSERT INTO "AdvertisingConsentSession" ("id", "revision") VALUES (${id}::uuid, 0) ON CONFLICT ("id") DO NOTHING`;
        rows = await tx.$queryRaw<SessionRow[]>`SELECT * FROM "AdvertisingConsentSession" WHERE "id" = ${id}::uuid FOR UPDATE`;
      }
      return rows[0];
    },
    async receipt(id) { return (await tx.$queryRaw<ReceiptRow[]>`SELECT * FROM "AdvertisingConsent" WHERE "id" = ${id}::uuid`)[0] ?? null; },
    async revoke(id, now) { await tx.$executeRaw`UPDATE "AdvertisingConsent" SET "revokedAt" = ${now} WHERE "id" = ${id}::uuid AND "revokedAt" IS NULL`; },
    async create(receipt) {
      await tx.$executeRaw`INSERT INTO "AdvertisingConsent" ("id", "sessionId", "revision", "version", "issuedAt", "expiresAt")
        VALUES (${receipt.id}::uuid, ${receipt.sessionId}::uuid, ${receipt.revision}, ${receipt.version}, ${new Date(receipt.issuedAt)}, ${new Date(receipt.expiresAt)})`;
    },
    async update(id, revision, activeReceiptId, lastGrantAt) {
      await tx.$executeRaw`UPDATE "AdvertisingConsentSession" SET "revision" = ${revision}, "activeReceiptId" = ${activeReceiptId}::uuid,
        "lastGrantAt" = ${lastGrantAt} WHERE "id" = ${id}::uuid`;
    },
  }, session, advertising, expectedRevision, key), { maxWait: 2000, timeout: 3000 });
}

// Read-only synchronization never issues or renews a grant.
export async function readConsent(session: ConsentSession, token?: string) {
  const key = signingKey();
  const db = await database();
  return db.$transaction(async (tx) => {
    const row = (await tx.$queryRaw<SessionRow[]>`SELECT * FROM "AdvertisingConsentSession" WHERE "id" = ${session.id}::uuid FOR SHARE`)[0];
    const current = { ...session, revision: row?.revision ?? 0 };
    const receipt = row ? verifyCurrentReceipt(token, key, current, row) : null;
    if (!receipt) return { session: current, receipt: null };
    const valid = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "AdvertisingConsent" WHERE "id" = ${receipt.id}::uuid
      AND "sessionId" = ${current.id}::uuid AND "revision" = ${current.revision} AND "revokedAt" IS NULL
      AND "version" = ${receipt.version} AND "issuedAt" = ${new Date(receipt.issuedAt)}
      AND "expiresAt" = ${new Date(receipt.expiresAt)} AND "expiresAt" > clock_timestamp() FOR SHARE`;
    return { session: current, receipt: valid.length ? receipt : null };
  }, { maxWait: 2000, timeout: 3000 });
}

export const emptyAttribution = { referrer: null, utmSource: null, utmMedium: null,
  utmCampaign: null, utmTerm: null, utmContent: null, gclid: null };
export function campaignFields(input: Record<string, unknown>) {
  const text = (name: string, length: number) => typeof input[name] === "string" ? (input[name] as string).trim().slice(0, length) || null : null;
  // Referrer is intentionally excluded: arbitrary URL parameters may contain personal data.
  return { ...emptyAttribution, utmSource: text("utmSource", 180), utmMedium: text("utmMedium", 180),
    utmCampaign: text("utmCampaign", 250), utmTerm: text("utmTerm", 250), utmContent: text("utmContent", 250), gclid: text("gclid", 255) };
}

export async function attachAttribution(request: NextRequest, input: Record<string, unknown>,
  kind: "lead" | "whatsapp", id: number) {
  try {
    // Client denial/pending revocation suppresses even a still-present HttpOnly cookie.
    if (input.advertisingConsent !== true && input.advertisingConsent !== "true") return;
    const fields = campaignFields(input);
    if (!Object.values(fields).some(Boolean)) return;
    const key = signingKey();
    const token = request.cookies.get(RECEIPT_COOKIE)?.value;
    const receipt = verifyReceipt(token, key);
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value, key);
    if (!receipt || !session || receipt.sessionId !== session.id || receipt.revision !== session.revision) return;
    const db = await database();
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Session first: same lock order as grant/revoke. A stale receipt cannot survive a session revocation.
      const active = await tx.$queryRaw<SessionRow[]>`
        SELECT * FROM "AdvertisingConsentSession" WHERE "id" = ${session.id}::uuid
          AND "revision" = ${receipt.revision} AND "activeReceiptId" = ${receipt.id}::uuid FOR SHARE`;
      // Lock acquisition may outlive the session or receipt. Revalidate the complete
      // contract here, keeping the authoritative session locked through attribution.
      if (!active.length || !verifyCurrentReceipt(token, key, session, active[0])) return;
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "AdvertisingConsent" WHERE "id" = ${receipt.id}::uuid
          AND "sessionId" = ${session.id}::uuid AND "revision" = ${receipt.revision}
          AND "version" = ${receipt.version} AND "issuedAt" = ${new Date(receipt.issuedAt)}
          AND "expiresAt" = ${new Date(receipt.expiresAt)} AND "expiresAt" > clock_timestamp()
          AND "revokedAt" IS NULL FOR SHARE`;
      if (!rows.length) return;
      const data = { ...fields, advertisingConsentId: receipt.id };
      if (kind === "lead") await tx.portalLead.updateMany({ where: { id, advertisingConsentId: null }, data });
      else await tx.whatsAppLeadIntent.updateMany({ where: { id, advertisingConsentId: null }, data });
    }, { maxWait: 2000, timeout: 3000 });
  } catch { /* Advertising must never break an operational lead or redirect. */ }
}
