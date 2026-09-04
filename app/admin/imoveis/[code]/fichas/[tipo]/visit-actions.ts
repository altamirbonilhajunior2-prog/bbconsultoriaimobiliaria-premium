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

function parseRequiredDate(
  value: string | null,
  label: string,
) {
  const parsedDate =
    parseOptionalDate(value);

  if (!parsedDate) {
    throw new Error(
      `${label} é obrigatória.`,
    );
  }

  return parsedDate;
}

function parseInterest(
  value: string | null,
) {
  if (
    value === "ALTO" ||
    value === "MEDIO" ||
    value === "BAIXO"
  ) {
    return value;
  }

  return null;
}

function parseReturnType(
  value: string | null,
) {
  if (
    value === "PROPOSTA" ||
    value === "NOVA_VISITA" ||
    value === "SEM_INTERESSE"
  ) {
    return value;
  }

  return null;
}

export async function savePropertyVisit(
  propertyCode: string,
  formData: FormData,
) {
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

  const visitorName =
    getRequiredText(
      formData,
      "visitorName",
      "Nome completo",
    );

  const visitorDocument =
    getOptionalText(
      formData,
      "visitorDocument",
    );

  const visitorPhone =
    getOptionalText(
      formData,
      "visitorPhone",
    );

  const visitorEmail =
    getOptionalText(
      formData,
      "visitorEmail",
    );

  const visitorBirthDate =
    parseOptionalDate(
      getOptionalText(
        formData,
        "visitorBirthDate",
      ),
    );

  const visitorAddress =
    getOptionalText(
      formData,
      "visitorAddress",
    );

  const visitDate =
    parseRequiredDate(
      getOptionalText(
        formData,
        "visitDate",
      ),
      "Data da visita",
    );

  const visitTime =
    getOptionalText(
      formData,
      "visitTime",
    );

  const companions =
    getOptionalText(
      formData,
      "companions",
    );

  const interest =
    parseInterest(
      getOptionalText(
        formData,
        "interest",
      ),
    );

  const returnType =
    parseReturnType(
      getOptionalText(
        formData,
        "returnType",
      ),
    );

  const notes =
    getOptionalText(
      formData,
      "visitNotes",
    );

  const visitorSignature =
    getOptionalText(
      formData,
      "visitorSignature",
    );

  const responsibleSignature =
    getOptionalText(
      formData,
      "responsibleSignature",
    );

  await prisma.propertyVisit.create({
    data: {
      propertyId:
        property.id,

      visitorName,
      visitorDocument,
      visitorPhone,
      visitorEmail,
      visitorBirthDate,
      visitorAddress,

      visitDate,
      visitTime,
      companions,

      interest,
      returnType,

      notes,

      visitorSignature,
      responsibleSignature,
    },
  });

  const path =
    `/admin/imoveis/${property.code.toLowerCase()}/fichas/visita`;

  revalidatePath(path);

  redirect(
    `${path}?salvo=1`,
  );
}