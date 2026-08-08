"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const whatsappNumber = "5512978140636";

const questions = [
  {
    name: "objetivo",
    title: "1. Qual é o objetivo desta aquisição?",
    options: ["Moradia", "Investimento", "Ainda estou avaliando"],
  },
  {
    name: "aquisicao",
    title: "2. Como pretende realizar esta aquisição?",
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
    title: "3. Em quanto tempo pretende realizar a compra?",
    options: [
      "Até 30 dias",
      "Até 90 dias",
      "Até 6 meses",
      "Ainda estou avaliando oportunidades",
    ],
  },
  {
    name: "conhecimento",
    title: "4. Já conhece o condomínio ou a região deste imóvel?",
    options: ["Sim", "Não", "Estou comparando outras regiões"],
  },
] as const;

export default function AgendarVisitaPage() {
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyTitle, setPropertyTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const code = searchParams.get("imovel");
    const title = searchParams.get("titulo");

    if (code) {
      setPropertyCode(code.toUpperCase());
    }

    if (title) {
      setPropertyTitle(title);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const objetivo = formData.get("objetivo");
    const aquisicao = formData.get("aquisicao");
    const prazo = formData.get("prazo");
    const conhecimento = formData.get("conhecimento");

    if (!objetivo || !aquisicao || !prazo || !conhecimento) {
      setError("Responda todas as perguntas antes de continuar.");
      return;
    }

    const propertyIdentification =
      propertyCode && propertyTitle
        ? `${propertyCode} Ã¢â‚¬â€ ${propertyTitle}`
        : propertyCode
          ? propertyCode
          : propertyTitle || "Ainda não definido";

    const message = [
      "Olá, gostaria de agendar uma visita.",
      "",
      `Imóvel: ${propertyIdentification}`,
      `Objetivo: ${objetivo}`,
      `Aquisição: ${aquisicao}`,
      `Prazo: ${prazo}`,
      `Conhece o condomínio/região: ${conhecimento}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const hasSelectedProperty = Boolean(propertyCode || propertyTitle);

  const backPath = propertyCode
    ? `/imovel/${propertyCode.toLowerCase()}`
    : "/comprar";

  const selectedPropertyTitle =
    propertyTitle || "Imóvel ainda não selecionado";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <Link
            href={backPath}
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            {hasSelectedProperty
              ? "Ã¢â€ Â Voltar para o imóvel"
              : "Ã¢â€ Â Voltar para os imóveis"}
          </Link>

          <div className="mt-8 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Atendimento consultivo B&B
            </p>

            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
              Solicite o agendamento da sua visita
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
              Conte-nos rapidamente o seu objetivo. Suas respostas nos ajudam a
              preparar um atendimento mais preciso para o seu momento de compra.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:px-10 lg:py-16">
        <aside className="h-fit border border-amber-500/30 bg-[#0b0b0b] p-7 lg:sticky lg:top-[155px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {hasSelectedProperty ? "Imóvel selecionado" : "Atendimento B&B"}
          </p>

          {propertyCode && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Referência {propertyCode}
            </p>
          )}

          <h2 className="mt-3 font-serif text-3xl font-normal leading-tight text-white">
            {selectedPropertyTitle}
          </h2>

          {!hasSelectedProperty && (
            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Caso ainda não tenha escolhido um imóvel, nós identificaremos as
              opções mais adequadas durante o atendimento.
            </p>
          )}

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="text-sm leading-7 text-zinc-400">
              O preenchimento leva menos de um minuto. Ao finalizar, você será
              direcionado ao WhatsApp da B&B com suas respostas organizadas.
            </p>
          </div>

          <div className="mt-7 border border-amber-500/20 bg-black/40 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Atendimento personalizado
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Nós verificaremos a disponibilidade e prepararemos o atendimento
              de acordo com o seu objetivo.
            </p>
          </div>
        </aside>

        <div className="border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Perfil de atendimento
            </p>

            <h2 className="mt-3 font-serif text-3xl font-normal sm:text-4xl">
              Conte-nos sobre sua intenção de compra
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Selecione uma resposta em cada etapa.
            </p>
          </div>

          <form className="mt-10" onSubmit={handleSubmit}>
            <div className="space-y-9">
              {questions.map((question) => (
                <fieldset
                  key={question.name}
                  className="border-b border-white/10 pb-9 last:border-0"
                >
                  <legend className="mb-5 block font-serif text-xl leading-8 text-white sm:text-2xl">
                    {question.title}
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="group relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={question.name}
                          value={option}
                          className="peer sr-only"
                        />

                        <span className="flex min-h-16 items-center border border-white/15 bg-black/30 px-5 py-4 text-sm leading-6 text-zinc-300 transition-all duration-300 group-hover:border-amber-500/60 group-hover:text-white peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black">
                          <span className="mr-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-600">
                            <span className="h-2 w-2 rounded-full bg-amber-500 opacity-0 transition peer-checked:opacity-100" />
                          </span>

                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-7 border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-9 inline-flex min-h-16 w-full items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Continuar pelo WhatsApp
            </button>

            <p className="mt-5 text-center text-[11px] leading-5 text-zinc-600">
              Suas respostas serão utilizadas apenas para personalizar o
              atendimento.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}