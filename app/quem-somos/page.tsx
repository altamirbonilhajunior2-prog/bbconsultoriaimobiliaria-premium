import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata = {
  title: "Quem Somos | B&B Consultoria Imobiliária",
  description:
    "Conheça a história, a missão, a visão e os valores da B&B Consultoria Imobiliária, especializada em decisões patrimoniais em São José dos Campos.",
};

const values = [
  {
    title: "Ética",
    description:
      "Agimos com honestidade, respeito e responsabilidade em todas as relações.",
  },
  {
    title: "Integridade",
    description:
      "Mantemos coerência entre aquilo que acreditamos, recomendamos e praticamos.",
  },
  {
    title: "Transparência",
    description:
      "Apresentamos informações claras para decisões conscientes e bem fundamentadas.",
  },
  {
    title: "Conhecimento",
    description:
      "Buscamos atualização contínua para oferecer análises relevantes e consistentes.",
  },
  {
    title: "Independência",
    description:
      "Recomendamos aquilo que realmente faz sentido para o perfil e os objetivos do cliente.",
  },
  {
    title: "Compromisso",
    description:
      "Atuamos com dedicação e responsabilidade em todas as etapas do processo imobiliário.",
  },
  {
    title: "Relacionamento",
    description:
      "Valorizamos vínculos duradouros, construídos com confiança, respeito e proximidade.",
  },
  {
    title: "Visão de longo prazo",
    description:
      "Entendemos o imóvel como patrimônio, qualidade de vida e parte de um projeto de futuro.",
  },
];

const differentials = [
  {
    title: "Vivência em São José dos Campos",
    description:
      "Mais de 30 anos acompanhando o desenvolvimento da cidade, seus bairros e o mercado imobiliário local.",
  },
  {
    title: "Conhecimento do Urbanova",
    description:
      "Mais de 26 anos de vivência como morador, acompanhando de perto a evolução, expansão e valorização da região.",
  },
  {
    title: "Atendimento verdadeiramente consultivo",
    description:
      "Cada recomendação considera o perfil, o momento, os objetivos e a estratégia patrimonial do cliente.",
  },
  {
    title: "Análise além do imóvel",
    description:
      "Avaliamos localização, liquidez, valorização, custos futuros, entorno, mobilidade e adequação ao objetivo.",
  },
];

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header hideScheduleButton />

      <section className="relative min-h-[570px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="Residência contemporânea representando o padrão de atuação da B&B Consultoria Imobiliária"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[570px] max-w-[1720px] items-center px-6 py-20 lg:px-10 xl:px-12">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Quem somos
            </p>

            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-normal leading-[1.04] sm:text-6xl lg:text-7xl">
              Mais do que intermediar negócios. Nós orientamos decisões
              patrimoniais.
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              Unimos vivência em São José dos Campos, conhecimento de mercado e
              atuação consultiva para ajudar nossos clientes a tomar decisões
              imobiliárias mais seguras, conscientes e alinhadas ao futuro.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.38fr_1fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Nossa história
            </p>

            <h2 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
              Experiência que se transforma em orientação.
            </h2>
          </div>

          <div className="space-y-7 text-base leading-8 text-zinc-400">
            <p>
              A B&amp;B Consultoria Imobiliária nasceu da convicção de que uma
              decisão imobiliária representa muito mais do que a aquisição de
              um imóvel. Trata-se de uma decisão patrimonial que exige
              conhecimento, análise criteriosa e uma compreensão profunda do
              mercado, da cidade e da região onde se pretende viver ou investir.
            </p>

            <p>
              Essa filosofia foi construída ao longo de mais de três décadas de
              vivência em São José dos Campos, acompanhando de perto a evolução
              da cidade, a transformação de seus principais bairros e o
              desenvolvimento do mercado imobiliário local.
            </p>

            <p>
              No Urbanova, essa experiência se estende por mais de 26 anos como
              morador, acompanhando sua trajetória desde os primeiros
              empreendimentos até sua consolidação como uma das regiões
              residenciais mais valorizadas, completas e desejadas do Vale do
              Paraíba.
            </p>

            <p>
              Ao longo desse período, testemunhamos a implantação de novos
              condomínios, a expansão da infraestrutura urbana, o crescimento
              de instituições de ensino, centros comerciais, serviços e áreas
              de lazer, além da constante valorização imobiliária da região.
              Mais do que observar essas transformações, vivenciamos cada etapa
              desse desenvolvimento.
            </p>

            <p>
              Essa experiência permite que nossa análise vá muito além das
              características físicas de um imóvel. Avaliamos também seu
              contexto urbano, potencial de valorização, liquidez, custos de
              manutenção, evolução da região e, principalmente, sua adequação
              aos objetivos e ao momento de vida de cada cliente.
            </p>

            <p className="border-l-2 border-amber-500 pl-6 font-serif text-2xl leading-9 text-white">
              A B&amp;B nasceu da união entre experiência de vida, conhecimento
              do mercado imobiliário e a convicção de que toda decisão
              patrimonial merece uma orientação técnica, ética e verdadeiramente
              personalizada.
            </p>

            <p>
              Nós acreditamos que uma consultoria de excelência não consiste em
              apresentar o maior número de imóveis, mas em recomendar aqueles
              que realmente fazem sentido para o perfil, o momento e os
              objetivos de cada cliente. Essa responsabilidade exige
              independência, critério técnico e, acima de tudo, ética
              profissional.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <article className="border border-amber-500/25 bg-black/30 p-8 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
              Nossa missão
            </p>

            <h2 className="mt-5 font-serif text-4xl font-normal">
              Orientar decisões com segurança.
            </h2>

            <p className="mt-6 text-base leading-8 text-zinc-400">
              Oferecer uma consultoria imobiliária pautada pela análise técnica,
              ética, transparência e conhecimento de mercado, orientando nossos
              clientes na tomada de decisões patrimoniais seguras, conscientes e
              alinhadas aos seus objetivos de vida e investimento.
            </p>
          </article>

          <article className="border border-white/10 bg-black/30 p-8 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
              Nossa visão
            </p>

            <h2 className="mt-5 font-serif text-4xl font-normal">
              Ser referência pela confiança.
            </h2>

            <p className="mt-6 text-base leading-8 text-zinc-400">
              Ser reconhecida como uma consultoria imobiliária de referência em
              São José dos Campos pela excelência no atendimento, profundidade
              das análises e confiança construída em cada relacionamento,
              tornando-nos uma escolha segura para decisões imobiliárias
              relevantes.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Nossos valores
          </p>

          <h2 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
            Grandes decisões exigem princípios sólidos.
          </h2>

          <p className="mt-6 text-base leading-8 text-zinc-400">
            Nossos valores orientam cada atendimento, análise e recomendação.
            Eles representam a forma como construímos relações e conduzimos
            decisões patrimoniais.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <article
              key={value.title}
              className="min-h-[230px] border border-white/10 bg-[#0a0a0a] p-7 transition duration-300 hover:border-amber-500/50 hover:bg-[#0d0d0d]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-7 font-serif text-2xl font-normal text-white">
                {value.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-zinc-500">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Por que escolher a B&amp;B
            </p>

            <h2 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
              Conhecimento local com visão patrimonial.
            </h2>

            <p className="mt-6 text-base leading-8 text-zinc-400">
              Nossa atuação combina experiência prática, análise imobiliária e
              atenção individual para compreender não apenas qual imóvel o
              cliente procura, mas qual decisão realmente faz sentido.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {differentials.map((differential) => (
              <article
                key={differential.title}
                className="border border-white/10 bg-black/30 p-7"
              >
                <h3 className="font-serif text-2xl font-normal leading-tight">
                  {differential.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  {differential.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-20 text-center lg:px-10 lg:py-28">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
          Nosso compromisso
        </p>

        <h2 className="mx-auto mt-6 max-w-5xl font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
          Nós recomendamos apenas aquilo que realmente faz sentido para você.
        </h2>

        <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-zinc-400 sm:text-lg">
          Preferimos não concluir uma negociação a recomendar um imóvel que não
          esteja alinhado ao seu perfil, ao seu momento e aos seus objetivos.
          Esse é o compromisso que orienta a atuação da B&amp;B Consultoria
          Imobiliária.
        </p>

        <div className="mx-auto mt-12 max-w-4xl border border-amber-500/25 bg-[#0a0a0a] px-7 py-10 sm:px-12">
          <h3 className="font-serif text-3xl font-normal sm:text-4xl">
            Vamos compreender seus objetivos?
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
            Será um prazer conhecer o seu momento e ajudá-lo a avaliar as opções
            mais adequadas para morar, investir ou construir patrimônio.
          </p>

          <Link
            href="/agendar-visita"
            className="mt-8 inline-flex min-h-16 items-center justify-center bg-amber-500 px-9 text-center text-xs font-bold uppercase tracking-[0.17em] text-black transition hover:bg-amber-400"
          >
            Iniciar atendimento
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}