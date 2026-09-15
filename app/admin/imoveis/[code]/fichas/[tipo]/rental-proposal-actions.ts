"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessContext } from "../../../../../../lib/admin/access";
import { prisma } from "../../../../../../lib/prisma";

function optionalText(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function requiredText(
  formData: FormData,
  field: string,
  label: string,
) {
  const value = optionalText(formData, field);

  if (!value) {
    throw new Error(`${label} é obrigatório.`);
  }

  return value;
}

function parseCurrency(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00-03:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseInteger(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizePhone(value: string | null) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  return value;
}

function parseStatus(value: string | null) {
  if (
    value === "EM_ANALISE" ||
    value === "CONTRAPROPOSTA" ||
    value === "ACEITA" ||
    value === "RECUSADA" ||
    value === "CANCELADA"
  ) {
    return value;
  }

  return "EM_ANALISE";
}

function parseGuaranteeType(value: string | null) {
  if (
    value === "CAUCAO" ||
    value === "FIADOR" ||
    value === "SEGURO_FIANCA" ||
    value === "TITULO_CAPITALIZACAO" ||
    value === "OUTRA"
  ) {
    return value;
  }

  return null;
}

export async function savePropertyRentalProposal(
  propertyCode: string,
  formData: FormData,
) {
  const access = await getAccessContext();
  const normalizedCode = propertyCode.trim().toUpperCase();

  const property = await prisma.property.findUnique({
    where: {
      code: normalizedCode,
    },
    select: {
      id: true,
      code: true,
      purpose: true,
    },
  });

  if (!property) {
    throw new Error("Imóvel não encontrado.");
  }

  if (
    property.purpose !== "LOCACAO" &&
    property.purpose !== "VENDA_E_LOCACAO"
  ) {
    throw new Error("Este imóvel não está disponível para locação.");
  }

  const tenantName = requiredText(
    formData,
    "tenantName",
    "Nome do pretendente",
  );
  const tenantDocument = optionalText(formData, "tenantDocument");
  const tenantPhone = optionalText(formData, "tenantPhone");
  const tenantEmail = optionalText(formData, "tenantEmail");
  const offeredRentValue = parseCurrency(
    optionalText(formData, "offeredRentValue"),
  );

  if (offeredRentValue === null || offeredRentValue <= 0) {
    throw new Error("Valor mensal proposto é obrigatório.");
  }

  const normalizedTenantPhone = normalizePhone(tenantPhone);
  const existingClient = normalizedTenantPhone
    ? await prisma.client.findFirst({
        where: {
          phone: normalizedTenantPhone,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      })
    : null;

  let responsibleAgentId: number | null = access.agentId;

  if (access.isAdmin) {
    const selectedAgentId = parseInteger(
      optionalText(formData, "agentId"),
    );

    if (selectedAgentId) {
      const selectedAgent = await prisma.agent.findFirst({
        where: {
          id: selectedAgentId,
          active: true,
        },
        select: {
          id: true,
        },
      });

      responsibleAgentId = selectedAgent?.id ?? null;
    } else {
      responsibleAgentId = null;
    }
  }

  await prisma.propertyRentalProposal.create({
    data: {
      propertyId: property.id,
      clientId: existingClient?.id ?? null,
      agentId: responsibleAgentId,
      tenantName,
      tenantDocument,
      tenantPhone: normalizedTenantPhone ?? tenantPhone,
      tenantEmail,
      offeredRentValue,
      condominiumValue: parseCurrency(
        optionalText(formData, "condominiumValue"),
      ),
      iptuValue: parseCurrency(optionalText(formData, "iptuValue")),
      securityDepositValue: parseCurrency(
        optionalText(formData, "securityDepositValue"),
      ),
      desiredStartDate: parseDate(
        optionalText(formData, "desiredStartDate"),
      ),
      leaseTermMonths: parseInteger(
        optionalText(formData, "leaseTermMonths"),
      ),
      guaranteeType: parseGuaranteeType(
        optionalText(formData, "guaranteeType"),
      ),
      guaranteeDetails: optionalText(formData, "guaranteeDetails"),
      specialConditions: optionalText(formData, "specialConditions"),
      validUntil: parseDate(optionalText(formData, "validUntil")),
      notes: optionalText(formData, "proposalNotes"),
      counterOfferRent: parseCurrency(
        optionalText(formData, "counterOfferRent"),
      ),
      counterOfferTerms: optionalText(formData, "counterOfferTerms"),
      counterOfferNotes: optionalText(formData, "counterOfferNotes"),
      status: parseStatus(optionalText(formData, "proposalStatus")),
      tenantSignature: optionalText(formData, "tenantSignature"),
      ownerSignature: optionalText(formData, "ownerSignature"),
      agentSignature: optionalText(formData, "agentSignature"),
    },
  });

  const propertyPath =
    `/admin/imoveis/${property.code.toLowerCase()}`;
  const proposalPath = `${propertyPath}/fichas/proposta-locacao`;

  revalidatePath(propertyPath);
  revalidatePath(proposalPath);
  revalidatePath("/admin/clientes");

  redirect(`${proposalPath}?salvo=1`);
}
