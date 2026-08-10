import Link from "next/link";

import { prisma } from "../../../lib/prisma";
import { getAccessContext } from "../../../lib/admin/access";

export const dynamic = "force-dynamic";

function maskCpf(cpf: string | null) {
  if (!cpf) {
    return "Não informado";
  }

  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) {
    return cpf;
  }

  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export default async function ProprietariosPage() {
  const access = await getAccessContext();

  const owners =
    await prisma.owner.findMany({
      where: access.isAdmin
        ? {}
        : {
            capturedById:
              access.agentId ?? -1,
          },

      orderBy: {
        name: "asc",
      },

      include: {
        capturedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            properties: true,
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
              Voltar para administração
            </Link>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Administração
            </p>

            <h1 className="mt-3 font-serif text-5xl">
              Proprietários
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              {access.isAdmin
                ? "Visão administrativa completa dos proprietários cadastrados."
                : "Sua carteira de proprietários captados."}
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
                  className="grid gap-5 p-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-center"
                >
                  <div>
                    <p className="font-serif text-2xl">
                      {owner.name}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      CPF: {maskCpf(owner.cpf)}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>
                      {owner.phone ||
                        "Telefone não informado"}
                    </p>

                    <p className="mt-1">
                      {owner.email ||
                        "E-mail não informado"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>
                      {owner.neighborhood ||
                        "Bairro não informado"}
                    </p>

                    <p className="mt-1">
                      {[
                        owner.city,
                        owner.state,
                      ]
                        .filter(Boolean)
                        .join(" / ") ||
                        "Cidade não informada"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>
                      Captador:{" "}
                      {owner.capturedBy?.name ||
                        "Não definido"}
                    </p>

                    <p className="mt-1">
                      Imóveis vinculados:{" "}
                      {owner._count.properties}
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