"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "../../../lib/admin/access";
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

export async function updatePortalLeadAction(formData: FormData) {
  await requireUser();

  const leadId = Number.parseInt(String(formData.get("leadId") ?? ""), 10);
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 5000);

  if (
    !Number.isInteger(leadId) ||
    leadId <= 0 ||
    !allowedStatuses.includes(status as (typeof allowedStatuses)[number])
  ) {
    redirect("/admin/clientes");
  }

  const existingLead = await prisma.portalLead.findUnique({
    where: { id: leadId },
    select: { contactedAt: true },
  });

  if (!existingLead) redirect("/admin/clientes");

  await prisma.portalLead.update({
    where: { id: leadId },
    data: {
      status: status as (typeof allowedStatuses)[number],
      notes: notes || null,
      contactedAt:
        status !== "NOVO" && !existingLead.contactedAt
          ? new Date()
          : existingLead.contactedAt,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}
