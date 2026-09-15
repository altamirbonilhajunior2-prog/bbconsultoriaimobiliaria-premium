"use server";

import { revalidatePath } from "next/cache";

import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

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
        code: normalizedCode,
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
        id: proposalId,
        propertyId: property.id,
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
      id: proposal.id,
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
  const access = await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir propostas.",
    );
  }

  const normalizedCode = propertyCode.trim().toUpperCase();
  const property = await prisma.property.findUnique({
    where: {
      code: normalizedCode,
    },
    select: {
      id: true,
      code: true,
    },
  });

  if (!property) {
    throw new Error("Imóvel não encontrado.");
  }

  const proposal = await prisma.propertyRentalProposal.findFirst({
    where: {
      id: proposalId,
      propertyId: property.id,
    },
    select: {
      id: true,
    },
  });

  if (!proposal) {
    throw new Error("Proposta de locação não encontrada.");
  }

  await prisma.propertyRentalProposal.delete({
    where: {
      id: proposal.id,
    },
  });

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );
}
