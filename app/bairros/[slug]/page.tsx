import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { neighborhoods } from "../../data/neighborhoods";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const details: Record<string, {
  eyebrow: string;
  title: string;
  intro: string;
  paragraphs: string[];
  highlights: string[];
}> = {
  urbanova: {
    eyebrow: "Urbanova | S\u00E3o Jos\u00E9 dos Campos",
    title: "Urbanova",
    intro:
      "Uma das regi\u00F5es mais consolidadas de S\u00E3o Jos\u00E9 dos Campos para quem busca qualidade de vida, condom\u00EDnios fechados e im\u00F3veis de m\u00E9dio e alto padr\u00E3o.",
    paragraphs: [
      "O Urbanova combina perfil residencial, \u00E1reas verdes, infraestrutura e acesso a servi\u00E7os que fazem parte da rotina das fam\u00EDlias que escolheram a regi\u00E3o para morar.",
      "A expans\u00E3o dos condom\u00EDnios ao longo dos anos consolidou diferentes perfis de im\u00F3veis e faixas de valor. Por isso, a escolha exige an\u00E1lise do condom\u00EDnio, localiza\u00E7\u00E3o interna, mobilidade, padr\u00E3o construtivo e potencial de revenda.",
      "Na B&B, nossa atua\u00E7\u00E3o no Urbanova parte de uma leitura consultiva: buscamos entender o momento do cliente e comparar as op\u00E7\u00F5es de maneira racional antes da decis\u00E3o.",
    ],
    highlights: [
      "Condom\u00EDnios fechados e seguran\u00E7a",
      "\u00C1reas verdes e perfil residencial",
      "Im\u00F3veis de m\u00E9dio e alto padr\u00E3o",
      "Estrutura de com\u00E9rcio, escolas e servi\u00E7os",
      "Diferentes perfis de condom\u00EDnios",
      "Mercado relevante para moradia e valoriza\u00E7\u00E3o patrimonial",
    ],
  },
  "jardim-aquarius": {
    eyebrow: "Jardim Aquarius | S\u00E3o Jos\u00E9 dos Campos",
    title: "Jardim Aquarius",
    intro:
      "Uma regi\u00E3o urbana consolidada, com forte presen\u00E7a de edif\u00EDcios residenciais, servi\u00E7os, gastronomia e mobilidade.",
    paragraphs: [
      "O Jardim Aquarius oferece uma rotina marcada pela proximidade entre moradia, com\u00E9rcio e servi\u00E7os.",
      "A diversidade de edif\u00EDcios exige compara\u00E7\u00E3o entre idade, padr\u00E3o construtivo, lazer, posi\u00E7\u00E3o da unidade, vagas e liquidez.",
      "Nossa curadoria busca separar atributos est\u00E9ticos de fatores que realmente influenciam uso, valor e revenda.",
    ],
    highlights: [
      "Localiza\u00E7\u00E3o consolidada",
      "Com\u00E9rcio e servi\u00E7os",
      "Perfil predominantemente vertical",
      "Gastronomia e conveni\u00EAncia",
      "Boa mobilidade urbana",
      "Oferta diversificada de apartamentos",
    ],
  },
  colinas: {
    eyebrow: "Colinas | S\u00E3o Jos\u00E9 dos Campos",
    title: "Colinas",
    intro:
      "Uma regi\u00E3o tradicional de S\u00E3o Jos\u00E9 dos Campos, reconhecida pela localiza\u00E7\u00E3o e proximidade a importantes servi\u00E7os da cidade.",
    paragraphs: [
      "A regi\u00E3o dos Colinas re\u00FAne conveni\u00EAncia, acesso e diferentes perfis residenciais.",
      "Na escolha de um im\u00F3vel, avaliamos entorno, mobilidade, ru\u00EDdo, posi\u00E7\u00E3o e caracter\u00EDsticas espec\u00EDficas de cada empreendimento.",
      "Esse conjunto de fatores ajuda a entender n\u00E3o apenas como \u00E9 morar no local, mas tamb\u00E9m a perspectiva patrimonial da aquisi\u00E7\u00E3o.",
    ],
    highlights: [
      "Regi\u00E3o tradicional",
      "Localiza\u00E7\u00E3o estrat\u00E9gica",
      "Servi\u00E7os consolidados",
      "Mobilidade",
      "Perfil residencial valorizado",
      "Diversidade imobili\u00E1ria",
    ],
  },
  "altos-do-esplanada": {
    eyebrow: "Altos do Esplanada | S\u00E3o Jos\u00E9 dos Campos",
    title: "Altos do Esplanada",
    intro:
      "Uma regi\u00E3o associada a exclusividade, tranquilidade e im\u00F3veis voltados ao segmento de maior padr\u00E3o.",
    paragraphs: [
      "O Altos do Esplanada apresenta perfil residencial diferenciado e acesso a importantes eixos da cidade.",
      "Im\u00F3veis nessa regi\u00E3o devem ser avaliados considerando padr\u00E3o arquitet\u00F4nico, privacidade, localiza\u00E7\u00E3o, entorno e liquidez.",
      "Nossa an\u00E1lise busca relacionar esses atributos ao objetivo do comprador, seja para moradia ou posicionamento patrimonial.",
    ],
    highlights: [
      "Perfil residencial premium",
      "Tranquilidade",
      "Privacidade",
      "Boa localiza\u00E7\u00E3o",
      "Im\u00F3veis de alto padr\u00E3o",
      "An\u00E1lise patrimonial relevante",
    ],
  },
};

export function generateStaticParams() {
  return neighborhoods.map((neighborhood) => ({
    slug: neighborhood.slug,
  }));
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const { slug } = await params;

  const neighborhood = neighborhoods.find(
    (item) => item.slug === slug,
  );

  const detail = details[slug];

  if (!neighborhood || !detail) {
    notFound();
  }

  const encodedName = encodeURIComponent(neighborhood.name);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative min-h-[500px] overflow-hidden lg:min-h-[580px]">
        <Image
          src={neighborhood.image}
          alt={neighborhood.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-[1500px] items-end px-5 pb-14 sm:px-6 lg:min-h-[580px] lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400 sm:text-xs">
              {detail.eyebrow}
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              {detail.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-200 sm:text-lg">
              {detail.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-24">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">
            Conhe\u00E7a a regi\u00E3o
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Uma escolha que vai al\u00E9m do im\u00F3vel.
          </h2>

          <div className="mt-8 space-y-6 text-base leading-8 text-zinc-400">
            {detail.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/comprar?bairro=${encodedName}`}
              className="inline-flex min-h-14 items-center justify-center bg-[#D5A85A] px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e3bd77]"
            >
              Ver im\u00F3veis \u00E0 venda
            </Link>

            <Link
              href={`/alugar?bairro=${encodedName}`}
              className="inline-flex min-h-14 items-center justify-center border border-[#D5A85A] px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D5A85A] transition hover:bg-[#D5A85A] hover:text-black"
            >
              Ver im\u00F3veis para loca\u00E7\u00E3o
            </Link>
          </div>
        </div>

        <aside className="border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Caracter\u00EDsticas
          </p>

          <h2 className="mt-4 font-serif text-3xl">
            O que observar
          </h2>

          <div className="mt-7 divide-y divide-white/10">
            {detail.highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 py-4 text-sm leading-6 text-zinc-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D5A85A]" />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-y border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Consultoria B&B
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Avalie a regi\u00E3o antes de decidir.
            </h2>
          </div>

          <Link
            href="/contato"
            className="inline-flex min-h-14 w-fit items-center justify-center border border-[#D5A85A] px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D5A85A] transition hover:bg-[#D5A85A] hover:text-black"
          >
            Solicitar atendimento
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
