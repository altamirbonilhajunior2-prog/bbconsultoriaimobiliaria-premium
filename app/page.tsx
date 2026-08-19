import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ConsultoriaSection from "./components/ConsultoriaSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NeighborhoodsSection from "./components/NeighborhoodsSection";
import PropertyCard from "./components/PropertyCard";
import PropertySearch from "./components/PropertySearch";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imobiliária em São José dos Campos | B&B Consultoria Imobiliária",
  description:
    "Imóveis para comprar e alugar em São José dos Campos com curadoria, análise estratégica e atendimento consultivo da B&B Consultoria Imobiliária.",
};

const benefits = [
  {
    number: "01",
    title: "Análise estratégica",
    text:
      "Decisões fundamentadas em dados, mercado e experiência.",
  },
  {
    number: "02",
    title: "Transparência",
    text:
      "Informações claras para decisões imobiliárias mais seguras.",
  },
  {
    number: "03",
    title: "Foco no objetivo",
    text:
      "Cada imóvel é avaliado conforme o seu perfil e planejamento.",
  },
  {
    number: "04",
    title: "Curadoria",
    text:
      "Selecionamos oportunidades com localização, liquidez e potencial.",
  },
];

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

  return Number.isFinite(number)
    ? number
    : null;
}

function formatCurrency(
  value: {
    toString(): string;
  } | null,
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
  value: {
    toString(): string;
  } | null,
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

export default async function Home() {
  const featuredProperties =
    await prisma.property.findMany({
      where: {
        published: true,
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

      take: 4,
    });

  const cards =
    featuredProperties.map(
      (property) => {
        const coverImage =
          property.images.find(
            (image) =>
              image.isCover,
          ) ??
          property.images[0];

        const location =
          property.location ||
          [
            property.neighborhood,
            property.city,
          ]
            .filter(Boolean)
            .join(" • ");

        const isLaunch =
          property.opportunityProfiles.includes(
            "LANCAMENTO",
          );

        const basePrice =
          property.purpose ===
          "LOCACAO"
            ? formatCurrency(
                property.rentalPrice,
              )
            : formatCurrency(
                property.price,
              );

        const price =
          property.purpose !== "LOCACAO" &&
          isLaunch
            ? `A partir de ${basePrice}*`
            : basePrice;

        const tag =
          property.tag ||
          (property.highlight
            ? "Destaque"
            : property.purpose ===
                "LOCACAO"
              ? "Locação"
              : isLaunch
                ? "Lançamento"
                : "Selecionado");

        return {
          code:
            property.code,

          title:
            property.title,

          location,

          price,

          image:
            coverImage?.url ??
            "/logo-bb.png",

          tag,

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

      <Hero />

      <Suspense
        fallback={
          <section className="border-b border-white/10 bg-black">
            <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
              <div className="h-40 animate-pulse border border-white/10 bg-[#111111]" />
            </div>
          </section>
        }
      >
        <PropertySearch />
      </Suspense>

      <section className="mx-auto max-w-[1720px] px-5 pb-20 pt-20 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Imóveis selecionados
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal leading-none md:text-5xl">
              Seleção exclusiva B&amp;B
            </h2>
          </div>

          <Link
            href="/comprar"
            className="inline-flex w-fit border-b border-amber-500 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            Ver todos os imóveis →
          </Link>
        </div>

        {cards.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(
              (property) => (
                <PropertyCard
                  key={property.code}
                  code={property.code}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  image={property.image}
                  tag={property.tag}
                  area={property.area}
                  bedrooms={property.bedrooms}
                  parking={property.parking}
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-10 border border-white/10 bg-[#0a0a0a] px-6 py-12 text-center">
            <p className="font-serif text-2xl text-white">
              Novos imóveis estão em processo de curadoria.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Nossa seleção é atualizada conforme concluímos a análise técnica e
              comercial de cada imóvel.
            </p>

            <Link
              href="/contato"
              className="mt-7 inline-flex min-h-14 items-center justify-center border border-amber-500 px-7 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Iniciar atendimento
            </Link>
          </div>
        )}
      </section>

      <ConsultoriaSection />

      <NeighborhoodsSection />

      <section className="border-y border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-5 px-5 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8 xl:px-10">
          {benefits.map(
            (benefit) => (
              <article
                key={benefit.number}
                className="border border-white/10 bg-black/30 p-6 transition hover:border-amber-500/50"
              >
                <span className="text-sm font-bold text-amber-400">
                  {benefit.number}
                </span>

                <h3 className="mt-5 font-serif text-2xl">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {benefit.text}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}