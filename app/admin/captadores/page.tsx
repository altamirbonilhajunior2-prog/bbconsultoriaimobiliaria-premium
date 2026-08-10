import Link from "next/link";

import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin/access";
import { toggleAgent } from "./actions";

export const dynamic = "force-dynamic";

export default async function CaptadoresPage() {
  await requireAdmin();

  const agents = await prisma.agent.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          capturedOwners: true,
          capturedProperties: true,
        },
      },
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
              Equipe B&amp;B
            </p>

            <h1 className="mt-3 font-serif text-5xl">
              Captadores / Angariadores
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Gerencie os profissionais responsáveis pelas captações.
            </p>
          </div>

          <Link
            href="/admin/captadores/novo"
            className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400"
          >
            Novo captador
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {agents.length === 0 ? (
            <div className="border border-white/10 bg-[#0b0b0b] p-8 text-zinc-400">
              Nenhum captador cadastrado.
            </div>
          ) : (
            agents.map((agent) => {
              const toggleAction = toggleAgent.bind(
                null,
                agent.id,
              );

              return (
                <article
                  key={agent.id}
                  className="grid gap-5 border border-white/10 bg-[#0b0b0b] p-6 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="font-serif text-2xl">
                      {agent.name}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                      {agent.email}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      CRECI: {agent.creci || "Não informado"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>
                      Proprietários:{" "}
                      {agent._count.capturedOwners}
                    </p>

                    <p className="mt-2">
                      Imóveis:{" "}
                      {agent._count.capturedProperties}
                    </p>
                  </div>

                  <div>
                    <span
                      className={
                        agent.active
                          ? "inline-flex border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400"
                          : "inline-flex border border-zinc-500/40 bg-zinc-500/10 px-3 py-2 text-xs text-zinc-400"
                      }
                    >
                      {agent.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/admin/captadores/${agent.id}`}
                      className="inline-flex min-h-11 items-center justify-center border border-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400"
                    >
                      Editar
                    </Link>

                    <form action={toggleAction}>
                      <button
                        type="submit"
                        className="min-h-11 border border-white/20 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300"
                      >
                        {agent.active
                          ? "Desativar"
                          : "Ativar"}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}