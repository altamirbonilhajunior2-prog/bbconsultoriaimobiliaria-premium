import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { updateOwner } from "../actions";

export const dynamic = "force-dynamic";

const fieldClass =
  "h-14 w-full border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-amber-500";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProprietarioPage({
  params,
}: PageProps) {
  const { id } = await params;
  const ownerId = Number(id);

  if (!Number.isInteger(ownerId)) {
    notFound();
  }

  const owner = await prisma.owner.findUnique({
    where: {
      id: ownerId,
    },
  });

  if (!owner) {
    notFound();
  }

  const action = updateOwner.bind(null, owner.id);

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
          Editar proprietário
        </h1>

        <form action={action} className="mt-10 space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome completo *" name="name" value={owner.name} required />
            <Field label="Telefone / WhatsApp" name="phone" value={owner.phone} />
            <Field label="E-mail" name="email" value={owner.email} type="email" />
            <Field label="RG" name="rg" value={owner.rg} />
            <Field label="CPF" name="cpf" value={owner.cpf} />
            <Field label="CEP" name="zipCode" value={owner.zipCode} />
            <Field label="Endereço" name="address" value={owner.address} />
            <Field label="Complemento" name="complement" value={owner.complement} />
            <Field label="Bairro" name="neighborhood" value={owner.neighborhood} />
            <Field label="Cidade" name="city" value={owner.city} />
            <Field label="Estado" name="state" value={owner.state} maxLength={2} />
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Observações
            </span>

            <textarea
              name="notes"
              defaultValue={owner.notes || ""}
              rows={5}
              className="w-full border border-white/10 bg-[#0b0b0b] p-4 text-sm text-white outline-none focus:border-amber-500"
            />
          </label>

          <button
            type="submit"
            className="min-h-14 bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  value: string | null;
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
        defaultValue={value || ""}
        required={required}
        maxLength={maxLength}
        className={fieldClass}
      />
    </label>
  );
}