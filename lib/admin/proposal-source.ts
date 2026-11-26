import type { PrismaClient } from "../../generated/prisma/client";

type Database = Pick<PrismaClient, "client" | "propertyVisit">;
type Access = { isAdmin: boolean; agentId: number | null };
export type ProposalSourceInput = { clientId?: unknown; visitId?: unknown };

export class InvalidProposalSource extends Error {
  constructor() {
    super("Cliente ou visita não encontrado ou sem permissão de acesso.");
  }
}

function sourceId(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) throw new InvalidProposalSource();
  const id = Number(value);
  if (!Number.isSafeInteger(id)) throw new InvalidProposalSource();
  return id;
}

export function clientScope(access: Access) {
  return access.isAdmin ? {} : { agentId: access.agentId ?? -1 };
}

export function visitScope(access: Access) {
  return access.isAdmin ? {} : {
    OR: [
      { agentId: access.agentId ?? -1 },
      { client: { agentId: access.agentId ?? -1 } },
    ],
  };
}

function legacyDocument(value: string | null | undefined, allowCnpj = false) {
  const length = value?.replace(/\D/g, "").length;
  return value && (length === 11 || (allowCnpj && length === 14)) ? value : "";
}

// Revalidate the source on both page load and submission; never trust a hidden ID.
export async function resolveProposalSource(
  db: Database, propertyId: number, access: Access, input: ProposalSourceInput,
) {
  const clientId = sourceId(input.clientId);
  const visitId = sourceId(input.visitId);
  if (clientId && visitId) throw new InvalidProposalSource();
  if (!clientId && !visitId) return null;

  const visit = visitId ? await db.propertyVisit.findFirst({
    where: { id: visitId, propertyId, ...visitScope(access) },
    select: { id: true, clientId: true, visitorName: true, visitorPhone: true, visitorEmail: true, visitorDocument: true },
  }) : null;
  if (visitId && !visit) throw new InvalidProposalSource();

  const selectedClientId = clientId ?? visit?.clientId;
  const client = selectedClientId ? await db.client.findFirst({
    where: { id: selectedClientId, ...clientScope(access) },
    select: { id: true, name: true, cpf: true, document: true, phone: true, email: true },
  }) : null;
  if (selectedClientId && !client) throw new InvalidProposalSource();

  return {
    clientId: client?.id ?? null,
    visitId: visit?.id ?? null,
    name: client?.name ?? visit?.visitorName ?? "",
    document: client?.cpf || legacyDocument(client?.document) || legacyDocument(visit?.visitorDocument),
    rentalDocument: client?.cpf || legacyDocument(client?.document, true) || legacyDocument(visit?.visitorDocument, true),
    phone: client?.phone ?? visit?.visitorPhone ?? "",
    email: client?.email ?? visit?.visitorEmail ?? "",
  };
}

export async function proposalClientId(
  db: Database, propertyId: number, access: Access,
  input: ProposalSourceInput, phone: string | null,
) {
  const source = await resolveProposalSource(db, propertyId, access, input);
  // Explicit source wins even if the editable contact details change.
  if (source) return source.clientId;
  if (!phone) return null;
  const matches = await db.client.findMany({
    where: { phone, ...clientScope(access) }, select: { id: true }, take: 2,
  });
  return matches.length === 1 ? matches[0].id : null;
}
