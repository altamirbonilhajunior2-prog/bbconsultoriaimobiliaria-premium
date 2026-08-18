import Image from "next/image";
import Link from "next/link";

import Footer from "../components/Footer";
import Header from "../components/Header";

const neighborhoods = [
  {
    title: "Urbanova",
    image: "/hero-clean.png",
    description:
      "Condomínios fechados, áreas verdes, segurança e imóveis de médio e alto padrão. Região muito procurada por famílias que valorizam tranquilidade, qualidade de vida e boa infraestrutura de comércio e serviços.",
    href: "/comprar?bairro=Urbanova",
  },
  {
    title: "Jardim Aquarius",
    image: "/hero-clean.png",
    description:
      "Bairro completo, com ampla oferta de restaurantes, supermercados, academias, serviços e comércio, além de apartamentos modernos e excelente mobilidade.",
    href: "/comprar?bairro=Jardim%20Aquarius",
  },
  {
    title: "Colinas",
    image: "/hero-clean.png",
    description:
      "Região tradicional e valorizada, próxima a centros comerciais, serviços, escolas, restaurantes e importantes vias da cidade. Reúne imóveis de bom padrão e localização estratégica.",
    href: "/comprar?bairro=Colinas",
  },
  {
    title: "Vila Ema",
    image: "/hero-clean.png",
    description:
      "Um dos bairros mais tradicionais e desejados de São José dos Campos, com forte presença de gastronomia, cafés, comércio e serviços. Oferece principalmente apartamentos e boa conexão com regiões centrais.",
    href: "/comprar?bairro=Vila%20Ema",
  },
  {
    title: "Parque Industrial",
    image: "/hero-clean.png",
    description:
      "Região com infraestrutura consolidada, supermercados, comércio, serviços, escolas e acesso facilitado às principais vias da cidade. Possui perfil residencial diversificado e boa oferta de apartamentos e casas.",
    href: "/comprar?bairro=Parque%20Industrial",
  },
  {
    title: "Altos do Esplanada",
    image: "/hero-clean.png",
    description:
      "Região residencial valorizada, tranquila e estratégica, com fácil acesso a comércio, serviços e áreas importantes da cidade. Destaca-se por imóveis de padrão elevado e ambiente mais reservado.",
    href: "/comprar?bairro=Altos%20do%20Esplanada",
  },
  {
    title: "Vila Adyana",
    image: "/hero-clean.png",
    description:
      "Região tradicional, arborizada e muito bem servida por restaurantes, supermercados, escolas, academias, clínicas e serviços. Sua localização central e a proximidade de áreas de lazer tornam o bairro bastante procurado.",
    href: "/comprar?bairro=Vila%20Adyana",
  },
  {
    title: "Jardim Esplanada",
    image: "/hero-clean.png",
    description:
      "Bairro residencial valorizado, com ruas arborizadas, boa infraestrutura e localização privilegiada. A região oferece fácil acesso a comércio, escolas, restaurantes, serviços e importantes eixos da cidade.",
    href: "/comprar?bairro=Jardim%20Esplanada",
  },
  {
    title: "Bosque dos Eucaliptos",
    image: "/hero-clean.png",
    description:
      "Região residencial consolidada, com supermercados, escolas, comércio, serviços e áreas de lazer. Reúne casas e apartamentos para diferentes perfis de famílias, com boa mobilidade para outras regiões da cidade.",
    href: "/comprar?bairro=Bosque%20dos%20Eucaliptos",
  },
  {
    title: "Jardim das Indústrias",
    image: "/hero-clean.png",
    description:
      "Bairro com localização estratégica, infraestrutura completa de comércio e serviços e acesso facilitado às principais vias de São José dos Campos. Possui boa oferta de apartamentos, casas e condomínios residenciais.",
    href: "/comprar?bairro=Jardim%20das%20Ind%C3%BAstrias",
  },
];

export default function BairrosPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative h-[520px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="Bairros Premium em São José dos Campos"
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
              Conheça algumas das regiões onde concentramos nossa atuação em
              São José dos Campos e entenda o perfil, a infraestrutura e os
              diferenciais de cada bairro.
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
                  alt={`${bairro.title} em São José dos Campos`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-8">
                <h2 className="font-serif text-3xl">
                  {bairro.title}
                </h2>

                <p className="mt-5 leading-8 text-zinc-400">
                  {bairro.description}
                </p>

                <Link
                  href={bairro.href}
                  className="mt-8 inline-flex border border-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                >
                  Conhecer imóveis
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}