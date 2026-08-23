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

type MatchType =
  | "exact"
  | "similar"
  | "none";

function normalizePropertyType(
  value?: string,
): PropertyType | undefined {
  if (value === "Casa") {
    return PropertyType.CASA;
  }

  if (value === "Apartamento") {
    return PropertyType.APARTAMENTO;
  }

  if (value === "Terreno") {
    return PropertyType.TERRENO;
  }

  if (value === "Comercial") {
    return PropertyType.COMERCIAL;
  }

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

  if (
    value ===
    "Valorização patrimonial"
  ) {
    return OpportunityProfile.VALORIZACAO;
  }

  return undefined;
}

function getValueRange(
  value?: string,
): ValueRange | null {
  if (
    value ===
    "Até R$ 500 mil"
  ) {
    return {
      max: 500000,
    };
  }

  if (
    value ===
    "De R$ 500 mil a R$ 1 milhão"
  ) {
    return {
      min: 500000,
      max: 1000000,
    };
  }

  if (
    value ===
    "De R$ 1 milhão a R$ 2 milhões"
  ) {
    return {
      min: 1000000,
      max: 2000000,
    };
  }

  if (
    value ===
    "De R$ 2 milhões a R$ 3 milhões"
  ) {
    return {
      min: 2000000,
      max: 3000000,
    };
  }

  if (
    value ===
    "Acima de R$ 3 milhões"
  ) {
    return {
      min: 3000000,
    };
  }

  return null;
}

function getMinimumBedrooms(
  value?: string,
) {
  if (
    value ===
    "1 dormitório"
  ) {
    return 1;
  }

  if (
    value ===
    "2 dormitórios"
  ) {
    return 2;
  }

  if (
    value ===
    "3 dormitórios"
  ) {
    return 3;
  }

  if (
    value ===
    "4 ou mais dormitórios"
  ) {
    return 4;
  }

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

  const number =
    Number(
      value.toString(),
    );

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizeText(
  value: string | null | undefined,
) {
  return (
    value
      ?.normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .trim() ?? ""
  );
}

function isPriceInsideRange(
  price: number | null,
  range: ValueRange | null,
) {
  if (
    price === null ||
    !range
  ) {
    return false;
  }

  if (
    range.min !== undefined &&
    price < range.min
  ) {
    return false;
  }

  if (
    range.max !== undefined &&
    price > range.max
  ) {
    return false;
  }

  return true;
}

function isPriceNearRange(
  price: number | null,
  range: ValueRange | null,
) {
  if (
    price === null ||
    !range
  ) {
    return false;
  }

  const expandedMin =
    range.min !== undefined
      ? range.min * 0.8
      : undefined;

  const expandedMax =
    range.max !== undefined
      ? range.max * 1.2
      : undefined;

  if (
    expandedMin !== undefined &&
    price < expandedMin
  ) {
    return false;
  }

  if (
    expandedMax !== undefined &&
    price > expandedMax
  ) {
    return false;
  }

  return true;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as
        IrisSearchRequest;

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
        body.value,
      );

    const minimumBedrooms =
      getMinimumBedrooms(
        body.bedrooms,
      );

    const region =
      body.region?.trim();

    const exactProperties =
      await prisma.property.findMany({
        where: {
          published: true,

          status:
            "DISPONIVEL",

          ...(propertyType
            ? {
                propertyType,
              }
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
                      contains:
                        region,
                      mode:
                        "insensitive",
                    },
                  },

                  {
                    city: {
                      contains:
                        region,
                      mode:
                        "insensitive",
                    },
                  },

                  {
                    development: {
                      contains:
                        region,
                      mode:
                        "insensitive",
                    },
                  },

                  {
                    location: {
                      contains:
                        region,
                      mode:
                        "insensitive",
                    },
                  },
                ],
              }
            : {}),

          ...(minimumBedrooms !==
          undefined
            ? {
                bedrooms: {
                  gte:
                    minimumBedrooms,
                },
              }
            : {}),

          ...(valueRange
            ? body.purpose ===
              "Locação"
              ? {
                  rentalPrice: {
                    ...(valueRange.min !==
                    undefined
                      ? {
                          gte:
                            valueRange.min,
                        }
                      : {}),

                    ...(valueRange.max !==
                    undefined
                      ? {
                          lte:
                            valueRange.max,
                        }
                      : {}),
                  },
                }
              : {
                  price: {
                    ...(valueRange.min !==
                    undefined
                      ? {
                          gte:
                            valueRange.min,
                        }
                      : {}),

                    ...(valueRange.max !==
                    undefined
                      ? {
                          lte:
                            valueRange.max,
                        }
                      : {}),
                  },
                }
            : {}),
        },

        include: {
          images: {
            orderBy: [
              {
                isCover:
                  "desc",
              },
              {
                position:
                  "asc",
              },
              {
                id:
                  "asc",
              },
            ],

            take: 1,
          },
        },

        orderBy: [
          {
            highlight:
              "desc",
          },
          {
            publishedAt:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],

        take: 6,
      });

    let properties =
      exactProperties;

    let matchType: MatchType =
      exactProperties.length > 0
        ? "exact"
        : "none";

    if (
      exactProperties.length === 0
    ) {
      const similarCandidates =
        await prisma.property.findMany({
          where: {
            published: true,

            status:
              "DISPONIVEL",

            ...(purposes
              ? {
                  purpose: {
                    in: purposes,
                  },
                }
              : {}),
          },

          include: {
            images: {
              orderBy: [
                {
                  isCover:
                    "desc",
                },
                {
                  position:
                    "asc",
                },
                {
                  id:
                    "asc",
                },
              ],

              take: 1,
            },
          },

          orderBy: [
            {
              highlight:
                "desc",
            },
            {
              publishedAt:
                "desc",
            },
            {
              createdAt:
                "desc",
            },
          ],

          take: 50,
        });

      const normalizedRegion =
        normalizeText(
          region,
        );

      const scoredCandidates =
        similarCandidates
          .flatMap(
            (property) => {
              const candidatePrice =
                body.purpose ===
                "Locação"
                  ? decimalToNumber(
                      property.rentalPrice,
                    )
                  : decimalToNumber(
                      property.price,
                    );

              if (
                valueRange &&
                !isPriceInsideRange(
                  candidatePrice,
                  valueRange,
                ) &&
                !isPriceNearRange(
                  candidatePrice,
                  valueRange,
                )
              ) {
                return [];
              }

              let score = 0;

              if (propertyType) {
                if (
                  property.propertyType ===
                  propertyType
                ) {
                  score += 6;
                } else {
                  const requestedResidential =
                    propertyType ===
                      PropertyType.CASA ||
                    propertyType ===
                      PropertyType.APARTAMENTO;

                  const candidateResidential =
                    property.propertyType ===
                      PropertyType.CASA ||
                    property.propertyType ===
                      PropertyType.APARTAMENTO;

                  if (
                    requestedResidential &&
                    candidateResidential
                  ) {
                    score += 2;
                  } else {
                    return [];
                  }
                }
              }

              if (
                normalizedRegion
              ) {
                const searchableLocation =
                  [
                    property.neighborhood,
                    property.city,
                    property.development,
                    property.location,
                  ]
                    .map(
                      normalizeText,
                    )
                    .join(" ");

                if (
                  searchableLocation.includes(
                    normalizedRegion,
                  )
                ) {
                  score += 5;
                }
              }

              if (
                objective &&
                property.opportunityProfiles.includes(
                  objective,
                )
              ) {
                score += 3;
              }

              if (
                minimumBedrooms !==
                undefined
              ) {
                if (
                  property.bedrooms >=
                  minimumBedrooms
                ) {
                  score += 3;
                } else if (
                  property.bedrooms ===
                  minimumBedrooms - 1
                ) {
                  score += 1;
                }
              }

              if (valueRange) {
                if (
                  isPriceInsideRange(
                    candidatePrice,
                    valueRange,
                  )
                ) {
                  score += 4;
                } else {
                  score += 1;
                }
              }

              if (score <= 0) {
                return [];
              }

              return [
                {
                  property,
                  score,
                },
              ];
            },
          )
          .sort(
            (a, b) =>
              b.score -
              a.score,
          )
          .slice(
            0,
            6,
          )
          .map(
            ({ property }) =>
              property,
          );

      if (
        scoredCandidates.length >
        0
      ) {
        properties =
          scoredCandidates;

        matchType =
          "similar";
      }
    }
    const results =
      properties.map(
        (property) => {
          const image =
            property.images[0];

          const price =
            body.purpose ===
            "Locação"
              ? decimalToNumber(
                  property.rentalPrice,
                )
              : decimalToNumber(
                  property.price,
                );

          return {
            code:
              property.code,

            title:
              property.title,

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
              property.bedrooms,

            suites:
              property.suites,

            parking:
              property.parking,

            image:
              image?.url ??
              null,

            url:
              `/imovel/${property.code.toLowerCase()}`,
          };
        },
      );

    return NextResponse.json({
      success: true,

      count:
        results.length,

      matchType,

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
        matchType:
          "none",
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