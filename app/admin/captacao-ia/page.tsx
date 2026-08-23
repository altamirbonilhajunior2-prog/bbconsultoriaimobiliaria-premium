import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

const sourceLabels: Record<string, string> = {
  OLX: "OLX",
  ZAP: "ZAP",
  VIVAREAL: "Viva Real",
  IMOVELWEB: "Imovelweb",
  SITE_IMOBILIARIA: "Site imobiliária",
  OUTRO: "Outro",
};

const statusLabels: Record<string, string> = {
  ENCONTRADO: "Encontrado",
  SELECIONADO: "Selecionado",
  CONTATADO: "Contatado",
  AGUARDANDO_AUTORIZACAO: "Aguardando autorização",
  AUTORIZADO: "Autorizado",
  PUBLICADO: "Publicado",
  DESCARTADO: "Descartado",
  ARQUIVADO: "Arquivado",
};

function formatCurrency(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return "Não informado";
  }

  const numericValue = Number(
    value.toString(),
  );

  if (!Number.isFinite(numericValue)) {
    return "Não informado";
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

function getStatusClass(
  status: string,
) {
  if (
    status === "AUTORIZADO"
  ) {
    return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
  }

  if (
    status === "PUBLICADO"
  ) {
    return "border-blue-500/50 bg-blue-500/10 text-blue-400";
  }

  if (
    status === "CONTATADO" ||
    status ===
      "AGUARDANDO_AUTORIZACAO"
  ) {
    return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  }

  if (
    status === "DESCARTADO" ||
    status === "ARQUIVADO"
  ) {
    return "border-zinc-500/50 bg-zinc-500/10 text-zinc-500";
  }

  return "border-white/15 bg-white/[0.03] text-zinc-300";
}

export default async function AdminCaptacaoIAPage() {
  const opportunities =
    await prisma.acquisitionOpportunity.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        source: true,
        sourceUrl: true,
        sourceTitle: true,
        status: true,
        city: true,
        neighborhood: true,
        development: true,
        price: true,
        rentalPrice: true,
        score: true,
        createdAt: true,
      },
    });

  const totalFound =
    opportunities.filter(
      (item) =>
        item.status ===
        "ENCONTRADO",
    ).length;

  const totalSelected =
    opportunities.filter(
      (item) =>
        item.status ===
        "SELECIONADO",
    ).length;

  const totalContacted =
    opportunities.filter(
      (item) =>
        item.status ===
          "CONTATADO" ||
        item.status ===
          "AGUARDANDO_AUTORIZACAO",
    ).length;

  const totalAuthorized =
    opportunities.filter(
      (item) =>
        item.status ===
        "AUTORIZADO",
    ).length;

  const totalPublished =
    opportunities.filter(
      (item) =>
        item.status ===
        "PUBLICADO",
    ).length;

  const stages = [
    {
      label: "Encontrados",
      value: totalFound,
      detail:
        "Oportunidades identificadas",
    },
    {
      label: "Selecionados",
      value: totalSelected,
      detail:
        "Aprovados para abordagem",
    },
    {
      label: "Contatados",
      value: totalContacted,
      detail:
        "Contato ou autorização em andamento",
    },
    {
      label: "Autorizados",
      value: totalAuthorized,
      detail:
        "Liberados para preparação",
    },
    {
      label: "Publicados",
      value: totalPublished,
      detail:
        "Convertidos em imóveis do portal",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
            >
              ← Voltar ao painel
            </Link>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Inteligência de captação
            </p>

            <h1 className="mt-3 font-serif text-5xl font-normal">
              Captação IA
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Radar interno para localizar,
              selecionar, acompanhar e
              transformar oportunidades de
              captação em imóveis autorizados
              para o Portal B&amp;B.
            </p>
          </div>

          <Link
            href="/admin/captacao-ia/nova"
            className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
          >
            Nova captação
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stages.map(
            (stage) => (
              <article
                key={stage.label}
                className="border border-white/10 bg-[#0b0b0b] p-6"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {stage.label}
                </p>

                <strong className="mt-3 block font-serif text-4xl font-normal text-white">
                  {stage.value}
                </strong>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  {stage.detail}
                </p>
              </article>
            ),
          )}
        </section>

        <section className="mt-10 overflow-hidden border border-white/10">
          <div className="hidden grid-cols-[110px_1.7fr_1fr_1fr_160px_160px] gap-5 border-b border-white/10 bg-[#0b0b0b] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 lg:grid">
            <span>
              Fonte
            </span>

            <span>
              Oportunidade
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

          {opportunities.length >
          0 ? (
            <div>
              {opportunities.map(
                (
                  opportunity,
                ) => {
                  const location =
                    opportunity.development ??
                    opportunity.neighborhood ??
                    "Localização não informada";

                  const value =
                    opportunity.price ??
                    opportunity.rentalPrice;

                  return (
                    <article
                      key={
                        opportunity.id
                      }
                      className="grid gap-5 border-b border-white/10 bg-[#080808] px-6 py-6 last:border-b-0 lg:grid-cols-[110px_1.7fr_1fr_1fr_160px_160px] lg:items-center"
                    >
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Fonte
                        </span>

                        <p className="mt-1 text-sm font-semibold text-amber-400 lg:mt-0">
                          {sourceLabels[
                            opportunity
                              .source
                          ] ??
                            opportunity.source}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Oportunidade
                        </span>

                        <h2 className="mt-1 font-serif text-xl font-normal text-white lg:mt-0">
                          {opportunity.sourceTitle ??
                            `Captação #${opportunity.id}`}
                        </h2>

                        {opportunity.score !==
                        null ? (
                          <p className="mt-2 text-xs text-zinc-500">
                            Score B&amp;B:{" "}
                            <span className="text-amber-400">
                              {
                                opportunity.score
                              }
                              /100
                            </span>
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Localização
                        </span>

                        <p className="mt-1 text-sm text-zinc-300 lg:mt-0">
                          {location}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            opportunity.city
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600 lg:hidden">
                          Valor
                        </span>

                        <p className="mt-1 text-sm font-medium text-white lg:mt-0">
                          {formatCurrency(
                            value,
                          )}
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] ${getStatusClass(
                            opportunity.status,
                          )}`}
                        >
                          {statusLabels[
                            opportunity
                              .status
                          ] ??
                            opportunity.status}
                        </span>
                      </div>

                      <div className="flex gap-3 lg:justify-end">
                        <a
                          href={
                            opportunity.sourceUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center border border-white/15 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                        >
                          Fonte
                        </a>

                        <Link
                          href={`/admin/captacao-ia/${opportunity.id}`}
                          className="inline-flex h-10 items-center justify-center border border-amber-500/50 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                        >
                          Abrir
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="bg-[#080808] px-6 py-16 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Radar B&amp;B
              </p>

              <h2 className="mt-4 font-serif text-3xl font-normal">
                Nenhuma oportunidade
                cadastrada.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                As oportunidades
                encontradas em fontes
                como OLX, ZAP, parceiros
                e outras origens
                aparecerão aqui para
                análise antes de qualquer
                publicação.
              </p>
            </div>
          )}
        </section>

        <section className="mt-10 border border-amber-500/20 bg-amber-500/[0.04] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            Regra de segurança
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
            Uma oportunidade encontrada
            pela Captação IA permanece
            privada no CRM. Ela somente
            poderá ser transformada em
            imóvel publicável após o
            registro da autorização
            correspondente.
          </p>
        </section>
      </div>
    </main>
  );
}