"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";

function text(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function number(
  formData: FormData,
  name: string,
) {
  const value = text(
    formData,
    name,
  );

  if (value === null) {
    return null;
  }

  let normalized =
    value.replace(
      /[^\d,.-]/g,
      "",
    );

  if (normalized.includes(",")) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (
    /^-?\d{1,3}(\.\d{3})+$/.test(
      normalized,
    )
  ) {
    normalized =
      normalized.replace(
        /\./g,
        "",
      );
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export async function createMarketReference(
  formData: FormData,
) {
  await requireAdmin();

  const state =
    text(formData, "state") ??
    "SP";

  const city =
    text(formData, "city");

  const neighborhood =
    text(
      formData,
      "neighborhood",
    );

  const referenceScope =
    text(
      formData,
      "referenceScope",
    ) === "BAIRRO"
      ? "BAIRRO"
      : "EMPREENDIMENTO";

  const referenceDevelopment =
    text(
      formData,
      "referenceDevelopment",
    );

  const evidenceDevelopment =
    text(
      formData,
      "evidenceDevelopment",
    );

  const source =
    text(formData, "source");

  const sourceUrl =
    text(
      formData,
      "sourceUrl",
    );

  const minimum =
    number(
      formData,
      "pricePerSquareMeterMin",
    );

  const maximum =
    number(
      formData,
      "pricePerSquareMeterMax",
    );

  if (
    !city ||
    !neighborhood ||
    !source ||
    !sourceUrl ||
    minimum === null ||
    maximum === null
  ) {
    throw new Error(
      "Preencha bairro, fonte, link e faixa de valor por m².",
    );
  }

  if (
    referenceScope ===
      "EMPREENDIMENTO" &&
    !referenceDevelopment
  ) {
    throw new Error(
      "Informe o condomínio/edifício da referência ou escolha referência geral do bairro.",
    );
  }

  if (
    minimum <= 0 ||
    maximum < minimum
  ) {
    throw new Error(
      "A faixa de valor por m² é inválida.",
    );
  }

  const purpose =
    formData.get("purpose") ===
    "LOCACAO"
      ? "LOCACAO"
      : "VENDA";

  const propertyTypeValue =
    text(
      formData,
      "propertyType",
    ) ?? "APARTAMENTO";

  const allowedTypes = [
    "CASA",
    "APARTAMENTO",
    "TERRENO",
    "COMERCIAL",
    "RURAL",
  ] as const;

  const propertyType =
    allowedTypes.find(
      (item) =>
        item ===
        propertyTypeValue,
    ) ?? "APARTAMENTO";

  const areaMin =
    number(
      formData,
      "areaMin",
    );

  const areaMax =
    number(
      formData,
      "areaMax",
    );

  const bedrooms =
    number(
      formData,
      "bedrooms",
    );

  const evidenceArea =
    number(
      formData,
      "evidenceArea",
    );

  const evidencePrice =
    number(
      formData,
      "evidencePrice",
    );

  const evidenceBedrooms =
    number(
      formData,
      "evidenceBedrooms",
    );

  if (
    areaMin !== null &&
    areaMax !== null &&
    areaMax < areaMin
  ) {
    throw new Error(
      "A área máxima não pode ser menor que a área mínima.",
    );
  }

  const marketReferenceDevelopment =
    referenceScope === "BAIRRO"
      ? null
      : referenceDevelopment;

  await prisma.marketReference.create({
    data: {
      state,
      city,
      neighborhood,

      development:
        marketReferenceDevelopment,

      purpose,
      propertyType,

      areaMin,
      areaMax,
      bedrooms,

      pricePerSquareMeterMin:
        minimum,

      pricePerSquareMeterMax:
        maximum,

      sampleSize: 1,

      notes:
        text(
          formData,
          "notes",
        ),

      evidences: {
        create: {
          source,
          sourceUrl,

          propertyType,
          purpose,

          area:
            evidenceArea,

          bedrooms:
            evidenceBedrooms,

          price:
            evidencePrice,

          pricePerSquareMeter:
            evidencePrice !== null &&
            evidenceArea !== null &&
            evidenceArea > 0
              ? evidencePrice /
                evidenceArea
              : null,

          development:
            evidenceDevelopment ??
            referenceDevelopment,

          notes:
            text(
              formData,
              "evidenceNotes",
            ),
        },
      },
    },
  });

  revalidatePath(
    "/admin/referencias-mercado",
  );

  redirect(
    "/admin/referencias-mercado",
  );
}