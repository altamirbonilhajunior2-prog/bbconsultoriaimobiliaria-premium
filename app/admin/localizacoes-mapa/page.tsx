import Link from "next/link";

import { requireAdmin } from "../../../lib/admin/access";
import { normalizeLocationKey } from "../../../lib/location/normalize";
import { prisma } from "../../../lib/prisma";
import { saveNeighborhoodMapLocation } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-12 border border-white/10 bg-black px-4 text-sm text-white outline-none focus:border-amber-500";
const labelClass =
  "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

export default async function NeighborhoodMapLocationsPage() {
  await requireAdmin();
  const [locations, registeredNeighborhoods] = await Promise.all([
    prisma.neighborhoodMapLocation.findMany({
      orderBy: [{ city: "asc" }, { displayName: "asc" }],
    }),
    prisma.property.findMany({
      select: { state: true, city: true, neighborhood: true },
      distinct: ["state", "city", "neighborhood"],
      orderBy: [{ city: "asc" }, { neighborhood: "asc" }],
    }),
  ]);

  const pendingNeighborhoods = registeredNeighborhoods.filter((neighborhood) => {
    const normalizedName = normalizeLocationKey(neighborhood.neighborhood);
    return !locations.some(
      (location) =>
        location.active &&
        location.state === neighborhood.state &&
        location.city === neighborhood.city &&
        (location.normalizedName === normalizedName ||
          location.aliases.includes(normalizedName)),
    );
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <Link href="/admin" className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">← Voltar ao CRM</Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Mapa do portal</p>
          <h1 className="mt-3 font-serif text-5xl">Localização dos bairros</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
            Cadastre uma referência central dentro de cada bairro. Todos os imóveis desse bairro usarão automaticamente o mesmo ponto no mapa gratuito.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b] p-7">
          <h2 className="font-serif text-3xl">Cadastrar ou atualizar bairro</h2>
          <form action={saveNeighborhoodMapLocation} className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className={labelClass}>Estado<input className={inputClass} name="state" defaultValue="SP" maxLength={2} /></label>
            <label className={labelClass}>Cidade<input className={inputClass} name="city" defaultValue="São José dos Campos" required /></label>
            <label className={labelClass}>Bairro<input className={inputClass} name="displayName" required /></label>
            <label className={labelClass}>Grafias alternativas<input className={inputClass} name="aliases" placeholder="Separadas por vírgula" /></label>
            <label className={labelClass}>Latitude do bairro<input className={inputClass} name="latitude" inputMode="decimal" required /></label>
            <label className={labelClass}>Longitude do bairro<input className={inputClass} name="longitude" inputMode="decimal" required /></label>
            <label className={labelClass}>Raio do mapa (metros)<input className={inputClass} name="radiusMeters" type="number" min="300" max="2000" defaultValue="700" /></label>
            <label className={labelClass}>Fonte da coordenada<input className={inputClass} name="source" /></label>
            <label className={`${labelClass} md:col-span-2 xl:col-span-4`}>Link de conferência<input className={inputClass} name="sourceUrl" type="url" /></label>
            <button className="min-h-14 bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400 md:col-span-2 xl:col-span-4">Salvar bairro</button>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl">Bairros aguardando validação do mapa</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
            O captador pode cadastrar qualquer bairro novo. O imóvel é salvo normalmente e aparece aqui até que o ponto do bairro seja conferido.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingNeighborhoods.length === 0 ? (
              <p className="border border-dashed border-white/10 p-7 text-sm text-zinc-500">Todos os bairros cadastrados possuem um ponto validado.</p>
            ) : pendingNeighborhoods.map((neighborhood) => (
              <article key={`${neighborhood.state}-${neighborhood.city}-${neighborhood.neighborhood}`} className="border border-amber-500/30 bg-amber-500/5 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">{neighborhood.city}/{neighborhood.state}</p>
                <h3 className="mt-3 font-serif text-2xl">{neighborhood.neighborhood}</h3>
                <p className="mt-3 text-sm text-zinc-400">Imóvel salvo • mapa oculto até a validação</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl">Bairros validados</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {locations.length === 0 ? (
              <p className="border border-dashed border-white/10 p-7 text-sm text-zinc-500">Nenhum bairro validado.</p>
            ) : locations.map((location) => (
              <article key={location.id} className="border border-white/10 bg-[#0b0b0b] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">{location.city}/{location.state}</p>
                <h3 className="mt-3 font-serif text-2xl">{location.displayName}</h3>
                <p className="mt-3 text-sm text-zinc-400">Pin validado • raio de {location.radiusMeters} m</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
