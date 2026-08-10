import Link from "next/link";
import { createOwner } from "../actions";

const fieldClass =
  "h-14 w-full border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-amber-500";

export default function NovoProprietarioPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/admin/proprietarios"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
        >
          ← Voltar para proprietários
        </Link>

        <h1 className="mt-8 font-serif text-5xl">
          Novo proprietário
        </h1>

        <form action={createOwner} className="mt-10 space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome completo *" name="name" required />
            <Field label="Telefone / WhatsApp" name="phone" />
            <Field label="E-mail" name="email" type="email" />
            <Field label="RG" name="rg" />
            <Field label="CPF" name="cpf" />
            <Field label="CEP" name="zipCode" />
            <Field label="Endereço" name="address" />
            <Field label="Complemento" name="complement" />
            <Field label="Bairro" name="neighborhood" />
            <Field label="Cidade" name="city" />
            <Field label="Estado" name="state" maxLength={2} />
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Observações
            </span>

            <textarea
              name="notes"
              rows={5}
              className="w-full border border-white/10 bg-[#0b0b0b] p-4 text-sm text-white outline-none focus:border-amber-500"
            />
          </label>

          <button
            type="submit"
            className="min-h-14 bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400"
          >
            Cadastrar proprietário
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className={fieldClass}
      />
    </label>
  );
}