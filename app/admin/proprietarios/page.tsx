import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProprietariosPage() {
  const owners = await prisma.owner.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <div className="flex flex-col gap-7 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
            >
              ← Voltar para administração
            </Link>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Administração
            </p>

            <h1 className="mt-3 font-serif text-5xl">
              Proprietários
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Cadastro interno de proprietários e informações de contato.
            </p>
          </div>

          <Link
            href="/admin/proprietarios/novo"
            className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400"
          >
            Novo proprietário
          </Link>
        </div>

        <div className="mt-10 border border-white/10 bg-[#0a0a0a]">
          {owners.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Nenhum proprietário cadastrado.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {owners.map((owner) => (
                <div
                  key={owner.id}
                  className="grid gap-5 p-6 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-serif text-2xl">
                      {owner.name}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      CPF: {owner.cpf || "Não informado"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>{owner.phone || "Telefone não informado"}</p>
                    <p className="mt-1">{owner.email || "E-mail não informado"}</p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>{owner.neighborhood || "Bairro não informado"}</p>
                    <p className="mt-1">
                      {[owner.city, owner.state].filter(Boolean).join(" / ") ||
                        "Cidade não informada"}
                    </p>
                  </div>

                  <Link
                    href={`/admin/proprietarios/${owner.id}`}
                    className="inline-flex min-h-11 items-center justify-center border border-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 hover:bg-amber-500 hover:text-black"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}