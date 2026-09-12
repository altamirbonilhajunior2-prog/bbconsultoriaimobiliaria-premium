"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
} from "react";

import {
  saveExternalAcquisitionOpportunity,
} from "./actions";

type SearchOpportunity = {
  title: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;

  city: string;
  neighborhood: string;
  development: string;

  purpose: string;
  propertyType: string;

  price: number | null;
  priceText: string;

  bedrooms: number | null;
  suites: number | null;
  parking: number | null;
  area: number | null;

  compatibility: number;
  compatibilityReason: string;

  notes: string;
};

type SearchResponse = {
  success: boolean;

  profile?: string;
  summary?: string;

  totalFound?: number;
  strongOpportunities?: number;

  opportunities?: SearchOpportunity[];

  message?: string;
  technicalMessage?: string;
};

type SaveFeedback = {
  status:
    | "saved"
    | "duplicate"
    | "error";
  message: string;
  opportunityId?: number;
};

const inputClass =
  "h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-500";

const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500";

function formatCurrency(
  value: number | null,
) {
  if (value === null) {
    return "Valor não informado";
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

function getCompatibilityClass(
  score: number,
) {
  if (score >= 90) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }

  if (score >= 75) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }

  return "border-white/15 bg-white/[0.04] text-zinc-300";
}

export default function ExternalSearchPanel() {
  const router = useRouter();

  const [
    purpose,
    setPurpose,
  ] = useState("Locação");

  const [
    propertyType,
    setPropertyType,
  ] = useState("Casa");

  const [
    state,
    setState,
  ] = useState("SP");

  const [
    city,
    setCity,
  ] = useState(
    "São José dos Campos",
  );

  const [
    neighborhood,
    setNeighborhood,
  ] = useState("Urbanova");

  const [
    development,
    setDevelopment,
  ] = useState("");

  const [
    minPrice,
    setMinPrice,
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice,
  ] = useState("9000");

  const [
    bedrooms,
    setBedrooms,
  ] = useState("");

  const [
    suites,
    setSuites,
  ] = useState("");

  const [
    parking,
    setParking,
  ] = useState("");

  const [
    area,
    setArea,
  ] = useState("");

  const [
    details,
    setDetails,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    result,
    setResult,
  ] =
    useState<SearchResponse | null>(
      null,
    );

  const [
    searchedState,
    setSearchedState,
  ] = useState("SP");

  const [
    savingSourceUrl,
    setSavingSourceUrl,
  ] = useState<string | null>(
    null,
  );

  const [
    saveFeedback,
    setSaveFeedback,
  ] = useState<
    Record<string, SaveFeedback>
  >({});

  async function handleSearch() {
    if (!city.trim()) {
      setError(
        "Informe a cidade da busca.",
      );

      return;
    }

    if (!purpose) {
      setError(
        "Selecione a finalidade.",
      );

      return;
    }

    if (!propertyType) {
      setError(
        "Selecione o tipo de imóvel.",
      );

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSaveFeedback({});

    try {
      const normalizedState =
        state.trim().toUpperCase() ||
        "SP";

      const additionalDetails = [
        area.trim()
          ? `Área desejada: ${area.trim()} m²`
          : "",
        details.trim(),
      ]
        .filter(Boolean)
        .join(". ");

      const response =
        await fetch(
          "/api/admin/captacao-ia/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              purpose,
              propertyType,

              state:
                normalizedState,

              city:
                city.trim(),

              neighborhood:
                neighborhood.trim(),

              development:
                development.trim(),

              minPrice:
                minPrice.trim() ||
                null,

              maxPrice:
                maxPrice.trim() ||
                null,

              minBedrooms:
                bedrooms.trim() ||
                null,

              minSuites:
                suites.trim() ||
                null,

              minParking:
                parking.trim() ||
                null,

              details:
                additionalDetails,
            }),
          },
        );

      const data =
        (await response.json()) as SearchResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.technicalMessage ||
            data.message ||
            "Não foi possível realizar a busca.",
        );
      }

      setResult(data);
      setSearchedState(
        normalizedState,
      );
    } catch (searchError) {
      console.error(
        "Erro ao pesquisar oportunidades externas:",
        searchError,
      );

      setError(
        searchError instanceof Error
          ? searchError.message
          : "Não foi possível realizar a busca externa.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveOpportunity(
    opportunity: SearchOpportunity,
  ) {
    const sourceUrl =
      opportunity.sourceUrl;

    setSavingSourceUrl(sourceUrl);

    setSaveFeedback(
      (currentFeedback) => {
        const nextFeedback = {
          ...currentFeedback,
        };

        delete nextFeedback[
          sourceUrl
        ];

        return nextFeedback;
      },
    );

    try {
      const saveResult =
        await saveExternalAcquisitionOpportunity({
          title:
            opportunity.title,

          sourceName:
            opportunity.sourceName,

          sourceType:
            opportunity.sourceType,

          sourceUrl,

          state:
            searchedState,

          city:
            opportunity.city,

          neighborhood:
            opportunity.neighborhood,

          development:
            opportunity.development,

          purpose:
            opportunity.purpose,

          propertyType:
            opportunity.propertyType,

          price:
            opportunity.price,

          bedrooms:
            opportunity.bedrooms,

          suites:
            opportunity.suites,

          parking:
            opportunity.parking,

          area:
            opportunity.area,

          compatibility:
            opportunity.compatibility,

          compatibilityReason:
            opportunity.compatibilityReason,

          notes:
            opportunity.notes,
        });

      setSaveFeedback(
        (currentFeedback) => ({
          ...currentFeedback,

          [sourceUrl]: {
            status:
              saveResult.success
                ? "saved"
                : saveResult.duplicate
                  ? "duplicate"
                  : "error",

            message:
              saveResult.message,

            opportunityId:
              saveResult.opportunityId,
          },
        }),
      );

      if (saveResult.success) {
        router.refresh();
      }
    } catch (saveError) {
      console.error(
        "Erro ao salvar oportunidade externa:",
        saveError,
      );

      setSaveFeedback(
        (currentFeedback) => ({
          ...currentFeedback,

          [sourceUrl]: {
            status: "error",
            message:
              "Não foi possível salvar a oportunidade.",
          },
        }),
      );
    } finally {
      setSavingSourceUrl(null);
    }
  }

  const opportunities =
    result?.opportunities ?? [];

  return (
    <section className="mt-10 border border-amber-500/20 bg-amber-500/[0.03] p-7">
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
          Busca externa
        </p>

        <h2 className="font-serif text-3xl font-normal text-white">
          Encontrar oportunidades no mercado
        </h2>

        <p className="max-w-4xl text-sm leading-7 text-zinc-400">
          Informe o perfil do imóvel
          procurado. A Captação IA
          pesquisará oportunidades fora
          da carteira B&amp;B em portais,
          imobiliárias e outras fontes
          públicas.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            01. Perfil do imóvel
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Finalidade
              </span>

              <select
                value={purpose}
                onChange={(event) =>
                  setPurpose(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="Venda">
                  Venda
                </option>

                <option value="Locação">
                  Locação
                </option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Tipo de imóvel
              </span>

              <select
                value={
                  propertyType
                }
                onChange={(event) =>
                  setPropertyType(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="Casa">
                  Casa
                </option>

                <option value="Apartamento">
                  Apartamento
                </option>

                <option value="Terreno">
                  Terreno
                </option>

                <option value="Comercial">
                  Comercial
                </option>

                <option value="Rural">
                  Rural
                </option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Estado
              </span>

              <input
                type="text"
                value={state}
                maxLength={2}
                onChange={(event) =>
                  setState(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Cidade
              </span>

              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value,
                  )
                }
                placeholder="Ex.: São José dos Campos"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Bairro / região
              </span>

              <input
                type="text"
                value={
                  neighborhood
                }
                onChange={(event) =>
                  setNeighborhood(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Urbanova"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-1 xl:col-span-3">
              <span className={labelClass}>
                Condomínio / empreendimento
              </span>

              <input
                type="text"
                value={
                  development
                }
                onChange={(event) =>
                  setDevelopment(
                    event.target.value,
                  )
                }
                placeholder="Opcional. Ex.: Alphaville II"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            02. Valores
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Valor mínimo
              </span>

              <input
                type="text"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 7000"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Valor máximo
              </span>

              <input
                type="text"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 9000"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            03. Características
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Dormitórios
              </span>

              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(event) =>
                  setBedrooms(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 3"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Suítes
              </span>

              <input
                type="number"
                min="0"
                value={suites}
                onChange={(event) =>
                  setSuites(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 2"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Vagas
              </span>

              <input
                type="number"
                min="0"
                value={parking}
                onChange={(event) =>
                  setParking(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 2"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Área
              </span>

              <input
                type="number"
                min="0"
                value={area}
                onChange={(event) =>
                  setArea(
                    event.target.value,
                  )
                }
                placeholder="Ex.: 250 m²"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            04. Observações adicionais
          </p>

          <div className="mt-5">
            <textarea
              value={details}
              onChange={(event) =>
                setDetails(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Ex.: preferência por condomínio fechado, piscina, área gourmet, casa moderna, aceita pet..."
              className="w-full resize-y border border-white/10 bg-[#111111] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-500"
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={
              handleSearch
            }
            disabled={loading}
            className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Pesquisando mercado..."
              : "Buscar oportunidades"}
          </button>

          <p className="text-xs leading-5 text-zinc-600">
            A Captação IA apenas
            localiza oportunidades e
            apresenta os links. O contato
            com proprietário, corretor ou
            imobiliária é feito pelo
            captador da B&amp;B.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-6 border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm leading-6 text-red-300">
            {error}
          </p>
        </div>
      ) : null}

      {result ? (
        <div className="mt-10 border-t border-white/10 pt-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="border border-white/10 bg-[#0b0b0b] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Mercado externo
              </p>

              <strong className="mt-2 block font-serif text-4xl font-normal text-white">
                {
                  result.totalFound ??
                  opportunities.length
                }
              </strong>

              <p className="mt-2 text-xs text-zinc-500">
                oportunidades encontradas
              </p>
            </article>

            <article className="border border-white/10 bg-[#0b0b0b] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Oportunidades fortes
              </p>

              <strong className="mt-2 block font-serif text-4xl font-normal text-amber-400">
                {
                  result.strongOpportunities ??
                  0
                }
              </strong>

              <p className="mt-2 text-xs text-zinc-500">
                compatibilidade de 90% ou mais
              </p>
            </article>

            <article className="border border-white/10 bg-[#0b0b0b] p-5 sm:col-span-2 xl:col-span-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Status
              </p>

              <strong className="mt-2 block text-lg font-semibold text-emerald-400">
                Busca concluída
              </strong>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Resultados externos
                disponíveis para análise.
              </p>
            </article>
          </div>

          {result.summary ? (
            <div className="mt-6 border border-white/10 bg-[#0b0b0b] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Análise da Captação IA
              </p>

              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {
                  result.summary
                }
              </p>
            </div>
          ) : null}

          {opportunities.length >
          0 ? (
            <div className="mt-7 space-y-4">
              {opportunities.map(
                (
                  opportunity,
                  index,
                ) => {
                  const opportunityFeedback =
                    saveFeedback[
                      opportunity
                        .sourceUrl
                    ];

                  const isSaving =
                    savingSourceUrl ===
                    opportunity.sourceUrl;

                  const isSaved =
                    opportunityFeedback
                      ?.status ===
                      "saved";

                  const isDuplicate =
                    opportunityFeedback
                      ?.status ===
                      "duplicate";

                  return (
                    <article
                      key={`${opportunity.sourceUrl}-${index}`}
                      className="border border-white/10 bg-[#080808] p-6"
                    >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] ${getCompatibilityClass(
                              opportunity.compatibility,
                            )}`}
                          >
                            {
                              opportunity.compatibility
                            }
                            % compatível
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">
                            {
                              opportunity.sourceName
                            }
                          </span>
                        </div>

                        <h3 className="mt-4 font-serif text-2xl font-normal text-white">
                          {
                            opportunity.title
                          }
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                          {
                            opportunity.compatibilityReason
                          }
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                              Valor
                            </p>

                            <p className="mt-1 text-sm text-white">
                              {opportunity.priceText ||
                                formatCurrency(
                                  opportunity.price,
                                )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                              Localização
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {[
                                opportunity.development,
                                opportunity.neighborhood,
                                opportunity.city,
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  " · ",
                                ) ||
                                "Não informada"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                              Dormitórios
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {opportunity.bedrooms ??
                                "Não informado"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                              Vagas
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {opportunity.parking ??
                                "Não informado"}
                            </p>
                          </div>
                        </div>

                        {opportunity.notes ? (
                          <p className="mt-5 text-xs leading-6 text-zinc-500">
                            {
                              opportunity.notes
                            }
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 xl:w-52">
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveOpportunity(
                              opportunity,
                            )
                          }
                          disabled={
                            isSaving ||
                            isSaved ||
                            isDuplicate
                          }
                          className={`inline-flex min-h-12 items-center justify-center border px-6 text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed ${
                            isSaved ||
                            isDuplicate
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 disabled:opacity-100"
                              : "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 hover:text-black disabled:opacity-60"
                          }`}
                        >
                          {isSaving
                            ? "Salvando..."
                            : isSaved
                              ? "Oportunidade salva"
                              : isDuplicate
                                ? "Já cadastrada"
                                : "Salvar oportunidade"}
                        </button>

                        <a
                          href={
                            opportunity.sourceUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-12 items-center justify-center border border-amber-500/50 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                        >
                          Abrir anúncio
                        </a>

                        {opportunityFeedback ? (
                          <div
                            className={`border px-4 py-3 text-xs leading-5 ${
                              opportunityFeedback.status ===
                              "error"
                                ? "border-red-500/30 bg-red-500/10 text-red-300"
                                : opportunityFeedback.status ===
                                    "duplicate"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            }`}
                          >
                            <p>
                              {
                                opportunityFeedback.message
                              }
                            </p>

                            {opportunityFeedback.opportunityId ? (
                              <Link
                                href={`/admin/captacao-ia/${opportunityFeedback.opportunityId}`}
                                className="mt-2 inline-flex font-bold uppercase tracking-[0.12em] text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                              >
                                Abrir captação #
                                {
                                  opportunityFeedback.opportunityId
                                }
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-7 border border-white/10 bg-[#080808] px-6 py-10 text-center">
              <p className="text-sm text-zinc-500">
                Nenhuma oportunidade
                externa compatível foi
                encontrada nesta busca.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
