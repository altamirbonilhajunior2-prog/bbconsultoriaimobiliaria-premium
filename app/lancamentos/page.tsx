import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lançamentos | B&B Consultoria Imobiliária",
  description:
    "Lançamentos imobiliários selecionados em São José dos Campos.",
};

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
      maximumFractionDigits: 0,
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

export default async function LancamentosPage() {
  const properties =
    await prisma.property.findMany({
      where: {
        published: true,

        opportunityProfiles: {
          has: "LANCAMENTO",
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

  const cards =
    properties.map(
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

        const price =
          property.price !== null
            ? formatCurrency(
                property.price,
              )
            : formatCurrency(
                property.rentalPrice,
              );

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
            Lançamentos
          </p>

          <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[1250px]">
              <h1 className="font-serif text-[38px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] lg:text-[50px] xl:text-[56px]">
                Lançamentos selecionados
                para quem busca
                exclusividade.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Nós acompanhamos os
                principais lançamentos
                imobiliários de São José
                dos Campos para
                apresentar oportunidades
                com potencial de
                valorização e qualidade
                construtiva.
              </p>
            </div>

            <Link
              href="/contato"
              className="inline-flex min-h-13 w-fit items-center justify-center border border-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Solicitar atendimento
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
          <div className="rounded-sm border border-amber-500/30 bg-[#0b0b0b] p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-amber-400">
              Curadoria B&amp;B
            </p>

            <h2 className="mt-4 font-serif text-3xl">
              Empreendimentos
              acompanhados pela nossa
              consultoria
            </h2>

            <p className="mt-5 max-w-4xl leading-8 text-zinc-400">
              Antes de recomendar um
              lançamento, nós avaliamos
              incorporadora, localização,
              padrão construtivo,
              liquidez, potencial de
              valorização e perfil do
              público comprador.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Lançamentos em destaque
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              Oportunidades selecionadas
            </h2>
          </div>

          <p className="text-sm text-zinc-500">
            {cards.length}{" "}
            {cards.length === 1
              ? "empreendimento disponível"
              : "empreendimentos disponíveis"}
          </p>
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
                  tag="Lançamento"
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
              Curadoria em andamento
            </p>

            <h3 className="mt-5 font-serif text-3xl font-normal sm:text-4xl">
              Não há lançamentos
              publicados neste momento.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Novos empreendimentos
              aparecerão aqui quando
              concluirmos nossa análise
              e eles forem publicados
              pelo painel administrativo.
            </p>

            <Link
              href="/contato"
              className="mt-8 inline-flex min-h-14 items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Consultar lançamentos
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}