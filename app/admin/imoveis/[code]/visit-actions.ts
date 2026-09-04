"use server";

import { revalidatePath } from "next/cache";

import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

export async function deletePropertyVisit(
  propertyCode: string,
  visitId: number,
) {
  const access = await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir visitas.",
    );
  }

  const normalizedCode =
    propertyCode.trim().toUpperCase();

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

  const visit =
    await prisma.propertyVisit.findFirst({
      where: {
        id: visitId,
        propertyId: property.id,
      },

      select: {
        id: true,
      },
    });

  if (!visit) {
    throw new Error(
      "Visita não encontrada.",
    );
  }

  await prisma.propertyVisit.delete({
    where: {
      id: visit.id,
    },
  });

  revalidatePath(
    `/admin/imoveis/${property.code.toLowerCase()}`,
  );
}