"use server";

import { revalidatePath } from "next/cache";
import { getAccessContext } from "../../../../lib/admin/access";
import { executeTimelineDeletion, planTimelineDeletion, TimelineDeletionError } from "../../../../lib/admin/timeline-deletion";
import { prisma } from "../../../../lib/prisma";

export async function previewTimelineDeletion(clientId: number, eventId: number) {
  const access=await getAccessContext();
  if (!access.isAdmin) return {error:"Somente administradores podem excluir etapas."};
  try { return {plan:await planTimelineDeletion(prisma,clientId,eventId)}; }
  catch(error) { return {error:error instanceof TimelineDeletionError ? error.message : "Não foi possível conferir esta etapa. Tente novamente."}; }
}

export async function deleteTimelineEvent(clientId: number, eventId: number, token: string, choiceKey: string) {
  const access=await getAccessContext();
  if (!access.isAdmin) return {error:"Somente administradores podem excluir etapas."};
  try {
    const codes=await prisma.$transaction(tx=>executeTimelineDeletion(tx,clientId,eventId,token,choiceKey),{isolationLevel:"Serializable"});
    revalidatePath(`/admin/clientes/${clientId}`);
    revalidatePath("/admin/clientes");
    revalidatePath("/admin");
    for (const code of codes) revalidatePath(`/admin/imoveis/${code.toLowerCase()}`,"layout");
    return {success:true};
  } catch(error) {
    return {error:error instanceof TimelineDeletionError ? error.message : "Não foi possível excluir. Os dados podem ter mudado; atualize a página e tente novamente."};
  }
}
