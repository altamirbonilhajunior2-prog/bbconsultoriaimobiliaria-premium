import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { revalidatePath } from "next/cache";

import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    erro?: string;
    ok?: string;
  }>;
};

const commercialEventLabels = {
  NOVO_CONTATO: "Novo contato",
  CONTATO_REALIZADO: "Contato realizado",
  CLIENTE_QUALIFICADO: "Cliente qualificado",
  IMOVEIS_APRESENTADOS:
    "Imóveis apresentados/enviados",
  VISITA_AGENDADA: "Visita agendada",
  VISITA_REALIZADA: "Visita realizada",
  POS_VISITA: "Pós-visita",
  PROPOSTA_APRESENTADA:
    "Proposta apresentada",
  CONTRAPROPOSTA: "Contraproposta",
  NEGOCIACAO:
    "Negociação em andamento",
  PROPOSTA_ACEITA: "Proposta aceita",
  DOCUMENTACAO: "Documentação",
  NEGOCIO_CONCLUIDO:
    "Negócio concluído",
  PERDIDO_ENCERRADO:
    "Perdido / encerrado",
} as const;

const clientStatusLabels = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  CONVERTIDO: "Convertido",
} as const;

const visitStatusLabels = {
  AGENDADA: "Agendada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
} as const;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

function formatDateOnly(value: Date) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

function formatPhone(phone: string) {
  const digits =
    phone.replace(/\D/g, "");

  const local =
    digits.startsWith("55")
      ? digits.slice(2)
      : digits;

  if (local.length !== 11) {
    return phone;
  }

  return `(${local.slice(
    0,
    2,
  )}) ${local.slice(
    2,
    7,
  )}-${local.slice(7)}`;
}

function formatCurrency(
  value: {
    toString(): string;
  } | null,
) {
  if (!value) {
    return null;
  }

  const number =
    Number(value.toString());

  if (!Number.isFinite(number)) {
    return null;
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    },
  ).format(number);
}

function normalizePropertyCodes(
  value: string,
) {
  return Array.from(
    new Set(
      value
        .toUpperCase()
        .split(/[\s,;]+/)
        .map((item) =>
          item.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function parseVisitDate(
  value: string,
) {
  if (!value) {
    return null;
  }

  const parsed =
    new Date(
      `${value}T12:00:00-03:00`,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return null;
  }

  return parsed;
}

async function addPresentedPropertiesAction(
  clientId: number,
  formData: FormData,
) {
  "use server";

  const access =
    await getAccessContext();

  if (
    !Number.isInteger(clientId) ||
    clientId <= 0
  ) {
    redirect(
      "/admin/clientes",
    );
  }

  const rawCodes = String(
    formData.get(
      "propertyCodes",
    ) ?? "",
  );

  const description = String(
    formData.get(
      "description",
    ) ?? "",
  )
    .trim()
    .slice(0, 5000);

  const codes =
    normalizePropertyCodes(
      rawCodes,
    );

  if (codes.length === 0) {
    redirect(
      `/admin/clientes/${clientId}?erro=imoveis`,
    );
  }

  const client =
    await prisma.client.findUnique({
      where: {
        id: clientId,
      },

      select: {
        id: true,
      },
    });

  if (!client) {
    notFound();
  }

  const properties =
    await prisma.property.findMany({
      where: {
        code: {
          in: codes,
        },
      },

      select: {
        id: true,
        code: true,
      },
    });

  const foundCodes =
    new Set(
      properties.map(
        (property) =>
          property.code.toUpperCase(),
      ),
    );

  const missingCodes =
    codes.filter(
      (code) =>
        !foundCodes.has(code),
    );

  if (
    properties.length === 0 ||
    missingCodes.length > 0
  ) {
    redirect(
      `/admin/clientes/${clientId}?erro=imoveis`,
    );
  }

  await prisma.commercialEvent.create({
    data: {
      clientId,

      agentId:
        access.agentId,

      type:
        "IMOVEIS_APRESENTADOS",

      description:
        description || null,

      properties: {
        create:
          properties.map(
            (property) => ({
              propertyId:
                property.id,
            }),
          ),
      },
    },
  });

  revalidatePath(
    `/admin/clientes/${clientId}`,
  );

  revalidatePath(
    "/admin/clientes",
  );

  for (const property of properties) {
    revalidatePath(
      `/admin/imoveis/${property.code.toLowerCase()}`,
    );
  }

  redirect(
    `/admin/clientes/${clientId}?ok=imoveis`,
  );
}

async function scheduleVisitAction(
  clientId: number,
  formData: FormData,
) {
  "use server";

  const access =
    await getAccessContext();

  if (
    !Number.isInteger(clientId) ||
    clientId <= 0
  ) {
    redirect(
      "/admin/clientes",
    );
  }

  const propertyCode =
    String(
      formData.get(
        "visitPropertyCode",
      ) ?? "",
    )
      .trim()
      .toUpperCase();

  const rawVisitDate =
    String(
      formData.get(
        "visitDate",
      ) ?? "",
    ).trim();

  const visitTime =
    String(
      formData.get(
        "visitTime",
      ) ?? "",
    )
      .trim()
      .slice(0, 10);

  const notes =
    String(
      formData.get(
        "visitNotes",
      ) ?? "",
    )
      .trim()
      .slice(0, 5000);

  const visitDate =
    parseVisitDate(
      rawVisitDate,
    );

  if (
    !propertyCode ||
    !visitDate
  ) {
    redirect(
      `/admin/clientes/${clientId}?erro=visita`,
    );
  }

  const [
    client,
    property,
  ] = await Promise.all([
    prisma.client.findUnique({
      where: {
        id: clientId,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        document: true,
        birthDate: true,
        address: true,
      },
    }),

    prisma.property.findUnique({
      where: {
        code: propertyCode,
      },

      select: {
        id: true,
        code: true,
        title: true,
      },
    }),
  ]);

  if (!client) {
    notFound();
  }

  if (!property) {
    redirect(
      `/admin/clientes/${clientId}?erro=visita`,
    );
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.propertyVisit.create({
        data: {
          propertyId:
            property.id,

          clientId:
            client.id,

          status:
            "AGENDADA",

          visitorName:
            client.name,

          visitorDocument:
            client.document,

          visitorPhone:
            client.phone,

          visitorEmail:
            client.email,

          visitorBirthDate:
            client.birthDate,

          visitorAddress:
            client.address,

          visitDate,

          visitTime:
            visitTime || null,

          notes:
            notes || null,
        },
      });

      const scheduleText = [
        `Visita agendada para o imóvel ${property.code} — ${property.title}.`,
        `Data: ${formatDateOnly(visitDate)}${visitTime ? ` às ${visitTime}` : ""}.`,
        notes
          ? `Observação: ${notes}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      await tx.commercialEvent.create({
        data: {
          clientId:
            client.id,

          agentId:
            access.agentId,

          type:
            "VISITA_AGENDADA",

          description:
            scheduleText,

          eventAt:
            new Date(),

          properties: {
            create: {
              propertyId:
                property.id,
            },
          },
        },
      });
    },
  );

  revalidatePath(
    `/admin/clientes/${clientId}`,
  );

  revalidatePath(
    "/admin/clientes",
  );

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );

  redirect(
    `/admin/clientes/${clientId}?ok=visita`,
  );
}

async function deleteClientAction(
  clientId: number,
  formData: FormData,
) {
  "use server";

  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    redirect(
      `/admin/clientes/${clientId}?erro=excluir-permissao`,
    );
  }

  if (
    !Number.isInteger(clientId) ||
    clientId <= 0
  ) {
    redirect(
      "/admin/clientes",
    );
  }

  const confirmation = String(
    formData.get(
      "deleteConfirmation",
    ) ?? "",
  )
    .trim()
    .toUpperCase();

  if (confirmation !== "EXCLUIR") {
    redirect(
      `/admin/clientes/${clientId}?erro=excluir-confirmacao`,
    );
  }

  const client =
    await prisma.client.findUnique({
      where: {
        id: clientId,
      },

      select: {
        id: true,
        _count: {
          select: {
            portalLeads: true,
            visits: true,
            proposals: true,
            rentalProposals: true,
            commercialEvents: true,
          },
        },
      },
    });

  if (!client) {
    notFound();
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.portalLead.updateMany({
        where: {
          clientId,
        },
        data: {
          clientId: null,
        },
      });

      await tx.propertyVisit.updateMany({
        where: {
          clientId,
        },
        data: {
          clientId: null,
        },
      });

      await tx.propertyProposal.updateMany({
        where: {
          clientId,
        },
        data: {
          clientId: null,
        },
      });

      await tx.propertyRentalProposal.updateMany({
        where: {
          clientId,
        },
        data: {
          clientId: null,
        },
      });

      await tx.client.delete({
        where: {
          id: clientId,
        },
      });
    },
  );

  revalidatePath(
    "/admin/clientes",
  );

  redirect(
    "/admin/clientes?ok=cliente-excluido",
  );
}

export default async function ClientePage({
  params,
  searchParams,
}: PageProps) {
  const access =
    await getAccessContext();

  const { id } =
    await params;

  const { erro, ok } =
    await searchParams;

  const clientId =
    Number(id);

  if (
    !Number.isInteger(clientId) ||
    clientId <= 0
  ) {
    notFound();
  }

  const client =
    await prisma.client.findUnique({
      where: {
        id: clientId,
      },

      include: {
        portalLeads: {
          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            propertyCode: true,
            propertyTitle: true,
            status: true,
            notes: true,
            createdAt: true,
            contactedAt: true,
          },
        },

        visits: {
          orderBy: {
            visitDate: "desc",
          },

          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },

        proposals: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },

            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        rentalProposals: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },

            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        commercialEvents: {
          orderBy: [
            {
              eventAt: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          include: {
            agent: {
              select: {
                id: true,
                name: true,
              },
            },

            lead: {
              select: {
                id: true,
                propertyCode: true,
              },
            },

            properties: {
              include: {
                property: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                  },
                },
              },

              orderBy: {
                property: {
                  code: "asc",
                },
              },
            },
          },
        },
      },
    });

  if (!client) {
    notFound();
  }

  const addPresentedAction =
    addPresentedPropertiesAction.bind(
      null,
      client.id,
    );

  const scheduleVisit =
    scheduleVisitAction.bind(
      null,
      client.id,
    );

  const deleteClient =
    deleteClientAction.bind(
      null,
      client.id,
    );

  const linkedHistoryCount =
    client.portalLeads.length +
    client.visits.length +
    client.proposals.length +
    client.rentalProposals.length +
    client.commercialEvents.length;

  const whatsappDigits =
    client.phone.replace(
      /\D/g,
      "",
    );

  const whatsappPhone =
    whatsappDigits.startsWith("55")
      ? whatsappDigits
      : `55${whatsappDigits}`;

  const whatsappMessage =
    encodeURIComponent(
      `Olá, ${client.name}. Sou da B&B Consultoria Imobiliária. Como podemos ajudar?`,
    );

  const latestEvent =
    client.commercialEvents[0] ??
    null;

  const relatedPropertyCodes =
    Array.from(
      new Set([
        ...client.portalLeads
          .map(
            (lead) =>
              lead.propertyCode,
          )
          .filter(
            (code) =>
              code &&
              code !== "GERAL",
          ),

        ...client.visits.map(
          (visit) =>
            visit.property.code,
        ),

        ...client.proposals.map(
          (proposal) =>
            proposal.property.code,
        ),

        ...client.rentalProposals.map(
          (proposal) =>
            proposal.property.code,
        ),

        ...client.commercialEvents.flatMap(
          (event) =>
            event.properties.map(
              (item) =>
                item.property.code,
            ),
        ),
      ]),
    );

  const scheduledVisits =
    client.visits.filter(
      (visit) =>
        visit.status === "AGENDADA",
    );

  const completedVisits =
    client.visits.filter(
      (visit) =>
        visit.status === "REALIZADA",
    );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-12 lg:px-10">
        <header className="border-b border-white/10 pb-8">
          <Link
            href="/admin/clientes"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400"
          >
            Voltar para clientes e leads
          </Link>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                Ficha do cliente
              </p>

              <h1 className="mt-3 font-serif text-5xl">
                {client.name}
              </h1>

              <p className="mt-4 text-sm text-zinc-400">
                Cliente #{client.id}
                {" · "}
                {
                  clientStatusLabels[
                    client.status
                  ]
                }
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-500 hover:text-black"
            >
              Abrir WhatsApp
            </a>
          </div>
        </header>

        {erro === "imoveis" ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-red-300">
              Não foi possível registrar
              os imóveis apresentados.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Confira se todos os códigos
              informados existem no CRM.
            </p>
          </div>
        ) : null}

        {erro === "visita" ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-red-300">
              Não foi possível agendar a visita.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Confira o código do imóvel e a
              data informada.
            </p>
          </div>
        ) : null}

        {erro === "excluir-confirmacao" ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-red-300">
              Exclusão não confirmada.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Para excluir definitivamente este cliente,
              digite EXCLUIR no campo de confirmação.
            </p>
          </div>
        ) : null}

        {erro === "excluir-permissao" ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-red-300">
              Apenas administradores podem excluir clientes.
            </p>
          </div>
        ) : null}

        {ok === "imoveis" ? (
          <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-emerald-300">
              Imóveis apresentados/enviados
              registrados com sucesso.
            </p>
          </div>
        ) : null}

        {ok === "visita" ? (
          <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-emerald-300">
              Visita agendada com sucesso.
            </p>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard
            label="Telefone"
            value={formatPhone(
              client.phone,
            )}
          />

          <InfoCard
            label="E-mail"
            value={
              client.email ||
              "Não informado"
            }
          />

          <InfoCard
            label="Imóveis relacionados"
            value={String(
              relatedPropertyCodes.length,
            )}
          />

          <InfoCard
            label="Visitas agendadas"
            value={String(
              scheduledVisits.length,
            )}
          />

          <InfoCard
            label="Visitas realizadas"
            value={String(
              completedVisits.length,
            )}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <article className="border border-white/10 bg-[#0a0a0a] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Dados do cliente
              </p>

              <div className="mt-5 space-y-4 text-sm">
                <DataRow
                  label="Nome"
                  value={client.name}
                />

                <DataRow
                  label="Telefone"
                  value={formatPhone(
                    client.phone,
                  )}
                />

                <DataRow
                  label="E-mail"
                  value={
                    client.email ||
                    "Não informado"
                  }
                />

                <DataRow
                  label="Documento"
                  value={
                    client.document ||
                    "Não informado"
                  }
                />

                <DataRow
                  label="Nascimento"
                  value={
                    client.birthDate
                      ? formatDateOnly(
                          client.birthDate,
                        )
                      : "Não informado"
                  }
                />

                <DataRow
                  label="Endereço"
                  value={
                    client.address ||
                    "Não informado"
                  }
                />

                <DataRow
                  label="Cadastro"
                  value={formatDate(
                    client.createdAt,
                  )}
                />
              </div>

              {client.notes ? (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Observações
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {client.notes}
                  </p>
                </div>
              ) : null}
            </article>

            {access.isAdmin ? (
              <article className="border border-red-500/30 bg-red-500/[0.04] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-300">
                  Administração
                </p>

                <h2 className="mt-2 font-serif text-2xl text-white">
                  Excluir cliente
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Esta ação exclui definitivamente o cadastro do cliente.
                  Leads, visitas e propostas permanecem no CRM sem vínculo
                  com este cliente. Os eventos da linha do tempo comercial,
                  que pertencem ao cadastro do cliente, serão excluídos junto
                  com ele.
                </p>

                {linkedHistoryCount > 0 ? (
                  <div className="mt-4 border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-300">
                      Atenção: este cliente possui {linkedHistoryCount} registro
                      {linkedHistoryCount === 1 ? "" : "s"} vinculado
                      {linkedHistoryCount === 1 ? "" : "s"} entre leads, visitas,
                      propostas e eventos comerciais.
                    </p>
                  </div>
                ) : null}

                <form
                  action={deleteClient}
                  className="mt-5 space-y-4"
                >
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                      Digite EXCLUIR para confirmar
                    </span>

                    <input
                      name="deleteConfirmation"
                      required
                      autoComplete="off"
                      placeholder="EXCLUIR"
                      className="min-h-12 w-full border border-red-500/30 bg-[#111] px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center border border-red-500/50 bg-red-500/10 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500 hover:text-white"
                  >
                    Excluir cliente definitivamente
                  </button>
                </form>
              </article>
            ) : null}

            <article className="border border-white/10 bg-[#0a0a0a] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Imóveis relacionados
              </p>

              {relatedPropertyCodes.length >
              0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {relatedPropertyCodes.map(
                    (code) => (
                      <Link
                        key={code}
                        href={`/admin/imoveis/${code.toLowerCase()}`}
                        className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white transition hover:border-amber-500/50 hover:text-amber-400"
                      >
                        {code}
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-zinc-500">
                  Nenhum imóvel relacionado
                  até o momento.
                </p>
              )}
            </article>

            <article className="border border-white/10 bg-[#0a0a0a] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Resumo comercial
              </p>

              <div className="mt-5 space-y-4 text-sm">
                <DataRow
                  label="Leads vinculados"
                  value={String(
                    client.portalLeads
                      .length,
                  )}
                />

                <DataRow
                  label="Visitas agendadas"
                  value={String(
                    scheduledVisits.length,
                  )}
                />

                <DataRow
                  label="Visitas realizadas"
                  value={String(
                    completedVisits.length,
                  )}
                />

                <DataRow
                  label="Propostas de compra"
                  value={String(
                    client.proposals.length,
                  )}
                />

                <DataRow
                  label="Propostas de locação"
                  value={String(
                    client.rentalProposals
                      .length,
                  )}
                />

                <DataRow
                  label="Eventos"
                  value={String(
                    client.commercialEvents
                      .length,
                  )}
                />

                <DataRow
                  label="Última movimentação"
                  value={
                    latestEvent
                      ? formatDate(
                          latestEvent.eventAt,
                        )
                      : "Ainda não registrada"
                  }
                />
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <article className="border border-amber-500/20 bg-[#0a0a0a] p-6 lg:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                Registrar atendimento
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Imóveis apresentados/enviados
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                Informe todos os imóveis
                apresentados ou enviados
                ao cliente nesta ação.
                Eles serão agrupados em
                um único evento da linha
                do tempo.
              </p>

              <form
                action={
                  addPresentedAction
                }
                className="mt-6 space-y-5"
              >
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Códigos dos imóveis
                  </span>

                  <input
                    name="propertyCodes"
                    required
                    placeholder="Ex.: BBC001, BBA015, BBC023, BBA021"
                    className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                  />

                  <span className="mt-2 block text-xs leading-5 text-zinc-600">
                    Separe os códigos por
                    vírgula, espaço ou
                    ponto e vírgula.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Observação opcional
                  </span>

                  <textarea
                    name="description"
                    maxLength={5000}
                    rows={3}
                    placeholder="Ex.: Opções enviadas pelo WhatsApp após qualificação do cliente."
                    className="w-full resize-y border border-white/15 bg-[#111] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center bg-amber-500 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
                >
                  Registrar imóveis enviados
                </button>
              </form>
            </article>

            <article className="border border-sky-500/20 bg-[#0a0a0a] p-6 lg:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">
                Próxima etapa
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Agendar visita
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                Registre a visita confirmada
                com o cliente. Ela será criada
                como agendada e entrará
                automaticamente na linha do
                tempo.
              </p>

              <form
                action={scheduleVisit}
                className="mt-6 space-y-5"
              >
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Código do imóvel
                  </span>

                  <input
                    name="visitPropertyCode"
                    required
                    placeholder="Ex.: BBC008"
                    className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm uppercase text-white outline-none placeholder:text-zinc-700 focus:border-sky-500"
                  />

                  {relatedPropertyCodes.length >
                  0 ? (
                    <span className="mt-2 block text-xs leading-5 text-zinc-600">
                      Relacionados:{" "}
                      {relatedPropertyCodes.join(
                        " · ",
                      )}
                    </span>
                  ) : null}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                      Data
                    </span>

                    <input
                      type="date"
                      name="visitDate"
                      required
                      className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                      Horário
                    </span>

                    <input
                      type="time"
                      name="visitTime"
                      className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Observação opcional
                  </span>

                  <textarea
                    name="visitNotes"
                    maxLength={5000}
                    rows={3}
                    placeholder="Ex.: Confirmado com proprietário. Encontrar cliente na portaria."
                    className="w-full resize-y border border-white/15 bg-[#111] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-sky-500"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center bg-sky-500 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-sky-400"
                >
                  Confirmar agendamento
                </button>
              </form>
            </article>

            <article className="border border-white/10 bg-[#0a0a0a] p-6 lg:p-8">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                    Andamento comercial
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">
                    Linha do tempo
                  </h2>
                </div>

                <p className="text-xs text-zinc-500">
                  {
                    client
                      .commercialEvents
                      .length
                  }{" "}
                  evento
                  {client
                    .commercialEvents
                    .length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              {client.commercialEvents
                .length === 0 ? (
                <div className="py-14 text-center">
                  <p className="font-serif text-2xl text-zinc-300">
                    Linha do tempo ainda
                    vazia
                  </p>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
                    Contato, qualificação,
                    imóveis apresentados,
                    visitas, propostas,
                    negociação e fechamento
                    aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="mt-8">
                  {client.commercialEvents.map(
                    (
                      event,
                      index,
                    ) => {
                      const properties =
                        event.properties.map(
                          (item) =>
                            item.property,
                        );

                      const amount =
                        formatCurrency(
                          event.amount,
                        );

                      return (
                        <div
                          key={event.id}
                          className="relative grid grid-cols-[22px_1fr] gap-4"
                        >
                          <div className="relative flex justify-center">
                            <span className="relative z-10 mt-1 h-3 w-3 rounded-full border-2 border-amber-400 bg-[#050505]" />

                            {index <
                            client
                              .commercialEvents
                              .length -
                              1 ? (
                              <span className="absolute bottom-0 top-4 w-px bg-white/10" />
                            ) : null}
                          </div>

                          <div className="pb-8">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-semibold text-white">
                                {
                                  commercialEventLabels[
                                    event
                                      .type
                                  ]
                                }
                              </p>

                              <span className="text-xs text-zinc-600">
                                {formatDate(
                                  event.eventAt,
                                )}
                              </span>
                            </div>

                            {properties.length >
                            0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {properties.map(
                                  (
                                    property,
                                  ) => (
                                    <Link
                                      key={
                                        property.id
                                      }
                                      href={`/admin/imoveis/${property.code.toLowerCase()}`}
                                      className="border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-black"
                                    >
                                      {
                                        property.code
                                      }
                                    </Link>
                                  ),
                                )}
                              </div>
                            ) : null}

                            {amount ? (
                              <p className="mt-3 text-sm font-semibold text-emerald-300">
                                {amount}
                              </p>
                            ) : null}

                            {event.description ? (
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                                {
                                  event.description
                                }
                              </p>
                            ) : null}

                            {event.agent ? (
                              <p className="mt-3 text-xs text-zinc-600">
                                Responsável:{" "}
                                {
                                  event.agent
                                    .name
                                }
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <article className="border border-white/10 bg-[#0a0a0a] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  Visitas
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Histórico de visitas
                </h2>
              </div>

              <p className="text-xs text-zinc-600">
                {client.visits.length} registro
                {client.visits.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            {client.visits.length ===
            0 ? (
              <p className="mt-5 text-sm text-zinc-500">
                Nenhuma visita vinculada
                a este cliente.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {client.visits.map(
                  (visit) => (
                    <div
                      key={visit.id}
                      className="border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/admin/imoveis/${visit.property.code.toLowerCase()}`}
                            className="font-semibold text-white hover:text-amber-400"
                          >
                            {
                              visit.property
                                .code
                            }
                          </Link>

                          <p className="mt-2 text-xs text-zinc-500">
                            {
                              visit.property
                                .title
                            }
                          </p>
                        </div>

                        <span
                          className={
                            visit.status ===
                            "AGENDADA"
                              ? "border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-300"
                              : visit.status ===
                                  "REALIZADA"
                                ? "border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300"
                                : "border border-zinc-500/30 bg-zinc-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400"
                          }
                        >
                          {
                            visitStatusLabels[
                              visit.status
                            ]
                          }
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>
                          {formatDateOnly(
                            visit.visitDate,
                          )}
                        </span>

                        {visit.visitTime ? (
                          <span>
                            · {visit.visitTime}
                          </span>
                        ) : null}
                      </div>

                      {visit.interest ? (
                        <p className="mt-3 text-xs text-zinc-400">
                          Interesse:{" "}
                          {visit.interest ===
                          "ALTO"
                            ? "Alto"
                            : visit.interest ===
                                "MEDIO"
                              ? "Médio"
                              : "Baixo"}
                        </p>
                      ) : null}

                      {visit.status ===
                      "AGENDADA" ? (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <Link
                            href={`/admin/imoveis/${visit.property.code.toLowerCase()}/fichas/visita?visitId=${visit.id}`}
                            className="inline-flex min-h-10 items-center justify-center border border-sky-500 px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sky-300 transition hover:bg-sky-500 hover:text-black"
                          >
                            Realizar visita
                          </Link>
                        </div>
                      ) : null}

                      {visit.status ===
                      "REALIZADA" ? (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <Link
                            href={`/admin/imoveis/${visit.property.code.toLowerCase()}/visitas/${visit.id}`}
                            className="inline-flex min-h-10 items-center justify-center border border-white/15 px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                          >
                            Abrir ficha da visita
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            )}
          </article>

          <article className="border border-white/10 bg-[#0a0a0a] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Propostas
            </p>

            {client.proposals.length ===
              0 &&
            client.rentalProposals
              .length === 0 ? (
              <p className="mt-5 text-sm text-zinc-500">
                Nenhuma proposta vinculada
                a este cliente.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {client.proposals.map(
                  (proposal) => (
                    <div
                      key={`sale-${proposal.id}`}
                      className="border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                          href={`/admin/imoveis/${proposal.property.code.toLowerCase()}`}
                          className="font-semibold text-white hover:text-amber-400"
                        >
                          {
                            proposal.property
                              .code
                          }
                        </Link>

                        <span className="border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300">
                          Compra
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {
                          proposal.property
                            .title
                        }
                      </p>

                      {formatCurrency(
                        proposal.offeredValue,
                      ) ? (
                        <p className="mt-3 text-sm font-semibold text-emerald-300">
                          {formatCurrency(
                            proposal.offeredValue,
                          )}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-zinc-500">
                        Status:{" "}
                        {proposal.status}
                      </p>
                    </div>
                  ),
                )}

                {client.rentalProposals.map(
                  (proposal) => (
                    <div
                      key={`rental-${proposal.id}`}
                      className="border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                          href={`/admin/imoveis/${proposal.property.code.toLowerCase()}`}
                          className="font-semibold text-white hover:text-amber-400"
                        >
                          {
                            proposal.property
                              .code
                          }
                        </Link>

                        <span className="border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-300">
                          Locação
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {
                          proposal.property
                            .title
                        }
                      </p>

                      <p className="mt-3 text-sm font-semibold text-emerald-300">
                        {formatCurrency(
                          proposal.offeredRentValue,
                        )}
                      </p>

                      <p className="mt-2 text-xs text-zinc-500">
                        Status:{" "}
                        {proposal.status}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="border border-white/10 bg-[#0b0b0b] p-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-lg font-semibold text-white">
        {value}
      </p>
    </article>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 border-b border-white/[0.06] pb-3 sm:grid-cols-[140px_1fr]">
      <span className="text-xs text-zinc-600">
        {label}
      </span>

      <span className="text-sm text-zinc-300">
        {value}
      </span>
    </div>
  );
}