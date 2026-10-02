import Link from "next/link";

import { requireAdmin } from "../../../../lib/admin/access";
import { createAgent } from "../actions";

const fieldClass =
  "h-14 w-full border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-amber-500";

export default async function NovoCaptadorPage() {
  await requireAdmin();

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
          Novo usuário
        </h1>

        <form
          action={createAgent}
          className="mt-10 grid gap-5 md:grid-cols-2"
        >
          <Field
            label="Nome *"
            name="name"
            required
          />

          <Field
            label="E-mail *"
            name="email"
            type="email"
            required
          />

          <Field
            label="Telefone / WhatsApp"
            name="phone"
          />

          <Field
            label="CRECI"
            name="creci"
          />

          <label>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Perfil *
            </span>

            <select
              name="role"
              required
              defaultValue="CAPTADOR"
              className={fieldClass}
            >
              <option value="CAPTADOR">
                Captador / Corretor
              </option>

              <option value="ADMIN">
                Administrador
              </option>
            </select>
          </label>

          <Field
            label="Senha inicial *"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            description="Mínimo de 12 caracteres, com letra maiúscula, letra minúscula, número e caractere especial."
          />

          <div className="md:col-span-2">
            <button
              type="submit"
              className="min-h-14 bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black"
            >
              Cadastrar usuário
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
  type = "text",
  required = false,
  minLength,
  autoComplete,
  description,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  description?: string;
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
        minLength={minLength}
        autoComplete={autoComplete}
        className={fieldClass}
      />

      {description ? (
        <span className="mt-2 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      ) : null}
    </label>
  );
}
