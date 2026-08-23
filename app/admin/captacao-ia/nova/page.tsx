"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createAcquisitionAction,
  type AcquisitionFormState,
} from "./actions";

const initialState: AcquisitionFormState = {
  success: false,
  message: "",
};

const inputClass =
  "h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500";

const textareaClass =
  "w-full resize-y border border-white/10 bg-[#111111] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-amber-500";

const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500";

const sectionClass =
  "border border-white/10 bg-[#0b0b0b] p-7";

const sectionTitleClass =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400";

export default function NovaCaptacaoPage() {
  const [
    formState,
    formAction,
    isPending,
  ] = useActionState(
    createAcquisitionAction,
    initialState,
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <header className="border-b border-white/10 pb-8">
          <Link
            href="/admin/captacao-ia"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
          >
            ← Voltar para Captação IA
          </Link>

          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Radar B&amp;B
          </p>

          <h1 className="mt-3 font-serif text-5xl font-normal">
            Nova captação
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Registre uma oportunidade encontrada em uma fonte externa.
            O imóvel permanecerá privado no CRM até a obtenção da
            autorização correspondente.
          </p>

          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm leading-6 text-amber-200">
              O cadastro desta oportunidade não publica o imóvel e não
              concede autorização para utilização de imagens.
            </p>
          </div>

          {formState.message ? (
            <div className="mt-6 border border-red-500/30 bg-red-500/10 px-5 py-4">
              <p className="text-sm leading-6 text-red-300">
                {formState.message}
              </p>
            </div>
          ) : null}
        </header>

        <form
          action={formAction}
          className="mt-10 space-y-10"
        >
          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              01. Origem da oportunidade
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Fonte *
                </span>

                <select
                  name="source"
                  required
                  defaultValue="OLX"
                  className={inputClass}
                >
                  <option value="OLX">
                    OLX
                  </option>

                  <option value="ZAP">
                    ZAP
                  </option>

                  <option value="Viva Real">
                    Viva Real
                  </option>

                  <option value="Imovelweb">
                    Imovelweb
                  </option>

                  <option value="Site imobiliária">
                    Site imobiliária
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Origem
                </span>

                <select
                  name="origin"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">
                    Não identificado
                  </option>

                  <option value="Proprietário">
                    Proprietário
                  </option>

                  <option value="Imobiliária">
                    Imobiliária
                  </option>

                  <option value="Corretor">
                    Corretor
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>
                  Link do anúncio original *
                </span>

                <input
                  name="sourceUrl"
                  type="url"
                  required
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
                <span className={labelClass}>
                  Título do anúncio
                </span>

                <input
                  name="sourceTitle"
                  type="text"
                  maxLength={250}
                  placeholder="Ex.: Casa no Urbanova com 4 suítes"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              02. Localização
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Estado
                </span>

                <input
                  name="state"
                  type="text"
                  defaultValue="SP"
                  maxLength={2}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Cidade
                </span>

                <input
                  name="city"
                  type="text"
                  defaultValue="São José dos Campos"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Bairro
                </span>

                <input
                  name="neighborhood"
                  type="text"
                  placeholder="Ex.: Urbanova"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Condomínio / edifício
                </span>

                <input
                  name="development"
                  type="text"
                  placeholder="Ex.: Alphaville II"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
                <span className={labelClass}>
                  Localização resumida
                </span>

                <input
                  name="location"
                  type="text"
                  placeholder="Ex.: Alphaville II, Urbanova"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              03. Classificação e valores
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Finalidade
                </span>

                <select
                  name="purpose"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">
                    Não informada
                  </option>

                  <option value="Venda">
                    Venda
                  </option>

                  <option value="Locação">
                    Locação
                  </option>

                  <option value="Venda e locação">
                    Venda e locação
                  </option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Tipo de imóvel
                </span>

                <select
                  name="propertyType"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">
                    Qualquer / não informado
                  </option>

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
                  Valor de venda
                </span>

                <input
                  name="price"
                  type="text"
                  placeholder="Ex.: R$ 1.500.000"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Valor de locação
                </span>

                <input
                  name="rentalPrice"
                  type="text"
                  placeholder="Ex.: R$ 8.000"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Condomínio
                </span>

                <input
                  name="condominium"
                  type="text"
                  placeholder="Ex.: R$ 950"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  IPTU
                </span>

                <input
                  name="iptu"
                  type="text"
                  placeholder="Ex.: R$ 2.500"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              04. Características do imóvel
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Área
                </span>

                <input
                  name="area"
                  type="text"
                  placeholder="Ex.: 180 m²"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Área do terreno
                </span>

                <input
                  name="landArea"
                  type="text"
                  placeholder="Ex.: 450 m²"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Dormitórios
                </span>

                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Suítes
                </span>

                <input
                  name="suites"
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Banheiros
                </span>

                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Vagas
                </span>

                <input
                  name="parking"
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              05. Contato e análise
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Nome do contato
                </span>

                <input
                  name="contactName"
                  type="text"
                  placeholder="Proprietário, corretor ou imobiliária"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Telefone
                </span>

                <input
                  name="contactPhone"
                  type="text"
                  placeholder="(12) 99999-9999"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  E-mail
                </span>

                <input
                  name="contactEmail"
                  type="email"
                  placeholder="contato@email.com"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>
                  Score B&amp;B
                </span>

                <input
                  name="score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 a 100"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>
                  Motivo do score
                </span>

                <textarea
                  name="scoreReason"
                  rows={4}
                  placeholder="Ex.: condomínio estratégico, preço competitivo e boa aderência ao portfólio."
                  className={textareaClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
                <span className={labelClass}>
                  Observações internas
                </span>

                <textarea
                  name="internalNotes"
                  rows={5}
                  placeholder="Informações internas sobre a oportunidade, abordagem ou negociação."
                  className={textareaClass}
                />

                <span className="text-[10px] leading-5 text-zinc-600">
                  Estas informações permanecem somente no CRM e não são
                  exibidas no Portal B&amp;B.
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-end">
            <Link
              href="/admin/captacao-ia"
              className="inline-flex min-h-14 items-center justify-center border border-white/15 px-7 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Salvando..."
                : "Salvar oportunidade"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}