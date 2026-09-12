"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

export type ExternalAcquisitionOpportunityInput = {
  title: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;

  state: string;
  city: string;
  neighborhood: string;
  development: string;

  purpose: string;
  propertyType: string;

  price: number | null;

  bedrooms: number | null;
  suites: number | null;
  parking: number | null;
  area: number | null;

  compatibility: number;
  compatibilityReason: string;

  notes: string;
};

export type SaveExternalOpportunityResult = {
  success: boolean;
  message: string;
  opportunityId?: number;
  duplicate?: boolean;
};

function textValue(
  value: unknown,
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function limitedText(
  value: unknown,
  maximumLength: number,
) {
  const text = textValue(value);

  return text
    ? text.slice(
        0,
        maximumLength,
      )
    : null;
}

function normalizedLabel(
  value: unknown,
) {
  return textValue(value)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase();
}

function optionalNumber(
  value: unknown,
) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
    ? value
    : null;
}

function optionalInteger(
  value: unknown,
) {
  const number =
    optionalNumber(value);

  return number === null
    ? null
    : Math.trunc(number);
}

function mapExternalSource(
  sourceUrl: string,
  sourceName: string,
  sourceType: string,
) {
  const hostname =
    new URL(sourceUrl).hostname
      .toLowerCase()
      .replace(/^www\./, "");

  if (hostname.includes("olx.")) {
    return "OLX" as const;
  }

  if (
    hostname.includes(
      "zapimoveis",
    )
  ) {
    return "ZAP" as const;
  }

  if (
    hostname.includes(
      "vivareal",
    )
  ) {
    return "VIVAREAL" as const;
  }

  if (
    hostname.includes(
      "imovelweb",
    )
  ) {
    return "IMOVELWEB" as const;
  }

  const sourceDescription =
    normalizedLabel(
      `${sourceName} ${sourceType}`,
    );

  if (
    sourceDescription.includes(
      "imobiliaria",
    ) &&
    !sourceDescription.includes(
      "portal imobiliario",
    )
  ) {
    return "SITE_IMOBILIARIA" as const;
  }

  return "OUTRO" as const;
}

function mapExternalOrigin(
  sourceType: string,
) {
  const normalized =
    normalizedLabel(sourceType);

  if (
    normalized.includes(
      "proprietario",
    )
  ) {
    return "PROPRIETARIO" as const;
  }

  if (
    normalized.includes(
      "imobiliaria",
    )
  ) {
    return "IMOBILIARIA" as const;
  }

  if (
    normalized.includes(
      "corretor",
    )
  ) {
    return "CORRETOR" as const;
  }

  return null;
}

function mapExternalPurpose(
  value: string,
) {
  const normalized =
    normalizedLabel(value);

  if (
    normalized.includes("venda") &&
    (
      normalized.includes(
        "locacao",
      ) ||
      normalized.includes(
        "aluguel",
      )
    )
  ) {
    return "VENDA_E_LOCACAO" as const;
  }

  if (
    normalized.includes(
      "locacao",
    ) ||
    normalized.includes(
      "aluguel",
    )
  ) {
    return "LOCACAO" as const;
  }

  if (
    normalized.includes("venda")
  ) {
    return "VENDA" as const;
  }

  return null;
}

function mapExternalPropertyType(
  value: string,
) {
  const normalized =
    normalizedLabel(value);

  if (normalized.includes("casa")) {
    return "CASA" as const;
  }

  if (
    normalized.includes(
      "apartamento",
    )
  ) {
    return "APARTAMENTO" as const;
  }

  if (
    normalized.includes(
      "terreno",
    )
  ) {
    return "TERRENO" as const;
  }

  if (
    normalized.includes(
      "comercial",
    )
  ) {
    return "COMERCIAL" as const;
  }

  if (normalized.includes("rural")) {
    return "RURAL" as const;
  }

  return null;
}

function duplicateResult(
  opportunityId: number,
): SaveExternalOpportunityResult {
  return {
    success: false,
    duplicate: true,
    opportunityId,
    message:
      `Esta oportunidade já está cadastrada no CRM como captação #${opportunityId}.`,
  };
}

export async function saveExternalAcquisitionOpportunity(
  input: ExternalAcquisitionOpportunityInput,
): Promise<SaveExternalOpportunityResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const sourceUrl =
    textValue(input?.sourceUrl);

  if (!sourceUrl) {
    return {
      success: false,
      message:
        "O anúncio não possui um link válido para salvar.",
    };
  }

  if (sourceUrl.length > 1000) {
    return {
      success: false,
      message:
        "O link do anúncio é muito longo para salvar.",
    };
  }

  let parsedSourceUrl: URL;

  try {
    parsedSourceUrl =
      new URL(sourceUrl);
  } catch {
    return {
      success: false,
      message:
        "O anúncio não possui um link válido para salvar.",
    };
  }

  if (
    parsedSourceUrl.protocol !==
      "http:" &&
    parsedSourceUrl.protocol !==
      "https:"
  ) {
    return {
      success: false,
      message:
        "O anúncio não possui um link válido para salvar.",
    };
  }

  if (
    parsedSourceUrl.hostname
      .toLowerCase()
      .includes(
        "bbconsultoriaimoveis.com.br",
      )
  ) {
    return {
      success: false,
      message:
        "Este anúncio pertence à carteira da B&B e não pode ser salvo como oportunidade externa.",
    };
  }

  const state =
    textValue(input?.state)
      .toUpperCase() || "SP";

  if (!/^[A-Z]{2}$/.test(state)) {
    return {
      success: false,
      message:
        "A oportunidade não possui uma sigla de estado válida.",
    };
  }

  const city =
    textValue(input?.city) ||
    "São José dos Campos";

  if (city.length > 120) {
    return {
      success: false,
      message:
        "A cidade informada no anúncio é muito longa para salvar.",
    };
  }

  const sourceName =
    textValue(input?.sourceName);

  const sourceType =
    textValue(input?.sourceType);

  const purpose =
    mapExternalPurpose(
      textValue(input?.purpose),
    );

  const price =
    optionalNumber(input?.price);

  const score =
    optionalInteger(
      input?.compatibility,
    );

  if (
    score !== null &&
    score > 100
  ) {
    return {
      success: false,
      message:
        "A compatibilidade da oportunidade é inválida.",
    };
  }

  try {
    const existingOpportunity =
      await prisma.acquisitionOpportunity.findUnique({
        where: {
          sourceUrl,
        },

        select: {
          id: true,
        },
      });

    if (existingOpportunity) {
      return duplicateResult(
        existingOpportunity.id,
      );
    }

    const location = [
      textValue(
        input?.development,
      ),
      textValue(
        input?.neighborhood,
      ),
      city,
      state,
    ]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 250);

    const opportunity =
      await prisma.acquisitionOpportunity.create({
        data: {
          source:
            mapExternalSource(
              sourceUrl,
              sourceName,
              sourceType,
            ),

          sourceUrl,

          origin:
            mapExternalOrigin(
              sourceType,
            ),

          status: "ENCONTRADO",

          authorizationStatus:
            "NAO_SOLICITADA",

          sourceTitle:
            limitedText(
              input?.title,
              250,
            ),

          state,
          city,

          neighborhood:
            limitedText(
              input?.neighborhood,
              150,
            ),

          development:
            limitedText(
              input?.development,
              180,
            ),

          location:
            location || null,

          purpose,

          propertyType:
            mapExternalPropertyType(
              textValue(
                input?.propertyType,
              ),
            ),

          price:
            purpose === "LOCACAO"
              ? null
              : price,

          rentalPrice:
            purpose === "LOCACAO"
              ? price
              : null,

          area:
            optionalNumber(
              input?.area,
            ),

          bedrooms:
            optionalInteger(
              input?.bedrooms,
            ),

          suites:
            optionalInteger(
              input?.suites,
            ),

          parking:
            optionalInteger(
              input?.parking,
            ),

          score,

          scoreReason:
            limitedText(
              input?.compatibilityReason,
              10_000,
            ),

          internalNotes:
            limitedText(
              input?.notes,
              10_000,
            ),

          authorizedToAdvertise:
            false,

          authorizedToUseImages:
            false,

          authorizedToEditImages:
            false,
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      "/admin/captacao-ia",
    );

    revalidatePath("/admin");

    return {
      success: true,
      opportunityId:
        opportunity.id,
      message:
        "Oportunidade salva com sucesso.",
    };
  } catch (error) {
    try {
      const existingOpportunity =
        await prisma.acquisitionOpportunity.findUnique({
          where: {
            sourceUrl,
          },

          select: {
            id: true,
          },
        });

      if (existingOpportunity) {
        return duplicateResult(
          existingOpportunity.id,
        );
      }
    } catch {
      // A mensagem principal abaixo também cobre falhas de conexão.
    }

    console.error(
      "Erro ao salvar oportunidade externa de captação:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível salvar a oportunidade.",
    };
  }
}

export async function deleteAcquisitionOpportunity(
  opportunityId: number,
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  if (
    !Number.isInteger(
      opportunityId,
    ) ||
    opportunityId <= 0
  ) {
    return {
      success: false,
      message:
        "Oportunidade inválida.",
    };
  }

  try {
    const opportunity =
      await prisma.acquisitionOpportunity.findUnique({
        where: {
          id: opportunityId,
        },

        select: {
          id: true,
        },
      });

    if (!opportunity) {
      return {
        success: false,
        message:
          "A oportunidade não foi encontrada.",
      };
    }

    await prisma.acquisitionOpportunity.delete({
      where: {
        id: opportunityId,
      },
    });

    revalidatePath(
      "/admin/captacao-ia",
    );

    revalidatePath(
      "/admin",
    );

    return {
      success: true,
      message:
        "Oportunidade excluída com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao excluir oportunidade de captação:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível excluir a oportunidade.",
    };
  }
}
