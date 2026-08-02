const testimonials = [
  {
    quote:
      "A consultoria nos ajudou a enxergar aspectos que não havíamos considerado, como posição solar, liquidez e custos futuros.",
    name: "Cliente B&B",
    profile: "Compra para moradia",
  },
  {
    quote:
      "Nós recebemos uma análise clara e objetiva, sem pressão. Isso trouxe muita segurança para tomar a decisão.",
    name: "Cliente B&B",
    profile: "Aquisição patrimonial",
  },
  {
    quote:
      "A seleção dos imóveis foi muito mais assertiva. Visitamos menos opções e entendemos melhor o que realmente fazia sentido.",
    name: "Cliente B&B",
    profile: "Imóvel de alto padrão",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-y border-white/10 bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-[1720px] px-6 lg:px-10 xl:px-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
            Experiência consultiva
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal leading-tight md:text-5xl">
            O que nossos clientes dizem
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Decisões imobiliárias importantes exigem clareza, análise e
            confiança em todas as etapas.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.name}-${index}`}
              className="flex min-h-[310px] flex-col border border-white/10 bg-black/35 p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-500/55"
            >
              <span className="font-serif text-5xl leading-none text-amber-400">
                “
              </span>

              <blockquote className="mt-5 flex-1 font-serif text-2xl leading-[1.45] text-white">
                {testimonial.quote}
              </blockquote>

              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-white">
                  {testimonial.name}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  {testimonial.profile}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-7 max-w-3xl text-xs leading-6 text-zinc-500">
          Os textos acima são provisórios e devem ser substituídos por
          depoimentos reais autorizados antes da publicação do portal.
        </p>
      </div>
    </section>
  );
}