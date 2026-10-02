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

function agentRole(formData: FormData) {
  const role = text(
    formData,
    "role",
  );

  if (role === "ADMIN") {
    return "ADMIN" as const;
  }

  if (role === "CAPTADOR") {
    return "CAPTADOR" as const;
  }

  return null;
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

function validatePassword(password: string) {
  if (password.length < 12) {
    throw new Error(
      "A senha deve ter pelo menos 12 caracteres.",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new Error(
      "A senha deve conter pelo menos uma letra minúscula.",
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error(
      "A senha deve conter pelo menos uma letra maiúscula.",
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new Error(
      "A senha deve conter pelo menos um número.",
    );
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error(
      "A senha deve conter pelo menos um caractere especial.",
    );
  }
}

export async function createAgent(formData: FormData) {
  await requireAdmin();

  const name = text(formData, "name");
  const email = text(formData, "email")?.toLowerCase();
  const password = text(formData, "password");
  const role = agentRole(formData);

  if (!name || !email || !password || !role) {
    throw new Error(
      "Nome, e-mail e senha são obrigatórios.",
    );
  }

  validatePassword(password);

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
      role,
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
  const role = agentRole(formData);

  if (!name || !email || !role) {
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

  if (password !== null) {
    validatePassword(password);
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
      role,

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
  const currentUser =
    await requireAdmin();

  const agent =
    await prisma.agent.findUnique({
      where: {
        id,
      },
      select: {
        active: true,
        role: true,
        email: true,
      },
    });

  if (!agent) {
    throw new Error(
      "Usuario nao encontrado.",
    );
  }

  if (
    agent.active &&
    currentUser.email &&
    agent.email.toLowerCase() ===
      currentUser.email.toLowerCase()
  ) {
    throw new Error(
      "Voce nao pode desativar o proprio acesso.",
    );
  }

  if (
    agent.active &&
    agent.role === "ADMIN"
  ) {
    const activeAdmins =
      await prisma.agent.count({
        where: {
          role: "ADMIN",
          active: true,
        },
      });

    if (activeAdmins <= 1) {
      throw new Error(
        "O sistema precisa manter pelo menos um Administrador ativo.",
      );
    }
  }

  await prisma.agent.update({
    where: {
      id,
    },
    data: {
      active: !agent.active,
    },
  });

  revalidatePath(
    "/admin/captadores",
  );
}
