import Link from "next/link";

import { getAccessContext } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";
import DeleteLeadButton from "./DeleteLeadButton";
import {
  deletePortalLeadAction,
  updatePortalLeadAction,
} from "./actions";

export const dynamic = "force-dynamic";

const statusLabels = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  VISITA_AGENDADA: "Visita agendada",
  PROPOSTA: "Proposta",
  EM_NEGOCIACAO: "Em negociação",
  CONVERTIDO: "Negócio concluído",
  ENCERRADO: "Encerrado",
} as const;

const statusOptions =
  Object.entries(statusLabels);

function formatPhone(
  phone: string,
) {
  const digits =
    phone.replace(/\D/g, "");

  const local =
    digits.startsWith("55")
      ? digits.slice(2)
      : digits;

  if (local.length !== 11) {
    return phone;
  }

  return `(${local.slice(
    0,
    2,
  )}) ${local.slice(
    2,
    7,
  )}-${local.slice(7)}`;
}

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

function getSourceLabel(
  source: string | null,
  campaign: string | null,
) {
  if (
    campaign &&
    source
  ) {
    return `${source} · ${campaign}`;
  }

  return (
    campaign ||
    source ||
    "Acesso direto ao portal"
  );
}

export default async function ClientesPage() {
  const access =
    await getAccessContext();

  const [
    leads,
    total,
    newLeads,
    visits,
    converted,
  ] = await Promise.all([
    prisma.portalLead.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 250,
    }),

    prisma.portalLead.count(),

    prisma.portalLead.count({
      where: {
        status: "NOVO",
      },
    }),

    prisma.portalLead.count({
      where: {
        status:
          "VISITA_AGENDADA",
      },
    }),

    prisma.portalLead.count({
      where: {
        status: "CONVERTIDO",
      },
    }),
  ]);

  const indicators = [
    {
      label:
        "Leads recebidos",
      value: total,
    },
    {
      label:
        "Novos",
      value: newLeads,
    },
    {
      label:
        "Visitas agendadas",
      value: visits,
    },
    {
      label:
        "Negócios concluídos",
      value: converted,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <header className="border-b border-white/10 pb-8">
          <Link
            href="/admin"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
          >
            Voltar para administração
          </Link>

          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Relacionamento comercial
          </p>

          <h1 className="mt-3 font-serif text-5xl">
            Clientes e leads
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Contatos autorizados
            pelo visitante,
            identificados pelo
            imóvel e pela origem
            da campanha.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {indicators.map(
            (indicator) => (
              <article
                key={
                  indicator.label
                }
                className="border border-white/10 bg-[#0b0b0b] p-6"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {
                    indicator.label
                  }
                </p>

                <p className="mt-3 font-serif text-4xl">
                  {
                    indicator.value
                  }
                </p>
              </article>
            ),
          )}
        </section>

        <section className="mt-10">
          {leads.length === 0 ? (
            <div className="border border-white/10 bg-[#0a0a0a] p-10 text-center text-zinc-400">
              Nenhum lead recebido
              pelo portal até o
              momento.
            </div>
          ) : (
            <div className="space-y-5">
              {leads.map(
                (lead) => {
                  const message =
                    encodeURIComponent(
                      `Olá, ${lead.name}. Sou da B&B Consultoria Imobiliária. Recebemos seu interesse no imóvel ${lead.propertyCode}. Como podemos ajudar?`,
                    );

                  const deleteAction =
                    deletePortalLeadAction.bind(
                      null,
                      lead.id,
                    );

                  return (
                    <article
                      key={
                        lead.id
                      }
                      className="border border-white/10 bg-[#0a0a0a] p-6 lg:p-7"
                    >
                      <div className="grid gap-7 xl:grid-cols-[1.1fr_1fr_1.35fr]">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400">
                              {
                                statusLabels[
                                  lead.status
                                ]
                              }
                            </span>

                            <span className="text-xs text-zinc-500">
                              {formatDate(
                                lead.createdAt,
                              )}
                            </span>
                          </div>

                          <h2 className="mt-4 font-serif text-3xl">
                            {
                              lead.name
                            }
                          </h2>

                          <a
                            href={`https://wa.me/${lead.phone}?text=${message}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex text-sm font-medium text-amber-400 hover:text-amber-300"
                          >
                            {formatPhone(
                              lead.phone,
                            )}{" "}
                            · abrir
                            WhatsApp
                          </a>
                        </div>

                        <div className="text-sm leading-7 text-zinc-400">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                            Imóvel
                            consultado
                          </p>

                          <Link
                            href={`/imovel/${lead.propertyCode.toLowerCase()}`}
                            target="_blank"
                            className="mt-2 block font-medium text-white hover:text-amber-400"
                          >
                            {
                              lead.propertyCode
                            }{" "}
                            —{" "}
                            {
                              lead.propertyTitle
                            }
                          </Link>

                          <p className="mt-4 text-xs text-zinc-500">
                            Origem:{" "}
                            {getSourceLabel(
                              lead.utmSource,
                              lead.utmCampaign,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            Autorização
                            registrada em{" "}
                            {formatDate(
                              lead.consentedAt,
                            )}
                          </p>
                        </div>

                        <div>
                          <form
                            action={
                              updatePortalLeadAction
                            }
                          >
                            <input
                              type="hidden"
                              name="leadId"
                              value={
                                lead.id
                              }
                            />

                            <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
                              <label>
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                  Etapa
                                  comercial
                                </span>

                                <select
                                  name="status"
                                  defaultValue={
                                    lead.status
                                  }
                                  className="min-h-12 w-full border border-white/15 bg-[#111] px-3 text-sm text-white outline-none focus:border-amber-500"
                                >
                                  {statusOptions.map(
                                    ([
                                      value,
                                      label,
                                    ]) => (
                                      <option
                                        key={
                                          value
                                        }
                                        value={
                                          value
                                        }
                                      >
                                        {
                                          label
                                        }
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>

                              <label>
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                  Observações
                                </span>

                                <textarea
                                  name="notes"
                                  defaultValue={
                                    lead.notes ??
                                    ""
                                  }
                                  maxLength={
                                    5000
                                  }
                                  rows={3}
                                  className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none focus:border-amber-500"
                                  placeholder="Registre o andamento do atendimento."
                                />
                              </label>
                            </div>

                            <button
                              type="submit"
                              className="mt-4 inline-flex min-h-11 items-center justify-center border border-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                            >
                              Salvar
                              andamento
                            </button>
                          </form>

                          {access.isAdmin ? (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <DeleteLeadButton
                                onDelete={
                                  deleteAction
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}