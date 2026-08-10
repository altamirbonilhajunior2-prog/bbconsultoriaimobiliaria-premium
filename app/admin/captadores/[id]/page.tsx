import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin/access";
import { updateAgent } from "../actions";

const fieldClass =
  "h-14 w-full border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-amber-500";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarCaptadorPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const agentId = Number(id);

  if (!Number.isInteger(agentId)) {
    notFound();
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!agent) {
    notFound();
  }

  const action = updateAgent.bind(
    null,
    agent.id,
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        <Link
          href="/admin/captadores"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
        >
          ← Voltar para captadores
        </Link>

        <h1 className="mt-8 font-serif text-5xl">
          Editar captador
        </h1>

        <form
          action={action}
          className="mt-10 grid gap-5 md:grid-cols-2"
        >
          <Field
            label="Nome *"
            name="name"
            value={agent.name}
            required
          />

          <Field
            label="E-mail *"
            name="email"
            type="email"
            value={agent.email}
            required
          />

          <Field
            label="Telefone / WhatsApp"
            name="phone"
            value={agent.phone}
          />

          <Field
            label="CRECI"
            name="creci"
            value={agent.creci}
          />

          <Field
            label="Nova senha"
            name="password"
            type="password"
          />

          <div className="md:col-span-2 text-xs text-zinc-500">
            Deixe a nova senha em branco para manter a senha atual.
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="min-h-14 bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black"
            >
              Salvar alterações
            </button>
          </div>
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
}: {
  label: string;
  name: string;
  value?: string | null;
  type?: string;
  required?: boolean;
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
        className={fieldClass}
      />
    </label>
  );
}