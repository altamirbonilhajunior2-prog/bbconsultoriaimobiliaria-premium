import ApproximateLocationMap from "../../components/ApproximateLocationMap";

export const metadata = {
  title: "Protótipo interno | Referência de Mercado B&B",
  robots: { index: false, follow: false },
};

export default function MarketReferencePrototypePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1180px] px-6 py-16 lg:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Protótipo interno • não publicado
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <article className="border border-white/10 bg-[#0a0a0a] p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Valor do m²
            </p>
            <p className="mt-3 font-serif text-4xl text-white">R$ 8.429/m²</p>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Calculado com base no preço anunciado e na área informada no cadastro.
            </p>
          </article>

          <article className="border border-amber-500/30 bg-amber-500/5 p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Valores de referência de mercado
            </p>
            <p className="mt-3 font-serif text-4xl text-amber-400">R$ 7.900 a R$ 8.600/m²</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Baseados em imóveis comparáveis anunciados no mercado.
            </p>
          </article>
        </div>

        <div className="mt-6 border border-white/10 bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
            Referência de Mercado B&amp;B
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Estimativa elaborada a partir de pesquisa periódica em portais imobiliários, ofertas públicas e imóveis comparáveis. Valores anunciados podem diferir dos valores efetivamente negociados.
          </p>
        </div>
      </section>

      <ApproximateLocationMap
        latitude={-23.1828}
        longitude={-45.8928}
        radiusMeters={700}
        neighborhood="Urbanova"
        city="São José dos Campos"
      />
    </main>
  );
}
