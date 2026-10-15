import { randomUUID } from "node:crypto";
import { operationalSource } from "./attribution";

export function interactionId(value: unknown): string {
  if (value === undefined || value === null || value === "") return randomUUID();
  if (typeof value !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value))
    throw new Error("Invalid interaction id");
  return value.toLowerCase();
}
export async function recordWhatsAppIntent(input: { interactionId: string; propertyCode: string | null; sourcePage: string }) {
  const { prisma } = await import("../prisma");
  const sourcePage = operationalSource(input.sourcePage);
  return prisma.$transaction(async (tx) => {
    // Lock by operation, not page/visitor. Retries do not allocate new contacts.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.interactionId}, 0))`;
    const existing = await tx.$queryRaw<{ id: number }[]>`SELECT "id" FROM "WhatsAppLeadIntent" WHERE "interactionId" = ${input.interactionId}::uuid`;
    if (existing.length) return { id: existing[0].id, created: false };
    const property = input.propertyCode ? await tx.property.findFirst({ where: { code: input.propertyCode }, select: { id: true, code: true } }) : null;
    const rows = await tx.$queryRaw<{ id: number }[]>`INSERT INTO "WhatsAppLeadIntent" ("interactionId", "propertyId", "propertyCode", "sourcePage")
      VALUES (${input.interactionId}::uuid, ${property?.id ?? null}, ${property?.code ?? input.propertyCode}, ${sourcePage}) RETURNING "id"`;
    return { id: rows[0].id, created: true };
  }, { maxWait: 2000, timeout: 3000 });
}
