"use server";

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin/access";

const scryptAsync = promisify(scrypt);

function text(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

async function createPassword(password: string) {
  const salt = randomBytes(32).toString("hex");

  const derivedKey = (await scryptAsync(
    password,
    salt,
    64,
  )) as Buffer;

  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

export async function createAgent(formData: FormData) {
  await requireAdmin();

  const name = text(formData, "name");
  const email = text(formData, "email")?.toLowerCase();
  const password = text(formData, "password");

  if (!name || !email || !password) {
    throw new Error(
      "Nome, e-mail e senha são obrigatórios.",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "A senha deve ter pelo menos 8 caracteres.",
    );
  }

  const existing = await prisma.agent.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    throw new Error(
      "Já existe um captador cadastrado com este e-mail.",
    );
  }

  const credentials = await createPassword(password);

  await prisma.agent.create({
    data: {
      name,
      email,
      phone: text(formData, "phone"),
      creci: text(formData, "creci"),
      role: "CAPTADOR",
      active: true,
      passwordHash: credentials.hash,
      passwordSalt: credentials.salt,
    },
  });

  revalidatePath("/admin/captadores");

  redirect("/admin/captadores");
}

export async function updateAgent(
  id: number,
  formData: FormData,
) {
  await requireAdmin();

  const name = text(formData, "name");
  const email = text(formData, "email")?.toLowerCase();
  const password = text(formData, "password");

  if (!name || !email) {
    throw new Error(
      "Nome e e-mail são obrigatórios.",
    );
  }

  const duplicate = await prisma.agent.findFirst({
    where: {
      email,
      id: {
        not: id,
      },
    },
  });

  if (duplicate) {
    throw new Error(
      "Já existe outro captador com este e-mail.",
    );
  }

  const passwordData =
    password !== null
      ? await createPassword(password)
      : null;

  await prisma.agent.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      phone: text(formData, "phone"),
      creci: text(formData, "creci"),

      ...(passwordData
        ? {
            passwordHash: passwordData.hash,
            passwordSalt: passwordData.salt,
          }
        : {}),
    },
  });

  revalidatePath("/admin/captadores");
  revalidatePath(`/admin/captadores/${id}`);

  redirect("/admin/captadores");
}

export async function toggleAgent(
  id: number,
) {
  await requireAdmin();

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    select: {
      active: true,
    },
  });

  if (!agent) {
    throw new Error("Captador não encontrado.");
  }

  await prisma.agent.update({
    where: {
      id,
    },
    data: {
      active: !agent.active,
    },
  });

  revalidatePath("/admin/captadores");
}