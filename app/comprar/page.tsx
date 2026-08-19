import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ComprarFilters from "../components/ComprarFilters";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Imóveis à Venda em São José dos Campos e Região | B&B Consultoria Imobiliária",
  description:
    "Encontre imóveis à venda em São José dos Campos e região com curadoria, análise estratégica e atendimento consultivo da B&B Consultoria Imobiliária.",
};

type ComprarPageProps = {
  searchParams: Promise<{
    finalidade?: string | string[];
    estado?: string | string[];
    cidade?: string | string[];
    perfil?: string | string[];
    bairro?: string | string[];
    empreendimento?: string | string[];
    tipo?: string | string[];
    categoria?: string | string[];
    dormitorios?: string | string[];
    valor?: string | string[];
  }>;
};

const propertyTypeLabels = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
} as const;

const opportunityProfileLabels = {
  MORADIA: "Moradia",
  INVESTIMENTO: "Investimento",
  RENDA: "Renda",
  VALORIZACAO: "Valorização",
  LANCAMENTO: "Lançamento",
} as const;

function getSingleParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function isDefaultValue(
  value: string | undefined,
  defaults: string[],
) {
  if (!value) {
    return true;
  }

  const normalizedValue =
    normalizeText(value);

  return defaults.some(
    (defaultValue) =>
      normalizeText(
        defaultValue,
      ) === normalizedValue,
  );
}

function matchesNeighborhood(
  propertyNeighborhood: string,
  selectedNeighborhood: string,
) {
  const propertyValue =
    normalizeText(
      propertyNeighborhood,
    );

  const selectedValue =
    normalizeText(
      selectedNeighborhood,
    );

  return (
    propertyValue ===
      selectedValue ||
    propertyValue.startsWith(
      selectedValue,
    ) ||
    selectedValue.startsWith(
      propertyValue,
    )
  );
}

function matchesBedroomFilter(
  propertyBedrooms: number,
  selectedBedrooms: string,
) {
  if (
    selectedBedrooms === "4+"
  ) {
    return (
      propertyBedrooms >= 4
    );
  }

  const quantity =
    Number.parseInt(
      selectedBedrooms,
      10,
    );

  if (
    Number.isNaN(quantity)
  ) {
    return true;
  }

  return (
    propertyBedrooms ===
    quantity
  );
}

function matchesValueFilter(
  numericPrice: number | null,
  selectedValue: string,
) {
  if (
    numericPrice === null
  ) {
    return false;
  }

  const normalized =
    normalizeText(
      selectedValue,
    );

  switch (normalized) {
    case "ate r$ 500 mil":
      return (
        numericPrice <=
        500000
      );

    case "ate r$ 1 milhao":
      return (
        numericPrice <=
        1000000
      );

    case "ate r$ 2 milhoes":
      return (
        numericPrice <=
        2000000
      );

    case "ate r$ 3 milhoes":
      return (
        numericPrice <=
        3000000
      );

    case "acima de r$ 3 milhoes":
      return (
        numericPrice >
        3000000
      );

    default:
      return true;
  }
}

function decimalToNumber(
  value: {
    toString(): string;
  } | null,
) {
  if (value === null) {
    return null;
  }

  const number = Number(
    value.toString(),
  );

  return Number.isFinite(
    number,
  )
    ? number
    : null;
}

function formatCurrency(
  value: number | null,
) {
  if (value === null) {
    return "Sob consulta";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatArea(
  value: {
    toString(): string;
  } | null,
) {
  if (value === null) {
    return "Consulte";
  }

  const number = Number(
    value.toString(),
  );

  if (
    !Number.isFinite(number)
  ) {
    return "Consulte";
  }

  return `${new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    },
  ).format(number)} m²`;
}

export default async function ComprarPage({
  searchParams,
}: ComprarPageProps) {
  const params =
    await searchParams;

  const purpose =
    getSingleParam(
      params.finalidade,
    );

  const state =
    getSingleParam(
      params.estado,
    );

  const city =
    getSingleParam(
      params.cidade,
    );

  const profile =
    getSingleParam(
      params.perfil,
    );

  const neighborhood =
    getSingleParam(
      params.bairro,
    );

  const development =
    getSingleParam(
      params.empreendimento,
    );

  const propertyType =
    getSingleParam(
      params.tipo,
    );

  const category =
    getSingleParam(
      params.categoria,
    );

  const bedrooms =
    getSingleParam(
      params.dormitorios,
    );

  const value =
    getSingleParam(
      params.valor,
    );

  const hasPurposeFilter =
    !isDefaultValue(
      purpose,
      [
        "Todas as finalidades",
        "Venda",
      ],
    );

  const hasStateFilter =
    !isDefaultValue(
      state,
      [
        "Todos os estados",
        "Estado",
      ],
    );

  const hasCityFilter =
    !isDefaultValue(
      city,
      [
        "Todas as cidades",
        "Cidade",
      ],
    );

  const hasProfileFilter =
    !isDefaultValue(
      profile,
      [
        "Todos os perfis",
        "Perfil",
      ],
    );

  const hasNeighborhoodFilter =
    !isDefaultValue(
      neighborhood,
      [
        "Todos os bairros",
        "Bairro",
      ],
    );

  const hasDevelopmentFilter =
    !isDefaultValue(
      development,
      [
        "Todos os empreendimentos",
        "Empreendimento",
      ],
    );

  const hasPropertyTypeFilter =
    !isDefaultValue(
      propertyType,
      [
        "Todos",
        "Todos os tipos",
        "Tipo",
      ],
    );

  const hasCategoryFilter =
    !isDefaultValue(
      category,
      [
        "Todas as categorias",
        "Selecione o tipo primeiro",
        "Categoria",
      ],
    );

  const hasBedroomsFilter =
    !isDefaultValue(
      bedrooms,
      [
        "Todos",
        "Qualquer quantidade",
        "Dormitórios",
      ],
    );

  const hasValueFilter =
    !isDefaultValue(
      value,
      [
        "Todos os valores",
        "Qualquer valor",
        "Valor",
      ],
    );

  const hasActiveFilters =
    hasPurposeFilter ||
    hasStateFilter ||
    hasCityFilter ||
    hasProfileFilter ||
    hasNeighborhoodFilter ||
    hasDevelopmentFilter ||
    hasPropertyTypeFilter ||
    hasCategoryFilter ||
    hasBedroomsFilter ||
    hasValueFilter;

  const databaseProperties =
    await prisma.property.findMany({
      where: {
        published: true,

        purpose: {
          in: [
            "VENDA",
            "VENDA_E_LOCACAO",
          ],
        },
      },

      include: {
        images: {
          orderBy: [
            {
              position: "asc",
            },
            {
              id: "asc",
            },
          ],
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
    });

  const filteredProperties =
    databaseProperties.filter(
      (property) => {
        if (
          hasPurposeFilter &&
          purpose
        ) {
          const normalizedPurpose =
            normalizeText(
              purpose,
            );

          if (
            normalizedPurpose !==
              "venda" &&
            normalizedPurpose !==
              "venda e locacao"
          ) {
            return false;
          }

          if (
            normalizedPurpose ===
              "venda e locacao" &&
            property.purpose !==
              "VENDA_E_LOCACAO"
          ) {
            return false;
          }
        }

        if (
          hasStateFilter &&
          state &&
          normalizeText(
            property.state,
          ) !==
            normalizeText(state)
        ) {
          return false;
        }

        if (
          hasCityFilter &&
          city &&
          normalizeText(
            property.city,
          ) !==
            normalizeText(city)
        ) {
          return false;
        }

        if (
          hasProfileFilter &&
          profile
        ) {
          const profiles =
            property.opportunityProfiles.map(
              (item) =>
                opportunityProfileLabels[
                  item
                ],
            );

          const hasProfile =
            profiles.some(
              (item) =>
                normalizeText(
                  item,
                ) ===
                normalizeText(
                  profile,
                ),
            );

          if (!hasProfile) {
            return false;
          }
        }

        if (
          hasNeighborhoodFilter &&
          neighborhood &&
          !matchesNeighborhood(
            property.neighborhood,
            neighborhood,
          )
        ) {
          return false;
        }

        if (
          hasDevelopmentFilter &&
          development &&
          normalizeText(
            property.development ??
              "",
          ) !==
            normalizeText(
              development,
            )
        ) {
          return false;
        }

        if (
          hasPropertyTypeFilter &&
          propertyType &&
          normalizeText(
            propertyTypeLabels[
              property.propertyType
            ],
          ) !==
            normalizeText(
              propertyType,
            )
        ) {
          return false;
        }

        if (
          hasCategoryFilter &&
          category &&
          normalizeText(
            property.category,
          ) !==
            normalizeText(
              category,
            )
        ) {
          return false;
        }

        if (
          hasBedroomsFilter &&
          bedrooms &&
          !matchesBedroomFilter(
            property.bedrooms,
            bedrooms,
          )
        ) {
          return false;
        }

        if (
          hasValueFilter &&
          value &&
          !matchesValueFilter(
            decimalToNumber(
              property.price,
            ),
            value,
          )
        ) {
          return false;
        }

        return true;
      },
    );

  const cards =
    filteredProperties.map(
      (property) => {
        const coverImage =
          property.images.find(
            (image) =>
              image.isCover,
          ) ??
          property.images[0];

        const numericPrice =
          decimalToNumber(
            property.price,
          );

        return {
          code:
            property.code,

          title:
            property.title,

          location:
            property.location ||
            [
              property.neighborhood,
              property.city,
            ]
              .filter(Boolean)
              .join(" • "),

          price:
            formatCurrency(
              numericPrice,
            ),

          image:
            coverImage?.url ??
            "/logo-bb.png",

          tag:
            property.tag ??
            (property.highlight
              ? "Destaque"
              : ""),

          area:
            formatArea(
              property.area,
            ),

          bedrooms:
            String(
              property.bedrooms,
            ),

          parking:
            String(
              property.parking,
            ),
        };
      },
    );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-14 lg:px-10 xl:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            Comprar
          </p>

          <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[1250px]">
              <h1 className="font-serif text-[38px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] lg:text-[50px] xl:text-[56px]">
                Imóveis à venda em São José dos Campos e região.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Selecionamos imóveis com análise de localização, padrão
                construtivo, liquidez, valorização e adequação ao seu objetivo
                para tornar sua decisão de compra mais segura.
              </p>
            </div>

            <Link
              href="/consultoria"
              className="inline-flex min-h-13 w-fit shrink-0 items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Conheça nossa consultoria
            </Link>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="border-b border-white/10 bg-black">
            <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
              <div className="h-28 animate-pulse border border-white/10 bg-[#111111]" />
            </div>
          </section>
        }
      >
        <ComprarFilters />
      </Suspense>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Imóveis à venda
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              {hasActiveFilters
                ? "Resultados da sua busca"
                : "Imóveis selecionados para venda"}
            </h2>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="text-sm text-zinc-500">
              {cards.length}{" "}
              {cards.length === 1
                ? "imóvel encontrado"
                : "imóveis encontrados"}
            </p>

            {hasActiveFilters ? (
              <Link
                href="/comprar"
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
              >
                Limpar filtros
              </Link>
            ) : null}
          </div>
        </div>

        {cards.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(
              (property) => (
                <PropertyCard
                  key={
                    property.code
                  }
                  code={
                    property.code
                  }
                  title={
                    property.title
                  }
                  location={
                    property.location
                  }
                  price={
                    property.price
                  }
                  image={
                    property.image
                  }
                  tag={
                    property.tag
                  }
                  area={
                    property.area
                  }
                  bedrooms={
                    property.bedrooms
                  }
                  parking={
                    property.parking
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-10 border border-amber-500/25 bg-[#0a0a0a] px-6 py-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Nenhum resultado
              encontrado
            </p>

            <h3 className="mt-5 font-serif text-3xl font-normal sm:text-4xl">
              Não encontramos um imóvel
              com todos os critérios
              selecionados.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Você pode ajustar os
              filtros ou falar com a
              B&amp;B. Podemos
              identificar outras
              oportunidades compatíveis
              com o seu perfil,
              inclusive imóveis que
              ainda não estejam
              publicados no portal.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/comprar"
                className="inline-flex min-h-14 items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
              >
                Limpar filtros
              </Link>

              <Link
                href="/contato"
                className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
              >
                Falar com a B&amp;B
              </Link>
            </div>
          </div>
        )}

        {cards.length > 12 ? (
          <div className="mt-14 flex justify-center gap-3">
            <button
              type="button"
              aria-label="Página 1"
              className="flex h-11 w-11 items-center justify-center border border-amber-500 bg-amber-500 text-sm font-bold text-black"
            >
              1
            </button>

            <button
              type="button"
              aria-label="Página 2"
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-sm text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              2
            </button>

            <button
              type="button"
              aria-label="Página 3"
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-sm text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              3
            </button>

            <button
              type="button"
              className="flex h-11 items-center justify-center border border-white/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              Próxima →
            </button>
          </div>
        ) : null}
      </section>

      <Footer />
    </main>
  );
}