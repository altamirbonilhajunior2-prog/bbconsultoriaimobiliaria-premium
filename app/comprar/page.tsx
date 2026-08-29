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
  title: "Imóveis à Venda em São José dos Campos e Região",

  description:
    "Encontre casas, apartamentos, terrenos e imóveis selecionados à venda em São José dos Campos e região, com curadoria e atendimento consultivo da B&B.",

  alternates: {
    canonical: "/comprar",
  },
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
    pagina?: string | string[];
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
          price: {
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

        const basePrice =
          formatCurrency(
            numericPrice,
          );

        const isLaunch =
          property.opportunityProfiles.includes(
            "LANCAMENTO",
          );

        const price =
          isLaunch
            ? `A partir de ${basePrice}*`
            : basePrice;

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

          price,

          image:
            coverImage?.url ??
            "/logo-bb.png",

          tag:
            property.tag ??
            (property.highlight
              ? "Destaque"
              : ""),

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

  const pageSize = 12;
  const totalPages = Math.ceil(
    cards.length / pageSize,
  );
  const requestedPage = Number.parseInt(
    getSingleParam(params.pagina) ?? "1",
    10,
  );
  const currentPage = Math.min(
    Math.max(
      Number.isFinite(requestedPage)
        ? requestedPage
        : 1,
      1,
    ),
    Math.max(totalPages, 1),
  );
  const paginatedCards = cards.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function getPageHref(page: number) {
    const nextParams =
      new URLSearchParams();

    for (const [key, rawValue] of
      Object.entries(params)) {
      if (
        key === "pagina" ||
        rawValue === undefined
      ) {
        continue;
      }

      const values = Array.isArray(rawValue)
        ? rawValue
        : [rawValue];

      for (const item of values) {
        nextParams.append(key, item);
      }
    }

    if (page > 1) {
      nextParams.set(
        "pagina",
        String(page),
      );
    }

    const query = nextParams.toString();

    return `/comprar${
      query ? `?${query}` : ""
    }#imoveis`;
  }

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
                Encontre casas, apartamentos, terrenos e imóveis selecionados
                para venda, com análise de localização, padrão construtivo,
                liquidez, valorização e adequação ao seu objetivo.
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

      <section id="imoveis" className="mx-auto max-w-[1720px] scroll-mt-6 px-6 py-16 lg:px-10 xl:px-12">
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
            {paginatedCards.map(
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
              Não encontramos um imóvel com todos os critérios selecionados.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Você pode ajustar os filtros ou falar com a B&amp;B. Podemos
              identificar outras oportunidades compatíveis com o seu perfil,
              inclusive imóveis que ainda não estejam publicados no portal.
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

        {totalPages > 1 ? (
          <div className="mt-14 flex justify-center gap-3">
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => (
              <Link
                key={page}
                href={getPageHref(page)}
                aria-label={`Página ${page}`}
                aria-current={
                  page === currentPage
                    ? "page"
                    : undefined
                }
                className={`flex h-11 w-11 items-center justify-center border text-sm transition ${
                  page === currentPage
                    ? "border-amber-500 bg-amber-500 font-bold text-black"
                    : "border-white/15 text-zinc-300 hover:border-amber-500 hover:text-amber-400"
                }`}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages ? (
              <Link
                href={getPageHref(
                  currentPage + 1,
                )}
                className="flex h-11 items-center justify-center border border-white/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
              >
                Próxima →
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="border-t border-white/10 bg-[#090909]">
        <div className="mx-auto grid max-w-[1720px] gap-10 px-6 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 xl:px-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
              Comprar imóvel em São José dos Campos
            </p>

            <h2 className="mt-4 max-w-4xl font-serif text-3xl font-normal leading-tight sm:text-4xl">
              Curadoria imobiliária para encontrar o imóvel certo para o seu
              momento.
            </h2>

            <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              A B&amp;B Consultoria Imobiliária seleciona oportunidades em São
              José dos Campos e região considerando localização, padrão
              construtivo, liquidez, potencial de valorização e adequação ao
              perfil de cada cliente. O portal reúne casas, apartamentos,
              terrenos, imóveis em condomínio e oportunidades de médio e alto
              padrão para quem busca morar ou investir com mais segurança.
            </p>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              Entre as regiões acompanhadas pela B&amp;B estão bairros
              valorizados como Urbanova e Jardim Aquarius, além de outras áreas
              consolidadas de São José dos Campos.
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
              href="/consultoria"
              className="flex min-h-14 items-center justify-between border border-amber-500/50 px-5 text-sm text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Conheça a consultoria B&amp;B
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
