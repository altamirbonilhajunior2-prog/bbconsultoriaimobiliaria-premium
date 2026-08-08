import Image from "next/image";
import Link from "next/link";

const benefits = [
  {
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
    title: "Conhecimento local",
    description: "Especialistas em São José dos Campos",
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

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative lg:min-h-[calc(100vh-128px)]">
        <Image
          src="/hero-clean.png"
          alt="Residência contemporânea de alto padrão"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.65)_38%,rgba(0,0,0,0.08)_75%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/15" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1720px] flex-col justify-center px-5 pb-10 pt-10 sm:min-h-[620px] sm:px-6 sm:pb-12 sm:pt-14 lg:min-h-[calc(100vh-128px)] lg:px-10 lg:pb-72 lg:pt-16 xl:px-12">
          <div className="max-w-[650px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400 sm:text-xs">
              Conexões que constroem patrimônio.
            </p>

            <h1 className="mt-4 font-serif text-[36px] font-normal leading-[1.02] tracking-[-0.03em] text-white sm:mt-5 sm:text-[50px] sm:leading-[0.98] lg:text-[68px]">
              Mais que imóveis.
              <span className="mt-2 block text-[#d5a85a]">
                Estratégia para
                <br />
                grandes decisões.
              </span>
            </h1>

            <p className="mt-5 max-w-[560px] text-sm leading-7 text-zinc-200 sm:mt-6 sm:text-lg sm:leading-8">
              Nós unimos conhecimento de mercado, curadoria e experiência para
              conectar você às melhores oportunidades de São José dos Campos e
              região.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <Link
                href="/comprar"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-sm bg-[#ddb461] px-8 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[#edc876]"
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

              <a
                href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20falar%20com%20a%20B%26B%20Consultoria%20Imobiliária."
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-sm border border-[#d5a85a] bg-black/35 px-8 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:bg-[#d5a85a] hover:text-black"
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
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-6 lg:absolute lg:inset-x-0 lg:bottom-[104px] lg:pb-0">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6">
            <div className="rounded-xl border border-[#d5a85a]/45 bg-[#080808]/95 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="grid grid-cols-3 border-b border-white/10">
                <button
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-2 border-b-2 border-[#d5a85a] px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white sm:min-h-14 sm:text-xs sm:tracking-[0.12em]"
                >
                  Comprar
                </button>

                <button
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-2 border-b-2 border-transparent px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-300 transition hover:text-[#d5a85a] sm:min-h-14 sm:text-xs sm:tracking-[0.12em]"
                >
                  Alugar
                </button>

                <button
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-2 border-b-2 border-transparent px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-300 transition hover:text-[#d5a85a] sm:min-h-14 sm:text-xs sm:tracking-[0.12em]"
                >
                  Lançamentos
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:mt-6 lg:grid-cols-[1fr_1.15fr_1fr_180px] lg:gap-4">
                <label className="border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="block text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Tipo de imóvel
                  </span>

                  <select className="mt-1 h-7 w-full bg-transparent text-sm text-zinc-300 outline-none">
                    <option className="bg-zinc-950">Todos os tipos</option>
                    <option className="bg-zinc-950">Casa</option>
                    <option className="bg-zinc-950">Apartamento</option>
                    <option className="bg-zinc-950">Cobertura</option>
                    <option className="bg-zinc-950">Terreno</option>
                  </select>
                </label>

                <label className="border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="block text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Cidade ou bairro
                  </span>

                  <select className="mt-1 h-7 w-full bg-transparent text-sm text-zinc-300 outline-none">
                    <option className="bg-zinc-950">
                      São José dos Campos
                    </option>
                    <option className="bg-zinc-950">Urbanova</option>
                    <option className="bg-zinc-950">Jardim Aquarius</option>
                    <option className="bg-zinc-950">Colinas</option>
                    <option className="bg-zinc-950">
                      Altos do Esplanada
                    </option>
                  </select>
                </label>

                <label className="border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="block text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Faixa de preço
                  </span>

                  <select className="mt-1 h-7 w-full bg-transparent text-sm text-zinc-300 outline-none">
                    <option className="bg-zinc-950">Qualquer valor</option>
                    <option className="bg-zinc-950">Até R$ 1 milhão</option>
                    <option className="bg-zinc-950">Até R$ 2 milhões</option>
                    <option className="bg-zinc-950">Até R$ 3 milhões</option>
                    <option className="bg-zinc-950">
                      Acima de R$ 3 milhões
                    </option>
                  </select>
                </label>

                <Link
                  href="/comprar"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-sm bg-[#ddb461] px-6 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[#edc876]"
                >
                  Buscar
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 border-t border-white/10 bg-black/90 lg:absolute lg:inset-x-0 lg:bottom-0">
          <div className="mx-auto grid max-w-[1720px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-10 xl:px-12">
            {benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className={`flex min-h-[88px] items-center gap-3 py-4 sm:min-h-[104px] sm:gap-5 sm:py-5 ${
                  index < benefits.length - 1
                    ? "lg:border-r lg:border-white/10"
                    : ""
                } ${index % 2 === 0 ? "pr-4" : "pl-4"} lg:px-8`}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}