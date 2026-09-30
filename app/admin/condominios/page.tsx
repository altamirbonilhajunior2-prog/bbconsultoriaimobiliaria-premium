import Link from "next/link";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";
import {
  createDevelopment,
  toggleDevelopment,
} from "../developments/actions";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-12 border border-white/10 bg-black px-4 text-sm text-white outline-none focus:border-amber-500";

const labelClass =
  "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

export default async function CondominiosPage() {
  await requireAdmin();

  const developments =
    await prisma.development.findMany({
      where: {
        type: "CONDOMINIO",
      },

      orderBy: [
        {
          active: "desc",
        },
        {
          city: "asc",
        },
        {
          neighborhood: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <Link
          href="/admin"
          className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400"
        >
          ← Voltar ao painel
        </Link>

        <div className="mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Cadastro de empreendimentos
          </p>

          <h1 className="mt-3 font-serif text-4xl font-normal text-white">
            Condomínios
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Cadastre os condomínios utilizados nos imóveis da B&B.
            Esses nomes poderão ser usados de forma padronizada no CRM
            e posteriormente no filtro público do portal.
          </p>
        </div>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b] p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Novo condomínio
          </p>

          <form
            action={createDevelopment}
            className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <input
              type="hidden"
              name="type"
              value="CONDOMINIO"
            />

            <label className={labelClass}>
              Nome
              <input
                name="name"
                type="text"
                required
                maxLength={180}
                placeholder="Ex.: Alphaville II"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Estado
              <input
                name="state"
                type="text"
                required
                maxLength={2}
                defaultValue="SP"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Cidade
              <input
                name="city"
                type="text"
                required
                defaultValue="São José dos Campos"
                maxLength={120}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Bairro
              <input
                name="neighborhood"
                type="text"
                required
                maxLength={150}
                placeholder="Ex.: Urbanova"
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              className="min-h-12 bg-amber-500 px-6 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 md:col-span-2 xl:col-span-1"
            >
              Cadastrar condomínio
            </button>
          </form>
        </section>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Condomínios cadastrados
            </p>
          </div>

          {developments.length === 0 ? (
            <div className="px-6 py-10 text-sm text-zinc-500">
              Nenhum condomínio cadastrado.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {developments.map(
                (development) => (
                  <div
                    key={development.id}
                    className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {development.name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {development.active
                          ? "Ativo"
                          : "Inativo"}
                      </p>
                    </div>

                    <div className="text-sm text-zinc-300">
                      {development.city}/
                      {development.state}
                    </div>

                    <div className="text-sm text-zinc-300">
                      {development.neighborhood}
                    </div>

                    <form
                      action={toggleDevelopment}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={development.id}
                      />

                      <button
                        type="submit"
                        className="min-h-10 border border-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                      >
                        {development.active
                          ? "Desativar"
                          : "Ativar"}
                      </button>
                    </form>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}