export default function SearchPanel() {
  return (
    <section className="relative z-30 mx-auto -mt-10 w-[calc(100%-40px)] max-w-[1540px]">
      <div className="border border-amber-500/60 bg-[#090909]/95 px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1fr_210px]">
          <label className="flex flex-col gap-2 border-b border-white/15 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Tipo de imóvel
            </span>

            <select className="h-10 bg-transparent text-sm text-white outline-none">
              <option className="bg-zinc-900">Todos os tipos</option>
              <option className="bg-zinc-900">Casa</option>
              <option className="bg-zinc-900">Apartamento</option>
              <option className="bg-zinc-900">Cobertura</option>
              <option className="bg-zinc-900">Terreno</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 border-b border-white/15 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Finalidade
            </span>

            <select className="h-10 bg-transparent text-sm text-white outline-none">
              <option className="bg-zinc-900">Comprar</option>
              <option className="bg-zinc-900">Alugar</option>
              <option className="bg-zinc-900">Lançamentos</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 border-b border-white/15 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Bairro
            </span>

            <select className="h-10 bg-transparent text-sm text-white outline-none">
              <option className="bg-zinc-900">Todos os bairros</option>
              <option className="bg-zinc-900">Urbanova</option>
              <option className="bg-zinc-900">Jardim Aquarius</option>
              <option className="bg-zinc-900">Colinas</option>
              <option className="bg-zinc-900">Altos do Esplanada</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 border-b border-white/15 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Faixa de valor
            </span>

            <select className="h-10 bg-transparent text-sm text-white outline-none">
              <option className="bg-zinc-900">Qualquer valor</option>
              <option className="bg-zinc-900">Até R$ 1 milhão</option>
              <option className="bg-zinc-900">Até R$ 2 milhões</option>
              <option className="bg-zinc-900">Até R$ 3 milhões</option>
              <option className="bg-zinc-900">Acima de R$ 3 milhões</option>
            </select>
          </label>

          <button
            type="button"
            className="min-h-14 bg-amber-500 px-6 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
          >
            Buscar imóveis
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            Busca avançada →
          </button>
        </div>
      </div>
    </section>
  );
}