import Image from "next/image";
import Link from "next/link";

const neighborhoods = [
  {
    name: "Urbanova",
    slug: "urbanova",
    image: "/bairros/urbanova.webp",
    description:
      "Condomínios fechados, imóveis de alto padrão e excelente qualidade de vida.",
  },
  {
    name: "Jardim Aquarius",
    slug: "jardim-aquarius",
    image: "/bairros/jardim-aquarius.webp",
    description:
      "Apartamentos modernos, comércio completo e localização estratégica.",
  },
  {
    name: "Colinas",
    slug: "colinas",
    image: "/bairros/colinas.jpeg",
    description:
      "Elegância, tradição e proximidade aos melhores serviços da cidade.",
  },
  {
    name: "Altos do Esplanada",
    slug: "altos-do-esplanada",
    image: "/bairros/altos-do-esplanada.webp",
    description:
      "Exclusividade, tranquilidade e imóveis de alto padrão.",
  },
];

export default function NeighborhoodsSection() {
  return (
    <section className="bg-[#050505] py-24">
      <div className="mx-auto max-w-[1720px] px-6 lg:px-10 xl:px-12">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Bairros em destaque
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal md:text-5xl">
              Conheça as melhores regiões
            </h2>

            <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
              Cada bairro possui características próprias. Nós ajudamos você a
              encontrar a região que melhor combina com seu estilo de vida e
              objetivos patrimoniais.
            </p>
          </div>

          <Link
            href="/bairros"
            className="inline-flex w-fit border-b border-amber-500 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {neighborhoods.map((neighborhood) => (
            <article
              key={neighborhood.slug}
              className="group overflow-hidden border border-white/10 bg-[#0a0a0a] transition duration-300 hover:-translate-y-1 hover:border-amber-500/60"
            >
              <div className="relative h-[230px] overflow-hidden">
                <Image
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <h3 className="absolute bottom-5 left-5 font-serif text-3xl text-white">
                  {neighborhood.name}
                </h3>
              </div>

              <div className="p-5">
                <p className="min-h-[84px] text-sm leading-7 text-zinc-400">
                  {neighborhood.description}
                </p>

                <Link
                  href={`/bairros/${neighborhood.slug}`}
                  className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition group-hover:translate-x-1"
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