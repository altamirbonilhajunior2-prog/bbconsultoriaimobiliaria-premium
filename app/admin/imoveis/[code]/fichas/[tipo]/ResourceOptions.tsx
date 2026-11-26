"use client";

import { useState } from "react";

const options = [
  ["usesOwnResources", "Recursos próprios"],
  ["usesFinancing", "Financiamento bancário"],
  ["usesFgts", "FGTS"],
] as const;
const optionClass = "flex min-h-10 cursor-pointer items-center gap-3 border border-zinc-300 px-3 py-2 text-[10px] text-zinc-700 transition hover:border-amber-500";

export default function ResourceOptions() {
  const [other, setOther] = useState(false);
  const [description, setDescription] = useState("");
  return <>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 print:grid-cols-2">
      {options.map(([name, label]) => <label key={name} className={optionClass}>
        <input type="checkbox" name={name} className="h-4 w-4 shrink-0 accent-amber-500" />
        <span>{label}</span>
      </label>)}
      <label className={optionClass}>
        <input type="checkbox" name="usesOtherResources" checked={other} onChange={event => setOther(event.target.checked)} aria-controls="other-resources" className="h-4 w-4 shrink-0 accent-amber-500" />
        <span>Outros (especificar)</span>
      </label>
    </div>
    <label className={other ? "mt-4 block" : "hidden"}>
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">Especifique os outros recursos *</span>
      <textarea id="other-resources" name="otherResources" value={description} onChange={event => setDescription(event.target.value)} disabled={!other} required={other} maxLength={1000} rows={3} placeholder="Ex.: carta de crédito de consórcio, permuta de imóvel..." className="mt-2 w-full resize-none border border-zinc-300 bg-transparent p-3 text-[10px] leading-5 text-zinc-950 outline-none focus:border-amber-500 print:hidden" />
      <span className="mt-2 hidden whitespace-pre-wrap break-words border border-zinc-300 p-3 text-[10px] leading-5 text-zinc-950 print:block">{description}</span>
    </label>
  </>;
}
