import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";
import PropertySearch from "../components/PropertySearch";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imóveis para Alugar em São José dos Campos e Região",

  description:
    "Encontre casas, apartamentos e imóveis selecionados para alugar em São José dos Campos e região, com opções no Urbanova, Jardim Aquarius e atendimento consultivo da B&B.",

  alternates: {
    canonical: "/alugar",
  },
};

type AlugarPageProps = {
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
  const normalized =
    normalizeText(
      selectedBedrooms,
    );

  if (
    normalized === "4+" ||
    normalized === "4 ou mais"
  ) {
    return propertyBedrooms >= 4;
  }

  if (
    normalized === "3 ou mais"
  ) {
    return propertyBedrooms >= 3;
  }

  if (
    normalized === "2 ou mais"
  ) {
    return propertyBedrooms >= 2;
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

function matchesRentalValueFilter(
  rentalPrice: number | null,
  selectedValue: string,
) {
  if (
    rentalPrice === null
  ) {
    return false;
  }

  const normalized =
    normalizeText(
      selectedValue,
    );

  switch (normalized) {
    case "ate r$ 5.000":
      return (
        rentalPrice <= 5000
      );

    case "ate r$ 10.000":
      return (
        rentalPrice <= 10000
      );

    case "ate r$ 20.000":
      return (
        rentalPrice <= 20000
      );

    case "acima de r$ 20.000":
      return (
        rentalPrice > 20000
      );

    default:
      return true;
  }
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

export default async function AlugarPage({
  searchParams,
}: AlugarPageProps) {
  const params =
    await searchParams;

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
            "LOCACAO",
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
          rentalPrice: {
            sort: "desc",
            nulls: "last",
          },
        },
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

          if (
            !profiles.some(
              (item) =>
                normalizeText(
                  item,
                ) ===
                normalizeText(
                  profile,
                ),
            )
          ) {
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
          !matchesRentalValueFilter(
            decimalToNumber(
              property.rentalPrice,
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
              decimalToNumber(
                property.rentalPrice,
              ),
            ),

          image:
            coverImage?.url ??
            "/logo-bb.png",

          tag:
            property.tag ??
            (property.highlight
              ? "Destaque"
              : "Locação"),

          propertyType:
            property.propertyType,

          area:
            formatArea(
              property.propertyType ===
              "TERRENO"
                ? property.landArea
                : property.area,
            ),

          bedrooms:
            String(
              property.bedrooms,
            ),

          suites:
            String(
              property.suites,
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
            Alugar
          </p>

          <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[1250px]">
              <h1 className="font-serif text-[38px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] lg:text-[50px] xl:text-[56px]">
                Imóveis para alugar em São José dos Campos e região.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Casas, apartamentos e imóveis selecionados para locação,
                com foco em localização, segurança, mobilidade, qualidade
                construtiva e adequação ao perfil de cada cliente.
              </p>
            </div>

            <Link
              href="/contato"
              className="inline-flex min-h-13 w-fit shrink-0 items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Falar com um consultor
            </Link>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="border-b border-white/10 bg-black">
            <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
              <div className="h-40 animate-pulse border border-white/10 bg-[#111111]" />
            </div>
          </section>
        }
      >
        <PropertySearch
          showPurpose={false}
          defaultPurpose="Locação"
        />
      </Suspense>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Imóveis para locação
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              {hasActiveFilters
                ? "Resultados da sua busca"
                : "Imóveis disponíveis para locação"}
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
                href="/alugar"
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
                  propertyType={
                    property.propertyType
                  }
                  area={
                    property.area
                  }
                  bedrooms={
                    property.bedrooms
                  }
                  suites={
                    property.suites
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
              Nenhum resultado encontrado
            </p>

            <h3 className="mt-5 font-serif text-3xl font-normal sm:text-4xl">
              Não encontramos um imóvel para locação com todos os critérios
              selecionados.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Ajuste os filtros ou fale com a B&amp;B. Podemos verificar outras
              oportunidades compatíveis com o seu perfil, inclusive imóveis
              que ainda não estejam publicados no portal.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/alugar"
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
      </section>

      <section className="border-t border-white/10 bg-[#090909]">
        <div className="mx-auto grid max-w-[1720px] gap-10 px-6 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 xl:px-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
              Alugar imóvel em São José dos Campos
            </p>

            <h2 className="mt-4 max-w-4xl font-serif text-3xl font-normal leading-tight sm:text-4xl">
              Encontre o imóvel certo para morar com mais segurança e menos
              perda de tempo.
            </h2>

            <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              A B&amp;B Consultoria Imobiliária acompanha o mercado de locação
              em São José dos Campos e seleciona imóveis considerando
              localização, condomínio, padrão construtivo, mobilidade,
              segurança e adequação ao perfil do cliente.
            </p>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              Entre as regiões acompanhadas estão Urbanova, Jardim Aquarius e
              outros bairros consolidados da cidade, com opções de casas,
              apartamentos e imóveis em condomínio para diferentes perfis de
              locação.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <Link
              href="/bairros/urbanova"
              className="flex min-h-14 items-center justify-between border border-white/10 px-5 text-sm text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-400"
            >
              Imóveis no Urbanova
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/bairros/jardim-aquarius"
              className="flex min-h-14 items-center justify-between border border-white/10 px-5 text-sm text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-400"
            >
              Imóveis no Jardim Aquarius
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/contato"
              className="flex min-h-14 items-center justify-between border border-amber-500/50 px-5 text-sm text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Falar com a B&amp;B
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
