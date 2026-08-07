"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export type PublicationActionState = {
  success: boolean;
  message: string;
};

function normalizeCode(
  value: FormDataEntryValue | null,
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export async function updatePublicationAction(
  _previousState: PublicationActionState,
  formData: FormData,
): Promise<PublicationActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const code = normalizeCode(
    formData.get("code"),
  );

  const action = String(
    formData.get("publicationAction") ?? "",
  );

  if (!code) {
    return {
      success: false,
      message:
        "Não foi possível identificar o imóvel.",
    };
  }

  if (
    action !== "publish" &&
    action !== "unpublish"
  ) {
    return {
      success: false,
      message:
        "Ação de publicação inválida.",
    };
  }

  const property =
    await prisma.property.findUnique({
      where: {
        code,
      },

      select: {
        id: true,
        code: true,
        published: true,
      },
    });

  if (!property) {
    return {
      success: false,
      message:
        "O imóvel não foi encontrado no banco de dados.",
    };
  }

  const shouldPublish =
    action === "publish";

  if (
    property.published ===
    shouldPublish
  ) {
    return {
      success: true,
      message: shouldPublish
        ? `O imóvel ${code} já está publicado.`
        : `O imóvel ${code} já está fora do ar.`,
    };
  }

  try {
    await prisma.property.update({
      where: {
        code,
      },

      data: {
        published:
          shouldPublish,

        publishedAt:
          shouldPublish
            ? new Date()
            : null,
      },
    });

    revalidatePath(
      "/admin",
    );

    revalidatePath(
      "/admin/imoveis",
    );

    return {
      success: true,

      message:
        shouldPublish
          ? `Imóvel ${code} publicado com sucesso.`
          : `Imóvel ${code} retirado do ar com sucesso.`,
    };
  } catch (error) {
    console.error(
      "Erro ao alterar publicação do imóvel:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível alterar o status de publicação.",
    };
  }
}