import Image from "next/image";
import Link from "next/link";

const neighborhoods = [
  {
    name: "Urbanova",
    image: "/hero-clean.png",
    description:
      "Condomínios fechados, alto padrão e excelente qualidade de vida.",
  },
  {
    name: "Jardim Aquarius",
    image: "/hero-clean.png",
    description:
      "Apartamentos modernos, comércio completo e localização estratégica.",
  },
  {
    name: "Colinas",
    image: "/hero-clean.png",
    description:
      "Elegância, tradição e proximidade aos melhores serviços da cidade.",
  },
  {
    name: "Altos do Esplanada",
    image: "/hero-clean.png",
    description:
      "Exclusividade, tranquilidade e imóveis de alto padrão.",
  },
];

export default function NeighborhoodsSection() {
  return (
    <section className="bg-[#050505] py-24">
      <div className="mx-auto max-w-[1720px] px-6 lg:px-10 xl:px-12">

        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Bairros em destaque
            </p>

            <h2 className="mt-3 font-serif text-5xl">
              Conheça as melhores regiões
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-400 leading-7">
              Cada bairro possui características próprias. Nós ajudamos você a
              encontrar a região que melhor combina com seu estilo de vida e
              objetivos patrimoniais.
            </p>
          </div>

          <Link
            href="/bairros"
            className="hidden border-b border-amber-500 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-400 lg:block"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {neighborhoods.map((bairro) => (
            <article
              key={bairro.name}
              className="group overflow-hidden border border-white/10 bg-[#0a0a0a] transition hover:border-amber-500/60"
            >
              <div className="relative h-[250px] overflow-hidden">

                <Image
                  src={bairro.image}
                  alt={bairro.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <h3 className="absolute bottom-6 left-6 font-serif text-3xl text-white">
                  {bairro.name}
                </h3>

              </div>

              <div className="p-6">

                <p className="leading-7 text-zinc-400">
                  {bairro.description}
                </p>

                <Link
                  href={`/bairros/${bairro.name.toLowerCase().replaceAll(" ", "-")}`}
                  className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-amber-400"
                >
                  Conhecer bairro →
                </Link>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}