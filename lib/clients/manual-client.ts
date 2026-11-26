import type { Prisma } from "../../generated/prisma/client";
import { parsePersonalDetails } from "./personal-details";

export type ManualClientInput = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  propertyCodes: string[];
  personalDetails: ReturnType<typeof parsePersonalDetails>;
};

export function parseManualClient(form: FormData): ManualClientInput {
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const name = text("name");
  const rawPhone = text("phone");
  const digits = rawPhone.replace(/\D/g, "");
  const phone = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  const email = text("email");
  const notes = text("notes");
  const rawCodes = text("propertyCodes");
  if (name.length < 2 || name.length > 180) throw new Error("Informe o nome do cliente, com 2 a 180 caracteres.");
  if (rawPhone.length > 30 || /[a-z]/i.test(rawPhone) || !/^55\d{10,11}$/.test(phone)) {
    throw new Error("Informe um telefone brasileiro válido, com DDD.");
  }
  if (email.length > 180 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error("Confira o e-mail informado.");
  }
  if (notes.length > 5000) throw new Error("As observações devem ter até 5.000 caracteres.");
  if (rawCodes.length > 2000) throw new Error("Selecione até 50 imóveis por cadastro.");
  const propertyCodes = [...new Set(rawCodes.toUpperCase().split(/[\s,;]+/).filter(Boolean))];
  if (propertyCodes.length > 50) throw new Error("Selecione até 50 imóveis por cadastro.");
  return { name, phone, email, notes, propertyCodes, personalDetails: parsePersonalDetails(form) };
}

export type ManualClientResult = { id: number; duplicate: boolean };

// Called inside one transaction: a failed property lookup must never leave a partial client.
export async function insertManualClient(
  tx: Prisma.TransactionClient,
  input: ManualClientInput,
  access: { isAdmin: boolean; agentId: number | null },
): Promise<ManualClientResult> {
  if (!access.isAdmin && !access.agentId) throw new Error("Acesso não autorizado.");
  // Serializes double submits for the same phone without changing the existing schema.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"manual-client:" + input.phone}))`;
  const existing = await tx.$queryRaw<{ id: number }[]>`
    SELECT id FROM "Client"
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') IN (${input.phone}, ${input.phone.slice(2)})
      AND (${access.isAdmin} OR "agentId" = ${access.agentId})
    ORDER BY id LIMIT 1`;
  if (existing[0]) return { id: existing[0].id, duplicate: true };
  const properties = await tx.property.findMany({
    where: { code: { in: input.propertyCodes } }, select: { id: true, code: true },
  });
  if (properties.length !== input.propertyCodes.length) {
    throw new Error("Um dos imóveis selecionados não está mais disponível no cadastro. Confira a seleção.");
  }
  const client = await tx.client.create({
    data: {
      name: input.name, phone: input.phone, email: input.email || null,
      notes: input.notes || null, agentId: access.agentId,
      ...input.personalDetails,
      commercialEvents: { create: {
        type: "NOVO_CONTATO", agentId: access.agentId,
        description: properties.length
          ? "Cadastro manual. Imóveis de interesse informados pelo cliente."
          : "Cadastro manual do cliente.",
        properties: { create: properties.map(property => ({ propertyId: property.id })) },
      } },
    },
    select: { id: true },
  });
  return { id: client.id, duplicate: false };
}
