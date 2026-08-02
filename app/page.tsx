import Link from "next/link";
import ConsultoriaSection from "./components/ConsultoriaSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NeighborhoodsSection from "./components/NeighborhoodsSection";
import PropertyCard from "./components/PropertyCard";
import SearchPanel from "./components/SearchPanel";
import TestimonialsSection from "./components/TestimonialsSection";

const properties = [
  {
    code: "BBP001",
    title: "Casa contemporânea no Alphaville II",
    location: "Urbanova • São José dos Campos",
    price: "R$ 3.300.000",
    image: "/hero-clean.png",
    tag: "Destaque",
    area: "310 m²",
    bedrooms: "4",
    parking: "4",
  },
  {
    code: "BBP002",
    title: "Residência com arquitetura integrada",
    location: "Urbanova • São José dos Campos",
    price: "Sob consulta",
    image: "/hero-clean.png",
    tag: "Exclusivo",
    area: "420 m²",
    bedrooms: "4",
    parking: "5",
  },
  {
    code: "BBP003",
    title: "Apartamento com vista privilegiada",
    location: "Jardim Aquarius • São José dos Campos",
    price: "Sob consulta",
    image: "/hero-clean.png",
    tag: "Oportunidade",
    area: "158 m²",
    bedrooms: "3",
    parking: "3",
  },
  {
    code: "BBP004",
    title: "Casa térrea integrada à natureza",
    location: "Colinas do Parahyba • São José dos Campos",
    price: "R$ 3.980.000",
    image: "/hero-clean.png",
    tag: "Selecionado",
    area: "360 m²",
    bedrooms: "4",
    parking: "6",
  },
];

const benefits = [
  {
    number: "01",
    title: "Análise estratégica",
    text: "Decisões fundamentadas em dados, mercado e experiência.",
  },
  {
    number: "02",
    title: "Transparência",
    text: "Informações claras para decisões imobiliárias mais seguras.",
  },
  {
    number: "03",
    title: "Foco no objetivo",
    text: "Cada imóvel é avaliado conforme o seu perfil e planejamento.",
  },
  {
    number: "04",
    title: "Curadoria",
    text: "Selecionamos oportunidades com localização, liquidez e potencial.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <Hero />

      <SearchPanel />

      <section className="mx-auto max-w-[1720px] px-5 pb-20 pt-20 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Imóveis selecionados
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal leading-none md:text-5xl">
              Seleção exclusiva B&B
            </h2>
          </div>

          <Link
            href="/comprar"
            className="inline-flex w-fit border-b border-amber-500 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            Ver todos os imóveis →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.code}
              code={property.code}
              title={property.title}
              location={property.location}
              price={property.price}
              image={property.image}
              tag={property.tag}
              area={property.area}
              bedrooms={property.bedrooms}
              parking={property.parking}
            />
          ))}
        </div>
      </section>

      <ConsultoriaSection />

      <NeighborhoodsSection />

      <TestimonialsSection />

      <section className="border-y border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-5 px-5 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8 xl:px-10">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className="border border-white/10 bg-black/30 p-6 transition hover:border-amber-500/50"
            >
              <span className="text-sm font-bold text-amber-400">
                {benefit.number}
              </span>

              <h3 className="mt-5 font-serif text-2xl">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}