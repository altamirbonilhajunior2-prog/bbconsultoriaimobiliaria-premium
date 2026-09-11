import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";
import {
  deleteOwner,
  updateOwner,
} from "../actions";

import DeleteOwnerButton from "./DeleteOwnerButton";

export const dynamic = "force-dynamic";

const fieldClass =
  "h-14 w-full border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-amber-500";

type PageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditarProprietarioPage({
  params,
  searchParams,
}: PageProps) {
  const access =
    await getAccessContext();

  const { id } =
    await params;

  const { erro } =
    await searchParams;

  const duplicateError =
    erro === "duplicado";

  const ownerId =
    Number(id);

  if (
    !Number.isInteger(
      ownerId,
    )
  ) {
    notFound();
  }

  const owner =
    await prisma.owner.findFirst({
      where: {
        id: ownerId,

        ...(access.isAdmin
          ? {}
          : {
              capturedById:
                access.agentId ??
                -1,
            }),
      },

      include: {
        capturedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        properties: {
          select: {
            code: true,
            title: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!owner) {
    notFound();
  }

  const agents =
    access.isAdmin
      ? await prisma.agent.findMany({
          where: {
            active: true,
          },

          orderBy: {
            name: "asc",
          },

          select: {
            id: true,
            name: true,
            creci: true,
          },
        })
      : [];

  const updateAction =
    updateOwner.bind(
      null,
      owner.id,
    );

  const deleteAction =
    deleteOwner.bind(
      null,
      owner.id,
    );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/admin/proprietarios"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
        >
          Voltar para proprietários
        </Link>

        <h1 className="mt-8 font-serif text-5xl">
          Editar proprietário
        </h1>

        <p className="mt-4 text-sm text-zinc-400">
          Captador responsável:{" "}
          {owner.capturedBy?.name ||
            "Não definido"}
        </p>

        {duplicateError ? (
          <div className="mt-8 border border-amber-500/40 bg-amber-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-amber-300">
              Já existe um proprietário cadastrado com estes dados.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Verifique o cadastro existente antes de salvar alterações.
            </p>
          </div>
        ) : null}

        <form
          action={updateAction}
          className="mt-10 space-y-8"
        >
          {access.isAdmin ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Captador / Angariador
              </span>

              <select
                name="capturedById"
                defaultValue={
                  owner.capturedById?.toString() ??
                  ""
                }
                className={
                  fieldClass
                }
              >
                <option value="">
                  Não definido
                </option>

                {agents.map(
                  (agent) => (
                    <option
                      key={
                        agent.id
                      }
                      value={
                        agent.id
                      }
                    >
                      {agent.name}
                      {agent.creci
                        ? ` — CRECI ${agent.creci}`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Nome completo *"
              name="name"
              value={
                owner.name
              }
              required
            />

            <Field
              label="Telefone / WhatsApp"
              name="phone"
              value={
                owner.phone
              }
            />

            <Field
              label="E-mail"
              name="email"
              value={
                owner.email
              }
              type="email"
            />

            <Field
              label="RG"
              name="rg"
              value={
                owner.rg
              }
            />

            <Field
              label="CPF"
              name="cpf"
              value={
                owner.cpf
              }
            />

            <Field
              label="CEP"
              name="zipCode"
              value={
                owner.zipCode
              }
            />

            <Field
              label="Endereço"
              name="address"
              value={
                owner.address
              }
            />

            <Field
              label="Complemento"
              name="complement"
              value={
                owner.complement
              }
            />

            <Field
              label="Bairro"
              name="neighborhood"
              value={
                owner.neighborhood
              }
            />

            <Field
              label="Cidade"
              name="city"
              value={
                owner.city
              }
            />

            <Field
              label="Estado"
              name="state"
              value={
                owner.state
              }
              maxLength={2}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Observações
            </span>

            <textarea
              name="notes"
              defaultValue={
                owner.notes ||
                ""
              }
              rows={5}
              className="w-full border border-white/10 bg-[#0b0b0b] p-4 text-sm text-white outline-none focus:border-amber-500"
            />
          </label>

          {owner.properties
            .length > 0 ? (
            <section className="border border-white/10 bg-[#0b0b0b] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Imóveis vinculados
              </p>

              <div className="mt-4 space-y-3">
                {owner.properties.map(
                  (
                    property,
                  ) => (
                    <Link
                      key={
                        property.code
                      }
                      href={`/admin/imoveis/${property.code}`}
                      className="block border border-white/10 p-4 text-sm text-zinc-300 hover:border-amber-500/60"
                    >
                      {
                        property.code
                      }{" "}
                      —{" "}
                      {
                        property.title
                      }
                    </Link>
                  ),
                )}
              </div>
            </section>
          ) : null}

          <button
            type="submit"
            className="min-h-14 bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black hover:bg-amber-400"
          >
            Salvar alterações
          </button>
        </form>

        <section className="mt-12 border-t border-white/10 pt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
            Zona de exclusão
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal">
            Excluir proprietário
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Utilize esta opção quando
            desejar remover o cadastro
            deste proprietário.
          </p>

          <div className="mt-6">
            <DeleteOwnerButton
              action={
                deleteAction
              }
            />
          </div>
        </section>
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
        defaultValue={
          value || ""
        }
        required={required}
        maxLength={
          maxLength
        }
        className={
          fieldClass
        }
      />
    </label>
  );
}