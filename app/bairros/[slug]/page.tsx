import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { neighborhoods } from "../../data/neighborhoods";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type NeighborhoodDetail = {
  eyebrow: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  paragraphs: string[];
  highlights: string[];
};

const details: Record<string, NeighborhoodDetail> = {
  urbanova: {
    eyebrow: "Urbanova | São José dos Campos",
    title: "Imóveis no Urbanova em São José dos Campos",
    seoTitle: "Imóveis no Urbanova em São José dos Campos",
    seoDescription:
      "Casas, apartamentos e imóveis à venda e para locação no Urbanova, em São José dos Campos. Conheça a região e encontre oportunidades selecionadas pela B&B.",
    intro:
      "Casas, apartamentos e imóveis em condomínios em uma das regiões mais procuradas de São José dos Campos para quem busca qualidade de vida, segurança e imóveis de médio e alto padrão.",
    paragraphs: [
      "O Urbanova é uma das regiões residenciais mais consolidadas de São José dos Campos, com forte presença de condomínios fechados, áreas verdes, escolas, comércio e serviços que fazem parte da rotina das famílias que escolheram o bairro para morar.",
      "A variedade de condomínios e empreendimentos cria diferentes perfis de casas e apartamentos à venda e para locação no Urbanova. Por isso, a análise deve considerar localização interna, padrão construtivo, posição do imóvel, infraestrutura do condomínio, mobilidade e perspectiva de valorização.",
      "Na B&B, a busca por imóveis no Urbanova parte de uma análise consultiva. Comparamos as opções disponíveis de acordo com o objetivo, orçamento e momento de cada cliente, evitando que a decisão seja baseada apenas em aparência ou preço anunciado.",
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
    title: "Imóveis no Jardim Aquarius em São José dos Campos",
    seoTitle: "Imóveis no Jardim Aquarius em São José dos Campos",
    seoDescription:
      "Apartamentos e imóveis à venda e para locação no Jardim Aquarius, em São José dos Campos. Conheça o bairro e veja oportunidades selecionadas pela B&B.",
    intro:
      "Uma das regiões urbanas mais valorizadas de São José dos Campos, com forte presença de edifícios residenciais, comércio, serviços, gastronomia e excelente conveniência.",
    paragraphs: [
      "O Jardim Aquarius oferece uma rotina marcada pela proximidade entre moradia, comércio, serviços, restaurantes e importantes vias de acesso de São José dos Campos.",
      "A oferta de apartamentos no Jardim Aquarius é diversificada, com edifícios de diferentes idades, padrões construtivos e estruturas de lazer. A escolha exige comparar localização dentro do bairro, posição da unidade, vista, vagas, condomínio, padrão do edifício e liquidez.",
      "Na B&B, analisamos os imóveis à venda e para locação no Jardim Aquarius considerando não apenas atributos estéticos, mas também os fatores que influenciam conforto, valor de mercado e potencial de revenda.",
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
    title: "Imóveis no Colinas em São José dos Campos",
    seoTitle: "Imóveis no Colinas em São José dos Campos",
    seoDescription:
      "Imóveis à venda e para locação na região do Colinas, em São José dos Campos. Conheça a localização e oportunidades selecionadas pela B&B.",
    intro:
      "Uma região tradicional e valorizada de São José dos Campos, reconhecida pela localização estratégica, perfil residencial e proximidade a importantes serviços da cidade.",
    paragraphs: [
      "A região do Colinas reúne conveniência, boa mobilidade e diferentes perfis de imóveis residenciais em uma localização consolidada de São José dos Campos.",
      "Na escolha de um imóvel na região, é importante avaliar entorno, posição, mobilidade, ruído, padrão construtivo e características específicas de cada empreendimento.",
      "A análise desses fatores permite entender não apenas a experiência de morar no local, mas também aspectos relacionados à liquidez, valor de mercado e perspectiva patrimonial do imóvel.",
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
    title: "Imóveis no Altos do Esplanada em São José dos Campos",
    seoTitle: "Imóveis no Altos do Esplanada em São José dos Campos",
    seoDescription:
      "Imóveis de alto padrão à venda e para locação no Altos do Esplanada, em São José dos Campos. Conheça a região e a curadoria imobiliária da B&B.",
    intro:
      "Uma região residencial de São José dos Campos associada a exclusividade, tranquilidade, privacidade e imóveis voltados ao segmento de maior padrão.",
    paragraphs: [
      "O Altos do Esplanada apresenta perfil residencial diferenciado, localização estratégica e acesso a importantes regiões e serviços de São José dos Campos.",
      "Os imóveis no Altos do Esplanada devem ser analisados considerando arquitetura, padrão construtivo, privacidade, posição, entorno, conservação e liquidez.",
      "Na B&B, relacionamos esses atributos ao objetivo do comprador ou locatário para identificar oportunidades coerentes tanto para moradia quanto para posicionamento patrimonial.",
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const neighborhood = neighborhoods.find(
    (item) => item.slug === slug,
  );

  const detail = details[slug];

  if (!neighborhood || !detail) {
    notFound();
  }

  return {
    title: detail.seoTitle,

    description: detail.seoDescription,

    alternates: {
      canonical: `/bairros/${slug}`,
    },

    openGraph: {
      type: "website",
      title: detail.seoTitle,
      description: detail.seoDescription,
      url: `/bairros/${slug}`,
    },
  };
}

export default async function NeighborhoodPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const neighborhood = neighborhoods.find(
    (item) => item.slug === slug,
  );

  const detail = details[slug];

  if (!neighborhood || !detail) {
    notFound();
  }

  const encodedName = encodeURIComponent(
    neighborhood.name,
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative min-h-[500px] overflow-hidden lg:min-h-[580px]">
        <Image
          src={neighborhood.image}
          alt={`${neighborhood.name}, São José dos Campos`}
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

            <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
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
              <p key={paragraph}>
                {paragraph}
              </p>
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
              Consultoria B&amp;B
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