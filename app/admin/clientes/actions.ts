"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getAccessContext,
} from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";

const allowedStatuses = [
  "NOVO",
  "CONTATADO",
  "QUALIFICADO",
  "VISITA_AGENDADA",
  "PROPOSTA",
  "EM_NEGOCIACAO",
  "CONVERTIDO",
  "ENCERRADO",
] as const;

type AllowedStatus =
  (typeof allowedStatuses)[number];

function statusRepresentsQualification(
  status: AllowedStatus,
) {
  return [
    "QUALIFICADO",
    "VISITA_AGENDADA",
    "PROPOSTA",
    "EM_NEGOCIACAO",
    "CONVERTIDO",
  ].includes(status);
}

export async function updatePortalLeadAction(
  formData: FormData,
) {
  const access =
    await getAccessContext();

  const leadId = Number.parseInt(
    String(
      formData.get("leadId") ??
        "",
    ),
    10,
  );

  const status = String(
    formData.get("status") ?? "",
  ) as AllowedStatus;

  const notes = String(
    formData.get("notes") ?? "",
  )
    .trim()
    .slice(0, 5000);

  if (
    !Number.isInteger(leadId) ||
    leadId <= 0 ||
    !allowedStatuses.includes(status)
  ) {
    redirect("/admin/clientes");
  }

  const existingLead =
    await prisma.portalLead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
        clientId: true,
        propertyId: true,
        propertyCode: true,
        propertyTitle: true,
        status: true,
        notes: true,
        createdAt: true,
        contactedAt: true,

        client: {
          select: {
            agentId: true,
          },
        },
      },
    });

  if (!existingLead) {
    redirect("/admin/clientes");
  }

  if (
    !access.isAdmin &&
    existingLead.client?.agentId !== null &&
    existingLead.client?.agentId !==
      access.agentId
  ) {
    throw new Error(
      "Você não tem permissão para alterar o atendimento deste cliente.",
    );
  }

  const contactedAt =
    status !== "NOVO" &&
    !existingLead.contactedAt
      ? new Date()
      : existingLead.contactedAt;

  await prisma.$transaction(
    async (tx) => {
      if (
        existingLead.clientId &&
        existingLead.client?.agentId === null &&
        access.agentId
      ) {
        await tx.client.update({
          where: {
            id:
              existingLead.clientId,
          },

          data: {
            agentId:
              access.agentId,
          },
        });
      }

      await tx.portalLead.update({
        where: {
          id: leadId,
        },

        data: {
          status,

          notes:
            notes ||
            null,

          contactedAt,
        },
      });

      if (
        !existingLead.clientId ||
        existingLead.status === status
      ) {
        return;
      }

      let eventType:
        | "CONTATO_REALIZADO"
        | "CLIENTE_QUALIFICADO"
        | "NEGOCIO_CONCLUIDO"
        | "PERDIDO_ENCERRADO"
        | null = null;

      if (status === "CONTATADO") {
        eventType =
          "CONTATO_REALIZADO";
      }

      if (status === "QUALIFICADO") {
        eventType =
          "CLIENTE_QUALIFICADO";
      }

      if (status === "CONVERTIDO") {
        eventType =
          "NEGOCIO_CONCLUIDO";
      }

      if (status === "ENCERRADO") {
        eventType =
          "PERDIDO_ENCERRADO";
      }

      if (!eventType) {
        return;
      }

      const existingEvent =
        await tx.commercialEvent.findFirst({
          where: {
            clientId:
              existingLead.clientId,

            leadId:
              existingLead.id,

            type:
              eventType,
          },

          select: {
            id: true,
          },
        });

      if (existingEvent) {
        return;
      }

      await tx.commercialEvent.create({
        data: {
          clientId:
            existingLead.clientId,

          agentId:
            access.agentId,

          leadId:
            existingLead.id,

          type:
            eventType,

          description:
            notes ||
            null,

          eventAt:
            eventType ===
              "CONTATO_REALIZADO" &&
            contactedAt
              ? contactedAt
              : new Date(),

          ...(existingLead.propertyId
            ? {
                properties: {
                  create: {
                    propertyId:
                      existingLead.propertyId,
                  },
                },
              }
            : {}),
        },
      });
    },
  );

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");

  if (existingLead.clientId) {
    revalidatePath(
      `/admin/clientes/${existingLead.clientId}`,
    );
  }

  redirect("/admin/clientes");
}

export async function convertPortalLeadToClientAction(
  leadId: number,
) {
  const access =
    await getAccessContext();

  if (
    !Number.isInteger(leadId) ||
    leadId <= 0
  ) {
    throw new Error(
      "Lead inválido.",
    );
  }

  const lead =
    await prisma.portalLead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
        name: true,
        phone: true,

        clientId: true,

        client: {
          select: {
            agentId: true,
          },
        },

        propertyId: true,
        propertyCode: true,
        propertyTitle: true,

        status: true,
        notes: true,

        createdAt: true,
        contactedAt: true,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead não encontrado.",
    );
  }

  if (
    lead.clientId &&
    !access.isAdmin &&
    lead.client?.agentId !== null &&
    lead.client?.agentId !==
      access.agentId
  ) {
    throw new Error(
      "Este lead já está vinculado à carteira de outro corretor.",
    );
  }

  if (lead.clientId) {
    if (
      lead.client?.agentId === null &&
      access.agentId
    ) {
      await prisma.client.update({
        where: {
          id:
            lead.clientId,
        },

        data: {
          agentId:
            access.agentId,
        },
      });
    }

    revalidatePath(
      "/admin/clientes",
    );

    revalidatePath(
      `/admin/clientes/${lead.clientId}`,
    );

    return;
  }

  const existingClient =
    await prisma.client.findFirst({
      where: {
        phone:
          lead.phone,

        ...(access.isAdmin
          ? {}
          : {
              OR: [
                {
                  agentId:
                    access.agentId ??
                    -1,
                },

                {
                  agentId: null,
                },
              ],
            }),
      },

      orderBy: {
        createdAt:
          "asc",
      },

      select: {
        id: true,
        agentId: true,
      },
    });

  const clientId =
    await prisma.$transaction(
      async (tx) => {
        let resolvedClientId =
          existingClient?.id;

        if (!resolvedClientId) {
          const client =
            await tx.client.create({
              data: {
                name:
                  lead.name,

                phone:
                  lead.phone,

                agentId:
                  access.agentId ??
                  null,
              },

              select: {
                id: true,
              },
            });

          resolvedClientId =
            client.id;
        } else if (
          existingClient &&
          existingClient.agentId === null &&
          access.agentId
        ) {
          await tx.client.update({
            where: {
              id:
                existingClient.id,
            },

            data: {
              agentId:
                access.agentId,
            },
          });
        }

        await tx.portalLead.update({
          where: {
            id:
              lead.id,
          },

          data: {
            clientId:
              resolvedClientId,
          },
        });

        const propertyRelation =
          lead.propertyId
            ? {
                properties: {
                  create: {
                    propertyId:
                      lead.propertyId,
                  },
                },
              }
            : {};

        await tx.commercialEvent.create({
          data: {
            clientId:
              resolvedClientId,

            agentId:
              access.agentId,

            leadId:
              lead.id,

            type:
              "NOVO_CONTATO",

            description:
              lead.propertyCode ===
              "GERAL"
                ? "Novo contato recebido para atendimento geral B&B."
                : `Novo contato interessado no imóvel ${lead.propertyCode} — ${lead.propertyTitle}.`,

            eventAt:
              lead.createdAt,

            ...propertyRelation,
          },
        });

        if (
          lead.contactedAt ||
          lead.status !== "NOVO"
        ) {
          await tx.commercialEvent.create({
            data: {
              clientId:
                resolvedClientId,

              agentId:
                access.agentId,

              leadId:
                lead.id,

              type:
                "CONTATO_REALIZADO",

              description:
                lead.status ===
                  "CONTATADO" &&
                lead.notes
                  ? lead.notes
                  : null,

              eventAt:
                lead.contactedAt ??
                lead.createdAt,

              ...propertyRelation,
            },
          });
        }

        if (
          statusRepresentsQualification(
            lead.status,
          )
        ) {
          await tx.commercialEvent.create({
            data: {
              clientId:
                resolvedClientId,

              agentId:
                access.agentId,

              leadId:
                lead.id,

              type:
                "CLIENTE_QUALIFICADO",

              description:
                lead.notes ||
                "Cliente qualificado para continuidade do atendimento comercial.",

              eventAt:
                new Date(),

              ...propertyRelation,
            },
          });
        }

        if (
          lead.status ===
          "CONVERTIDO"
        ) {
          await tx.commercialEvent.create({
            data: {
              clientId:
                resolvedClientId,

              agentId:
                access.agentId,

              leadId:
                lead.id,

              type:
                "NEGOCIO_CONCLUIDO",

              description:
                lead.notes ||
                null,

              eventAt:
                new Date(),

              ...propertyRelation,
            },
          });
        }

        if (
          lead.status ===
          "ENCERRADO"
        ) {
          await tx.commercialEvent.create({
            data: {
              clientId:
                resolvedClientId,

              agentId:
                access.agentId,

              leadId:
                lead.id,

              type:
                "PERDIDO_ENCERRADO",

              description:
                lead.notes ||
                "Atendimento encerrado.",

              eventAt:
                new Date(),

              ...propertyRelation,
            },
          });
        }

        return resolvedClientId;
      },
    );

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");

  revalidatePath(
    `/admin/clientes/${clientId}`,
  );
}

export async function deletePortalLeadAction(
  leadId: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir leads.",
    );
  }

  if (
    !Number.isInteger(leadId) ||
    leadId <= 0
  ) {
    throw new Error(
      "Lead inválido.",
    );
  }

  const existingLead =
    await prisma.portalLead.findUnique({
      where: {
        id:
          leadId,
      },

      select: {
        id: true,
        clientId: true,
      },
    });

  if (!existingLead) {
    revalidatePath("/admin");

    revalidatePath(
      "/admin/clientes",
    );

    return;
  }

  await prisma.portalLead.delete({
    where: {
      id:
        leadId,
    },
  });

  revalidatePath("/admin");

  revalidatePath(
    "/admin/clientes",
  );

  if (existingLead.clientId) {
    revalidatePath(
      `/admin/clientes/${existingLead.clientId}`,
    );
  }
}

export async function deleteWhatsAppLeadIntentAction(
  intentId: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir registros de WhatsApp.",
    );
  }

  if (
    !Number.isInteger(intentId) ||
    intentId <= 0
  ) {
    throw new Error(
      "Registro de WhatsApp inválido.",
    );
  }

  const existingIntent =
    await prisma.whatsAppLeadIntent.findUnique({
      where: {
        id: intentId,
      },

      select: {
        id: true,
      },
    });

  if (!existingIntent) {
    revalidatePath("/admin");
    revalidatePath("/admin/clientes");

    return;
  }

  await prisma.whatsAppLeadIntent.delete({
    where: {
      id:
        intentId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
}