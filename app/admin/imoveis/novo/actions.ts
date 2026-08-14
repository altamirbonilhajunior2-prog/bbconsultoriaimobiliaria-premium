"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../../auth";
import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

export type PropertyFormState = {
  success: boolean;
  message: string;
  propertyId?: number;
};

export type PropertyFormAgent = {
  id: number;
  name: string;
  role: "ADMIN" | "CAPTADOR";
};

export type PropertyFormAccessData = {
  success: boolean;
  isAdmin: boolean;
  agentId: number | null;
  agents: PropertyFormAgent[];
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

function createSlug(
  code: string,
  title: string,
) {
  return `${code}-${title}`
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(0, 220);
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

function getPropertyCodePrefix(
  propertyType: NonNullable<
    ReturnType<typeof mapPropertyType>
  >,
) {
  switch (propertyType) {
    case "CASA":
      return "BBC";

    case "APARTAMENTO":
      return "BBA";

    case "TERRENO":
      return "BBT";

    case "COMERCIAL":
      return "BBM";

    case "RURAL":
      return "BBR";
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

export async function getPropertyFormAccessAction(): Promise<PropertyFormAccessData> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      isAdmin: false,
      agentId: null,
      agents: [],
    };
  }

  const access =
    await getAccessContext();

  const agents =
    await prisma.agent.findMany({
      where: {
        active: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        role: true,
      },
    });

  return {
    success: true,
    isAdmin: access.isAdmin,
    agentId:
      access.agentId ?? null,
    agents,
  };
}

export async function createPropertyAction(
  _previousState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
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

  if (
    !access.isAdmin &&
    !access.agentId
  ) {
    return {
      success: false,
      message:
        "Não foi possível identificar o angariador responsável.",
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

  const requestedCaptorId =
    getOptionalInteger(
      formData,
      "captorId",
    );

  const coCaptorId =
    getOptionalInteger(
      formData,
      "coCaptorId",
    );

  const captorId =
    access.isAdmin
      ? requestedCaptorId
      : access.agentId;

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
        "O título do imóvel deve ter no máximo 200 caracteres.",
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

  const internalNotes =
    getOptionalText(
      formData,
      "internalNotes",
    );

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

  if (state.length > 2) {
    return {
      success: false,
      message:
        "Utilize a sigla do estado com 2 caracteres. Ex.: SP.",
    };
  }

  try {
    const agents =
      await prisma.agent.findMany({
        where: {
          id: {
            in: [
              captorId,
              ...(coCaptorId !== null
                ? [coCaptorId]
                : []),
            ],
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
          (agent) => agent.id,
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

    const property =
      await prisma.$transaction(
        async (tx) => {
          const prefix =
            getPropertyCodePrefix(
              propertyType,
            );

          const existingCodes =
            await tx.property.findMany({
              where: {
                code: {
                  startsWith:
                    prefix,
                },
              },

              select: {
                code: true,
              },
            });

          const highestNumber =
            existingCodes.reduce(
              (
                highest,
                property,
              ) => {
                const match =
                  property.code.match(
                    new RegExp(
                      `^${prefix}(\\d+)$`,
                      "i",
                    ),
                  );

                if (!match) {
                  return highest;
                }

                const number =
                  Number.parseInt(
                    match[1],
                    10,
                  );

                if (
                  !Number.isFinite(
                    number,
                  )
                ) {
                  return highest;
                }

                return Math.max(
                  highest,
                  number,
                );
              },
              0,
            );

          const code =
            `${prefix}${String(
              highestNumber + 1,
            ).padStart(3, "0")}`;

          return tx.property.create({
            data: {
              code,

              title,

              slug: createSlug(
                code,
                title,
              ),

              purpose,

              opportunityProfiles,

              propertyType,

              category,

              status,

              highlight:
                formData.get(
                  "highlight",
                ) === "on",

              published: false,

              internalNotes,

              tag: getOptionalText(
                formData,
                "tag",
              ),

              state:
                state.toUpperCase(),

              city,

              neighborhood,

              ownerId,

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

            select: {
              id: true,
              code: true,
            },
          });
        },
        {
          isolationLevel:
            "Serializable",
        },
      );

    revalidatePath(
      "/admin",
    );

    revalidatePath(
      "/admin/imoveis",
    );

    return {
      success: true,
      propertyId:
        property.id,
      message:
        `Imóvel ${property.code} cadastrado com sucesso no banco de dados.`,
    };
  } catch (error) {
    console.error(
      "Erro ao cadastrar imóvel:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o imóvel. Verifique os dados e tente novamente.",
    };
  }
}