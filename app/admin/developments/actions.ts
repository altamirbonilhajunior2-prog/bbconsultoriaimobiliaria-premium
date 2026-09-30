"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";

type DevelopmentType =
  | "CONDOMINIO"
  | "EDIFICIO";

function text(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function normalizeName(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

function parseType(
  value: FormDataEntryValue | null,
): DevelopmentType {
  return value === "EDIFICIO"
    ? "EDIFICIO"
    : "CONDOMINIO";
}

export async function createDevelopment(
  formData: FormData,
) {
  await requireAdmin();

  const type =
    parseType(
      formData.get("type"),
    );

  const name =
    text(
      formData,
      "name",
    );

  const state =
    (
      text(
        formData,
        "state",
      ) ?? "SP"
    ).toUpperCase();

  const city =
    text(
      formData,
      "city",
    );

  const neighborhood =
    text(
      formData,
      "neighborhood",
    );

  if (
    !name ||
    !city ||
    !neighborhood
  ) {
    throw new Error(
      "Preencha nome, cidade e bairro.",
    );
  }

  if (state.length !== 2) {
    throw new Error(
      "Informe a UF com 2 caracteres.",
    );
  }

  if (name.length > 180) {
    throw new Error(
      "O nome deve ter no máximo 180 caracteres.",
    );
  }

  if (city.length > 120) {
    throw new Error(
      "A cidade deve ter no máximo 120 caracteres.",
    );
  }

  if (
    neighborhood.length > 150
  ) {
    throw new Error(
      "O bairro deve ter no máximo 150 caracteres.",
    );
  }

  const normalizedName =
    normalizeName(name);

  await prisma.development.create({
    data: {
      type,
      name,
      normalizedName,
      state,
      city,
      neighborhood,
      active: true,
    },
  });

  revalidatePath(
    "/admin/condominios",
  );

  revalidatePath(
    "/admin/edificios",
  );
}

export async function toggleDevelopment(
  formData: FormData,
) {
  await requireAdmin();

  const idValue =
    text(
      formData,
      "id",
    );

  if (!idValue) {
    throw new Error(
      "Cadastro inválido.",
    );
  }

  const id =
    Number(idValue);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Cadastro inválido.",
    );
  }

  const existing =
    await prisma.development.findUnique({
      where: {
        id,
      },

      select: {
        active: true,
      },
    });

  if (!existing) {
    throw new Error(
      "Condomínio ou edifício não encontrado.",
    );
  }

  await prisma.development.update({
    where: {
      id,
    },

    data: {
      active:
        !existing.active,
    },
  });

  revalidatePath(
    "/admin/condominios",
  );

  revalidatePath(
    "/admin/edificios",
  );
}