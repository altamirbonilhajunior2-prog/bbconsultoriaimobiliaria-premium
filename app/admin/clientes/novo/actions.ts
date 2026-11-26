"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";
import { insertManualClient, parseManualClient } from "../../../../lib/clients/manual-client";

export type NewClientState = { error?: string; existingClientId?: number };

export async function createClientAction(_state: NewClientState, form: FormData): Promise<NewClientState> {
  const access = await getAccessContext();
  let input;
  try { input = parseManualClient(form); }
  catch (error) { return { error: error instanceof Error ? error.message : "Confira os dados do cadastro." }; }
  let result;
  try {
    result = await prisma.$transaction(tx => insertManualClient(tx, input, access));
  } catch {
    return { error: "Não foi possível salvar. Confira os imóveis selecionados e tente novamente. Seus dados continuam no formulário." };
  }
  if (result.duplicate) {
    return { error: "Já existe um cliente com este telefone na carteira. Abra a ficha existente para evitar duplicidade.", existingClientId: result.id };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  for (const code of input.propertyCodes) revalidatePath(`/admin/imoveis/${code.toLowerCase()}`);
  redirect(`/admin/clientes/${result.id}?ok=novo-cliente`);
}
