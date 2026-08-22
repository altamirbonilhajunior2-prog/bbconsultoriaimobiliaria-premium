"use client";

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
            answers.purpose,
        },
        {
          label: "Tipo de imóvel",
          value:
            answers.propertyType,
        },
        {
          label: "Bairro ou região",
          value:
            answers.region,
        },
        {
          label: "Faixa de valor",
          value:
            answers.value,
        },
        {
          label: "Dormitórios",
          value:
            answers.bedrooms,
        },
        {
          label: "Objetivo",
          value:
            answers.objective,
        },
        {
          label: "Preferências",
          value:
            answers.details ||
            "Não informado.",
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

  function handleDetailsSubmit(
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

    setAnswers(
      (current) => ({
        ...current,
        details,
      }),
    );

    setStep(
      "summary",
    );
  }

  function sendToWhatsApp() {
    const message = [
      "Olá, concluí uma busca com a Íris no Portal B&B.",
      "",
      "Resumo da busca:",
      `Finalidade: ${answers.purpose}`,
      `Tipo de imóvel: ${answers.propertyType}`,
      `Bairro ou região: ${answers.region}`,
      `Faixa de valor: ${answers.value}`,
      `Dormitórios: ${answers.bedrooms}`,
      `Objetivo: ${answers.objective}`,
      "",
      "Preferências adicionais:",
      answers.details ||
        "Não informado.",
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
            Vou ajudar você a organizar sua busca de forma rápida e objetiva.
          </IrisMessage>

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

        <IrisMessage>
          Posso encaminhar este perfil para a equipe da B&amp;B continuar a
          curadoria pelo WhatsApp.
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
        className="fixed bottom-6 right-28 z-[998] hidden min-h-16 items-center gap-4 rounded-full border border-[#d5a85a]/60 bg-[#090909]/95 px-6 text-left shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d5a85a] hover:shadow-[0_16px_40px_rgba(213,168,90,0.22)] md:flex"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d5a85a]/60 bg-[#d5a85a]/10 font-serif text-xl text-[#d5a85a]">
          Í
        </span>

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
        className="fixed bottom-24 right-6 z-[998] flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d5a85a] bg-[#090909] font-serif text-xl text-[#d5a85a] shadow-2xl transition-all duration-300 hover:scale-105 md:hidden"
      >
        Í
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-end bg-black/30 p-3 backdrop-blur-[2px] sm:p-5"
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
            className="flex max-h-[min(760px,calc(100vh-24px))] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#d5a85a]/30 bg-[#080808] shadow-[0_28px_90px_rgba(0,0,0,0.72)]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0d0d0d] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d5a85a]/60 bg-[#d5a85a]/10 font-serif text-xl text-[#d5a85a]">
                  Í
                </span>

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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-zinc-400 transition hover:border-[#d5a85a]/60 hover:text-[#d5a85a]"
              >
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {
                renderStep()
              }

              <p className="mt-7 text-center text-[10px] leading-5 text-zinc-600">
                A Íris é uma assistente virtual. Quando necessário, seu
                atendimento poderá ser encaminhado para a equipe da B&amp;B.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
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
      onClick={onClick}
      className="min-h-12 rounded-xl border border-white/10 bg-[#101010] px-4 text-left text-sm text-zinc-200 transition hover:border-[#d5a85a]/60 hover:bg-[#d5a85a]/5 hover:text-[#d5a85a]"
    >
      {children}
    </button>
  );
}