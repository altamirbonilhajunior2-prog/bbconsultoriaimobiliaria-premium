"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";

export type DeletePropertyResult = {
  success: boolean;
  message: string;
};

function normalizeCode(
  value: string,
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function isVercelBlobUrl(
  value: string,
) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    );
  } catch {
    return false;
  }
}

async function removeBlobUrls(
  urls: string[],
) {
  const blobUrls =
    Array.from(
      new Set(
        urls.filter(
          isVercelBlobUrl,
        ),
      ),
    );

  if (blobUrls.length === 0) {
    return;
  }

  const results =
    await Promise.allSettled(
      blobUrls.map(
        (url) =>
          del(url),
      ),
    );

  const failed =
    results.filter(
      (result) =>
        result.status ===
        "rejected",
    );

  if (failed.length > 0) {
    console.error(
      `O imóvel foi excluído, mas ${failed.length} arquivo(s) do Vercel Blob não puderam ser removidos.`,
    );
  }
}

export async function deletePropertyAction(
  codeValue: string,
): Promise<DeletePropertyResult> {
  const session =
    await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const access =
    await getAccessContext();

  if (!access.isAdmin) {
    return {
      success: false,
      message:
        "Somente administradores podem excluir imóveis.",
    };
  }

  const code =
    normalizeCode(
      codeValue,
    );

  if (!code) {
    return {
      success: false,
      message:
        "Código do imóvel não informado.",
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

        images: {
          select: {
            url: true,
          },
        },

        _count: {
          select: {
            portalLeads: true,
            whatsAppLeadIntents:
              true,
            visits: true,
            proposals: true,
            rentalProposals: true,
            commercialEventProperties:
              true,
          },
        },
      },
    });

  if (!property) {
    return {
      success: false,
      message:
        "Imóvel não encontrado.",
    };
  }

  if (property.published) {
    return {
      success: false,
      message:
        "Despublique o imóvel antes de excluí-lo.",
    };
  }

  const hasCommercialHistory =
    property._count.portalLeads >
      0 ||
    property._count
      .whatsAppLeadIntents >
      0 ||
    property._count.visits >
      0 ||
    property._count.proposals >
      0 ||
    property._count
      .rentalProposals >
      0 ||
    property._count
      .commercialEventProperties >
      0;

  if (hasCommercialHistory) {
    return {
      success: false,
      message:
        "Este imóvel possui histórico comercial vinculado e não pode ser excluído por esta função.",
    };
  }

  const imageUrls =
    property.images.map(
      (image) =>
        image.url,
    );

  try {
    await prisma.property.delete({
      where: {
        id: property.id,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao excluir imóvel:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível excluir o imóvel.",
    };
  }

  try {
    await removeBlobUrls(
      imageUrls,
    );
  } catch (error) {
    console.error(
      "O imóvel foi excluído, mas ocorreu erro ao remover arquivos do Vercel Blob:",
      error,
    );
  }

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/imoveis",
  );

  revalidatePath(
    `/admin/imoveis/${code.toLowerCase()}`,
  );

  revalidatePath(
    `/imovel/${code.toLowerCase()}`,
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/comprar",
  );

  revalidatePath(
    "/alugar",
  );

  revalidatePath(
    "/lancamentos",
  );

  return {
    success: true,
    message:
      `Imóvel ${code} excluído com sucesso.`,
  };
}