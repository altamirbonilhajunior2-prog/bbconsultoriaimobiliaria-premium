"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getAccessContext } from "../../../lib/admin/access";

function text(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeName(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const normalized = value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " ",
    )
    .trim()
    .replace(/\s+/g, " ");

  return normalized || null;
}

function levenshteinDistance(
  first: string,
  second: string,
) {
  if (first === second) {
    return 0;
  }

  if (first.length === 0) {
    return second.length;
  }

  if (second.length === 0) {
    return first.length;
  }

  const previousRow =
    Array.from(
      {
        length:
          second.length + 1,
      },
      (_, index) => index,
    );

  for (
    let firstIndex = 1;
    firstIndex <= first.length;
    firstIndex += 1
  ) {
    const currentRow: number[] =
      [firstIndex];

    for (
      let secondIndex = 1;
      secondIndex <= second.length;
      secondIndex += 1
    ) {
      const insertion =
        currentRow[
          secondIndex - 1
        ] + 1;

      const deletion =
        previousRow[
          secondIndex
        ] + 1;

      const substitution =
        previousRow[
          secondIndex - 1
        ] +
        (
          first[
            firstIndex - 1
          ] ===
          second[
            secondIndex - 1
          ]
            ? 0
            : 1
        );

      currentRow[
        secondIndex
      ] = Math.min(
        insertion,
        deletion,
        substitution,
      );
    }

    for (
      let index = 0;
      index < currentRow.length;
      index += 1
    ) {
      previousRow[index] =
        currentRow[index];
    }
  }

  return previousRow[
    second.length
  ];
}

function namesAreSimilar(
  first: string | null,
  second: string | null,
) {
  const normalizedFirst =
    normalizeName(first);

  const normalizedSecond =
    normalizeName(second);

  if (
    !normalizedFirst ||
    !normalizedSecond
  ) {
    return false;
  }

  if (
    normalizedFirst ===
    normalizedSecond
  ) {
    return true;
  }

  const firstWords =
    normalizedFirst.split(" ");

  const secondWords =
    normalizedSecond.split(" ");

  /*
   * Detecta nome parcial que seja
   * o início completo do outro.
   *
   * Exemplo:
   * "alejandro enrique"
   * "alejandro enrique lopes flores"
   */
  if (
    firstWords.length >= 2 &&
    secondWords.length >= 2
  ) {
    const shorter =
      normalizedFirst.length <=
      normalizedSecond.length
        ? normalizedFirst
        : normalizedSecond;

    const longer =
      normalizedFirst.length >
      normalizedSecond.length
        ? normalizedFirst
        : normalizedSecond;

    if (
      longer.startsWith(
        `${shorter} `,
      )
    ) {
      return true;
    }
  }

  if (
    normalizedFirst.length < 8 ||
    normalizedSecond.length < 8
  ) {
    return false;
  }

  const longestLength =
    Math.max(
      normalizedFirst.length,
      normalizedSecond.length,
    );

  const distance =
    levenshteinDistance(
      normalizedFirst,
      normalizedSecond,
    );

  const similarity =
    1 -
    distance /
      longestLength;

  return similarity >= 0.92;
}

function normalizeCpf(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const digits =
    value.replace(/\D/g, "");

  return digits || null;
}

function normalizePhone(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const digits =
    value.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (
    digits.length === 13 &&
    digits.startsWith("55")
  ) {
    return digits.slice(2);
  }

  return digits;
}

function normalizeEmail(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  return normalized || null;
}

function integerOrNull(
  value:
    | FormDataEntryValue
    | null,
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const numeric =
    Number(value);

  return Number.isInteger(
    numeric,
  )
    ? numeric
    : null;
}

async function ownerIsDuplicate({
  name,
  cpf,
  phone,
  email,
  ignoreOwnerId,
}: {
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  ignoreOwnerId?: number;
}) {
  const owners =
    await prisma.owner.findMany({
      where:
        ignoreOwnerId !== undefined
          ? {
              id: {
                not: ignoreOwnerId,
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        email: true,
      },
    });

  const duplicatedName =
    owners.some(
      (owner) =>
        namesAreSimilar(
          owner.name,
          name,
        ),
    );

  if (duplicatedName) {
    return true;
  }

  if (cpf) {
    const duplicatedCpf =
      owners.some(
        (owner) =>
          normalizeCpf(
            owner.cpf,
          ) === cpf,
      );

    if (duplicatedCpf) {
      return true;
    }
  }

  if (email) {
    const duplicatedEmail =
      owners.some(
        (owner) =>
          normalizeEmail(
            owner.email,
          ) === email,
      );

    if (duplicatedEmail) {
      return true;
    }
  }

  if (phone) {
    const duplicatedPhone =
      owners.some(
        (owner) =>
          normalizePhone(
            owner.phone,
          ) === phone,
      );

    if (duplicatedPhone) {
      return true;
    }
  }

  return false;
}

export async function createOwner(
  formData: FormData,
) {
  const access =
    await getAccessContext();

  const name =
    text(
      formData,
      "name",
    );

  if (!name) {
    throw new Error(
      "Informe o nome do proprietário.",
    );
  }

  const rawPhone =
    text(
      formData,
      "phone",
    );

  const rawEmail =
    text(
      formData,
      "email",
    );

  const cpf =
    normalizeCpf(
      text(
        formData,
        "cpf",
      ),
    );

  const normalizedPhone =
    normalizePhone(
      rawPhone,
    );

  const normalizedEmail =
    normalizeEmail(
      rawEmail,
    );

  const duplicated =
    await ownerIsDuplicate({
      name,
      cpf,
      phone:
        normalizedPhone,
      email:
        normalizedEmail,
    });

  if (duplicated) {
    redirect(
      "/admin/proprietarios/novo?erro=duplicado",
    );
  }

  let capturedById:
    | number
    | null = null;

  if (access.isAdmin) {
    capturedById =
      integerOrNull(
        formData.get(
          "capturedById",
        ),
      );

    if (
      capturedById !== null
    ) {
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

    capturedById =
      access.agentId;
  }

  await prisma.owner.create({
    data: {
      name,

      phone:
        rawPhone,

      email:
        normalizedEmail,

      rg:
        text(
          formData,
          "rg",
        ),

      cpf,

      address:
        text(
          formData,
          "address",
        ),

      complement:
        text(
          formData,
          "complement",
        ),

      neighborhood:
        text(
          formData,
          "neighborhood",
        ),

      city:
        text(
          formData,
          "city",
        ),

      state:
        text(
          formData,
          "state",
        )?.toUpperCase() ??
        null,

      zipCode:
        text(
          formData,
          "zipCode",
        ),

      notes:
        text(
          formData,
          "notes",
        ),

      capturedById,
    },
  });

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/proprietarios",
  );

  redirect(
    "/admin/proprietarios",
  );
}

export async function updateOwner(
  id: number,
  formData: FormData,
) {
  const access =
    await getAccessContext();

  const owner =
    await prisma.owner.findFirst({
      where: {
        id,

        ...(access.isAdmin
          ? {}
          : {
              capturedById:
                access.agentId ??
                -1,
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

  const name =
    text(
      formData,
      "name",
    );

  if (!name) {
    throw new Error(
      "Informe o nome do proprietário.",
    );
  }

  const rawPhone =
    text(
      formData,
      "phone",
    );

  const rawEmail =
    text(
      formData,
      "email",
    );

  const cpf =
    normalizeCpf(
      text(
        formData,
        "cpf",
      ),
    );

  const normalizedPhone =
    normalizePhone(
      rawPhone,
    );

  const normalizedEmail =
    normalizeEmail(
      rawEmail,
    );

  const duplicated =
    await ownerIsDuplicate({
      name,
      cpf,
      phone:
        normalizedPhone,
      email:
        normalizedEmail,
      ignoreOwnerId:
        id,
    });

  if (duplicated) {
    redirect(
      `/admin/proprietarios/${id}?erro=duplicado`,
    );
  }

  let capturedById =
    owner.capturedById;

  if (access.isAdmin) {
    capturedById =
      integerOrNull(
        formData.get(
          "capturedById",
        ),
      );

    if (
      capturedById !== null
    ) {
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
        rawPhone,

      email:
        normalizedEmail,

      rg:
        text(
          formData,
          "rg",
        ),

      cpf,

      address:
        text(
          formData,
          "address",
        ),

      complement:
        text(
          formData,
          "complement",
        ),

      neighborhood:
        text(
          formData,
          "neighborhood",
        ),

      city:
        text(
          formData,
          "city",
        ),

      state:
        text(
          formData,
          "state",
        )?.toUpperCase() ??
        null,

      zipCode:
        text(
          formData,
          "zipCode",
        ),

      notes:
        text(
          formData,
          "notes",
        ),

      capturedById,
    },
  });

  revalidatePath(
    "/admin/proprietarios",
  );

  revalidatePath(
    `/admin/proprietarios/${id}`,
  );

  redirect(
    "/admin/proprietarios",
  );
}

export async function deleteOwner(
  id: number,
) {
  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    throw new Error(
      "Apenas administradores podem excluir proprietários.",
    );
  }

  const owner =
    await prisma.owner.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

  if (!owner) {
    throw new Error(
      "Proprietário não encontrado.",
    );
  }

  await prisma.owner.delete({
    where: {
      id,
    },
  });

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/proprietarios",
  );

  redirect(
    "/admin/proprietarios",
  );
}
