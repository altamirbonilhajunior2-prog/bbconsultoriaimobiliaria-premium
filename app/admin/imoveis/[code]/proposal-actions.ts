"use server";

import { revalidatePath } from "next/cache";

import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

function getOptionalText(
  formData: FormData,
  field: string,
) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function parseCurrency(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const numericValue =
    Number(normalized);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : null;
}

function formatCurrency(
  value:
    | number
    | null,
) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function parseCommercialStage(
  value: string | null,
) {
  if (
    value === "CONTRAPROPOSTA" ||
    value === "NEGOCIACAO" ||
    value === "ACEITA" ||
    value === "DOCUMENTACAO" ||
    value === "CONCLUIDO" ||
    value === "PERDIDO"
  ) {
    return value;
  }

  throw new Error(
    "Etapa comercial inválida.",
  );
}

export async function updatePropertyProposalCommercialStage(
  propertyCode: string,
  proposalId: number,
  formData: FormData,
) {
  const access =
    await getAccessContext();

  const normalizedCode =
    propertyCode
      .trim()
      .toUpperCase();

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          normalizedCode,
      },

      select: {
        id: true,
        code: true,
        title: true,
        status: true,
      },
    });

  if (!property) {
    throw new Error(
      "Imóvel não encontrado.",
    );
  }

  const proposal =
    await prisma.propertyProposal.findFirst({
      where: {
        id:
          proposalId,

        propertyId:
          property.id,
      },

      select: {
        id: true,
        clientId: true,
        agentId: true,
        proposerName: true,
        offeredValue: true,
        counterOfferValue: true,
        counterOfferTerms: true,
        counterOfferNotes: true,
        status: true,
      },
    });

  if (!proposal) {
    throw new Error(
      "Proposta não encontrada.",
    );
  }

  if (
    !access.isAdmin &&
    proposal.agentId !==
      access.agentId
  ) {
    throw new Error(
      "Você não tem permissão para atualizar esta proposta.",
    );
  }

  const stage =
    parseCommercialStage(
      getOptionalText(
        formData,
        "commercialStage",
      ),
    );

  const counterOfferValue =
    parseCurrency(
      getOptionalText(
        formData,
        "counterOfferValue",
      ),
    );

  const counterOfferTerms =
    getOptionalText(
      formData,
      "counterOfferTerms",
    );

  const counterOfferNotes =
    getOptionalText(
      formData,
      "counterOfferNotes",
    );

  const negotiationNotes =
    getOptionalText(
      formData,
      "negotiationNotes",
    );

  const offeredValue =
    proposal.offeredValue
      ? Number(
          proposal.offeredValue.toString(),
        )
      : null;

  const previousCounterOfferValue =
    proposal.counterOfferValue
      ? Number(
          proposal.counterOfferValue.toString(),
        )
      : null;

  await prisma.$transaction(
    async (tx) => {
      if (
        stage ===
        "CONTRAPROPOSTA"
      ) {
        await tx.propertyProposal.update({
          where: {
            id:
              proposal.id,
          },

          data: {
            status:
              "CONTRAPROPOSTA",

            counterOfferValue:
              counterOfferValue ??
              proposal.counterOfferValue,

            counterOfferTerms:
              counterOfferTerms ??
              proposal.counterOfferTerms,

            counterOfferNotes:
              counterOfferNotes ??
              proposal.counterOfferNotes,
          },
        });
      }

      if (
        stage ===
        "ACEITA"
      ) {
        await tx.propertyProposal.update({
          where: {
            id:
              proposal.id,
          },

          data: {
            status:
              "ACEITA",
          },
        });
      }

      if (
        stage ===
        "PERDIDO"
      ) {
        await tx.propertyProposal.update({
          where: {
            id:
              proposal.id,
          },

          data: {
            status:
              "RECUSADA",
          },
        });
      }

      if (
        proposal.clientId
      ) {
        let eventType:
          | "CONTRAPROPOSTA"
          | "NEGOCIACAO"
          | "PROPOSTA_ACEITA"
          | "DOCUMENTACAO"
          | "NEGOCIO_CONCLUIDO"
          | "PERDIDO_ENCERRADO";

        let amount:
          | number
          | null =
          null;

        let description =
          "";

        if (
          stage ===
          "CONTRAPROPOSTA"
        ) {
          eventType =
            "CONTRAPROPOSTA";

          amount =
            counterOfferValue ??
            previousCounterOfferValue;

          const amountLabel =
            formatCurrency(
              amount,
            );

          description = [
            `Contraproposta registrada para o imóvel ${property.code} — ${property.title}.`,

            amountLabel
              ? `Valor da contraproposta: ${amountLabel}.`
              : null,

            counterOfferTerms
              ? `Condições: ${counterOfferTerms}`
              : null,

            counterOfferNotes
              ? `Observações: ${counterOfferNotes}`
              : null,
          ]
            .filter(Boolean)
            .join("\n");
        } else if (
          stage ===
          "NEGOCIACAO"
        ) {
          eventType =
            "NEGOCIACAO";

          amount =
            previousCounterOfferValue ??
            offeredValue;

          description =
            negotiationNotes
              ? `Negociação em andamento para o imóvel ${property.code} — ${property.title}.\n${negotiationNotes}`
              : `Negociação em andamento para o imóvel ${property.code} — ${property.title}.`;
        } else if (
          stage ===
          "ACEITA"
        ) {
          eventType =
            "PROPOSTA_ACEITA";

          amount =
            previousCounterOfferValue ??
            offeredValue;

          description =
            `Proposta aceita para o imóvel ${property.code} — ${property.title}.`;
        } else if (
          stage ===
          "DOCUMENTACAO"
        ) {
          eventType =
            "DOCUMENTACAO";

          amount =
            previousCounterOfferValue ??
            offeredValue;

          description =
            negotiationNotes
              ? `Documentação iniciada para o imóvel ${property.code} — ${property.title}.\n${negotiationNotes}`
              : `Documentação iniciada para o imóvel ${property.code} — ${property.title}.`;
        } else if (
          stage ===
          "CONCLUIDO"
        ) {
          eventType =
            "NEGOCIO_CONCLUIDO";

          amount =
            previousCounterOfferValue ??
            offeredValue;

          description =
            negotiationNotes
              ? `Negócio concluído para o imóvel ${property.code} — ${property.title}.\n${negotiationNotes}`
              : `Negócio concluído para o imóvel ${property.code} — ${property.title}.`;
        } else {
          eventType =
            "PERDIDO_ENCERRADO";

          amount =
            previousCounterOfferValue ??
            offeredValue;

          description =
            negotiationNotes
              ? `Negociação encerrada para o imóvel ${property.code} — ${property.title}.\n${negotiationNotes}`
              : `Negociação encerrada para o imóvel ${property.code} — ${property.title}.`;
        }

        await tx.commercialEvent.create({
          data: {
            clientId:
              proposal.clientId,

            agentId:
              access.agentId ??
              proposal.agentId,

            type:
              eventType,

            amount,

            description,

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
      }
    },
  );

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );

  revalidatePath(
    "/admin/clientes",
  );

  if (proposal.clientId) {
    revalidatePath(
      `/admin/clientes/${proposal.clientId}`,
    );
  }
}

export async function finalizePropertySale(
  propertyCode: string,
  proposalId: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem finalizar uma venda.",
    );
  }

  const normalizedCode =
    propertyCode
      .trim()
      .toUpperCase();

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          normalizedCode,
      },

      select: {
        id: true,
        code: true,
        title: true,
        status: true,
      },
    });

  if (!property) {
    throw new Error(
      "Imóvel não encontrado.",
    );
  }

  const proposal =
    await prisma.propertyProposal.findFirst({
      where: {
        id:
          proposalId,

        propertyId:
          property.id,
      },

      select: {
        id: true,
        clientId: true,
        status: true,
      },
    });

  if (!proposal) {
    throw new Error(
      "Proposta não encontrada.",
    );
  }

  if (!proposal.clientId) {
    throw new Error(
      "A proposta precisa estar vinculada a um cliente para finalizar a venda.",
    );
  }

  if (
    proposal.status !==
    "ACEITA"
  ) {
    throw new Error(
      "Somente uma proposta aceita pode finalizar a venda.",
    );
  }

  const completedEvent =
    await prisma.commercialEvent.findFirst({
      where: {
        clientId:
          proposal.clientId,

        type:
          "NEGOCIO_CONCLUIDO",

        properties: {
          some: {
            propertyId:
              property.id,
          },
        },
      },

      select: {
        id: true,
      },
    });

  if (!completedEvent) {
    throw new Error(
      "Registre primeiro a etapa “Negócio concluído” antes de finalizar a venda.",
    );
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.property.update({
        where: {
          id:
            property.id,
        },

        data: {
          status:
            "VENDIDO",
        },
      });

      await tx.client.update({
        where: {
          id:
            proposal.clientId!,
        },

        data: {
          status:
            "CONVERTIDO",
        },
      });
    },
  );

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );

  revalidatePath(
    "/admin/imoveis",
  );

  revalidatePath(
    `/imovel/${property.code.toLowerCase()}`,
  );

  revalidatePath(
    "/admin/clientes",
  );

  revalidatePath(
    `/admin/clientes/${proposal.clientId}`,
  );
}

export async function deletePropertyProposal(
  propertyCode: string,
  proposalId: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir propostas.",
    );
  }

  const normalizedCode =
    propertyCode
      .trim()
      .toUpperCase();

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          normalizedCode,
      },

      select: {
        id: true,
        code: true,
      },
    });

  if (!property) {
    throw new Error(
      "Imóvel não encontrado.",
    );
  }

  const proposal =
    await prisma.propertyProposal.findFirst({
      where: {
        id:
          proposalId,

        propertyId:
          property.id,
      },

      select: {
        id: true,
      },
    });

  if (!proposal) {
    throw new Error(
      "Proposta não encontrada.",
    );
  }

  await prisma.propertyProposal.delete({
    where: {
      id:
        proposal.id,
    },
  });

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );
}

export async function deletePropertyRentalProposal(
  propertyCode: string,
  proposalId: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir propostas.",
    );
  }

  const normalizedCode =
    propertyCode
      .trim()
      .toUpperCase();

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          normalizedCode,
      },

      select: {
        id: true,
        code: true,
      },
    });

  if (!property) {
    throw new Error(
      "Imóvel não encontrado.",
    );
  }

  const proposal =
    await prisma.propertyRentalProposal.findFirst({
      where: {
        id:
          proposalId,

        propertyId:
          property.id,
      },

      select: {
        id: true,
      },
    });

  if (!proposal) {
    throw new Error(
      "Proposta de locação não encontrada.",
    );
  }

  await prisma.propertyRentalProposal.delete({
    where: {
      id:
        proposal.id,
    },
  });

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );
}