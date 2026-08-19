import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";

const neighborhoods = [
  {
    title: "Urbanova",
    slug: "urbanova",
    image: "/bairros/urbanova.webp",
    highlight:
      "Natureza, segurança e qualidade de vida em uma das regiões mais valorizadas da cidade.",
    description:
      "Região consolidada de condomínios fechados, áreas verdes e imóveis de médio e alto padrão. O Urbanova oferece supermercados, padarias, farmácias, academias, escolas, restaurantes e serviços, além de espaços para lazer e atividades ao ar livre. É uma das regiões mais procuradas por famílias que valorizam segurança, tranquilidade e qualidade de vida.",
  },
  {
    title: "Jardim Aquarius",
    slug: "jardim-aquarius",
    image: "/bairros/jardim-aquarius.webp",
    highlight:
      "Vida urbana completa, conveniência e excelente mobilidade.",
    description:
      "Bairro completo, com ampla oferta de restaurantes, supermercados, academias, serviços e comércio, além de apartamentos modernos e excelente mobilidade. É uma das regiões mais valorizadas para quem busca praticidade no dia a dia sem abrir mão de conforto e qualidade de vida.",
  },
  {
    title: "Colinas",
    slug: "colinas",
    image: "/bairros/colinas.jpeg",
    highlight:
      "Tradição, sofisticação e localização estratégica.",
    description:
      "Região tradicional e valorizada, próxima a centros comerciais, serviços, escolas, restaurantes e importantes vias da cidade. Reúne imóveis de bom padrão e localização estratégica, atendendo quem busca conveniência e perfil residencial qualificado.",
  },
  {
    title: "Vila Ema",
    slug: "vila-ema",
    image: "/bairros/vila-ema.webp",
    highlight:
      "Gastronomia, charme urbano e praticidade no dia a dia.",
    description:
      "Um dos bairros mais tradicionais e desejados de São José dos Campos, com forte presença de gastronomia, cafés, comércio e serviços. Oferece principalmente apartamentos e boa conexão com regiões centrais, sendo muito procurado por quem valoriza um estilo de vida urbano e funcional.",
  },
  {
    title: "Parque Industrial",
    slug: "parque-industrial",
    image: "/bairros/parque-industrial.jpg",
    highlight:
      "Infraestrutura consolidada, mobilidade e boa relação entre localização e conveniência.",
    description:
      "Região com infraestrutura consolidada, supermercados, comércio, serviços, escolas e acesso facilitado às principais vias da cidade. Possui perfil residencial diversificado e boa oferta de apartamentos e casas, atraindo famílias e compradores em busca de praticidade.",
  },
  {
    title: "Altos do Esplanada",
    slug: "altos-do-esplanada",
    image: "/bairros/altos-do-esplanada.webp",
    highlight:
      "Exclusividade, tranquilidade e imóveis de padrão elevado.",
    description:
      "Região residencial valorizada, tranquila e estratégica, com fácil acesso a comércio, serviços e áreas importantes da cidade. Destaca-se por imóveis de padrão elevado, ambiente mais reservado e perfil voltado a quem busca sofisticação e qualidade de vida.",
  },
  {
    title: "Vila Adyana",
    slug: "vila-adyana",
    image: "/bairros/vila-adyana.webp",
    highlight:
      "Qualidade de vida, áreas verdes e conveniência em uma região central.",
    description:
      "Bairro tradicional e muito valorizado, conhecido pela boa arborização, qualidade de vida e proximidade com o Parque Vicentina Aranha, além de comércio, serviços e gastronomia. Reúne um perfil residencial qualificado e localização estratégica.",
  },
  {
    title: "Jardim Esplanada",
    slug: "jardim-esplanada",
    image: "/bairros/jardim-esplanada.jpg",
    highlight:
      "Ambiente residencial, localização privilegiada e fácil acesso à cidade.",
    description:
      "Região bastante valorizada, com perfil residencial e excelente localização. Possui acesso facilitado a escolas, serviços, comércio e vias importantes da cidade, sendo muito procurada por quem busca conforto, conveniência e imóveis de bom padrão.",
  },
  {
    title: "Bosque dos Eucaliptos",
    slug: "bosque-dos-eucaliptos",
    image: "/bairros/bosque-dos-eucaliptos.jpg",
    highlight:
      "Perfil familiar, infraestrutura completa e boa mobilidade.",
    description:
      "Bairro consolidado, com comércio variado, supermercados, escolas, farmácias e serviços no entorno. Apresenta perfil predominantemente familiar, boa mobilidade e oferta diversificada de apartamentos e casas para diferentes perfis de compradores.",
  },
  {
    title: "Jardim das Indústrias",
    slug: "jardim-das-industrias",
    image: "/bairros/jardim-das-industrias.jpg",
    highlight:
      "Localização estratégica, serviços e ampla oferta residencial.",
    description:
      "Região com localização estratégica e fácil acesso às principais vias da cidade e à Rodovia Presidente Dutra. Conta com boa oferta de comércio, serviços e imóveis residenciais, sendo procurada por quem valoriza mobilidade e praticidade no cotidiano.",
  },
];

function buildNeighborhoodLink(neighborhood: string) {
  return `/comprar?bairro=${encodeURIComponent(neighborhood)}`;
}

export default function BairrosPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative h-[520px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="Bairros Premium"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              São José dos Campos
            </p>

            <h1 className="mt-5 font-serif text-5xl lg:text-6xl">
              Bairros Premium
            </h1>

            <p className="mt-6 text-lg leading-8 text-zinc-300">
              Conheça as regiões onde concentramos nossa atuação e descubra as
              características de cada bairro.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {neighborhoods.map((bairro) => (
            <article
              key={bairro.title}
              className="overflow-hidden border border-white/10 bg-[#0b0b0b] transition hover:border-amber-500"
            >
              <div className="relative h-72">
                <Image
                  src={bairro.image}
                  alt={bairro.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-8">
                <h2 className="font-serif text-3xl">{bairro.title}</h2>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">
                  {bairro.highlight}
                </p>

                <p className="mt-5 leading-8 text-zinc-400">
                  {bairro.description}
                </p>

                <Link
                  href={buildNeighborhoodLink(bairro.title)}
                  className="mt-8 inline-flex border border-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                >
                  Conhecer imóveis
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="border border-white/10 bg-[#0b0b0b] p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
            Curadoria B&amp;B
          </p>

          <p className="mx-auto mt-4 max-w-4xl text-lg leading-8 text-zinc-300">
            Nós atuamos com análise, curadoria e orientação estratégica para
            decisões imobiliárias mais seguras em São José dos Campos.
          </p>

          <p className="mt-6 font-serif text-3xl text-white">
            Mais que imóveis. Estratégia para grandes decisões.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}