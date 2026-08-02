import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";

const neighborhoods = [
  {
    title: "Urbanova",
    image: "/hero-clean.png",
    description:
      "Condomínios fechados, áreas verdes, segurança e imóveis de alto padrão.",
  },
  {
    title: "Jardim Aquarius",
    image: "/hero-clean.png",
    description:
      "Apartamentos modernos, gastronomia, serviços e excelente localização.",
  },
  {
    title: "Colinas",
    image: "/hero-clean.png",
    description:
      "Tradicional, sofisticado e próximo aos principais centros comerciais.",
  },
  {
    title: "Altos do Esplanada",
    image: "/hero-clean.png",
    description:
      "Exclusividade, tranquilidade e imóveis voltados ao público premium.",
  },
];

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
                <h2 className="font-serif text-3xl">
                  {bairro.title}
                </h2>

                <p className="mt-5 leading-8 text-zinc-400">
                  {bairro.description}
                </p>

                <button className="mt-8 border border-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-amber-400 transition hover:bg-amber-500 hover:text-black">
                  Ver imóveis
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}