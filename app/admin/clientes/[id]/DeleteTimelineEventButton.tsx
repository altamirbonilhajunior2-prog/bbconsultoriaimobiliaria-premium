"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TimelineDeletionPlan } from "../../../../lib/admin/timeline-deletion";
import { deleteTimelineEvent, previewTimelineDeletion } from "./timeline-actions";

export default function DeleteTimelineEventButton({clientId,eventId,label}:{clientId:number;eventId:number;label:string}) {
  const router=useRouter();
  const [pending,startTransition]=useTransition();
  const [plan,setPlan]=useState<TimelineDeletionPlan|null>(null);
  const [choiceKey,setChoiceKey]=useState("");
  const [error,setError]=useState("");
  const choice=plan?.choices.find(c=>c.key===choiceKey);
  function preview() {
    startTransition(async()=>{
      setError("");
      const result=await previewTimelineDeletion(clientId,eventId);
      if (result.error) setError(result.error);
      else if(result.plan) {setPlan(result.plan);setChoiceKey(result.plan.choices.length===1?result.plan.choices[0].key:"");}
    });
  }
  function confirm() {
    if(!plan||!choice||choice.blocked)return;
    startTransition(async()=>{
      setError("");
      const result=await deleteTimelineEvent(clientId,eventId,plan.token,choiceKey);
      if(result.error)setError(result.error);
      else {setPlan(null);router.refresh();}
    });
  }
  return <div className="mt-4 print:hidden">
    {!plan && <button type="button" onClick={preview} disabled={pending} className="min-h-10 border border-red-400/30 px-3 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50">{pending?"Conferindo…":"Excluir etapa"}</button>}
    {plan && <div role="group" aria-label={`Excluir ${label}`} className="space-y-3 border border-red-400/30 bg-red-500/5 p-4 text-sm">
      <p className="font-semibold text-white">Excluir “{label}”?</p>
      {plan.choices.length>1 && <label className="block">
        <span className="mb-2 block text-zinc-300">Selecione a ficha relacionada a esta etapa</span>
        <select value={choiceKey} onChange={e=>setChoiceKey(e.target.value)} disabled={pending} className="min-h-11 w-full border border-white/20 bg-zinc-950 px-3 text-white">
          <option value="">Selecione a ficha correta</option>
          {plan.choices.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>}
      {choice && <p className="text-zinc-300">{choice.blocked ?? choice.effect}</p>}
      {!choice?.blocked && <p className="text-xs text-zinc-500">Confira antes de confirmar. Esta exclusão não pode ser desfeita automaticamente.</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending||!choice||Boolean(choice.blocked)} onClick={confirm} className="min-h-11 bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-40">{pending?"Excluindo…":"Confirmar exclusão"}</button>
        <button type="button" disabled={pending} onClick={()=>{setPlan(null);setError("");}} className="min-h-11 border border-white/20 px-4 text-sm text-zinc-300">Cancelar</button>
      </div>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
  </div>;
}
