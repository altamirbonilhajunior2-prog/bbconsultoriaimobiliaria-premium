import Link from "next/link";

const points = [
  "Localização e entorno",
  "Liquidez e potencial de revenda",
  "Valorização patrimonial",
  "Perfil da família e estilo de vida",
  "Documentação e segurança jurídica",
  "Custos futuros e manutenção",
];

export default function ConsultoriaSection() {
  return (
    <section className="border-y border-white/10 bg-[#090909]">
      <div className="mx-auto grid max-w-[1720px] gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 xl:px-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            Por que escolher a B&B?
          </p>

          <h2 className="mt-4 max-w-xl font-serif text-4xl font-normal leading-tight md:text-5xl">
            Nós não apresentamos apenas imóveis.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
            Nós analisamos cada oportunidade com visão estratégica para que sua
            decisão seja mais segura, coerente e alinhada ao seu objetivo
            patrimonial.
          </p>

          <Link
            href="/consultoria"
            className="mt-8 inline-flex min-h-13 items-center justify-center border border-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
          >
            Conheça nossa metodologia
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((point, index) => (
            <article
              key={point}
              className="border border-white/10 bg-black/40 p-6 transition hover:border-amber-500/50"
            >
              <span className="text-xs font-bold text-amber-400">
                0{index + 1}
              </span>

              <h3 className="mt-4 font-serif text-2xl text-white">
                {point}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}