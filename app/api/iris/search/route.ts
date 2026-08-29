import { NextResponse } from "next/server";
import {
  OpportunityProfile,
  PropertyPurpose,
  PropertyType,
} from "../../../../generated/prisma/client";
import { prisma } from "../../../../lib/prisma";

type IrisSearchRequest = {
  purpose?: string;
  propertyType?: string;
  region?: string;
  value?: string;
  bedrooms?: string;
  objective?: string;
};

type ValueRange = {
  min?: number;
  max?: number;
};

function normalizePropertyType(
  value?: string,
): PropertyType | undefined {
  if (value === "Casa") return PropertyType.CASA;
  if (value === "Apartamento") return PropertyType.APARTAMENTO;
  if (value === "Terreno") return PropertyType.TERRENO;

  if (
    value === "Rural" ||
    value === "Chácara" ||
    value === "Sitio" ||
    value === "Sítio" ||
    value === "Fazenda" ||
    value === "Área Rural"
  ) {
    return PropertyType.RURAL;
  }

  if (value === "Comercial") return PropertyType.COMERCIAL;

  return undefined;
}

function normalizePurpose(
  value?: string,
): PropertyPurpose[] | undefined {
  if (value === "Compra") {
    return [
      PropertyPurpose.VENDA,
      PropertyPurpose.VENDA_E_LOCACAO,
    ];
  }

  if (value === "Locação") {
    return [
      PropertyPurpose.LOCACAO,
      PropertyPurpose.VENDA_E_LOCACAO,
    ];
  }

  return undefined;
}

function normalizeObjective(
  value?: string,
): OpportunityProfile | undefined {
  if (value === "Moradia") {
    return OpportunityProfile.MORADIA;
  }

  if (value === "Investimento") {
    return OpportunityProfile.INVESTIMENTO;
  }

  if (value === "Renda") {
    return OpportunityProfile.RENDA;
  }

  if (value === "Valorização patrimonial") {
    return OpportunityProfile.VALORIZACAO;
  }

  return undefined;
}

function getPurchaseValueRange(
  value?: string,
): ValueRange | null {
  if (value === "Até R$ 500 mil") {
    return { max: 500000 };
  }

  if (value === "De R$ 500 mil a R$ 1 milhão") {
    return {
      min: 500000,
      max: 1000000,
    };
  }

  if (value === "De R$ 1 milhão a R$ 2 milhões") {
    return {
      min: 1000000,
      max: 2000000,
    };
  }

  if (value === "De R$ 2 milhões a R$ 3 milhões") {
    return {
      min: 2000000,
      max: 3000000,
    };
  }

  if (value === "Acima de R$ 3 milhões") {
    return {
      min: 3000000,
    };
  }

  return null;
}

function getRentalValueRange(
  value?: string,
): ValueRange | null {
  if (value === "Até R$ 3 mil/mês") {
    return { max: 3000 };
  }

  if (value === "De R$ 3 mil a R$ 5 mil/mês") {
    return {
      min: 3000,
      max: 5000,
    };
  }

  if (value === "De R$ 5 mil a R$ 8 mil/mês") {
    return {
      min: 5000,
      max: 8000,
    };
  }

  if (value === "De R$ 8 mil a R$ 12 mil/mês") {
    return {
      min: 8000,
      max: 12000,
    };
  }

  if (value === "Acima de R$ 12 mil/mês") {
    return {
      min: 12000,
    };
  }

  return null;
}

function getValueRange(
  purpose?: string,
  value?: string,
): ValueRange | null {
  if (!value || value === "Ainda não defini") {
    return null;
  }

  if (purpose === "Locação") {
    return getRentalValueRange(value);
  }

  return getPurchaseValueRange(value);
}

function getMinimumBedrooms(
  value?: string,
) {
  if (value === "1 dormitório") return 1;
  if (value === "2 dormitórios") return 2;
  if (value === "3 dormitórios") return 3;
  if (value === "4 ou mais dormitórios") return 4;

  return undefined;
}

function decimalToNumber(
  value: {
    toString(): string;
  } | null,
) {
  if (value === null) {
    return null;
  }

  const number = Number(value.toString());

  return Number.isFinite(number)
    ? number
    : null;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as IrisSearchRequest;

    const propertyType =
      normalizePropertyType(
        body.propertyType,
      );

    const purposes =
      normalizePurpose(
        body.purpose,
      );

    const objective =
      normalizeObjective(
        body.objective,
      );

    const valueRange =
      getValueRange(
        body.purpose,
        body.value,
      );

    const isLandOrRural =
      propertyType === PropertyType.TERRENO ||
      propertyType === PropertyType.RURAL;

    const minimumBedrooms =
      isLandOrRural
        ? undefined
        : getMinimumBedrooms(
            body.bedrooms,
          );

    const region =
      body.region?.trim();

    let properties =
      await prisma.property.findMany({
        where: {
          published: true,
          status: "DISPONIVEL",

          ...(propertyType
            ? { propertyType }
            : {}),

          ...(purposes
            ? {
                purpose: {
                  in: purposes,
                },
              }
            : {}),

          ...(objective
            ? {
                opportunityProfiles: {
                  has: objective,
                },
              }
            : {}),

          ...(region
            ? {
                OR: [
                  {
                    neighborhood: {
                      contains: region,
                      mode: "insensitive",
                    },
                  },
                  {
                    city: {
                      contains: region,
                      mode: "insensitive",
                    },
                  },
                  {
                    development: {
                      contains: region,
                      mode: "insensitive",
                    },
                  },
                  {
                    location: {
                      contains: region,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),

          ...(minimumBedrooms !== undefined
            ? {
                bedrooms: {
                  gte: minimumBedrooms,
                },
              }
            : {}),

          ...(valueRange
            ? body.purpose === "Locação"
              ? {
                  rentalPrice: {
                    ...(valueRange.min !== undefined
                      ? { gte: valueRange.min }
                      : {}),
                    ...(valueRange.max !== undefined
                      ? { lte: valueRange.max }
                      : {}),
                  },
                }
              : {
                  price: {
                    ...(valueRange.min !== undefined
                      ? { gte: valueRange.min }
                      : {}),
                    ...(valueRange.max !== undefined
                      ? { lte: valueRange.max }
                      : {}),
                  },
                }
            : {}),
        },

        include: {
          images: {
            orderBy: [
              {
                isCover: "desc",
              },
              {
                position: "asc",
              },
            ],
            take: 1,
          },
        },

        orderBy: [
          {
            highlight: "desc",
          },
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],

        take: 6,
      });

    if (properties.length === 0) {
      properties =
        await prisma.property.findMany({
          where: {
            published: true,
            status: "DISPONIVEL",

            ...(propertyType
              ? { propertyType }
              : {}),

            ...(region
              ? {
                  OR: [
                    {
                      neighborhood: {
                        contains: region,
                        mode: "insensitive",
                      },
                    },
                    {
                      city: {
                        contains: region,
                        mode: "insensitive",
                      },
                    },
                    {
                      development: {
                        contains: region,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {}),
          },

          include: {
            images: {
              orderBy: [
                {
                  isCover: "desc",
                },
                {
                  position: "asc",
                },
              ],
              take: 1,
            },
          },

          orderBy: [
            {
              highlight: "desc",
            },
            {
              publishedAt: "desc",
            },
          ],

          take: 6,
        });
    }

    const results =
      properties.map(
        (property) => {
          const image =
            property.images[0];

          const price =
            body.purpose === "Locação"
              ? decimalToNumber(
                  property.rentalPrice,
                )
              : decimalToNumber(
                  property.price,
                );

          return {
            code: property.code,
            title: property.title,
            propertyType:
              property.propertyType,
            category:
              property.category,
            neighborhood:
              property.neighborhood,
            city:
              property.city,
            development:
              property.development,
            purpose:
              property.purpose,
            price,
            bedrooms:
  property.propertyType === PropertyType.TERRENO ||
  property.propertyType === PropertyType.RURAL
    ? 0
    : property.bedrooms,
            suites:
  property.propertyType === PropertyType.TERRENO ||
  property.propertyType === PropertyType.RURAL
    ? 0
    : property.suites,
           parking:
  property.propertyType === PropertyType.TERRENO ||
  property.propertyType === PropertyType.RURAL
    ? 0
    : property.parking,
            image:
              image?.url ?? null,
            url:
              `/imovel/${property.code.toLowerCase()}`,
          };
        },
      );

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error(
      "Erro na busca da Íris:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        count: 0,
        results: [],
        message:
          "Não foi possível realizar a busca agora.",
      },
      {
        status: 500,
      },
    );
  }
}
