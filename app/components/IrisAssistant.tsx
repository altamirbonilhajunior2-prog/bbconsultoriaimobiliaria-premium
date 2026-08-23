"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Step =
  | "purpose"
  | "type"
  | "region"
  | "value"
  | "bedrooms"
  | "objective"
  | "details"
  | "summary";

type IrisAnswers = {
  purpose: string;
  propertyType: string;
  region: string;
  value: string;
  bedrooms: string;
  objective: string;
  details: string;
};

type IrisSearchResult = {
  code: string;
  title: string;
  propertyType: string;
  category: string;
  neighborhood: string;
  city: string;
  development: string | null;
  purpose: string;
  price: number | null;
  bedrooms: number;
  suites: number;
  parking: number;
  image: string | null;
  url: string;
};

type IrisSearchResponse = {
  success: boolean;
  count: number;
  matchType?: "exact" | "similar" | "none";
  results: IrisSearchResult[];
  message?: string;
};

type IrisInterpretResponse = {
  success: boolean;
  interpreted?: IrisAnswers;
  message?: string;
};

const initialAnswers: IrisAnswers = {
  purpose: "",
  propertyType: "",
  region: "",
  value: "",
  bedrooms: "",
  objective: "",
  details: "",
};

const valueOptions = [
  "Até R$ 500 mil",
  "De R$ 500 mil a R$ 1 milhão",
  "De R$ 1 milhão a R$ 2 milhões",
  "De R$ 2 milhões a R$ 3 milhões",
  "Acima de R$ 3 milhões",
  "Ainda não defini",
];

const bedroomOptions = [
  "1 dormitório",
  "2 dormitórios",
  "3 dormitórios",
  "4 ou mais dormitórios",
  "Não é relevante",
];

const objectiveOptions = [
  "Moradia",
  "Investimento",
  "Renda",
  "Valorização patrimonial",
  "Outro",
];

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

function summaryValue(
  value: string,
) {
  return value.trim() || "Não informado.";
}

export default function IrisAssistant() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    step,
    setStep,
  ] = useState<Step>(
    "purpose",
  );

  const [
    answers,
    setAnswers,
  ] = useState<IrisAnswers>(
    initialAnswers,
  );

  const [
    regionInput,
    setRegionInput,
  ] = useState("");

  const [
    naturalInput,
    setNaturalInput,
  ] = useState("");

  const [
    isInterpreting,
    setIsInterpreting,
  ] = useState(false);

  const [
    interpretError,
    setInterpretError,
  ] = useState(false);

  const [
    searchResults,
    setSearchResults,
  ] = useState<IrisSearchResult[]>(
    [],
  );

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    searchCompleted,
    setSearchCompleted,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState(false);

  const [
    searchMatchType,
    setSearchMatchType,
  ] = useState<
    "exact" | "similar" | "none"
  >("none");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen]);

  const summaryItems =
    useMemo(
      () => [
        {
          label: "Finalidade",
          value:
            summaryValue(
              answers.purpose,
            ),
        },
        {
          label: "Tipo de imóvel",
          value:
            summaryValue(
              answers.propertyType,
            ),
        },
        {
          label: "Bairro ou região",
          value:
            summaryValue(
              answers.region,
            ),
        },
        {
          label: "Faixa de valor",
          value:
            summaryValue(
              answers.value,
            ),
        },
        {
          label: "Dormitórios",
          value:
            summaryValue(
              answers.bedrooms,
            ),
        },
        {
          label: "Objetivo",
          value:
            summaryValue(
              answers.objective,
            ),
        },
        {
          label: "Preferências",
          value:
            summaryValue(
              answers.details,
            ),
        },
      ],
      [answers],
    );

  function resetConversation() {
    setStep(
      "purpose",
    );

    setAnswers(
      initialAnswers,
    );

    setRegionInput("");

    setNaturalInput("");

    setIsInterpreting(
      false,
    );

    setInterpretError(
      false,
    );

    setSearchResults(
      [],
    );

    setSearchMatchType(
      "none",
    );

    setIsSearching(
      false,
    );

    setSearchCompleted(
      false,
    );

    setSearchError(
      false,
    );
  }

  function openAssistant() {
    setIsOpen(true);
  }

  function choosePurpose(
    purpose: string,
  ) {
    setAnswers(
      (current) => ({
        ...current,
        purpose,
      }),
    );

    setStep(
      "type",
    );
  }

  function choosePropertyType(
    propertyType: string,
  ) {
    setAnswers(
      (current) => ({
        ...current,
        propertyType,
      }),
    );

    setStep(
      "region",
    );
  }

  function handleRegionSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedRegion =
      regionInput.trim();

    if (
      !normalizedRegion
    ) {
      return;
    }

    setAnswers(
      (current) => ({
        ...current,
        region:
          normalizedRegion,
      }),
    );

    setStep(
      "value",
    );
  }

  function chooseValue(
    value: string,
  ) {
    setAnswers(
      (current) => ({
        ...current,
        value,
      }),
    );

    setStep(
      "bedrooms",
    );
  }

  function chooseBedrooms(
    bedrooms: string,
  ) {
    setAnswers(
      (current) => ({
        ...current,
        bedrooms,
      }),
    );

    setStep(
      "objective",
    );
  }

  function chooseObjective(
    objective: string,
  ) {
    setAnswers(
      (current) => ({
        ...current,
        objective,
      }),
    );

    setStep(
      "details",
    );
  }

  async function searchProperties(
    nextAnswers: IrisAnswers,
  ) {
    setIsSearching(
      true,
    );

    setSearchCompleted(
      false,
    );

    setSearchError(
      false,
    );

    setSearchResults(
      [],
    );

    setSearchMatchType(
      "none",
    );

    try {
      const response =
        await fetch(
          "/api/iris/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                purpose:
                  nextAnswers.purpose,

                propertyType:
                  nextAnswers.propertyType,

                region:
                  nextAnswers.region,

                value:
                  nextAnswers.value,

                bedrooms:
                  nextAnswers.bedrooms,

                objective:
                  nextAnswers.objective,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Falha na busca de imóveis.",
        );
      }

      const data =
        (await response.json()) as
          IrisSearchResponse;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Falha na busca de imóveis.",
        );
      }

      setSearchResults(
        data.results,
      );

      setSearchMatchType(
        data.matchType ??
          (data.results.length > 0
            ? "exact"
            : "none"),
      );
    } catch (error) {
      console.error(
        "Erro ao consultar imóveis com a Íris:",
        error,
      );

      setSearchError(
        true,
      );
    } finally {
      setIsSearching(
        false,
      );

      setSearchCompleted(
        true,
      );
    }
  }

  async function handleNaturalSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message =
      naturalInput.trim();

    if (!message) {
      return;
    }

    setInterpretError(
      false,
    );

    setIsInterpreting(
      true,
    );

    setSearchResults(
      [],
    );

    setSearchCompleted(
      false,
    );

    setSearchError(
      false,
    );

    try {
      const response =
        await fetch(
          "/api/iris/interpret",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Falha ao interpretar a busca.",
        );
      }

      const data =
        (await response.json()) as
          IrisInterpretResponse;

      if (
        !data.success ||
        !data.interpreted
      ) {
        throw new Error(
          data.message ||
            "Falha ao interpretar a busca.",
        );
      }

      const interpreted =
        data.interpreted;

      const nextAnswers: IrisAnswers = {
        purpose:
          interpreted.purpose ||
          "",

        propertyType:
          interpreted.propertyType ||
          "",

        region:
          interpreted.region ||
          "",

        value:
          interpreted.value ||
          "Ainda não defini",

        bedrooms:
          interpreted.bedrooms ||
          "Não é relevante",

        objective:
          interpreted.objective ||
          "",

        details:
          interpreted.details ||
          message,
      };

      setAnswers(
        nextAnswers,
      );

      setStep(
        "summary",
      );

      await searchProperties(
        nextAnswers,
      );
    } catch (error) {
      console.error(
        "Erro ao interpretar busca com a Íris:",
        error,
      );

      setInterpretError(
        true,
      );
    } finally {
      setIsInterpreting(
        false,
      );
    }
  }

  async function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget,
      );

    const details =
      String(
        formData.get(
          "details",
        ) || "",
      ).trim();

    const nextAnswers: IrisAnswers = {
      ...answers,
      details,
    };

    setAnswers(
      nextAnswers,
    );

    setStep(
      "summary",
    );

    await searchProperties(
      nextAnswers,
    );
  }

  function sendToWhatsApp() {
    const selectedProperties =
      searchResults.length > 0
        ? [
            "",
            "Imóveis encontrados pela Íris:",
            ...searchResults.map(
              (property) =>
                `${property.code} - ${property.title}`,
            ),
          ]
        : [];

    const message = [
      "Olá, concluí uma busca com a Íris no Portal B&B.",
      "",
      "Resumo da busca:",
      `Finalidade: ${summaryValue(
        answers.purpose,
      )}`,
      `Tipo de imóvel: ${summaryValue(
        answers.propertyType,
      )}`,
      `Bairro ou região: ${summaryValue(
        answers.region,
      )}`,
      `Faixa de valor: ${summaryValue(
        answers.value,
      )}`,
      `Dormitórios: ${summaryValue(
        answers.bedrooms,
      )}`,
      `Objetivo: ${summaryValue(
        answers.objective,
      )}`,
      "",
      "Preferências adicionais:",
      summaryValue(
        answers.details,
      ),
      ...selectedProperties,
      "",
      "Gostaria de receber uma curadoria de imóveis compatíveis com este perfil.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/5512978140636?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function renderStep() {
    if (
      step === "purpose"
    ) {
      return (
        <>
          <IrisMessage>
            Olá, eu sou a Íris, assistente virtual da B&amp;B Consultoria
            Imobiliária.
          </IrisMessage>

          <IrisMessage>
            Você pode me contar com suas próprias palavras o imóvel que procura
            ou usar a busca guiada abaixo.
          </IrisMessage>

          <IrisQuestion>
            Descreva o imóvel que você procura.
          </IrisQuestion>

          <form
            onSubmit={
              handleNaturalSearch
            }
            className="mt-4"
          >
            <textarea
              rows={4}
              value={
                naturalInput
              }
              onChange={(event) =>
                setNaturalInput(
                  event.target.value,
                )
              }
              disabled={
                isInterpreting
              }
              placeholder="Ex.: Quero uma casa no Urbanova até R$ 2 milhões, com 4 dormitórios, para morar."
              className="w-full resize-y rounded-xl border border-[#d5a85a]/30 bg-[#101010] px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 transition focus:border-[#d5a85a]/70 disabled:cursor-wait disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                isInterpreting ||
                !naturalInput.trim()
              }
              className="mt-3 min-h-12 w-full rounded-xl bg-[#d5a85a] px-5 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e8c47d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInterpreting
                ? "Íris está analisando..."
                : "Buscar com a Íris"}
            </button>
          </form>

          {interpretError ? (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-xs leading-5 text-zinc-300">
                Não consegui interpretar sua descrição agora. Você pode tentar
                novamente ou continuar pela busca guiada abaixo.
              </p>
            </div>
          ) : null}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              ou busca guiada
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <IrisQuestion>
            Para começarmos, o que você procura?
          </IrisQuestion>

          <Options>
            <OptionButton
              onClick={() =>
                choosePurpose(
                  "Compra",
                )
              }
            >
              Comprar um imóvel
            </OptionButton>

            <OptionButton
              onClick={() =>
                choosePurpose(
                  "Locação",
                )
              }
            >
              Alugar um imóvel
            </OptionButton>

            <OptionButton
              onClick={() =>
                choosePurpose(
                  "Investimento",
                )
              }
            >
              Buscar uma oportunidade de investimento
            </OptionButton>
          </Options>
        </>
      );
    }

    if (
      step === "type"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.purpose
            }
          </UserAnswer>

          <IrisQuestion>
            Qual tipo de imóvel você procura?
          </IrisQuestion>

          <Options>
            {[
              "Casa",
              "Apartamento",
              "Terreno",
              "Comercial",
            ].map(
              (item) => (
                <OptionButton
                  key={item}
                  onClick={() =>
                    choosePropertyType(
                      item,
                    )
                  }
                >
                  {item}
                </OptionButton>
              ),
            )}
          </Options>
        </>
      );
    }

    if (
      step === "region"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.propertyType
            }
          </UserAnswer>

          <IrisQuestion>
            Em qual bairro ou região você gostaria de buscar?
          </IrisQuestion>

          <form
            onSubmit={
              handleRegionSubmit
            }
            className="mt-4"
          >
            <input
              type="text"
              value={
                regionInput
              }
              onChange={(event) =>
                setRegionInput(
                  event.target.value,
                )
              }
              placeholder="Ex.: Urbanova, Jardim Aquarius..."
              autoFocus
              className="h-13 w-full rounded-xl border border-white/10 bg-[#101010] px-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#d5a85a]/60"
            />

            <button
              type="submit"
              className="mt-3 min-h-12 w-full rounded-xl bg-[#d5a85a] px-5 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e8c47d]"
            >
              Continuar
            </button>
          </form>
        </>
      );
    }

    if (
      step === "value"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.region
            }
          </UserAnswer>

          <IrisQuestion>
            Qual faixa de valor você considera?
          </IrisQuestion>

          <Options>
            {valueOptions.map(
              (item) => (
                <OptionButton
                  key={item}
                  onClick={() =>
                    chooseValue(
                      item,
                    )
                  }
                >
                  {item}
                </OptionButton>
              ),
            )}
          </Options>
        </>
      );
    }

    if (
      step === "bedrooms"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.value
            }
          </UserAnswer>

          <IrisQuestion>
            Quantos dormitórios você procura?
          </IrisQuestion>

          <Options>
            {bedroomOptions.map(
              (item) => (
                <OptionButton
                  key={item}
                  onClick={() =>
                    chooseBedrooms(
                      item,
                    )
                  }
                >
                  {item}
                </OptionButton>
              ),
            )}
          </Options>
        </>
      );
    }

    if (
      step === "objective"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.bedrooms
            }
          </UserAnswer>

          <IrisQuestion>
            Qual é o principal objetivo dessa busca?
          </IrisQuestion>

          <Options>
            {objectiveOptions.map(
              (item) => (
                <OptionButton
                  key={item}
                  onClick={() =>
                    chooseObjective(
                      item,
                    )
                  }
                >
                  {item}
                </OptionButton>
              ),
            )}
          </Options>
        </>
      );
    }

    if (
      step === "details"
    ) {
      return (
        <>
          <UserAnswer>
            {
              answers.objective
            }
          </UserAnswer>

          <IrisQuestion>
            Quer me contar mais alguma preferência?
          </IrisQuestion>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Exemplos: metragem, condomínio específico, piscina, escritório,
            posição solar, prazo ou qualquer outra característica importante.
          </p>

          <form
            onSubmit={
              handleDetailsSubmit
            }
            className="relative z-10 mt-4"
          >
            <textarea
              name="details"
              rows={5}
              defaultValue={
                answers.details
              }
              placeholder="Digite suas preferências..."
              className="relative z-10 w-full resize-y rounded-xl border border-white/10 bg-[#101010] px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 transition focus:border-[#d5a85a]/60"
            />

            <button
              type="submit"
              className="mt-3 min-h-12 w-full rounded-xl bg-[#d5a85a] px-5 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e8c47d]"
            >
              Finalizar minha busca
            </button>
          </form>
        </>
      );
    }

    return (
      <>
        <IrisMessage>
          Perfeito. Organizei o perfil da sua busca.
        </IrisMessage>

        <div className="mt-5 rounded-2xl border border-[#d5a85a]/25 bg-[#d5a85a]/5 p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d5a85a]">
            Resumo da busca
          </p>

          <div className="mt-4 space-y-3">
            {summaryItems.map(
              (item) => (
                <div
                  key={
                    item.label
                  }
                  className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                >
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                    {
                      item.label
                    }
                  </p>

                  <p className="mt-1 text-sm text-zinc-200">
                    {
                      item.value
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        {isSearching ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#111111] px-4 py-5">
            <p className="text-sm leading-6 text-zinc-300">
              Estou consultando os imóveis disponíveis da B&amp;B para encontrar
              as opções mais compatíveis com o seu perfil...
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#d5a85a]" />
            </div>
          </div>
        ) : null}

        {searchCompleted &&
        !searchError &&
        searchResults.length >
          0 ? (
          <>
            <IrisMessage>
              {searchMatchType ===
              "similar"
                ? `Não encontrei uma correspondência exata, mas selecionei ${
                    searchResults.length
                  } ${
                    searchResults.length ===
                    1
                      ? "alternativa próxima"
                      : "alternativas próximas"
                  } ao seu perfil.`
                : `Encontrei ${
                    searchResults.length
                  } ${
                    searchResults.length ===
                    1
                      ? "imóvel compatível"
                      : "imóveis compatíveis"
                  } com os critérios informados.`}
            </IrisMessage>

            <div className="mt-4 space-y-3">
              {searchResults.map(
                (property) => (
                  <article
                    key={
                      property.code
                    }
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#101010]"
                  >
                    {property.image ? (
                      <div className="aspect-[16/9] overflow-hidden bg-black">
                        <img
                          src={
                            property.image
                          }
                          alt={
                            property.title
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#d5a85a]">
                          {
                            property.code
                          }
                        </span>

                        <span className="text-xs font-semibold text-white">
                          {
                            formatCurrency(
                              property.price,
                            )
                          }
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-lg leading-6 text-white">
                        {
                          property.title
                        }
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-zinc-400">
                        {
                          property.neighborhood
                        }
                        {" • "}
                        {
                          property.city
                        }
                      </p>

                      {property.development ? (
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {
                            property.development
                          }
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-400">
                        {property.bedrooms >
                        0 ? (
                          <span>
                            {
                              property.bedrooms
                            }{" "}
                            dormitórios
                          </span>
                        ) : null}

                        {property.suites >
                        0 ? (
                          <span>
                            {
                              property.suites
                            }{" "}
                            suítes
                          </span>
                        ) : null}

                        {property.parking >
                        0 ? (
                          <span>
                            {
                              property.parking
                            }{" "}
                            vagas
                          </span>
                        ) : null}
                      </div>

                      <a
                        href={
                          property.url
                        }
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#d5a85a]/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d5a85a] transition hover:bg-[#d5a85a] hover:text-black"
                      >
                        Ver imóvel
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
          </>
        ) : null}

        {searchCompleted &&
        !searchError &&
        searchResults.length ===
          0 ? (
          <IrisMessage>
            Não encontrei neste momento um imóvel publicado que corresponda
            exatamente a todos esses critérios. A equipe da B&amp;B pode fazer
            uma curadoria personalizada para você.
          </IrisMessage>
        ) : null}

        {searchCompleted &&
        searchError ? (
          <IrisMessage>
            Não consegui consultar os imóveis automaticamente neste momento,
            mas seu perfil já está organizado e pode ser encaminhado para a
            equipe da B&amp;B continuar a busca.
          </IrisMessage>
        ) : null}

        {searchCompleted ? (
          <>
            <IrisMessage>
              Posso encaminhar seu perfil para a equipe da B&amp;B continuar o
              atendimento pelo WhatsApp.
            </IrisMessage>

            <button
              type="button"
              onClick={
                sendToWhatsApp
              }
              className="mt-4 min-h-13 w-full rounded-xl bg-[#d5a85a] px-5 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e8c47d]"
            >
              Enviar para a B&amp;B
            </button>

            <button
              type="button"
              onClick={
                resetConversation
              }
              className="mt-3 min-h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-[#d5a85a]/50 hover:text-[#d5a85a]"
            >
              Fazer uma nova busca
            </button>
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={
          openAssistant
        }
        aria-label="Falar com a Íris, assistente virtual da B&B"
        className="fixed bottom-6 right-28 z-[998] hidden min-h-16 items-center gap-4 rounded-full border border-[#d5a85a]/60 bg-[#090909]/95 px-5 pr-6 text-left shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d5a85a] hover:shadow-[0_16px_40px_rgba(213,168,90,0.22)] md:flex"
      >
        <IrisAvatar />

        <span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#d5a85a]">
            Assistente virtual
          </span>

          <span className="mt-1 block text-sm font-semibold text-white">
            Fale com a Íris
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={
          openAssistant
        }
        aria-label="Falar com a Íris, assistente virtual da B&B"
        className="fixed bottom-24 right-6 z-[998] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[#d5a85a] bg-[#090909] shadow-2xl transition-all duration-300 hover:scale-105 md:hidden"
      >
        <Image
          src="/iris-avatar.webp"
          alt="Íris"
          width={112}
          height={112}
          className="h-full w-full object-cover object-top"
        />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-end overflow-y-auto bg-black/30 p-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-[2px] sm:items-end sm:p-5"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="iris-title"
            className="flex max-h-[calc(100dvh-24px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#d5a85a]/30 bg-[#080808] shadow-[0_28px_90px_rgba(0,0,0,0.72)] sm:max-h-[min(760px,calc(100vh-40px))]"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0d0d0d] px-5 py-4">
              <div className="flex items-center gap-3">
                <IrisAvatar />

                <div>
                  <h2
                    id="iris-title"
                    className="font-serif text-xl font-normal text-white"
                  >
                    Íris
                  </h2>

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#d5a85a]">
                    Assistente virtual da B&amp;B
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Fechar atendimento da Íris"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl text-zinc-400 transition hover:border-[#d5a85a]/60 hover:text-[#d5a85a]"
              >
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              {
                renderStep()
              }

              <p className="mt-7 text-center text-[10px] leading-5 text-zinc-600">
                A Íris é uma assistente virtual. As sugestões exibidas são
                baseadas nos imóveis publicados no Portal B&amp;B. Quando
                necessário, o atendimento poderá ser encaminhado para a equipe.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function IrisAvatar() {
  return (
    <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#d5a85a]/70 bg-[#111111] shadow-[0_0_18px_rgba(213,168,90,0.14)]">
      <Image
        src="/iris-avatar.webp"
        alt="Íris, assistente virtual da B&B"
        width={88}
        height={88}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );
}

function IrisMessage({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-3 max-w-[92%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#111111] px-4 py-4 first:mt-0">
      <p className="text-sm leading-6 text-zinc-300">
        {children}
      </p>
    </div>
  );
}

function IrisQuestion({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-5 max-w-[92%] rounded-2xl rounded-tl-sm border border-[#d5a85a]/20 bg-[#d5a85a]/5 px-4 py-4">
      <p className="text-sm font-medium leading-6 text-white">
        {children}
      </p>
    </div>
  );
}

function UserAnswer({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-[#d5a85a] px-4 py-3 text-black">
      <p className="text-sm font-medium leading-5">
        {children}
      </p>
    </div>
  );
}

function Options({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-4 grid gap-2">
      {children}
    </div>
  );
}

function OptionButton({
  children,
  onClick,
}: {
  children:
    React.ReactNode;
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="min-h-12 rounded-xl border border-white/10 bg-[#101010] px-4 text-left text-sm text-zinc-200 transition hover:border-[#d5a85a]/60 hover:bg-[#d5a85a]/5 hover:text-[#d5a85a]"
    >
      {children}
    </button>
  );
}