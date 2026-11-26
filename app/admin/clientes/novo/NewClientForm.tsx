"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createClientAction } from "./actions";
import PersonalDetailsFields from "../PersonalDetailsFields";

type PropertyOption = { code: string; title: string };
const field = "mt-2 min-h-12 w-full rounded border border-white/20 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-amber-500";

export default function NewClientForm({ properties }: { properties: PropertyOption[] }) {
  const [state, action, pending] = useActionState(createClientAction, {});
  const [values, setValues] = useState({ name: "", phone: "", email: "", notes: "" });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const query = search.trim().toLocaleLowerCase("pt-BR");
  const matches = properties.filter(p => !selected.includes(p.code) && `${p.code} ${p.title}`.toLocaleLowerCase("pt-BR").includes(query));
  return (
    <form action={action} className="mt-8 space-y-6 border border-amber-500/20 bg-[#0a0a0a] p-5 sm:p-8">
      <p className="text-xs text-zinc-400">Nome e telefone são obrigatórios.</p>
      <label className="block text-sm">Nome completo *
        <input name="name" autoComplete="name" required minLength={2} maxLength={180} className={field} value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
      </label>
      <label className="block text-sm">Telefone / WhatsApp com DDD *
        <input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="(12) 99999-9999" className={field} value={values.phone} onChange={e => setValues({ ...values, phone: e.target.value })} />
      </label>
      <label className="block text-sm">E-mail (opcional)
        <input name="email" type="email" autoComplete="email" maxLength={180} className={field} value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} />
      </label>
      <PersonalDetailsFields />
      <fieldset className="space-y-3 border-t border-white/10 pt-6">
        <legend className="font-semibold text-amber-400">Imóveis de interesse (opcional)</legend>
        <p className="text-sm text-zinc-400">Selecione um ou mais imóveis. O vínculo ficará registrado na ficha e no histórico do cliente.</p>
        <input type="hidden" name="propertyCodes" value={selected.join(",")} />
        {selected.length > 0 && <ul className="space-y-2" aria-label="Imóveis selecionados">
          {selected.map(code => <li key={code} className="flex items-center justify-between gap-3 rounded border border-amber-500/40 p-3 text-sm">
            <span><strong>{code}</strong> — {properties.find(p => p.code === code)?.title}</span>
            <button type="button" disabled={pending} aria-label={`Remover ${code}`} onClick={() => setSelected(selected.filter(item => item !== code))} className="min-h-11 shrink-0 px-2 text-amber-400 underline">Remover</button>
          </li>)}
        </ul>}
        <label className="block text-sm">Buscar imóvel por código ou título
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ex.: BBA002 ou nome do condomínio" className={field} />
        </label>
        <p className="text-xs text-zinc-400" aria-live="polite">{selected.length} selecionado(s). {matches.length > 10 ? "Exibindo os primeiros 10 resultados. Refine a busca para encontrar outros imóveis." : `${matches.length} resultado(s).`}</p>
        <ul className="max-h-72 overflow-y-auto divide-y divide-white/10">
          {matches.slice(0, 10).map(property => <li key={property.code}>
            <button type="button" disabled={pending || selected.length >= 50} onClick={() => setSelected([...selected, property.code])} className="min-h-12 w-full px-2 py-3 text-left text-sm hover:bg-white/5 disabled:opacity-50">
              <span className="font-semibold text-amber-400">Selecionar {property.code}</span> — {property.title}
            </button>
          </li>)}
        </ul>
      </fieldset>
      <label className="block text-sm">Observações (opcional)
        <textarea name="notes" rows={4} maxLength={5000} placeholder="Origem do contato, objetivo da compra e preferências do cliente." className={field} value={values.notes} onChange={e => setValues({ ...values, notes: e.target.value })} />
      </label>
      {state.error && <div role="alert" className="rounded border border-amber-500/50 p-4 text-sm text-amber-200">
        <p>{state.error}</p>
        {state.existingClientId && <Link href={`/admin/clientes/${state.existingClientId}`} className="mt-3 inline-block underline">Abrir ficha existente</Link>}
      </div>}
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={pending} className="min-h-12 rounded bg-amber-500 px-6 font-semibold text-black hover:bg-amber-400 disabled:opacity-50">{pending ? "Salvando..." : "Salvar cliente"}</button>
        <Link href="/admin/clientes" className="text-sm text-zinc-300 underline">Cancelar</Link>
      </div>
    </form>
  );
}
