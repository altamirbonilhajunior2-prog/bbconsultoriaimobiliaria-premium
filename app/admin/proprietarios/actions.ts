"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getAccessContext } from "../../../lib/admin/access";

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

function integerOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const numeric = Number(value);

  return Number.isInteger(numeric)
    ? numeric
    : null;
}

export async function createOwner(formData: FormData) {
  const access = await getAccessContext();

  const name = text(formData, "name");

  if (!name) {
    throw new Error("Informe o nome do proprietário.");
  }

  const cpf = normalizeCpf(
    text(formData, "cpf"),
  );

  if (cpf) {
    const existing =
      await prisma.owner.findUnique({
        where: {
          cpf,
        },
      });

    if (existing) {
      throw new Error(
        "Já existe um proprietário cadastrado com este CPF.",
      );
    }
  }

  let capturedById: number | null = null;

  if (access.isAdmin) {
    capturedById = integerOrNull(
      formData.get("capturedById"),
    );

    if (capturedById !== null) {
      const agent =
        await prisma.agent.findFirst({
          where: {
            id: capturedById,
            active: true,
          },
          select: {
            id: true,
          },
        });

      if (!agent) {
        throw new Error(
          "Captador selecionado não está disponível.",
        );
      }
    }
  } else {
    if (!access.agentId) {
      throw new Error(
        "Captador não identificado.",
      );
    }

    capturedById = access.agentId;
  }

  await prisma.owner.create({
    data: {
      name,
      phone: text(formData, "phone"),

      email:
        text(formData, "email")
          ?.toLowerCase() ?? null,

      rg: text(formData, "rg"),
      cpf,

      address:
        text(formData, "address"),

      complement:
        text(formData, "complement"),

      neighborhood:
        text(formData, "neighborhood"),

      city:
        text(formData, "city"),

      state:
        text(formData, "state")
          ?.toUpperCase() ?? null,

      zipCode:
        text(formData, "zipCode"),

      notes:
        text(formData, "notes"),

      capturedById,
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
  const access = await getAccessContext();

  const owner =
    await prisma.owner.findFirst({
      where: {
        id,

        ...(access.isAdmin
          ? {}
          : {
              capturedById:
                access.agentId ?? -1,
            }),
      },

      select: {
        id: true,
        capturedById: true,
      },
    });

  if (!owner) {
    throw new Error(
      "Proprietário não encontrado ou acesso não autorizado.",
    );
  }

  const name = text(formData, "name");

  if (!name) {
    throw new Error(
      "Informe o nome do proprietário.",
    );
  }

  const cpf = normalizeCpf(
    text(formData, "cpf"),
  );

  if (cpf) {
    const existing =
      await prisma.owner.findFirst({
        where: {
          cpf,

          id: {
            not: id,
          },
        },
      });

    if (existing) {
      throw new Error(
        "Já existe outro proprietário cadastrado com este CPF.",
      );
    }
  }

  let capturedById =
    owner.capturedById;

  if (access.isAdmin) {
    capturedById = integerOrNull(
      formData.get("capturedById"),
    );

    if (capturedById !== null) {
      const agent =
        await prisma.agent.findFirst({
          where: {
            id: capturedById,
            active: true,
          },

          select: {
            id: true,
          },
        });

      if (!agent) {
        throw new Error(
          "Captador selecionado não está disponível.",
        );
      }
    }
  }

  await prisma.owner.update({
    where: {
      id,
    },

    data: {
      name,

      phone:
        text(formData, "phone"),

      email:
        text(formData, "email")
          ?.toLowerCase() ?? null,

      rg:
        text(formData, "rg"),

      cpf,

      address:
        text(formData, "address"),

      complement:
        text(formData, "complement"),

      neighborhood:
        text(formData, "neighborhood"),

      city:
        text(formData, "city"),

      state:
        text(formData, "state")
          ?.toUpperCase() ?? null,

      zipCode:
        text(formData, "zipCode"),

      notes:
        text(formData, "notes"),

      capturedById,
    },
  });

  revalidatePath(
    "/admin/proprietarios",
  );

  revalidatePath(
    `/admin/proprietarios/${id}`,
  );

  redirect("/admin/proprietarios");
}