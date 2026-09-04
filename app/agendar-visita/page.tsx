"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { trackWhatsAppClick } from "../components/whatsappTracking";
import { PORTAL_LEAD_CONSENT_TEXT } from "../../lib/leads/consent";

const whatsappNumber = "5512978140636";

const purchaseQuestions = [
  {
    name: "objetivo",
    title:
      "1. Qual é o objetivo desta aquisição?",
    label: "Objetivo",
    options: [
      "Moradia",
      "Investimento",
      "Ainda estou avaliando",
    ],
  },
  {
    name: "aquisicao",
    title:
      "2. Como pretende realizar esta aquisição?",
    label: "Aquisição",
    options: [
      "Recursos próprios",
      "Financiamento",
      "Venda de outro imóvel",
      "Permuta + complemento financeiro",
      "Ainda estou definindo",
    ],
  },
  {
    name: "prazo",
    title:
      "3. Em quanto tempo pretende realizar a compra?",
    label: "Prazo",
    options: [
      "Até 30 dias",
      "Até 90 dias",
      "Até 6 meses",
      "Ainda estou avaliando oportunidades",
    ],
  },
  {
    name: "conhecimento",
    title:
      "4. Já conhece o condomínio ou a região deste imóvel?",
    label:
      "Conhece o condomínio/região",
    options: [
      "Sim",
      "Não",
      "Estou comparando outras regiões",
    ],
  },
] as const;

const rentalQuestions = [
  {
    name: "objetivo",
    title:
      "1. Qual é o objetivo desta locação?",
    label: "Objetivo",
    options: [
      "Moradia",
      "Mudança de residência",
      "Transferência profissional",
      "Ainda estou avaliando",
    ],
  },
  {
    name: "perfilLocacao",
    title:
      "2. Qual é o seu momento para a locação?",
    label: "Momento da locação",
    options: [
      "Quero alugar o quanto antes",
      "Estou comparando imóveis",
      "Estou planejando a mudança",
      "Ainda estou definindo",
    ],
  },
  {
    name: "prazo",
    title:
      "3. Em quanto tempo pretende realizar a locação?",
    label: "Prazo",
    options: [
      "Até 30 dias",
      "Até 60 dias",
      "Até 90 dias",
      "Ainda estou avaliando oportunidades",
    ],
  },
  {
    name: "conhecimento",
    title:
      "4. Já conhece o condomínio ou a região deste imóvel?",
    label:
      "Conhece o condomínio/região",
    options: [
      "Sim",
      "Não",
      "Estou comparando outras regiões",
    ],
  },
] as const;

type SubmissionState =
  | "idle"
  | "sending"
  | "error";

export default function AgendarVisitaPage() {
  const [
    propertyCode,
    setPropertyCode,
  ] = useState("");

  const [
    propertyTitle,
    setPropertyTitle,
  ] = useState("");

  const [
    propertyPurpose,
    setPropertyPurpose,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    submissionState,
    setSubmissionState,
  ] =
    useState<SubmissionState>(
      "idle",
    );

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search,
      );

    const code =
      searchParams.get(
        "imovel",
      );

    const title =
      searchParams.get(
        "titulo",
      );

    const purpose =
      searchParams.get(
        "finalidade",
      );

    if (code) {
      setPropertyCode(
        code.toUpperCase(),
      );
    }

    if (title) {
      setPropertyTitle(
        title,
      );
    }

    if (purpose) {
      setPropertyPurpose(
        purpose.toLowerCase(),
      );
    }
  }, []);

  const isRental =
    useMemo(() => {
      if (
        propertyPurpose ===
          "locacao" ||
        propertyPurpose ===
          "locação"
      ) {
        return true;
      }

      return /loca[cç][aã]o/i.test(
        propertyTitle,
      );
    }, [
      propertyPurpose,
      propertyTitle,
    ]);

  const questions =
    isRental
      ? rentalQuestions
      : purchaseQuestions;

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmissionState(
      "sending",
    );

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const unansweredQuestion =
      questions.find(
        (question) =>
          !formData.get(
            question.name,
          ),
      );

    if (unansweredQuestion) {
      setError(
        "Responda todas as perguntas antes de continuar.",
      );

      setSubmissionState(
        "idle",
      );

      return;
    }

    const name =
      String(
        formData.get("name") ??
          "",
      ).trim();

    const phone =
      String(
        formData.get(
          "phone",
        ) ?? "",
      ).trim();

    const consent =
      formData.get(
        "consent",
      ) === "on";

    if (
      name.length < 2 ||
      !phone ||
      !consent
    ) {
      setError(
        "Preencha seu nome, um WhatsApp válido e autorize o contato.",
      );

      setSubmissionState(
        "idle",
      );

      return;
    }

    const searchParams =
      new URLSearchParams(
        window.location.search,
      );

    try {
      const response =
        await fetch(
          "/api/leads",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                propertyCode:
                  propertyCode ||
                  null,

                name,
                phone,
                consent,

                company:
                  formData.get(
                    "company",
                  ),

                sourcePage:
                  `${window.location.pathname}${window.location.search}`,

                referrer:
                  document.referrer ||
                  null,

                utmSource:
                  searchParams.get(
                    "utm_source",
                  ),

                utmMedium:
                  searchParams.get(
                    "utm_medium",
                  ),

                utmCampaign:
                  searchParams.get(
                    "utm_campaign",
                  ),

                utmTerm:
                  searchParams.get(
                    "utm_term",
                  ),

                utmContent:
                  searchParams.get(
                    "utm_content",
                  ),

                gclid:
                  searchParams.get(
                    "gclid",
                  ),
              }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Não foi possível registrar seu contato.",
        );
      }

      const propertyIdentification =
        propertyCode &&
        propertyTitle
          ? `${propertyCode} — ${propertyTitle}`
          : propertyCode
            ? propertyCode
            : propertyTitle ||
              "Ainda não definido";

      const message = [
        `Olá, sou ${name} e gostaria de agendar uma visita.`,
        "",
        `Imóvel: ${propertyIdentification}`,
        `Finalidade: ${
          isRental
            ? "Locação"
            : "Compra"
        }`,
        ...questions.map(
          (question) =>
            `${question.label}: ${String(
              formData.get(
                question.name,
              ) ?? "",
            )}`,
        ),
      ].join("\n");

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message,
        )}`;

      const trackedWindow =
        window as typeof window & {
          dataLayer?: Record<
            string,
            unknown
          >[];
        };

      trackedWindow.dataLayer =
        trackedWindow.dataLayer ||
        [];

      trackedWindow.dataLayer.push(
        {
          event:
            "portal_lead_created",

          property_code:
            propertyCode ||
            "GERAL",

          lead_origin:
            "agendar_visita",
        },
      );

      trackWhatsAppClick();

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );

      setSubmissionState(
        "idle",
      );
    } catch (error) {
      setSubmissionState(
        "error",
      );

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu contato.",
      );
    }
  }

  const hasSelectedProperty =
    Boolean(
      propertyCode ||
        propertyTitle,
    );

  const backPath =
    propertyCode
      ? `/imovel/${propertyCode.toLowerCase()}`
      : isRental
        ? "/alugar"
        : "/comprar";

  const selectedPropertyTitle =
    propertyTitle ||
    "Imóvel ainda não selecionado";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <Link
            href={
              backPath
            }
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            {hasSelectedProperty
              ? "← Voltar para o imóvel"
              : "← Voltar para os imóveis"}
          </Link>

          <div className="mt-8 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Atendimento consultivo
              B&amp;B
            </p>

            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
              Solicite o
              agendamento da sua
              visita
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
              Conte-nos
              rapidamente o seu
              objetivo. Suas
              respostas nos ajudam
              a preparar um
              atendimento mais
              preciso para o seu
              momento de{" "}
              {isRental
                ? "locação"
                : "compra"}
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:px-10 lg:py-16">
        <aside className="h-fit border border-amber-500/30 bg-[#0b0b0b] p-7 lg:sticky lg:top-[155px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {hasSelectedProperty
              ? "Imóvel selecionado"
              : "Atendimento B&B"}
          </p>

          {propertyCode ? (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Referência{" "}
              {propertyCode}
            </p>
          ) : null}

          <h2 className="mt-3 font-serif text-3xl font-normal leading-tight text-white">
            {
              selectedPropertyTitle
            }
          </h2>

          {!hasSelectedProperty ? (
            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Caso ainda não tenha
              escolhido um imóvel,
              nós identificaremos
              as opções mais
              adequadas durante o
              atendimento.
            </p>
          ) : null}

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="text-sm leading-7 text-zinc-400">
              O preenchimento leva
              menos de dois
              minutos. Ao
              finalizar, seu
              contato será
              registrado no CRM da
              B&amp;B e você será
              direcionado ao
              WhatsApp com suas
              respostas
              organizadas.
            </p>
          </div>

          <div className="mt-7 border border-amber-500/20 bg-black/40 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Atendimento
              personalizado
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Nós verificaremos a
              disponibilidade e
              prepararemos o
              atendimento de
              acordo com o seu
              objetivo.
            </p>
          </div>
        </aside>

        <div className="border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Perfil de atendimento
            </p>

            <h2 className="mt-3 font-serif text-3xl font-normal sm:text-4xl">
              Conte-nos sobre sua
              intenção de{" "}
              {isRental
                ? "locação"
                : "compra"}
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Responda às etapas e,
              ao final, informe seus
              dados para que a
              equipe B&amp;B possa
              dar continuidade ao
              atendimento.
            </p>
          </div>

          <form
            className="mt-10"
            onSubmit={
              handleSubmit
            }
          >
            <div
              className="hidden"
              aria-hidden="true"
            >
              <label htmlFor="company">
                Empresa
              </label>

              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-9">
              {questions.map(
                (
                  question,
                ) => (
                  <fieldset
                    key={
                      question.name
                    }
                    className="border-b border-white/10 pb-9 last:border-0"
                  >
                    <legend className="mb-5 block font-serif text-xl leading-8 text-white sm:text-2xl">
                      {
                        question.title
                      }
                    </legend>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {question.options.map(
                        (
                          option,
                        ) => (
                          <label
                            key={
                              option
                            }
                            className="group relative cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={
                                question.name
                              }
                              value={
                                option
                              }
                              className="peer sr-only"
                            />

                            <span className="flex min-h-16 items-center border border-white/15 bg-black/30 px-5 py-4 text-sm leading-6 text-zinc-300 transition-all duration-300 group-hover:border-amber-500/60 group-hover:text-white peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black">
                              <span className="mr-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-600">
                                <span className="h-2 w-2 rounded-full bg-amber-500 opacity-0 transition group-has-[input:checked]:opacity-100" />
                              </span>

                              {
                                option
                              }
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </fieldset>
                ),
              )}
            </div>

            <section className="mt-10 border-t border-white/10 pt-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Seus dados
              </p>

              <h3 className="mt-3 font-serif text-2xl font-normal">
                Como podemos entrar
                em contato?
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Nome
                  </span>

                  <input
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    className="min-h-12 w-full border border-white/15 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                    placeholder="Seu nome"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    WhatsApp com DDD
                  </span>

                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={20}
                    autoComplete="tel"
                    inputMode="tel"
                    className="min-h-12 w-full border border-white/15 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                    placeholder="(12) 99999-9999"
                  />
                </label>
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-5 text-zinc-400">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
                />

                <span>
                  {
                    PORTAL_LEAD_CONSENT_TEXT
                  }{" "}
                  Você poderá
                  solicitar a
                  interrupção do
                  contato a qualquer
                  momento.
                </span>
              </label>
            </section>

            {error ? (
              <div
                role="alert"
                aria-live="polite"
                className="mt-7 border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={
                submissionState ===
                "sending"
              }
              className="mt-9 inline-flex min-h-16 w-full items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-wait disabled:opacity-60"
            >
              {submissionState ===
              "sending"
                ? "Registrando atendimento..."
                : "Registrar e continuar pelo WhatsApp"}
            </button>

            <p className="mt-5 text-center text-[11px] leading-5 text-zinc-600">
              Seus dados e respostas
              serão utilizados
              exclusivamente para
              atendimento imobiliário
              pela B&amp;B.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}