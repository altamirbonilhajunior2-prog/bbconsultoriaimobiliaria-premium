"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessContext } from "../../../../../../lib/admin/access";
import { prisma } from "../../../../../../lib/prisma";

function getOptionalText(
  formData: FormData,
  field: string,
) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function getRequiredText(
  formData: FormData,
  field: string,
  label: string,
) {
  const value = getOptionalText(
    formData,
    field,
  );

  if (!value) {
    throw new Error(
      `${label} é obrigatório.`,
    );
  }

  return value;
}

function getCheckboxValue(
  formData: FormData,
  field: string,
) {
  const value = formData.get(field);

  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

function parseOptionalDate(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(
    `${value}T12:00:00-03:00`,
  );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return null;
  }

  return parsedDate;
}

function parseCurrency(
  value: string | null,
) {
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

  const numericValue =
    Number(normalized);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return null;
  }

  return numericValue;
}

function parseOptionalInteger(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const parsed =
    Number.parseInt(
      value,
      10,
    );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function normalizePhone(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const digits =
    value.replace(/\D/g, "");

  if (
    digits.length === 10 ||
    digits.length === 11
  ) {
    return `55${digits}`;
  }

  if (
    (
      digits.length === 12 ||
      digits.length === 13
    ) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  return value;
}

function parseProposalStatus(
  value: string | null,
) {
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

export async function savePropertyProposal(
  propertyCode: string,
  formData: FormData,
) {
  const access =
    await getAccessContext();

  const normalizedCode =
    propertyCode
      .trim()
      .toUpperCase();

  const property =
    await prisma.property.findUnique({
      where: {
        code: normalizedCode,
      },

      select: {
        id: true,
        code: true,
      },
    });

  if (!property) {
    throw new Error(
      "Imóvel não encontrado.",
    );
  }

  const proposerName =
    getRequiredText(
      formData,
      "proposerName",
      "Nome do proponente",
    );

  const proposerDocument =
    getOptionalText(
      formData,
      "proposerDocument",
    );

  const proposerPhone =
    getOptionalText(
      formData,
      "proposerPhone",
    );

  const proposerEmail =
    getOptionalText(
      formData,
      "proposerEmail",
    );

  const offeredValue =
    parseCurrency(
      getOptionalText(
        formData,
        "offeredValue",
      ),
    );

  const downPaymentValue =
    parseCurrency(
      getOptionalText(
        formData,
        "downPaymentValue",
      ),
    );

  const usesOwnResources =
    getCheckboxValue(
      formData,
      "usesOwnResources",
    );

  const usesFinancing =
    getCheckboxValue(
      formData,
      "usesFinancing",
    );

  const usesFgts =
    getCheckboxValue(
      formData,
      "usesFgts",
    );

  const paymentTerms =
    getOptionalText(
      formData,
      "paymentTerms",
    );

  const deadline =
    getOptionalText(
      formData,
      "deadline",
    );

  const specialConditions =
    getOptionalText(
      formData,
      "specialConditions",
    );

  const validUntil =
    parseOptionalDate(
      getOptionalText(
        formData,
        "validUntil",
      ),
    );

  const notes =
    getOptionalText(
      formData,
      "proposalNotes",
    );

  const counterOfferValue =
    parseCurrency(
      getOptionalText(
        formData,
        "counterOfferValue",
      ),
    );

  const counterOfferTerms =
    getOptionalText(
      formData,
      "counterOfferTerms",
    );

  const counterOfferNotes =
    getOptionalText(
      formData,
      "counterOfferNotes",
    );

  const status =
    parseProposalStatus(
      getOptionalText(
        formData,
        "proposalStatus",
      ),
    );

  const proposerSignature =
    getOptionalText(
      formData,
      "proposerSignature",
    );

  const ownerSignature =
    getOptionalText(
      formData,
      "ownerSignature",
    );

  const agentSignature =
    getOptionalText(
      formData,
      "agentSignature",
    );

  const normalizedProposerPhone =
    normalizePhone(
      proposerPhone,
    );

  const existingClient =
    normalizedProposerPhone
      ? await prisma.client.findFirst({
          where: {
            phone:
              normalizedProposerPhone,
          },

          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
          },
        })
      : null;

  let responsibleAgentId:
    | number
    | null =
    access.agentId;

  if (access.isAdmin) {
    const selectedAgentId =
      parseOptionalInteger(
        getOptionalText(
          formData,
          "agentId",
        ),
      );

    if (selectedAgentId) {
      const selectedAgent =
        await prisma.agent.findFirst({
          where: {
            id: selectedAgentId,
            active: true,
          },

          select: {
            id: true,
          },
        });

      responsibleAgentId =
        selectedAgent?.id ??
        null;
    }
  }

  await prisma.propertyProposal.create({
    data: {
      propertyId:
        property.id,

      clientId:
        existingClient?.id ??
        null,

      agentId:
        responsibleAgentId,

      proposerName,
      proposerDocument,

      proposerPhone:
        normalizedProposerPhone ??
        proposerPhone,

      proposerEmail,

      offeredValue,
      downPaymentValue,

      usesOwnResources,
      usesFinancing,
      usesFgts,

      paymentTerms,
      deadline,
      specialConditions,
      validUntil,
      notes,

      counterOfferValue,
      counterOfferTerms,
      counterOfferNotes,

      status,

      proposerSignature,
      ownerSignature,
      agentSignature,
    },
  });

  const propertyPath =
    `/admin/imoveis/${property.code.toLowerCase()}`;

  const proposalPath =
    `${propertyPath}/fichas/proposta`;

  revalidatePath(
    propertyPath,
  );

  revalidatePath(
    proposalPath,
  );

  revalidatePath(
    "/admin/clientes",
  );

  redirect(
    `${proposalPath}?salvo=1`,
  );
}