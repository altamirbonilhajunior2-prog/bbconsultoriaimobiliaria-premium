import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

const propertyTypeLabels: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  EM_ANALISE: "Em análise",
};

const propertyCodeOrder = [
  "BBC",
  "BBA",
  "BBT",
  "BBM",
  "BBR",
] as const;

function formatCurrency(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return "Sob consulta";
  }

  const numericValue = Number(
    value.toString(),
  );

  if (!Number.isFinite(numericValue)) {
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
  ).format(numericValue);
}

function getPropertyValue(
  purpose: string,
  price: {
    toString(): string;
  } | null,
  rentalPrice: {
    toString(): string;
  } | null,
) {
  if (
    purpose === "LOCACAO"
  ) {
    return {
      primary: formatCurrency(
        rentalPrice,
      ),
      secondary: "Locação / mês",
    };
  }

  if (
    purpose ===
    "VENDA_E_LOCACAO"
  ) {
    return {
      primary: formatCurrency(
        price,
      ),
      secondary:
        rentalPrice !== null
          ? `${formatCurrency(
              rentalPrice,
            )} / mês`
          : "Venda e locação",
    };
  }

  return {
    primary:
      formatCurrency(price),
    secondary: "Venda",
  };
}

function getStatusClass(
  status: string,
) {
  if (
    status === "DISPONIVEL"
  ) {
    return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
  }

  if (
    status === "VENDIDO" ||
    status === "ALUGADO"
  ) {
    return "border-zinc-500/50 bg-zinc-500/10 text-zinc-400";
  }

  if (
    status === "RESERVADO"
  ) {
    return "border-blue-500/50 bg-blue-500/10 text-blue-400";
  }

  return "border-amber-500/50 bg-amber-500/10 text-amber-400";
}

function getPropertyCodePrefix(
  code: string,
) {
  return code
    .trim()
    .toUpperCase()
    .slice(0, 3);
}

function getPropertyCodeNumber(
  code: string,
) {
  const numericPart =
    code
      .trim()
      .toUpperCase()
      .slice(3);

  const number =
    Number.parseInt(
      numericPart,
      10,
    );

  return Number.isFinite(number)
    ? number
    : Number.MAX_SAFE_INTEGER;
}

function comparePropertyCodes(
  codeA: string,
  codeB: string,
) {
  const prefixA =
    getPropertyCodePrefix(
      codeA,
    );

  const prefixB =
    getPropertyCodePrefix(
      codeB,
    );

  const orderA =
    propertyCodeOrder.indexOf(
      prefixA as (
        typeof propertyCodeOrder
      )[number],
    );

  const orderB =
    propertyCodeOrder.indexOf(
      prefixB as (
        typeof propertyCodeOrder
      )[number],
    );

  const normalizedOrderA =
    orderA === -1
      ? propertyCodeOrder.length
      : orderA;

  const normalizedOrderB =
    orderB === -1
      ? propertyCodeOrder.length
      : orderB;

  if (
    normalizedOrderA !==
    normalizedOrderB
  ) {
    return (
      normalizedOrderA -
      normalizedOrderB
    );
  }

  if (
    prefixA !== prefixB
  ) {
    return prefixA.localeCompare(
      prefixB,
      "pt-BR",
    );
  }

  const numberA =
    getPropertyCodeNumber(
      codeA,
    );

  const numberB =
    getPropertyCodeNumber(
      codeB,
    );

  if (
    numberA !== numberB
  ) {
    return numberA - numberB;
  }

  return codeA.localeCompare(
    codeB,
    "pt-BR",
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

export default async function AdminImoveisPage() {
  const properties =
    await prisma.property.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        purpose: true,
        propertyType: true,
        category: true,
        status: true,
        highlight: true,
        published: true,
        city: true,
        neighborhood: true,
        price: true,
        rentalPrice: true,
      },
    });

  properties.sort(
    (propertyA, propertyB) =>
      comparePropertyCodes(
        propertyA.code,
        propertyB.code,
      ),
  );

  const totalAvailable =
    properties.filter(
      (property) =>
        property.status ===
        "DISPONIVEL",
    ).length;

  const totalAnalysis =
    properties.filter(
      (property) =>
        property.status ===
        "EM_ANALISE",
    ).length;

  const totalHighlights =
    properties.filter(
      (property) =>
        property.highlight,
    ).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
            >
              ← Voltar ao painel
            </Link>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Administração
            </p>

            <h1 className="mt-3 font-serif text-5xl font-normal">
              Imóveis
            </h1>

            <p className="mt-4 text-zinc-400">
              Gerencie os imóveis cadastrados no Portal B&amp;B.
            </p>
          </div>

          <Link
            href="/admin/imoveis/novo"
            className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
          >
            Cadastrar novo imóvel
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Total
            </p>

            <strong className="mt-3 block font-serif text-4xl font-normal text-white">
              {
                properties.length
              }
            </strong>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Disponíveis
            </p>

            <strong className="mt-3 block font-serif text-4xl font-normal text-emerald-400">
              {
                totalAvailable
              }
            </strong>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Em análise
            </p>

            <strong className="mt-3 block font-serif text-4xl font-normal text-amber-400">
              {
                totalAnalysis
              }
            </strong>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Destaques
            </p>

            <strong className="mt-3 block font-serif text-4xl font-normal text-white">
              {
                totalHighlights
              }
            </strong>
          </div>
        </div>

        <div className="mt-10 overflow-hidden border border-white/10">
          <div className="hidden grid-cols-[110px_1.7fr_1fr_1fr_150px_150px] gap-5 border-b border-white/10 bg-[#0b0b0b] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 lg:grid">
            <span>
              Código
            </span>

            <span>
              Imóvel
            </span>

            <span>
              Localização
            </span>

            <span>
              Valor
            </span>

            <span>
              Status
            </span>

            <span className="text-right">
              Ações
            </span>
          </div>

          {properties.length >
          0 ? (
            <div>
              {properties.map(
                (property) => {
                  const value =
                    getPropertyValue(
                      property.purpose,
                      property.price,
                      property.rentalPrice,
                    );

                  const status =
                    statusLabels[
                      property
                        .status
                    ] ??
                    property.status;

                  const propertyType =
                    propertyTypeLabels[
                      property
                        .propertyType
                    ] ??
                    property.propertyType;

                  return (
                    <article
                      key={
                        property.id
                      }
                      className="grid gap-5 border-b border-white/10 bg-[#080808] px-6 py-6 last:border-b-0 lg:grid-cols-[110px_1.7fr_1fr_1fr_150px_150px] lg:items-center"
                    >
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Código
                        </span>

                        <p className="mt-1 text-sm font-semibold text-amber-400 lg:mt-0">
                          {
                            property.code
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Imóvel
                        </span>

                        <h2 className="mt-1 font-serif text-xl font-normal text-white lg:mt-0">
                          {
                            property.title
                          }
                        </h2>

                        <p className="mt-2 text-xs text-zinc-500">
                          {
                            propertyType
                          }{" "}
                          •{" "}
                          {
                            property.category
                          }
                        </p>

                        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em]">
                          {property.published ? (
                            <span className="text-emerald-400">
                              Publicado
                            </span>
                          ) : (
                            <span className="text-zinc-600">
                              Não publicado
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Localização
                        </span>

                        <p className="mt-1 text-sm text-zinc-300 lg:mt-0">
                          {
                            property.neighborhood
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            property.city
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Valor
                        </span>

                        <p className="mt-1 text-sm font-medium text-white lg:mt-0">
                          {
                            value.primary
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            value.secondary
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Status
                        </span>

                        <span
                          className={`mt-1 inline-flex border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] lg:mt-0 ${getStatusClass(
                            property.status,
                          )}`}
                        >
                          {
                            status
                          }
                        </span>
                      </div>

                      <div className="flex gap-3 lg:justify-end">
                        {property.published ? (
                          <Link
                            href={`/imovel/${property.code.toLowerCase()}`}
                            className="inline-flex h-10 items-center justify-center border border-white/15 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                          >
                            Ver
                          </Link>
                        ) : (
                          <span className="inline-flex h-10 items-center justify-center border border-white/5 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-700">
                            Ver
                          </span>
                        )}

                        <Link
                          href={`/admin/imoveis/${property.code.toLowerCase()}`}
                          className="inline-flex h-10 items-center justify-center border border-amber-500 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                        >
                          Editar
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="bg-[#080808] px-6 py-16 text-center">
              <h2 className="font-serif text-3xl">
                Nenhum imóvel cadastrado.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                O banco de dados está vazio. Cadastre o primeiro imóvel para iniciar a gestão pelo Portal B&amp;B.
              </p>

              <Link
                href="/admin/imoveis/novo"
                className="mt-7 inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black"
              >
                Cadastrar primeiro imóvel
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}