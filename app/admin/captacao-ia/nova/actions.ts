"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export type AcquisitionFormState = {
  success: boolean;
  message: string;
  opportunityId?: number;
};

function getText(
  formData: FormData,
  field: string,
) {
  return String(
    formData.get(field) ?? "",
  ).trim();
}

function getOptionalText(
  formData: FormData,
  field: string,
) {
  const value = getText(
    formData,
    field,
  );

  return value || null;
}

function parseDecimal(
  value: string,
) {
  const raw = value.trim();

  if (!raw) {
    return null;
  }

  let normalized = raw
    .replace(/[^\d,.-]/g, "")
    .trim();

  if (!normalized) {
    return null;
  }

  if (normalized.includes(",")) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else {
    const brazilianThousandsPattern =
      /^-?\d{1,3}(\.\d{3})+$/;

    if (
      brazilianThousandsPattern.test(
        normalized,
      )
    ) {
      normalized =
        normalized.replace(
          /\./g,
          "",
        );
    }
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function parseOptionalInteger(
  value: string,
) {
  const raw = value.trim();

  if (!raw) {
    return null;
  }

  const parsed =
    Number.parseInt(
      raw,
      10,
    );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function mapSource(
  value: string,
) {
  switch (value) {
    case "OLX":
      return "OLX" as const;

    case "ZAP":
      return "ZAP" as const;

    case "Viva Real":
      return "VIVAREAL" as const;

    case "Imovelweb":
      return "IMOVELWEB" as const;

    case "Site imobiliária":
      return "SITE_IMOBILIARIA" as const;

    case "Outro":
      return "OUTRO" as const;

    default:
      return null;
  }
}

function mapOrigin(
  value: string,
) {
  switch (value) {
    case "Proprietário":
      return "PROPRIETARIO" as const;

    case "Imobiliária":
      return "IMOBILIARIA" as const;

    case "Corretor":
      return "CORRETOR" as const;

    case "Outro":
      return "OUTRO" as const;

    default:
      return null;
  }
}

function mapPurpose(
  value: string,
) {
  switch (value) {
    case "Venda":
      return "VENDA" as const;

    case "Locação":
      return "LOCACAO" as const;

    case "Venda e locação":
      return "VENDA_E_LOCACAO" as const;

    default:
      return null;
  }
}

function mapPropertyType(
  value: string,
) {
  switch (value) {
    case "Casa":
      return "CASA" as const;

    case "Apartamento":
      return "APARTAMENTO" as const;

    case "Terreno":
      return "TERRENO" as const;

    case "Comercial":
      return "COMERCIAL" as const;

    case "Rural":
      return "RURAL" as const;

    default:
      return null;
  }
}
function calculateAcquisitionScore({
  neighborhood,
  development,
  propertyType,
  contactPhone,
  price,
  bedrooms,
}: {
  neighborhood: string | null;
  development: string | null;
  propertyType: string | null;
  contactPhone: string | null;
  price: number | null;
  bedrooms: number | null;
}) {
  let score = 0;

  const reasons: string[] = [];

  const location =
    `${neighborhood ?? ""} ${development ?? ""}`
      .toLowerCase();

  if (
    location.includes("urbanova") ||
    location.includes("jardim aquarius") ||
    location.includes("colinas") ||
    location.includes("altos do esplanada")
  ) {
    score += 20;

    reasons.push(
      "Região estratégica para o posicionamento B&B.",
    );
  }

  if (
    propertyType === "CASA"
  ) {
    score += 15;

    reasons.push(
      "Casa alinhada ao perfil de imóveis premium.",
    );
  }

  if (
    development
  ) {
    score += 10;

    reasons.push(
      "Condomínio ou empreendimento identificado.",
    );
  }

  if (
    contactPhone
  ) {
    score += 10;

    reasons.push(
      "Contato disponível para abordagem comercial.",
    );
  }

  if (
    price !== null
  ) {
    score += 5;

    reasons.push(
      "Valor informado para análise de mercado.",
    );
  }

  if (
    bedrooms !== null &&
    bedrooms >= 3
  ) {
    score += 5;

    reasons.push(
      "Perfil com boa aderência residencial.",
    );
  }

  return {
    score: Math.min(
      score,
      100,
    ),

    reason:
      reasons.join(" ") ||
      "Oportunidade necessita de análise complementar.",
  };
}
function isValidHttpUrl(
  value: string,
) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export async function createAcquisitionAction(
  _previousState: AcquisitionFormState,
  formData: FormData,
): Promise<AcquisitionFormState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const source =
    mapSource(
      getText(
        formData,
        "source",
      ),
    );

  const sourceUrl =
    getText(
      formData,
      "sourceUrl",
    );

  const sourceTitle =
    getOptionalText(
      formData,
      "sourceTitle",
    );

  const origin =
    mapOrigin(
      getText(
        formData,
        "origin",
      ),
    );

  const purpose =
    mapPurpose(
      getText(
        formData,
        "purpose",
      ),
    );

  const propertyType =
    mapPropertyType(
      getText(
        formData,
        "propertyType",
      ),
    );

  const state =
    getText(
      formData,
      "state",
    ) || "SP";

  const city =
    getText(
      formData,
      "city",
    ) ||
    "São José dos Campos";

  if (!source) {
    return {
      success: false,
      message:
        "Selecione a fonte da oportunidade.",
    };
  }

  if (!sourceUrl) {
    return {
      success: false,
      message:
        "Informe o link do anúncio original.",
    };
  }

  if (
    !isValidHttpUrl(
      sourceUrl,
    )
  ) {
    return {
      success: false,
      message:
        "Informe um link válido iniciado por http:// ou https://.",
    };
  }

  if (sourceUrl.length > 1000) {
    return {
      success: false,
      message:
        "O link do anúncio é muito longo.",
    };
  }

  if (state.length > 2) {
    return {
      success: false,
      message:
        "Utilize a sigla do estado com 2 caracteres. Ex.: SP.",
    };
  }

  const score =
    parseOptionalInteger(
      getText(
        formData,
        "score",
      ),
    );
const scoreReason =
  getOptionalText(
    formData,
    "scoreReason",
  );

const automaticScore =
  calculateAcquisitionScore({
    neighborhood:
      getOptionalText(
        formData,
        "neighborhood",
      ),

    development:
      getOptionalText(
        formData,
        "development",
      ),

    propertyType,

    contactPhone:
      getOptionalText(
        formData,
        "contactPhone",
      ),

    price:
      parseDecimal(
        getText(
          formData,
          "price",
        ),
      ),

    bedrooms:
      parseOptionalInteger(
        getText(
          formData,
          "bedrooms",
        ),
      ),
  });
  if (
    score !== null &&
    (
      score < 0 ||
      score > 100
    )
  ) {
    return {
      success: false,
      message:
        "O Score B&B deve estar entre 0 e 100.",
    };
  }

  let createdOpportunityId:
    number | null = null;

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
      return {
        success: false,
        message:
          `Esta oportunidade já está cadastrada no CRM como captação #${existingOpportunity.id}.`,
      };
    }

    const opportunity =
      await prisma.acquisitionOpportunity.create({
        data: {
          source,
          sourceUrl,

          origin,

          status:
            "ENCONTRADO",

          authorizationStatus:
            "NAO_SOLICITADA",

          sourceTitle,

          state:
            state.toUpperCase(),

          city,

          neighborhood:
            getOptionalText(
              formData,
              "neighborhood",
            ),

          development:
            getOptionalText(
              formData,
              "development",
            ),

          location:
            getOptionalText(
              formData,
              "location",
            ),

          purpose,

          propertyType,

          price:
            parseDecimal(
              getText(
                formData,
                "price",
              ),
            ),

          rentalPrice:
            parseDecimal(
              getText(
                formData,
                "rentalPrice",
              ),
            ),

          condominium:
            parseDecimal(
              getText(
                formData,
                "condominium",
              ),
            ),

          iptu:
            parseDecimal(
              getText(
                formData,
                "iptu",
              ),
            ),

          area:
            parseDecimal(
              getText(
                formData,
                "area",
              ),
            ),

          landArea:
            parseDecimal(
              getText(
                formData,
                "landArea",
              ),
            ),

          bedrooms:
            parseOptionalInteger(
              getText(
                formData,
                "bedrooms",
              ),
            ),

          suites:
            parseOptionalInteger(
              getText(
                formData,
                "suites",
              ),
            ),

          bathrooms:
            parseOptionalInteger(
              getText(
                formData,
                "bathrooms",
              ),
            ),

          parking:
            parseOptionalInteger(
              getText(
                formData,
                "parking",
              ),
            ),

          contactName:
            getOptionalText(
              formData,
              "contactName",
            ),

          contactPhone:
            getOptionalText(
              formData,
              "contactPhone",
            ),

          contactEmail:
            getOptionalText(
              formData,
              "contactEmail",
            ),

          score:
  score ??
  automaticScore.score,

scoreReason:
  scoreReason ||
  automaticScore.reason,

          internalNotes:
            getOptionalText(
              formData,
              "internalNotes",
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

    createdOpportunityId =
      opportunity.id;
  } catch (error) {
    console.error(
      "Erro ao cadastrar oportunidade de captação:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar a oportunidade. Verifique os dados e tente novamente.",
    };
  }

  if (!createdOpportunityId) {
    return {
      success: false,
      message:
        "Não foi possível identificar a oportunidade criada.",
    };
  }

  revalidatePath(
    "/admin/captacao-ia",
  );

  revalidatePath(
    "/admin",
  );

  redirect(
    "/admin/captacao-ia",
  );
}