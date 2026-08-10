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
    eyebrow: "Urbanova | São José dos Campos",
    title: "Urbanova",
    intro:
      "Uma das regiões mais consolidadas de São José dos Campos para quem busca qualidade de vida, condomínios fechados e imóveis de médio e alto padrão.",
    paragraphs: [
      "O Urbanova combina perfil residencial, áreas verdes, infraestrutura e acesso a serviços que fazem parte da rotina das famílias que escolheram a região para morar.",
      "A expansão dos condomínios ao longo dos anos consolidou diferentes perfis de imóveis e faixas de valor. Por isso, a escolha exige análise do condomínio, localização interna, mobilidade, padrão construtivo e potencial de revenda.",
      "Na B&B, nossa atuação no Urbanova parte de uma leitura consultiva: buscamos entender o momento do cliente e comparar as opções de maneira racional antes da decisão.",
    ],
    highlights: [
      "Condomínios fechados e segurança",
      "Áreas verdes e perfil residencial",
      "Imóveis de médio e alto padrão",
      "Estrutura de comércio, escolas e serviços",
      "Diferentes perfis de condomínios",
      "Mercado relevante para moradia e valorização patrimonial",
    ],
  },
  "jardim-aquarius": {
    eyebrow: "Jardim Aquarius | São José dos Campos",
    title: "Jardim Aquarius",
    intro:
      "Uma região urbana consolidada, com forte presença de edifícios residenciais, serviços, gastronomia e mobilidade.",
    paragraphs: [
      "O Jardim Aquarius oferece uma rotina marcada pela proximidade entre moradia, comércio e serviços.",
      "A diversidade de edifícios exige comparação entre idade, padrão construtivo, lazer, posição da unidade, vagas e liquidez.",
      "Nossa curadoria busca separar atributos estéticos de fatores que realmente influenciam uso, valor e revenda.",
    ],
    highlights: [
      "Localização consolidada",
      "Comércio e serviços",
      "Perfil predominantemente vertical",
      "Gastronomia e conveniência",
      "Boa mobilidade urbana",
      "Oferta diversificada de apartamentos",
    ],
  },
  colinas: {
    eyebrow: "Colinas | São José dos Campos",
    title: "Colinas",
    intro:
      "Uma região tradicional de São José dos Campos, reconhecida pela localização e proximidade a importantes serviços da cidade.",
    paragraphs: [
      "A região dos Colinas reúne conveniência, acesso e diferentes perfis residenciais.",
      "Na escolha de um imóvel, avaliamos entorno, mobilidade, ruído, posição e características específicas de cada empreendimento.",
      "Esse conjunto de fatores ajuda a entender não apenas como é morar no local, mas também a perspectiva patrimonial da aquisição.",
    ],
    highlights: [
      "Região tradicional",
      "Localização estratégica",
      "Serviços consolidados",
      "Mobilidade",
      "Perfil residencial valorizado",
      "Diversidade imobiliária",
    ],
  },
  "altos-do-esplanada": {
    eyebrow: "Altos do Esplanada | São José dos Campos",
    title: "Altos do Esplanada",
    intro:
      "Uma região associada a exclusividade, tranquilidade e imóveis voltados ao segmento de maior padrão.",
    paragraphs: [
      "O Altos do Esplanada apresenta perfil residencial diferenciado e acesso a importantes eixos da cidade.",
      "Imóveis nessa região devem ser avaliados considerando padrão arquitetônico, privacidade, localização, entorno e liquidez.",
      "Nossa análise busca relacionar esses atributos ao objetivo do comprador, seja para moradia ou posicionamento patrimonial.",
    ],
    highlights: [
      "Perfil residencial premium",
      "Tranquilidade",
      "Privacidade",
      "Boa localização",
      "Imóveis de alto padrão",
      "Análise patrimonial relevante",
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
            Conheça a região
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Uma escolha que vai além do imóvel.
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
              Ver imóveis à venda
            </Link>

            <Link
              href={`/alugar?bairro=${encodedName}`}
              className="inline-flex min-h-14 items-center justify-center border border-[#D5A85A] px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D5A85A] transition hover:bg-[#D5A85A] hover:text-black"
            >
              Ver imóveis para locação
            </Link>
          </div>
        </div>

        <aside className="border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Características
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
              Avalie a região antes de decidir.
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
