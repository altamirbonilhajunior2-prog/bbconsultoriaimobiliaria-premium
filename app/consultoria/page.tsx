import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";

const steps = [
  {
    number: "01",
    title: "Entendimento do perfil",
    text: "Nós identificamos seu objetivo, momento de vida, prioridades, prazo e capacidade de investimento.",
  },
  {
    number: "02",
    title: "Análise de localização",
    text: "Avaliamos bairro, rua, entorno, mobilidade, ruído, posição solar e dinâmica da região.",
  },
  {
    number: "03",
    title: "Curadoria de imóveis",
    text: "Selecionamos apenas oportunidades coerentes com seu perfil, evitando visitas improdutivas.",
  },
  {
    number: "04",
    title: "Análise patrimonial",
    text: "Consideramos liquidez, valorização, custos futuros e facilidade de revenda.",
  },
  {
    number: "05",
    title: "Comparação estratégica",
    text: "Apresentamos vantagens, limitações e contrapontos entre as opções analisadas.",
  },
  {
    number: "06",
    title: "Acompanhamento completo",
    text: "Nós orientamos você da seleção inicial até a negociação e conclusão da compra.",
  },
];

const analysisItems = [
  "Localização e entorno",
  "Posição solar e conforto",
  "Ruído, mobilidade e vizinhança",
  "Liquidez e potencial de revenda",
  "Custos futuros e manutenção",
  "Adequação ao objetivo patrimonial",
];

export const metadata = {
  title: "Consultoria | B&B Consultoria Imobiliária",
  description:
    "Conheça a metodologia de consultoria imobiliária da B&B em São José dos Campos.",
};

export default function ConsultoriaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="relative min-h-[540px] overflow-hidden border-b border-amber-500/25">
        <Image
          src="/hero-clean.png"
          alt="Residência contemporânea de alto padrão"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.76)_48%,rgba(0,0,0,0.16)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-[1720px] items-center px-6 py-14 lg:px-10 xl:px-12">
          <div className="max-w-[760px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Consultoria B&B
            </p>

            <h1 className="mt-5 font-serif text-[40px] font-normal leading-[1.04] tracking-[-0.03em] sm:text-[50px] lg:text-[58px]">
              Estratégia e análise antes de cada decisão imobiliária.
            </h1>

            <p className="mt-5 max-w-[650px] text-base leading-8 text-zinc-200 sm:text-lg">
              Nós analisamos localização, liquidez, valorização, custos futuros
              e adequação ao seu objetivo antes de apresentar cada oportunidade.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20conhecer%20a%20consultoria%20da%20B%26B."
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
              >
                Falar com a B&B
              </a>

              <Link
                href="/comprar"
                className="inline-flex min-h-14 items-center justify-center border border-amber-500 bg-black/30 px-8 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-amber-500 hover:text-black"
              >
                Conhecer imóveis
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <div className="max-w-[820px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            Nossa metodologia
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal leading-tight md:text-[48px]">
            Como nós conduzimos sua busca
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
            Nosso processo reduz ruído, evita decisões impulsivas e torna a
            comparação entre oportunidades mais clara e objetiva.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group min-h-[245px] border border-white/10 bg-[#0a0a0a] p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-500/55"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.16em] text-amber-400">
                  {step.number}
                </span>

                <span className="h-px w-12 bg-amber-500/50 transition-all duration-300 group-hover:w-20" />
              </div>

              <h3 className="mt-6 font-serif text-[25px] font-normal leading-tight text-white">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto grid max-w-[1720px] gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 xl:px-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Nossa diferença
            </p>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-normal leading-tight md:text-[46px]">
              Nós mostramos também quando um imóvel não é uma boa escolha.
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
              Transparência faz parte da nossa consultoria. Avaliamos fatores
              que podem comprometer conforto, liquidez, manutenção e revenda
              antes de qualquer recomendação.
            </p>
          </div>

          <div className="border border-amber-500/35 bg-black/40 p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              O que nós analisamos
            </p>

            <div className="mt-6 space-y-4">
              {analysisItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-500 text-xs text-amber-400">
                    ✓
                  </span>

                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-amber-500/25 bg-black">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-8 px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Sua próxima decisão
            </p>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-normal leading-tight">
              Encontre um imóvel coerente com seu momento e seu patrimônio.
            </h2>
          </div>

          <a
            href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20iniciar%20uma%20consultoria%20imobiliária."
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 shrink-0 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
          >
            Iniciar atendimento
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}