"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getAccessContext,
  requireUser,
} from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";

const allowedStatuses = [
  "NOVO",
  "CONTATADO",
  "VISITA_AGENDADA",
  "PROPOSTA",
  "EM_NEGOCIACAO",
  "CONVERTIDO",
  "ENCERRADO",
] as const;

export async function updatePortalLeadAction(
  formData: FormData,
) {
  await requireUser();

  const leadId = Number.parseInt(
    String(
      formData.get("leadId") ??
        "",
    ),
    10,
  );

  const status = String(
    formData.get("status") ??
      "",
  );

  const notes = String(
    formData.get("notes") ??
      "",
  )
    .trim()
    .slice(0, 5000);

  if (
    !Number.isInteger(
      leadId,
    ) ||
    leadId <= 0 ||
    !allowedStatuses.includes(
      status as (typeof allowedStatuses)[number],
    )
  ) {
    redirect(
      "/admin/clientes",
    );
  }

  const existingLead =
    await prisma.portalLead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        contactedAt: true,
      },
    });

  if (!existingLead) {
    redirect(
      "/admin/clientes",
    );
  }

  await prisma.portalLead.update({
    where: {
      id: leadId,
    },

    data: {
      status:
        status as (typeof allowedStatuses)[number],

      notes:
        notes ||
        null,

      contactedAt:
        status !== "NOVO" &&
        !existingLead.contactedAt
          ? new Date()
          : existingLead.contactedAt,
    },
  });

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/clientes",
  );

  redirect(
    "/admin/clientes",
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
    !Number.isInteger(
      leadId,
    ) ||
    leadId <= 0
  ) {
    throw new Error(
      "Lead inválido.",
    );
  }

  const existingLead =
    await prisma.portalLead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
      },
    });

  if (!existingLead) {
    revalidatePath(
      "/admin",
    );

    revalidatePath(
      "/admin/clientes",
    );

    return;
  }

  await prisma.portalLead.delete({
    where: {
      id: leadId,
    },
  });

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/clientes",
  );
}