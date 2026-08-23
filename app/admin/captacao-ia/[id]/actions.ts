"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

function getOpportunityId(
  formData: FormData,
) {
  const rawId = String(
    formData.get("opportunityId") ?? "",
  ).trim();

  const opportunityId =
    Number.parseInt(rawId, 10);

  if (
    !Number.isInteger(opportunityId) ||
    opportunityId <= 0
  ) {
    return null;
  }

  return opportunityId;
}

export async function registerContactAction(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  const opportunityId =
    getOpportunityId(formData);

  if (!opportunityId) {
    redirect("/admin/captacao-ia");
  }

  const opportunity =
    await prisma.acquisitionOpportunity.findUnique({
      where: {
        id: opportunityId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!opportunity) {
    redirect("/admin/captacao-ia");
  }

  const canRegisterContact =
    opportunity.status === "ENCONTRADO" ||
    opportunity.status === "SELECIONADO";

  if (canRegisterContact) {
    await prisma.acquisitionOpportunity.update({
      where: {
        id: opportunity.id,
      },

      data: {
        status: "CONTATADO",
        contactedAt: new Date(),
      },
    });
  }

  revalidatePath(
    "/admin/captacao-ia",
  );

  revalidatePath(
    `/admin/captacao-ia/${opportunity.id}`,
  );

  revalidatePath(
    "/admin",
  );

  redirect(
    `/admin/captacao-ia/${opportunity.id}`,
  );
}