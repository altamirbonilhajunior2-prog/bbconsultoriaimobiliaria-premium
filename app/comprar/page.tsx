import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";
import { properties } from "../data/properties";

export const metadata = {
  title: "Comprar | B&B Consultoria Imobiliária",
  description:
    "Imóveis selecionados para compra em São José dos Campos.",
};

export default function ComprarPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-14 lg:px-10 xl:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            Comprar
          </p>

          <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[1250px]">
              <h1 className="font-serif text-[38px] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] lg:text-[50px] xl:text-[56px]">
                Imóveis selecionados para decisões seguras.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                Nós analisamos localização, padrão construtivo, liquidez,
                valorização e adequação ao seu objetivo antes de apresentar
                cada oportunidade.
              </p>
            </div>

            <Link
              href="/consultoria"
              className="inline-flex min-h-13 w-fit shrink-0 items-center justify-center border border-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Conheça nossa consultoria
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_210px]">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Tipo de imóvel
              </span>

              <select className="h-14 border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none focus:border-amber-500">
                <option>Todos os tipos</option>
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Cobertura</option>
                <option>Terreno</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Bairro
              </span>

              <select className="h-14 border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none focus:border-amber-500">
                <option>Todos os bairros</option>
                <option>Urbanova</option>
                <option>Jardim Aquarius</option>
                <option>Colinas</option>
                <option>Altos do Esplanada</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Dormitórios
              </span>

              <select className="h-14 border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none focus:border-amber-500">
                <option>Qualquer quantidade</option>
                <option>2 ou mais</option>
                <option>3 ou mais</option>
                <option>4 ou mais</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Faixa de valor
              </span>

              <select className="h-14 border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none focus:border-amber-500">
                <option>Qualquer valor</option>
                <option>Até R$ 1 milhão</option>
                <option>Até R$ 2 milhões</option>
                <option>Até R$ 3 milhões</option>
                <option>Acima de R$ 3 milhões</option>
              </select>
            </label>

            <button
              type="button"
              className="mt-auto min-h-14 bg-amber-500 px-6 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Imóveis à venda
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              Imóveis selecionados para venda
            </h2>
          </div>

          <p className="text-sm text-zinc-500">
            {properties.length} imóveis encontrados
          </p>
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

        <div className="mt-14 flex justify-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-amber-500 bg-amber-500 text-sm font-bold text-black"
          >
            1
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-white/15 text-sm text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
          >
            2
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-white/15 text-sm text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
          >
            3
          </button>

          <button
            type="button"
            className="flex h-11 items-center justify-center border border-white/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
          >
            Próxima →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}