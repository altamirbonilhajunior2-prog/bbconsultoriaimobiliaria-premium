"use client";

import { useState } from "react";
import { maritalStatuses } from "../../../lib/clients/personal-details";

type Values = { cpf: string; rg: string; maritalStatus: string; profession: string; monthlyIncome: string; birthDate: string; address: string };
export default function PersonalDetailsFields({ initial = {} }: { initial?: Partial<Values> }) {
  const [values, setValues] = useState<Values>({ cpf: "", rg: "", maritalStatus: "", profession: "", monthlyIncome: "", birthDate: "", address: "", ...initial });
  const fields: { name: keyof Values; label: string; max: number; type?: string; placeholder?: string }[] = [
    { name: "cpf", label: "CPF", max: 14 }, { name: "rg", label: "RG", max: 40 },
    { name: "profession", label: "Profissão", max: 180 },
    { name: "monthlyIncome", label: "Renda mensal (R$)", max: 24, placeholder: "5.000,00" },
    { name: "birthDate", label: "Data de nascimento", max: 10, type: "date" },
    { name: "address", label: "Endereço", max: 300 },
  ];
  const style = "mt-2 min-h-12 w-full rounded border border-white/20 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-amber-500";
  return <fieldset className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
    <legend className="mb-4 text-sm text-zinc-400">Dados complementares (opcionais)</legend>
    {fields.map(({ name, label, max, type, placeholder }) => <label key={name} className={`block min-w-0 text-sm ${name === "address" ? "sm:col-span-2" : ""}`}>{label}
      <input name={name} type={type ?? "text"} maxLength={max} placeholder={placeholder} inputMode={name === "monthlyIncome" ? "decimal" : undefined} value={values[name]} onChange={e => setValues({ ...values, [name]: e.target.value })} className={style} />
    </label>)}
    <label className="block text-sm">Estado civil
      <select name="maritalStatus" value={values.maritalStatus} onChange={e => setValues({ ...values, maritalStatus: e.target.value })} className={style}>
        <option value="">Não informado</option>{maritalStatuses.map(status => <option key={status} value={status}>{status}</option>)}
      </select>
    </label>
  </fieldset>;
}
