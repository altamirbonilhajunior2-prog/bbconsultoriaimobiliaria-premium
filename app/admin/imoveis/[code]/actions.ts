"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";

export type PropertyEditState = {
  success: boolean;
  message: string;
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

function getOptionalInteger(
  formData: FormData,
  field: string,
) {
  const raw = getText(
    formData,
    field,
  );

  if (!raw) {
    return null;
  }

  const parsed =
    Number.parseInt(
      raw,
      10,
    );

  return Number.isInteger(parsed)
    ? parsed
    : null;
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

  const parsed = Number(
    normalized,
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function parseInteger(
  value: string,
) {
  const raw = value.trim();

  if (!raw) {
    return 0;
  }

  const parsed =
    Number.parseInt(
      raw,
      10,
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
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

function mapStatus(
  value: string,
) {
  switch (value) {
    case "Disponível":
      return "DISPONIVEL" as const;

    case "Reservado":
      return "RESERVADO" as const;

    case "Vendido":
      return "VENDIDO" as const;

    case "Alugado":
      return "ALUGADO" as const;

    case "Em análise":
      return "EM_ANALISE" as const;

    default:
      return null;
  }
}

function mapOpportunityProfile(
  value: string,
) {
  switch (value) {
    case "Moradia":
      return "MORADIA" as const;

    case "Investimento":
      return "INVESTIMENTO" as const;

    case "Renda":
      return "RENDA" as const;

    case "Valorização":
      return "VALORIZACAO" as const;

    case "Lançamento":
      return "LANCAMENTO" as const;

    default:
      return null;
  }
}

export async function updatePropertyAction(
  _previousState: PropertyEditState,
  formData: FormData,
): Promise<PropertyEditState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const access =
    await getAccessContext();

  const originalCode =
    getText(
      formData,
      "originalCode",
    ).toUpperCase();

  if (!originalCode) {
    return {
      success: false,
      message:
        "Não foi possível identificar o imóvel.",
    };
  }

  const existingProperty =
    await prisma.property.findUnique({
      where: {
        code: originalCode,
      },

      select: {
        id: true,
        captorId: true,
        coCaptorId: true,
      },
    });

  if (!existingProperty) {
    return {
      success: false,
      message:
        "O imóvel não foi encontrado no banco de dados.",
    };
  }

  const requestedCaptorId =
    getOptionalInteger(
      formData,
      "captorId",
    );

  const requestedCoCaptorId =
    getOptionalInteger(
      formData,
      "coCaptorId",
    );

  let captorId: number | null =
    existingProperty.captorId;

  let coCaptorId: number | null =
    existingProperty.coCaptorId;

  if (access.isAdmin) {
    captorId =
      requestedCaptorId;

    coCaptorId =
      requestedCoCaptorId;
  } else {
    if (
      !access.agentId ||
      existingProperty.captorId !==
        access.agentId
    ) {
      return {
        success: false,
        message:
          "Somente o angariador principal pode alterar os dados de angariação deste imóvel.",
      };
    }

    captorId =
      existingProperty.captorId;

    coCaptorId =
      requestedCoCaptorId;
  }

  if (!captorId) {
    return {
      success: false,
      message:
        "Selecione o angariador principal do imóvel.",
    };
  }

  if (
    coCaptorId !== null &&
    coCaptorId === captorId
  ) {
    return {
      success: false,
      message:
        "O co-angariador deve ser diferente do angariador principal.",
    };
  }

  const agentIds = [
    captorId,
    ...(coCaptorId !== null
      ? [coCaptorId]
      : []),
  ];

  const agents =
    await prisma.agent.findMany({
      where: {
        id: {
          in: agentIds,
        },
        active: true,
      },

      select: {
        id: true,
      },
    });

  const validAgentIds =
    new Set(
      agents.map(
        (agent) =>
          agent.id,
      ),
    );

  if (
    !validAgentIds.has(
      captorId,
    )
  ) {
    return {
      success: false,
      message:
        "O angariador principal selecionado não está disponível.",
    };
  }

  if (
    coCaptorId !== null &&
    !validAgentIds.has(
      coCaptorId,
    )
  ) {
    return {
      success: false,
      message:
        "O co-angariador selecionado não está disponível.",
    };
  }

  const title = getText(
    formData,
    "title",
  );

  const ownerId =
    getOptionalInteger(
      formData,
      "ownerId",
    );

  let validatedOwnerId:
    number | null = null;

  if (ownerId !== null) {
    const allowedOwner =
      await prisma.owner.findFirst({
        where: {
          id: ownerId,

          ...(access.isAdmin
            ? {}
            : {
                capturedById:
                  access.agentId ?? -1,
              }),
        },

        select: {
          id: true,
        },
      });

    if (!allowedOwner) {
      return {
        success: false,
        message:
          "Proprietário não encontrado ou acesso não autorizado.",
      };
    }

    validatedOwnerId =
      allowedOwner.id;
  }

  const neighborhood =
    getText(
      formData,
      "neighborhood",
    );

  const category =
    getText(
      formData,
      "category",
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

  const status =
    mapStatus(
      getText(
        formData,
        "status",
      ),
    );

  if (
    !title ||
    !neighborhood ||
    !category
  ) {
    return {
      success: false,
      message:
        "Preencha título, bairro e categoria.",
    };
  }

  if (title.length > 200) {
    return {
      success: false,
      message:
        "O título deve ter no máximo 200 caracteres.",
    };
  }

  if (
    !purpose ||
    !propertyType ||
    !status
  ) {
    return {
      success: false,
      message:
        "Finalidade, tipo ou status inválido.",
    };
  }

  const consultantScore =
    parseDecimal(
      getText(
        formData,
        "consultantScore",
      ),
    );

  if (
    consultantScore !== null &&
    (
      consultantScore < 0 ||
      consultantScore > 10
    )
  ) {
    return {
      success: false,
      message:
        "A nota consultiva deve estar entre 0 e 10.",
    };
  }

  const latitude =
    parseDecimal(
      getText(
        formData,
        "latitude",
      ),
    );

  const longitude =
    parseDecimal(
      getText(
        formData,
        "longitude",
      ),
    );

  if (
    latitude !== null &&
    (
      latitude < -90 ||
      latitude > 90
    )
  ) {
    return {
      success: false,
      message:
        "A latitude informada é inválida.",
    };
  }

  if (
    longitude !== null &&
    (
      longitude < -180 ||
      longitude > 180
    )
  ) {
    return {
      success: false,
      message:
        "A longitude informada é inválida.",
    };
  }

  const state =
    getText(
      formData,
      "state",
    ) || "SP";

  if (state.length > 2) {
    return {
      success: false,
      message:
        "Utilize a sigla do estado com 2 caracteres. Ex.: SP.",
    };
  }

  const opportunityProfiles =
    formData
      .getAll(
        "opportunityProfile",
      )
      .map((value) =>
        mapOpportunityProfile(
          String(value),
        ),
      )
      .filter(
        (
          value,
        ): value is NonNullable<
          ReturnType<
            typeof mapOpportunityProfile
          >
        > => value !== null,
      );

  const features =
    getText(
      formData,
      "features",
    )
      .split(/\r?\n/)
      .map((item) =>
        item.trim(),
      )
      .filter(Boolean);

  try {
    await prisma.property.update({
      where: {
        code: originalCode,
      },

      data: {
        title,

        purpose,

        opportunityProfiles,

        propertyType,

        category,

        status,

        highlight:
          formData.get(
            "highlight",
          ) === "on",

        consultantScore,

        tag:
          getOptionalText(
            formData,
            "tag",
          ),

        state:
          state.toUpperCase(),

        city:
          getText(
            formData,
            "city",
          ) ||
          "São José dos Campos",

        neighborhood,

        ownerId:
          validatedOwnerId,

        captorId,

        coCaptorId,

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

        address:
          getOptionalText(
            formData,
            "address",
          ),

        zipCode:
          getOptionalText(
            formData,
            "zipCode",
          ),

        latitude,

        longitude,

        googleMapsUrl:
          getOptionalText(
            formData,
            "googleMapsUrl",
          ),

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
          parseInteger(
            getText(
              formData,
              "bedrooms",
            ),
          ),

        suites:
          parseInteger(
            getText(
              formData,
              "suites",
            ),
          ),

        bathrooms:
          parseInteger(
            getText(
              formData,
              "bathrooms",
            ),
          ),

        parking:
          parseInteger(
            getText(
              formData,
              "parking",
            ),
          ),

        description:
          getOptionalText(
            formData,
            "description",
          ),

        features,

        video:
          getOptionalText(
            formData,
            "video",
          ),

        virtualTour:
          getOptionalText(
            formData,
            "virtualTour",
          ),

        brochure:
          getOptionalText(
            formData,
            "brochure",
          ),

        seoTitle:
          getOptionalText(
            formData,
            "seoTitle",
          ),

        seoDescription:
          getOptionalText(
            formData,
            "seoDescription",
          ),

        seoImage:
          getOptionalText(
            formData,
            "seoImage",
          ),
      },
    });

    revalidatePath(
      "/admin",
    );

    revalidatePath(
      "/admin/imoveis",
    );

    revalidatePath(
      `/admin/imoveis/${originalCode}`,
    );

    return {
      success: true,
      message:
        `Imóvel ${originalCode} atualizado com sucesso no banco de dados.`,
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar imóvel:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o imóvel. Verifique os dados e tente novamente.",
    };
  }
}