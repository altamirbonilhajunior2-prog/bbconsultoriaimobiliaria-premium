"use client";

import Image from "next/image";
import Link from "next/link";
import TrackedWhatsAppLink from "./TrackedWhatsAppLink";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  HomeSearchState,
} from "./HomeSearchExperience";

type HeroProps = {
  searchState?: HomeSearchState;
  onSearchStateChange?: (
    nextState: HomeSearchState,
  ) => void;
};

const initialSearchState: HomeSearchState = {
  propertyType: "Todos os tipos",
  location: "São José dos Campos",
  priceRange: "Qualquer valor",
};

const benefits = [
  {
    number: "01",
    title: "Atendimento personalizado",
    description: "Foco total nas suas necessidades",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-8 w-8"
      >
        <path
          d="M12 3 4.5 6v5.5c0 4.8 3.1 8 7.5 9.5 4.4-1.5 7.5-4.7 7.5-9.5V6L12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Imóveis selecionados",
    description: "Curadoria criteriosa e exclusiva",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-8 w-8"
      >
        <path
          d="M3 8h18M6 3h12l3 5-9 13L3 8l3-5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m8 8 4 13 4-13M8 8l4-5 4 5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Decisões seguras",
    description: "Análise técnica e estratégica",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-8 w-8"
      >
        <path
          d="M4 20h4v-7H4v7Zm6 0h4V8h-4v12Zm6 0h4V3h-4v17Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Conhecimento local",
    description: "Especialistas em São José dos Campos e região",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-8 w-8"
      >
        <path
          d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="10"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export default function Hero({
  searchState,
  onSearchStateChange,
}: HeroProps) {
  const router = useRouter();

  const [
    localSearchState,
    setLocalSearchState,
  ] = useState<HomeSearchState>(
    initialSearchState,
  );

  const activeSearchState =
    searchState ?? localSearchState;

  const {
    propertyType,
    location,
    priceRange,
  } = activeSearchState;

  function updateSearchState(
    partialState: Partial<HomeSearchState>,
  ) {
    const nextState: HomeSearchState = {
      ...activeSearchState,
      ...partialState,
    };

    if (onSearchStateChange) {
      onSearchStateChange(nextState);
      return;
    }

    setLocalSearchState(nextState);
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const params =
      new URLSearchParams();

    params.set(
      "finalidade",
      "Venda",
    );

    params.set(
      "estado",
      "SP",
    );

    params.set(
      "cidade",
      "São José dos Campos",
    );

    if (
      propertyType ===
      "Cobertura"
    ) {
      params.set(
        "tipo",
        "Apartamento",
      );

      params.set(
        "categoria",
        "Cobertura",
      );
    } else if (
      propertyType === "Chácara" ||
      propertyType === "Fazenda" ||
      propertyType === "Sítio" ||
      propertyType === "Área Rural"
    ) {
      params.set(
        "tipo",
        "Rural",
      );

      params.set(
        "categoria",
        propertyType,
      );
    } else if (
      propertyType !==
      "Todos os tipos"
    ) {
      params.set(
        "tipo",
        propertyType,
      );
    }

    if (
      location !==
      "São José dos Campos"
    ) {
      params.set(
        "bairro",
        location,
      );
    }

    if (
      priceRange !==
      "Qualquer valor"
    ) {
      params.set(
        "valor",
        priceRange,
      );
    }

    router.push(
      `/comprar?${params.toString()}`,
    );
  }

  return (
    <section className="relative overflow-hidden bg-black">
      <Image
        src="/hero-clean.png"
        alt="Imóveis de alto padrão em São José dos Campos e região"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.65)_38%,rgba(0,0,0,0.08)_75%)]" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />

      <div className="relative z-10">
        <div className="mx-auto flex min-h-[540px] max-w-[1720px] flex-col justify-center px-5 py-12 sm:min-h-[580px] sm:px-6 sm:py-14 lg:min-h-[600px] lg:px-10 lg:py-14 xl:px-12">
          <div className="max-w-[650px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400 sm:text-xs">
              Conexões que constroem patrimônio.
            </p>

            <h1 className="mt-4 font-serif text-[36px] font-normal leading-[1.02] tracking-[-0.03em] text-white sm:mt-5 sm:text-[50px] sm:leading-[0.98] lg:text-[68px]">
              Imóveis em São José dos Campos e região.

              <span className="mt-2 block text-[#d5a85a]">
                Estratégia para
                <br />
                grandes decisões.
              </span>
            </h1>

            <p className="mt-5 max-w-[560px] text-sm leading-7 text-zinc-200 sm:mt-6 sm:text-lg sm:leading-8">
              Curadoria imobiliária, conhecimento de mercado e atendimento
              consultivo para comprar, vender ou alugar imóveis em São José dos
              Campos e região com mais segurança.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:gap-5">
              <Link
                href="/comprar"
                className="inline-flex min-h-[62px] min-w-[220px] items-center justify-center gap-3 rounded-sm bg-[#ddb461] px-10 text-[13px] font-bold uppercase tracking-[0.14em] text-black shadow-[0_14px_38px_rgba(221,180,97,0.32)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#edc876] hover:shadow-[0_18px_46px_rgba(221,180,97,0.4)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                Buscar imóveis
              </Link>

              <TrackedWhatsAppLink
                href="https://wa.me/5512978140636?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20B%26B%20Consultoria%20Imobili%C3%A1ria."
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[62px] min-w-[240px] items-center justify-center gap-3 rounded-sm border-2 border-[#d5a85a] bg-[#d5a85a]/15 px-10 text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_38px_rgba(213,168,90,0.18)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#d5a85a] hover:text-black hover:shadow-[0_18px_46px_rgba(213,168,90,0.3)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M9 8.5c.5 2.8 2.7 5 5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                Falar no WhatsApp
              </TrackedWhatsAppLink>
            </div>
          </div>
        </div>

        <div className="pb-8">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <div className="rounded-lg border border-[#d5a85a]/45 bg-[#080808]/95 p-3.5 shadow-[0_22px_60px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-4">
              <div className="grid grid-cols-3 border-b border-white/10">
                <Link
                  href="/comprar"
                  className="flex min-h-10 items-center justify-center border-b-2 border-[#d5a85a] px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition hover:text-[#d5a85a] sm:min-h-11 sm:text-[11px]"
                >
                  Comprar
                </Link>

                <Link
                  href="/alugar"
                  className="flex min-h-10 items-center justify-center border-b-2 border-transparent px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-[#d5a85a] hover:text-[#d5a85a] sm:min-h-11 sm:text-[11px]"
                >
                  Alugar
                </Link>

                <Link
                  href="/lancamentos"
                  className="flex min-h-10 items-center justify-center border-b-2 border-transparent px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-[#d5a85a] hover:text-[#d5a85a] sm:min-h-11 sm:text-[11px]"
                >
                  Lançamentos
                </Link>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[0.95fr_1.1fr_0.95fr_150px]"
              >
                <label className="border border-white/10 bg-white/[0.035] px-3.5 py-2">
                  <span className="block text-[8px] uppercase tracking-[0.12em] text-zinc-500">
                    Tipo de imóvel
                  </span>

                  <select
                    value={propertyType}
                    onChange={(event) =>
                      updateSearchState({
                        propertyType:
                          event.target
                            .value as HomeSearchState["propertyType"],
                      })
                    }
                    className="mt-0.5 h-6 w-full bg-transparent text-[13px] text-zinc-300 outline-none"
                  >
                    <option
                      value="Todos os tipos"
                      className="bg-zinc-950"
                    >
                      Todos os tipos
                    </option>

                    <option
                      value="Casa"
                      className="bg-zinc-950"
                    >
                      Casa
                    </option>

                    <option
                      value="Apartamento"
                      className="bg-zinc-950"
                    >
                      Apartamento
                    </option>

                    <option
                      value="Cobertura"
                      className="bg-zinc-950"
                    >
                      Cobertura
                    </option>

                    <option
                      value="Terreno"
                      className="bg-zinc-950"
                    >
                      Terreno
                    </option>

                    <option
                      value="Comercial"
                      className="bg-zinc-950"
                    >
                      Comercial
                    </option>

                    <option value="Chácara" className="bg-zinc-950">
                      Chácara
                    </option>

                    <option value="Fazenda" className="bg-zinc-950">
                      Fazenda
                    </option>

                    <option value="Sítio" className="bg-zinc-950">
                      Sítio
                    </option>

                    <option value="Área Rural" className="bg-zinc-950">
                      Área Rural
                    </option>
                  </select>
                </label>

                <label className="border border-white/10 bg-white/[0.035] px-3.5 py-2">
                  <span className="block text-[8px] uppercase tracking-[0.12em] text-zinc-500">
                    Cidade ou bairro
                  </span>

                  <select
                    value={location}
                    onChange={(event) =>
                      updateSearchState({
                        location:
                          event.target
                            .value as HomeSearchState["location"],
                      })
                    }
                    className="mt-0.5 h-6 w-full bg-transparent text-[13px] text-zinc-300 outline-none"
                  >
                    <option
                      value="São José dos Campos"
                      className="bg-zinc-950"
                    >
                      São José dos Campos
                    </option>

                    <option
                      value="Urbanova"
                      className="bg-zinc-950"
                    >
                      Urbanova
                    </option>

                    <option
                      value="Jardim Aquarius"
                      className="bg-zinc-950"
                    >
                      Jardim Aquarius
                    </option>

                    <option
                      value="Colinas"
                      className="bg-zinc-950"
                    >
                      Colinas
                    </option>

                    <option
                      value="Altos do Esplanada"
                      className="bg-zinc-950"
                    >
                      Altos do Esplanada
                    </option>
                  </select>
                </label>

                <label className="border border-white/10 bg-white/[0.035] px-3.5 py-2">
                  <span className="block text-[8px] uppercase tracking-[0.12em] text-zinc-500">
                    Faixa de preço
                  </span>

                  <select
                    value={priceRange}
                    onChange={(event) =>
                      updateSearchState({
                        priceRange:
                          event.target
                            .value as HomeSearchState["priceRange"],
                      })
                    }
                    className="mt-0.5 h-6 w-full bg-transparent text-[13px] text-zinc-300 outline-none"
                  >
                    <option
                      value="Qualquer valor"
                      className="bg-zinc-950"
                    >
                      Qualquer valor
                    </option>

                    <option
                      value="Até R$ 1 milhão"
                      className="bg-zinc-950"
                    >
                      Até R$ 1 milhão
                    </option>

                    <option
                      value="Até R$ 2 milhões"
                      className="bg-zinc-950"
                    >
                      Até R$ 2 milhões
                    </option>

                    <option
                      value="Até R$ 3 milhões"
                      className="bg-zinc-950"
                    >
                      Até R$ 3 milhões
                    </option>

                    <option
                      value="Acima de R$ 3 milhões"
                      className="bg-zinc-950"
                    >
                      Acima de R$ 3 milhões
                    </option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-[#ddb461] px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-black shadow-[0_10px_26px_rgba(221,180,97,0.22)] transition duration-200 hover:bg-[#edc876] hover:shadow-[0_12px_30px_rgba(221,180,97,0.3)]"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/90">
          <div className="mx-auto grid max-w-[1720px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-10 xl:px-12">
            {benefits.map(
              (benefit, index) => (
                <article
                  key={benefit.title}
                  className={`flex min-h-[88px] items-center gap-3 py-4 sm:min-h-[104px] sm:gap-5 sm:py-5 ${
                    index <
                    benefits.length - 1
                      ? "lg:border-r lg:border-white/10"
                      : ""
                  } ${
                    index % 2 === 0
                      ? "pr-4"
                      : "pl-4"
                  } lg:px-8`}
                >
                  <span className="shrink-0 text-[#d5a85a]">
                    {benefit.icon}
                  </span>

                  <div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200">
                      {benefit.title}
                    </h2>

                    <p className="mt-2 text-xs text-zinc-400">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
