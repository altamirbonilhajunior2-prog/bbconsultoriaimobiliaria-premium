export default function SearchPanel() {
  return (
    <section className="relative z-20 w-full bg-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1720px] border border-[#D5A85A]/60 bg-[#090909] px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.45)] lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_230px]">
          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Tipo de imóvel
            </span>

            <select className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none">
              <option className="bg-zinc-900">Todos os tipos</option>
              <option className="bg-zinc-900">Casa</option>
              <option className="bg-zinc-900">Apartamento</option>
              <option className="bg-zinc-900">Cobertura</option>
              <option className="bg-zinc-900">Terreno</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Finalidade
            </span>

            <select className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none">
              <option className="bg-zinc-900">Comprar</option>
              <option className="bg-zinc-900">Alugar</option>
              <option className="bg-zinc-900">Lançamentos</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Bairro
            </span>

            <select className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none">
              <option className="bg-zinc-900">Todos os bairros</option>
              <option className="bg-zinc-900">Urbanova</option>
              <option className="bg-zinc-900">Jardim Aquarius</option>
              <option className="bg-zinc-900">Colinas</option>
              <option className="bg-zinc-900">Altos do Esplanada</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Faixa de valor
            </span>

            <select className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none">
              <option className="bg-zinc-900">Qualquer valor</option>
              <option className="bg-zinc-900">Até R$ 1 milhão</option>
              <option className="bg-zinc-900">Até R$ 2 milhões</option>
              <option className="bg-zinc-900">Até R$ 3 milhões</option>
              <option className="bg-zinc-900">Acima de R$ 3 milhões</option>
            </select>
          </label>

          <button
            type="button"
            className="min-h-16 bg-[#D5A85A] px-7 text-sm font-bold uppercase tracking-[0.18em] text-black transition-colors duration-300 hover:bg-[#E5BC6B] xl:min-h-full"
          >
            Buscar imóveis
          </button>
        </div>

        <div className="mt-7 flex justify-center">
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D5A85A] transition-colors duration-300 hover:text-[#E5BC6B]"
          >
            Busca avançada →
          </button>
        </div>
      </div>
    </section>
  );
}