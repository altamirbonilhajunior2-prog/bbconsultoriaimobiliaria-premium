import Link from "next/link";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";
import { createMarketReference } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-12 border border-white/10 bg-black px-4 text-sm text-white outline-none focus:border-amber-500";

const labelClass =
  "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

function currency(
  value: {
    toString(): string;
  },
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    },
  ).format(
    Number(value.toString()),
  );
}

function decimal(
  value:
    | {
        toString(): string;
      }
    | null,
) {
  if (!value) {
    return "Não informado";
  }

  const number =
    Number(value.toString());

  if (!Number.isFinite(number)) {
    return "Não informado";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    },
  ).format(number);
}

function propertyTypeLabel(
  value: string,
) {
  const labels: Record<
    string,
    string
  > = {
    APARTAMENTO:
      "Apartamento",
    CASA: "Casa",
    TERRENO: "Terreno",
    COMERCIAL: "Comercial",
    RURAL: "Rural",
  };

  return labels[value] ?? value;
}

function purposeLabel(
  value: string,
) {
  return value === "LOCACAO"
    ? "Locação"
    : "Venda";
}

export default async function MarketReferencesPage() {
  await requireAdmin();

  const references =
    await prisma.marketReference.findMany({
      include: {
        evidences: {
          orderBy: {
            researchedAt:
              "desc",
          },
        },
      },

      orderBy: {
        calculatedAt:
          "desc",
      },
    });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <Link
          href="/admin"
          className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400"
        >
          ← Voltar ao CRM
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Inteligência de
            mercado
          </p>

          <h1 className="mt-3 font-serif text-5xl font-normal">
            Referências de
            Mercado B&amp;B
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
            Cadastre faixas de
            valor por metro
            quadrado com fontes e
            evidências documentadas.
            Diferencie referências
            específicas de
            condomínio ou edifício
            das referências gerais
            de bairro.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b] p-7">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Nova referência
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Nova faixa e
              primeira evidência
            </h2>

            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Quando a faixa for
              específica de um
              condomínio ou
              edifício, informe o
              empreendimento. Use
              “Geral do bairro”
              somente quando a
              faixa representar
              diversos
              empreendimentos
              comparáveis daquele
              bairro.
            </p>
          </div>

          <form
            action={
              createMarketReference
            }
            className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <label
              className={
                labelClass
              }
            >
              Estado
              <input
                className={
                  inputClass
                }
                name="state"
                defaultValue="SP"
                maxLength={2}
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Cidade
              <input
                className={
                  inputClass
                }
                name="city"
                defaultValue="São José dos Campos"
                required
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Bairro
              <input
                className={
                  inputClass
                }
                name="neighborhood"
                required
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Escopo da referência
              <select
                className={
                  inputClass
                }
                name="referenceScope"
                defaultValue="EMPREENDIMENTO"
              >
                <option value="EMPREENDIMENTO">
                  Condomínio /
                  edifício
                  específico
                </option>

                <option value="BAIRRO">
                  Geral do bairro
                </option>
              </select>
            </label>

            <label
              className={`${labelClass} md:col-span-2`}
            >
              Condomínio /
              edifício da referência
              <input
                className={
                  inputClass
                }
                name="referenceDevelopment"
                placeholder="Ex.: New Life Tower"
              />

              <span className="normal-case font-normal leading-5 tracking-normal text-zinc-600">
                Preencha quando a
                referência for de
                um empreendimento
                específico. Deixe
                vazio somente ao
                escolher “Geral do
                bairro”.
              </span>
            </label>

            <label
              className={
                labelClass
              }
            >
              Finalidade
              <select
                className={
                  inputClass
                }
                name="purpose"
              >
                <option value="VENDA">
                  Venda
                </option>

                <option value="LOCACAO">
                  Locação
                </option>
              </select>
            </label>

            <label
              className={
                labelClass
              }
            >
              Tipo
              <select
                className={
                  inputClass
                }
                name="propertyType"
              >
                <option value="APARTAMENTO">
                  Apartamento
                </option>

                <option value="CASA">
                  Casa
                </option>

                <option value="TERRENO">
                  Terreno
                </option>

                <option value="COMERCIAL">
                  Comercial
                </option>

                <option value="RURAL">
                  Rural
                </option>
              </select>
            </label>

            <label
              className={
                labelClass
              }
            >
              Área mínima
              <input
                className={
                  inputClass
                }
                name="areaMin"
                inputMode="decimal"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Área máxima
              <input
                className={
                  inputClass
                }
                name="areaMax"
                inputMode="decimal"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Dormitórios
              <input
                className={
                  inputClass
                }
                name="bedrooms"
                type="number"
                min="0"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Faixa mínima R$/m²
              <input
                className={
                  inputClass
                }
                name="pricePerSquareMeterMin"
                inputMode="decimal"
                required
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Faixa máxima R$/m²
              <input
                className={
                  inputClass
                }
                name="pricePerSquareMeterMax"
                inputMode="decimal"
                required
              />
            </label>

            <div className="md:col-span-2 xl:col-span-4">
              <div className="border-t border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                  Primeira evidência
                </p>

                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  Dados do imóvel
                  comparável ou da
                  fonte utilizada
                  para sustentar
                  esta faixa.
                </p>
              </div>
            </div>

            <label
              className={
                labelClass
              }
            >
              Fonte consultada
              <input
                className={
                  inputClass
                }
                name="source"
                placeholder="Ex.: portal imobiliário"
                required
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Link da fonte
              <input
                className={
                  inputClass
                }
                name="sourceUrl"
                type="url"
                required
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Valor do comparável
              <input
                className={
                  inputClass
                }
                name="evidencePrice"
                inputMode="decimal"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Área do comparável
              <input
                className={
                  inputClass
                }
                name="evidenceArea"
                inputMode="decimal"
              />
            </label>

            <label
              className={
                labelClass
              }
            >
              Dormitórios do
              comparável
              <input
                className={
                  inputClass
                }
                name="evidenceBedrooms"
                type="number"
                min="0"
              />
            </label>

            <label
              className={`${labelClass} md:col-span-2 xl:col-span-3`}
            >
              Condomínio /
              edifício do
              comparável
              <input
                className={
                  inputClass
                }
                name="evidenceDevelopment"
                placeholder="Ex.: Edifício Rio das Pedras"
              />
            </label>

            <label
              className={`${labelClass} md:col-span-2 xl:col-span-4`}
            >
              Observações da
              referência
              <textarea
                className={`${inputClass} min-h-28 py-4`}
                name="notes"
              />
            </label>

            <label
              className={`${labelClass} md:col-span-2 xl:col-span-4`}
            >
              Observações da
              evidência
              <textarea
                className={`${inputClass} min-h-24 py-4`}
                name="evidenceNotes"
                placeholder="Ex.: anúncio ativo, mesmo padrão construtivo, andar semelhante, estado de conservação comparável."
              />
            </label>

            <button className="min-h-14 bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 md:col-span-2 xl:col-span-4">
              Registrar referência
            </button>
          </form>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Base atual
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Faixas cadastradas
              </h2>
            </div>

            <p className="text-xs text-zinc-500">
              {references.length}{" "}
              referência
              {references.length ===
              1
                ? ""
                : "s"}
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {references.length ===
            0 ? (
              <p className="border border-dashed border-white/10 p-7 text-sm text-zinc-500">
                Nenhuma referência
                cadastrada.
              </p>
            ) : (
              references.map(
                (reference) => {
                  const scope =
                    reference.development
                      ? "Empreendimento específico"
                      : "Geral do bairro";

                  return (
                    <article
                      key={
                        reference.id
                      }
                      className="border border-white/10 bg-[#0b0b0b] p-6"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
                          {propertyTypeLabel(
                            reference.propertyType,
                          )}
                        </span>

                        <span className="border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                          {purposeLabel(
                            reference.purpose,
                          )}
                        </span>

                        <span
                          className={
                            reference.development
                              ? "border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-sky-300"
                              : "border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300"
                          }
                        >
                          {scope}
                        </span>
                      </div>

                      <h3 className="mt-4 font-serif text-2xl">
                        {
                          reference.neighborhood
                        }
                        ,{" "}
                        {
                          reference.city
                        }
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {reference.development
                          ? reference.development
                          : "Referência geral do bairro"}
                      </p>

                      <p className="mt-5 text-xl text-white">
                        {currency(
                          reference.pricePerSquareMeterMin,
                        )}{" "}
                        a{" "}
                        {currency(
                          reference.pricePerSquareMeterMax,
                        )}
                        /m²
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                            Área mínima
                          </p>

                          <p className="mt-2 text-sm text-zinc-300">
                            {decimal(
                              reference.areaMin,
                            )}
                            {reference.areaMin
                              ? " m²"
                              : ""}
                          </p>
                        </div>

                        <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                            Área máxima
                          </p>

                          <p className="mt-2 text-sm text-zinc-300">
                            {decimal(
                              reference.areaMax,
                            )}
                            {reference.areaMax
                              ? " m²"
                              : ""}
                          </p>
                        </div>

                        <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                            Dormitórios
                          </p>

                          <p className="mt-2 text-sm text-zinc-300">
                            {reference.bedrooms ??
                              "Geral"}
                          </p>
                        </div>

                        <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                            Amostra
                          </p>

                          <p className="mt-2 text-sm text-zinc-300">
                            {
                              reference.sampleSize
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="text-xs text-zinc-500">
                          {
                            reference
                              .evidences
                              .length
                          }{" "}
                          fonte
                          {reference
                            .evidences
                            .length ===
                          1
                            ? ""
                            : "s"}{" "}
                          documentada
                          {reference
                            .evidences
                            .length ===
                          1
                            ? ""
                            : "s"}{" "}
                          • atualização{" "}
                          {reference.calculatedAt.toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>

                        {reference
                          .evidences[0] ? (
                          <div className="mt-4 border border-white/[0.06] bg-black/30 p-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                              Evidência mais
                              recente
                            </p>

                            <p className="mt-2 text-sm text-zinc-300">
                              {
                                reference
                                  .evidences[0]
                                  .source
                              }
                            </p>

                            {reference
                              .evidences[0]
                              .development ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                {
                                  reference
                                    .evidences[0]
                                    .development
                                }
                              </p>
                            ) : null}

                            <a
                              href={
                                reference
                                  .evidences[0]
                                  .sourceUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex text-xs font-semibold text-amber-400 hover:text-amber-300"
                            >
                              Abrir fonte
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                },
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}