import Link from "next/link";

export const dynamic = "force-dynamic";

const stages = [
  {
    label: "Encontrados",
    value: 0,
    detail: "Oportunidades identificadas",
  },
  {
    label: "Selecionados",
    value: 0,
    detail: "Aprovados para abordagem",
  },
  {
    label: "Contatados",
    value: 0,
    detail: "Contato já realizado",
  },
  {
    label: "Autorizados",
    value: 0,
    detail: "Liberados para preparação",
  },
  {
    label: "Publicados",
    value: 0,
    detail: "Convertidos em imóveis do portal",
  },
];

export default function AdminCaptacaoIAPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
            >
              ← Voltar ao painel
            </Link>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Inteligência de captação
            </p>

            <h1 className="mt-3 font-serif text-5xl font-normal">
              Captação IA
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Radar interno para localizar, selecionar, acompanhar e
              transformar oportunidades de captação em imóveis autorizados
              para o Portal B&amp;B.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled
              className="inline-flex min-h-14 cursor-not-allowed items-center justify-center border border-white/10 px-7 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600"
            >
              Nova captação
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stages.map((stage) => (
            <article
              key={stage.label}
              className="border border-white/10 bg-[#0b0b0b] p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                {stage.label}
              </p>

              <strong className="mt-3 block font-serif text-4xl font-normal text-white">
                {stage.value}
              </strong>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                {stage.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 overflow-hidden border border-white/10">
          <div className="hidden grid-cols-[110px_1.7fr_1fr_1fr_160px_160px] gap-5 border-b border-white/10 bg-[#0b0b0b] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 lg:grid">
            <span>Fonte</span>
            <span>Oportunidade</span>
            <span>Localização</span>
            <span>Valor</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>

          <div className="bg-[#080808] px-6 py-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Radar B&amp;B
            </p>

            <h2 className="mt-4 font-serif text-3xl font-normal">
              Nenhuma oportunidade cadastrada.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
              Assim que ativarmos a base de dados da Captação IA, as
              oportunidades encontradas em fontes como OLX, ZAP, parceiros e
              outras origens aparecerão aqui para análise antes de qualquer
              publicação.
            </p>

            <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left md:grid-cols-3">
              <article className="border border-white/10 bg-[#0b0b0b] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  01
                </p>

                <h3 className="mt-3 font-serif text-xl">
                  Encontrar
                </h3>

                <p className="mt-3 text-xs leading-6 text-zinc-500">
                  Registrar oportunidades encontradas nas fontes definidas
                  pela B&amp;B.
                </p>
              </article>

              <article className="border border-white/10 bg-[#0b0b0b] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  02
                </p>

                <h3 className="mt-3 font-serif text-xl">
                  Autorizar
                </h3>

                <p className="mt-3 text-xs leading-6 text-zinc-500">
                  Controlar contato, autorização de divulgação e utilização
                  das imagens.
                </p>
              </article>

              <article className="border border-white/10 bg-[#0b0b0b] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  03
                </p>

                <h3 className="mt-3 font-serif text-xl">
                  Publicar
                </h3>

                <p className="mt-3 text-xs leading-6 text-zinc-500">
                  Converter oportunidades autorizadas em imóveis completos do
                  Portal B&amp;B.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-10 border border-amber-500/20 bg-amber-500/[0.04] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            Regra de segurança
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
            Uma oportunidade encontrada pela Captação IA permanece privada no
            CRM. Ela somente poderá ser transformada em imóvel publicável após
            o registro da autorização correspondente.
          </p>
        </section>
      </div>
    </main>
  );
}