"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

function text(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeCpf(value: string | null) {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");

  return digits || null;
}

export async function createOwner(formData: FormData) {
  const name = text(formData, "name");

  if (!name) {
    throw new Error("Informe o nome do proprietário.");
  }

  const cpf = normalizeCpf(text(formData, "cpf"));

  if (cpf) {
    const existing = await prisma.owner.findUnique({
      where: { cpf },
    });

    if (existing) {
      throw new Error("Já existe um proprietário cadastrado com este CPF.");
    }
  }

  await prisma.owner.create({
    data: {
      name,
      phone: text(formData, "phone"),
      email: text(formData, "email")?.toLowerCase() ?? null,
      rg: text(formData, "rg"),
      cpf,
      address: text(formData, "address"),
      complement: text(formData, "complement"),
      neighborhood: text(formData, "neighborhood"),
      city: text(formData, "city"),
      state: text(formData, "state")?.toUpperCase() ?? null,
      zipCode: text(formData, "zipCode"),
      notes: text(formData, "notes"),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/proprietarios");

  redirect("/admin/proprietarios");
}

export async function updateOwner(
  id: number,
  formData: FormData,
) {
  const name = text(formData, "name");

  if (!name) {
    throw new Error("Informe o nome do proprietário.");
  }

  const cpf = normalizeCpf(text(formData, "cpf"));

  if (cpf) {
    const existing = await prisma.owner.findFirst({
      where: {
        cpf,
        id: {
          not: id,
        },
      },
    });

    if (existing) {
      throw new Error("Já existe outro proprietário cadastrado com este CPF.");
    }
  }

  await prisma.owner.update({
    where: { id },
    data: {
      name,
      phone: text(formData, "phone"),
      email: text(formData, "email")?.toLowerCase() ?? null,
      rg: text(formData, "rg"),
      cpf,
      address: text(formData, "address"),
      complement: text(formData, "complement"),
      neighborhood: text(formData, "neighborhood"),
      city: text(formData, "city"),
      state: text(formData, "state")?.toUpperCase() ?? null,
      zipCode: text(formData, "zipCode"),
      notes: text(formData, "notes"),
    },
  });

  revalidatePath("/admin/proprietarios");
  revalidatePath(`/admin/proprietarios/${id}`);

  redirect("/admin/proprietarios");
}