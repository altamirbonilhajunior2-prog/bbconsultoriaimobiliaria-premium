import Link from "next/link";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";
import { createMarketReference } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-12 border border-white/10 bg-black px-4 text-sm text-white outline-none focus:border-amber-500";
const labelClass =
  "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

function currency(value: { toString(): string }) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));
}

export default async function MarketReferencesPage() {
  await requireAdmin();

  const references = await prisma.marketReference.findMany({
    include: { evidences: { orderBy: { researchedAt: "desc" } } },
    orderBy: { calculatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <Link href="/admin" className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">
          ← Voltar ao CRM
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Inteligência de mercado
          </p>
          <h1 className="mt-3 font-serif text-5xl font-normal">Referências de Mercado B&amp;B</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
            Área interna para documentar fontes, links, datas e imóveis comparáveis usados na faixa de valor por metro quadrado.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b] p-7">
          <h2 className="font-serif text-3xl">Nova faixa e primeira evidência</h2>
          <form action={createMarketReference} className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className={labelClass}>Estado<input className={inputClass} name="state" defaultValue="SP" maxLength={2} /></label>
            <label className={labelClass}>Cidade<input className={inputClass} name="city" defaultValue="São José dos Campos" required /></label>
            <label className={labelClass}>Bairro<input className={inputClass} name="neighborhood" required /></label>
            <label className={labelClass}>Finalidade<select className={inputClass} name="purpose"><option value="VENDA">Venda</option><option value="LOCACAO">Locação</option></select></label>
            <label className={labelClass}>Tipo<select className={inputClass} name="propertyType"><option value="APARTAMENTO">Apartamento</option><option value="CASA">Casa</option><option value="TERRENO">Terreno</option><option value="COMERCIAL">Comercial</option><option value="RURAL">Rural</option></select></label>
            <label className={labelClass}>Área mínima<input className={inputClass} name="areaMin" inputMode="decimal" /></label>
            <label className={labelClass}>Área máxima<input className={inputClass} name="areaMax" inputMode="decimal" /></label>
            <label className={labelClass}>Dormitórios<input className={inputClass} name="bedrooms" type="number" min="0" /></label>
            <label className={labelClass}>Faixa mínima R$/m²<input className={inputClass} name="pricePerSquareMeterMin" inputMode="decimal" required /></label>
            <label className={labelClass}>Faixa máxima R$/m²<input className={inputClass} name="pricePerSquareMeterMax" inputMode="decimal" required /></label>
            <label className={labelClass}>Fonte consultada<input className={inputClass} name="source" placeholder="Ex.: portal imobiliário" required /></label>
            <label className={labelClass}>Link da fonte<input className={inputClass} name="sourceUrl" type="url" required /></label>
            <label className={labelClass}>Valor do comparável<input className={inputClass} name="evidencePrice" inputMode="decimal" /></label>
            <label className={labelClass}>Área do comparável<input className={inputClass} name="evidenceArea" inputMode="decimal" /></label>
            <label className={labelClass}>Dormitórios do comparável<input className={inputClass} name="evidenceBedrooms" type="number" min="0" /></label>
            <label className={labelClass}>Condomínio/edifício<input className={inputClass} name="development" /></label>
            <label className={`${labelClass} md:col-span-2 xl:col-span-4`}>Observações<textarea className={`${inputClass} min-h-28 py-4`} name="notes" /></label>
            <button className="min-h-14 bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 md:col-span-2 xl:col-span-4">
              Registrar referência
            </button>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl">Faixas cadastradas</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {references.length === 0 ? (
              <p className="border border-dashed border-white/10 p-7 text-sm text-zinc-500">Nenhuma referência cadastrada.</p>
            ) : references.map((reference) => (
              <article key={reference.id} className="border border-white/10 bg-[#0b0b0b] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">{reference.propertyType} • {reference.purpose}</p>
                <h3 className="mt-3 font-serif text-2xl">{reference.neighborhood}, {reference.city}</h3>
                <p className="mt-4 text-xl text-white">{currency(reference.pricePerSquareMeterMin)} a {currency(reference.pricePerSquareMeterMax)}/m²</p>
                <p className="mt-3 text-xs text-zinc-500">{reference.evidences.length} fonte(s) documentada(s) • atualização {reference.calculatedAt.toLocaleDateString("pt-BR")}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
