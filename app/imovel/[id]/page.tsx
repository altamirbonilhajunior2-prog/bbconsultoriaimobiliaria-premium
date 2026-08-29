import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PropertyCard from "../../components/PropertyCard";
import PropertyGallery from "../../components/PropertyGallery";
import TrackedWhatsAppLink from "../../components/TrackedWhatsAppLink";
import ApproximateLocationMap from "../../components/ApproximateLocationMap";
import { prisma } from "../../../lib/prisma";
import {
  calculatePricePerSquareMeter,
  formatPricePerSquareMeter,
} from "../../../lib/property-metrics";
import { normalizeLocationKey } from "../../../lib/location/normalize";

export const dynamic = "force-dynamic";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const defaultFeatures = [
  "Arquitetura contemporânea",
  "Ambientes integrados",
  "Área gourmet",
  "Suítes confortáveis",
  "Iluminação natural",
  "Paisagismo",
  "Acabamentos selecionados",
  "Condomínio fechado",
];

const analyzedDifferentials = [
  "Localização e qualidade do entorno",
  "Padrão construtivo",
  "Liquidez e facilidade de revenda",
  "Potencial de valorização",
  "Custos futuros de manutenção",
  "Adequação ao objetivo patrimonial",
];

function decimalToNumber(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return null;
  }

  const number = Number(
    value.toString(),
  );

  return Number.isFinite(number)
    ? number
    : null;
}

function getSalePriceRange(
  value: number | null,
) {
  if (value === null) {
    return null;
  }

  if (value <= 500_000) {
    return { lte: 500_000 };
  }

  if (value <= 1_000_000) {
    return {
      gt: 500_000,
      lte: 1_000_000,
    };
  }

  if (value <= 2_000_000) {
    return {
      gt: 1_000_000,
      lte: 2_000_000,
    };
  }

  if (value <= 3_000_000) {
    return {
      gt: 2_000_000,
      lte: 3_000_000,
    };
  }

  return { gt: 3_000_000 };
}

function getRentalPriceRange(
  value: number | null,
) {
  if (value === null) {
    return null;
  }

  if (value <= 5_000) {
    return { lte: 5_000 };
  }

  if (value <= 10_000) {
    return {
      gt: 5_000,
      lte: 10_000,
    };
  }

  if (value <= 20_000) {
    return {
      gt: 10_000,
      lte: 20_000,
    };
  }

  return { gt: 20_000 };
}

function formatCurrency(
  value: { toString(): string } | null,
) {
  const number =
    decimalToNumber(value);

  if (number === null) {
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
  ).format(number);
}

function formatArea(
  value: { toString(): string } | null,
) {
  const number =
    decimalToNumber(value);

  if (number === null) {
    return "Consulte";
  }

  return `${new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    },
  ).format(number)} m²`;
}

function buildLocation(
  neighborhood: string,
  city: string,
  state: string,
  location: string | null,
) {
  if (location) {
    return location;
  }

  return [
    neighborhood,
    `${city}/${state}`,
  ]
    .filter(Boolean)
    .join(" • ");
}

export async function generateMetadata({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const property =
    await prisma.property.findFirst({
      where: {
        code: id.toUpperCase(),
        published: true,
      },

      select: {
        title: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        seoImage: true,
        neighborhood: true,
        city: true,

        images: {
          orderBy: [
            {
              position: "asc",
            },
            {
              id: "asc",
            },
          ],

          select: {
            url: true,
            isCover: true,
          },
        },
      },
    });

  if (!property) {
    return {
      title:
        "Imóvel não encontrado | B&B Consultoria Imobiliária",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const coverImage =
    property.seoImage ||
    property.images.find(
      (image) =>
        image.isCover,
    )?.url ||
    property.images[0]?.url;

  const description =
    property.seoDescription ||
    property.description ||
    `${property.title}, localizado em ${property.neighborhood}, ${property.city}. Consulte a B&B para mais informações.`;

  return {
    title:
      property.seoTitle ||
      `${property.title} | B&B Consultoria Imobiliária`,

    description,

    openGraph: {
      title:
        property.seoTitle ||
        property.title,

      description,

      images: coverImage
        ? [
            {
              url: coverImage,
            },
          ]
        : undefined,
    },
  };
}

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const property =
    await prisma.property.findFirst({
      where: {
        code:
          id.toUpperCase(),

        published:
          true,
      },

      include: {
        images: {
          orderBy: [
            {
              position:
                "asc",
            },
            {
              id:
                "asc",
            },
          ],
        },
      },
    });

  if (!property) {
    notFound();
  }

  const referencePurpose =
    property.purpose === "LOCACAO" ? "LOCACAO" : "VENDA";
  const comparisonArea =
    property.propertyType === "TERRENO"
      ? property.landArea
      : property.area;
  const numericComparisonArea = decimalToNumber(comparisonArea);

  const marketReferenceCandidates =
    await prisma.marketReference.findMany({
      where: {
        active: true,
        state: property.state,
        city: property.city,
        neighborhood: property.neighborhood,
        purpose: referencePurpose,
        propertyType: property.propertyType,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { calculatedAt: "desc" },
    });

  const compatibleMarketReferences =
    marketReferenceCandidates.filter((reference) => {
      const minimumArea = decimalToNumber(reference.areaMin);
      const maximumArea = decimalToNumber(reference.areaMax);

      if (numericComparisonArea === null) {
        return minimumArea === null && maximumArea === null;
      }

      return (
        (minimumArea === null || numericComparisonArea >= minimumArea) &&
        (maximumArea === null || numericComparisonArea <= maximumArea) &&
        (reference.bedrooms === null || reference.bedrooms === property.bedrooms)
      );
    });

  const marketReference =
    compatibleMarketReferences.find(
      (reference) => reference.bedrooms === property.bedrooms,
    ) ??
    compatibleMarketReferences.find(
      (reference) => reference.bedrooms === null,
    ) ??
    null;

  const neighborhoodMapLocation =
    await prisma.neighborhoodMapLocation.findFirst({
      where: {
        active: true,
        state: property.state,
        city: property.city,
        OR: [
          { normalizedName: normalizeLocationKey(property.neighborhood) },
          { aliases: { has: normalizeLocationKey(property.neighborhood) } },
        ],
      },
    });

  const relatedPrice =
    decimalToNumber(
      property.purpose ===
      "LOCACAO"
        ? property.rentalPrice
        : property.price,
    );

  const relatedPriceRange =
    property.purpose ===
    "LOCACAO"
      ? getRentalPriceRange(
          relatedPrice,
        )
      : getSalePriceRange(
          relatedPrice,
        );

  const relatedProperties =
    await prisma.property.findMany({
      where: {
        published: true,

        propertyType:
          property.propertyType,

        code: {
          not:
            property.code,
        },

        purpose:
          property.purpose ===
          "LOCACAO"
            ? {
                in: [
                  "LOCACAO",
                  "VENDA_E_LOCACAO",
                ],
              }
            : {
                in: [
                  "VENDA",
                  "VENDA_E_LOCACAO",
                ],
              },

        ...(relatedPriceRange
          ? property.purpose ===
            "LOCACAO"
            ? {
                rentalPrice:
                  relatedPriceRange,
              }
            : {
                price:
                  relatedPriceRange,
              }
          : {}),
      },

      include: {
        images: {
          orderBy: [
            {
              position:
                "asc",
            },
            {
              id:
                "asc",
            },
          ],
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
      ],

      take:
        4,
    });

  const coverImage =
    property.images.find(
      (image) =>
        image.isCover,
    );

  const galleryImages =
    coverImage
      ? [
          coverImage.url,

          ...property.images
            .filter(
              (image) =>
                image.id !==
                coverImage.id,
            )
            .map(
              (image) =>
                image.url,
            ),
        ]
      : property.images.map(
          (image) =>
            image.url,
        );

  const safeGalleryImages =
    galleryImages.length > 0
      ? galleryImages
      : [
          "/hero-clean.png",
        ];

  const features =
    property.features.length > 0
      ? property.features
      : defaultFeatures;

  const location =
    buildLocation(
      property.neighborhood,
      property.city,
      property.state,
      property.location,
    );

  const tag =
    property.tag ||
    (
      property.highlight
        ? "Destaque"
        : "Selecionado"
    );

  const isRentalOnly =
    property.purpose ===
    "LOCACAO";

  const isApartment =
    property.propertyType ===
    "APARTAMENTO";

  const backUrl =
    isRentalOnly
      ? "/alugar"
      : "/comprar";

  const salePrice =
    formatCurrency(
      property.price,
    );

  const rentalPrice =
    formatCurrency(
      property.rentalPrice,
    );

  const displayedSalePrice =
    property.opportunityProfiles.includes(
      "LANCAMENTO",
    )
      ? `A partir de ${salePrice}*`
      : salePrice;

  const metricPrice =
    referencePurpose === "LOCACAO"
      ? property.rentalPrice
      : property.price;
  const propertyPricePerSquareMeter = calculatePricePerSquareMeter({
    price: metricPrice,
    area: comparisonArea,
  });
  const formattedPropertyPricePerSquareMeter =
    formatPricePerSquareMeter(propertyPricePerSquareMeter);
  const formattedReferenceRange = marketReference
    ? `${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(Number(marketReference.pricePerSquareMeterMin.toString()))} a ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(Number(marketReference.pricePerSquareMeterMax.toString()))}/m²`
    : null;

  const publicMapLocation =
    property.mapEnabled && neighborhoodMapLocation
      ? {
          latitude: Number(neighborhoodMapLocation.latitude.toString()),
          longitude: Number(neighborhoodMapLocation.longitude.toString()),
          radiusMeters: neighborhoodMapLocation.radiusMeters,
        }
      : null;

  const whatsappMessage =
    encodeURIComponent(
      `Olá! Gostaria de iniciar um atendimento com um consultor sobre este imóvel. Referência: ${property.code} — ${property.title}.`,
    );

  const schedulePurpose =
    property.purpose ===
    "LOCACAO"
      ? "locacao"
      : "venda";

  const scheduleUrl =
    `/agendar-visita?imovel=${encodeURIComponent(
      property.code,
    )}&titulo=${encodeURIComponent(
      property.title,
    )}&finalidade=${encodeURIComponent(
      schedulePurpose,
    )}`;

  const relatedCards =
    relatedProperties.map(
      (item) => {
        const relatedCover =
          item.images.find(
            (image) =>
              image.isCover,
          ) ??
          item.images[0];

        const relatedLocation =
          buildLocation(
            item.neighborhood,
            item.city,
            item.state,
            item.location,
          );

        const relatedBasePrice =
          item.purpose ===
          "LOCACAO"
            ? formatCurrency(
                item.rentalPrice,
              )
            : formatCurrency(
                item.price,
              );

        const relatedPrice =
          item.purpose !== "LOCACAO" &&
          item.opportunityProfiles.includes(
            "LANCAMENTO",
          )
            ? `A partir de ${relatedBasePrice}*`
            : relatedBasePrice;

        return {
          code:
            item.code,

          title:
            item.title,

          location:
            relatedLocation,

          price:
            relatedPrice,

          image:
            relatedCover?.url ??
            "/hero-clean.png",

          tag:
            item.tag ||
            (
              item.highlight
                ? "Destaque"
                : "Selecionado"
            ),

          propertyType:
            item.propertyType,

          area:
            formatArea(
              item.propertyType ===
              "TERRENO"
                ? item.landArea
                : item.area,
            ),

          bedrooms:
            String(
              item.bedrooms,
            ),

          suites:
            String(
              item.suites,
            ),

          parking:
            String(
              item.parking,
            ),
        };
      },
    );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
          <Link
            href={
              backUrl
            }
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            ← Voltar para imóveis
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-10 lg:px-10 xl:px-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <PropertyGallery
              images={
                safeGalleryImages
              }
              title={
                property.title
              }
              tag={
                tag
              }
            />
          </div>

          <aside className="h-fit border border-white/10 bg-[#0a0a0a] p-7 xl:sticky xl:top-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              {tag}
            </p>

            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.08]">
              {
                property.title
              }
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              {location}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-6">
              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {formatArea(
                    property.area,
                  )}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Área
                </span>
              </div>

              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.suites > 0
                    ? property.suites
                    : property.bedrooms}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {property.suites > 0
                    ? "Suítes"
                    : "Dormitórios"}
                </span>
              </div>

              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {
                    property.parking
                  }
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Vagas
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
              {!isApartment ? (
                <div className="border-b border-white/10 pb-4">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Área do terreno
                  </span>

                  <strong className="mt-2 block font-medium text-white">
                    {formatArea(
                      property.landArea,
                    )}
                  </strong>
                </div>
              ) : null}

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Dormitórios
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {
                    property.bedrooms
                  }
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Banheiros
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.bathrooms ||
                    "Consulte"}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Condomínio
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {formatCurrency(
                    property.condominium,
                  )}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  IPTU
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {formatCurrency(
                    property.iptu,
                  )}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Disponibilidade
                </span>

                <strong className="mt-2 block font-medium text-white">
                  Disponível
                </strong>
              </div>
            </div>

            <div className="mt-7 space-y-4 text-sm text-zinc-400">
              <p>
                <span className="text-zinc-500">
                  Referência:
                </span>{" "}

                <strong className="font-medium text-white">
                  {
                    property.code
                  }
                </strong>
              </p>

              <p>
                <span className="text-zinc-500">
                  Localização:
                </span>{" "}

                <strong className="font-medium text-white">
                  {location}
                </strong>
              </p>
            </div>

            {property.purpose !==
            "LOCACAO" ? (
              <div className="mt-8 border border-amber-500/25 bg-black/40 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Valor de venda
                </p>

                <p className="mt-2 font-serif text-3xl text-amber-400">
                  {displayedSalePrice}
                </p>
              </div>
            ) : null}

            {property.purpose !==
            "VENDA" ? (
              <div className="mt-4 border border-amber-500/25 bg-black/40 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Valor de locação
                </p>

                <p className="mt-2 font-serif text-3xl text-amber-400">
                  {rentalPrice}
                </p>
              </div>
            ) : null}

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Consulte condições comerciais e disponibilidade.
            </p>

            <div className="mt-6 border border-white/10 bg-[#111] p-5">
              <div
                className={
                  formattedReferenceRange
                    ? "grid gap-5 md:grid-cols-2"
                    : undefined
                }
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    Valor do m²
                  </p>
                  <p className="mt-2 font-serif text-2xl text-white">
                    {formattedPropertyPricePerSquareMeter}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Calculado com base no preço anunciado e na área informada no cadastro.
                  </p>
                </div>

                {formattedReferenceRange ? (
                  <div className="border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                      Referência de Mercado B&amp;B
                    </p>
                    <p className="mt-2 font-serif text-2xl text-amber-400">
                      {formattedReferenceRange}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                      Estimativa elaborada a partir de pesquisa periódica em portais imobiliários, ofertas públicas e imóveis comparáveis. Valores anunciados podem diferir dos valores efetivamente negociados.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <Link
              href={
                scheduleUrl
              }
              className="mt-6 inline-flex min-h-16 w-full items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-amber-400"
            >
              Agendar visita
            </Link>

            <TrackedWhatsAppLink
  href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
  className="mt-4 inline-flex min-h-16 w-full items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
>
  Solicitar informações
</TrackedWhatsAppLink>

            <p className="mt-6 text-center text-[10px] leading-5 text-zinc-500">
              Nós analisamos cada imóvel antes de indicá-lo aos nossos
              clientes. Durante o atendimento, apresentaremos nossa
              avaliação consultiva.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1720px] gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 xl:px-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Sobre o imóvel
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal">
            {
              property.title
            }
          </h2>

          <div className="mt-7 whitespace-pre-line text-base leading-8 text-zinc-400">
            {property.description ||
              "Entre em contato com a B&B Consultoria Imobiliária para receber a apresentação completa deste imóvel."}
          </div>
        </div>

        <div className="border border-white/10 bg-[#0a0a0a] p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Diferenciais analisados
          </p>

          <div className="mt-6 space-y-4">
            {analyzedDifferentials.map(
              (item) => (
                <div
                  key={
                    item
                  }
                  className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-500 text-xs text-amber-400">
                    ✓
                  </span>

                  <span className="text-sm text-zinc-300">
                    {item}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Características
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal">
            Estrutura e diferenciais do imóvel
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(
              (feature) => (
                <div
                  key={
                    feature
                  }
                  className="flex min-h-20 items-center gap-4 border border-white/10 bg-black/30 px-5 py-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/60 text-sm text-amber-400">
                    ✓
                  </span>

                  <span className="text-sm text-zinc-300">
                    {feature}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {publicMapLocation ? (
        <ApproximateLocationMap
          latitude={publicMapLocation.latitude}
          longitude={publicMapLocation.longitude}
          radiusMeters={publicMapLocation.radiusMeters}
          neighborhood={property.neighborhood}
          city={property.city}
        />
      ) : null}

      {relatedCards.length > 0 ? (
        <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Outras oportunidades
          </p>

          <div className="mt-4 flex items-end justify-between gap-6">
            <h2 className="font-serif text-4xl font-normal">
              Imóveis semelhantes
            </h2>

            <Link
              href={
                backUrl
              }
              className="hidden border-b border-amber-500 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 sm:inline-flex"
            >
              Ver todos →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCards.map(
              (item) => (
                <PropertyCard
                  key={
                    item.code
                  }
                  code={
                    item.code
                  }
                  title={
                    item.title
                  }
                  location={
                    item.location
                  }
                  price={
                    item.price
                  }
                  image={
                    item.image
                  }
                  tag={
                    item.tag
                  }
                  propertyType={
                    item.propertyType
                  }
                  area={
                    item.area
                  }
                  bedrooms={
                    item.bedrooms
                  }
                  suites={
                    item.suites
                  }
                  parking={
                    item.parking
                  }
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
