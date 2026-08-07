import Link from "next/link";
import { Suspense } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";
import PropertySearch from "../components/PropertySearch";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Alugar | B&B Consultoria Imobiliária",
  description:
    "Imóveis selecionados para locação em São José dos Campos.",
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
      maximumFractionDigits: 0,
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
            Alugar
          </p>

          <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[1250px]">
              <h1 className="font-serif text-[38px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] lg:text-[50px] xl:text-[56px]">
                Imóveis selecionados
                para locação.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Nós selecionamos
                imóveis para locação
                considerando
                localização, qualidade
                construtiva, segurança,
                mobilidade e perfil de
                cada cliente.
              </p>
            </div>

            <Link
              href="/contato"
              className="inline-flex min-h-13 w-fit items-center justify-center border border-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
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
              Resultado da busca
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              {hasActiveFilters
                ? "Resultados para locação"
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
              Nenhum resultado encontrado
            </p>

            <h3 className="mt-5 font-serif text-3xl font-normal sm:text-4xl">
              Não há imóveis publicados
              para locação com estes
              critérios.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Você pode ajustar os
              filtros ou falar com a
              B&amp;B para verificarmos
              outras oportunidades
              compatíveis com o seu
              perfil.
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

      <Footer />
    </main>
  );
}