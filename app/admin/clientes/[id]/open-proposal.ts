"use server";

import { notFound, redirect } from "next/navigation";
import { getAccessContext } from "../../../../lib/admin/access";
import { clientScope } from "../../../../lib/admin/proposal-source";
import { prisma } from "../../../../lib/prisma";

export async function openClientProposal(clientId: number, formData: FormData) {
  const access = await getAccessContext();
  const client = await prisma.client.findFirst({
    where: { id: clientId, ...clientScope(access) }, select: { id: true },
  });
  if (!client) notFound();
  const code = String(formData.get("proposalPropertyCode") ?? "").replace(/\s/g, "").toUpperCase();
  const kind = formData.get("proposalKind");
  const property = await prisma.property.findUnique({
    where: { code }, select: { code: true, purpose: true },
  });
  if (!property || (kind !== "proposta" && kind !== "proposta-locacao") ||
    (kind === "proposta" && property.purpose === "LOCACAO") ||
    (kind === "proposta-locacao" && property.purpose === "VENDA")) {
    redirect(`/admin/clientes/${client.id}?erro=proposta`);
  }
  redirect(`/admin/imoveis/${property.code.toLowerCase()}/fichas/${kind}?clientId=${client.id}`);
}
