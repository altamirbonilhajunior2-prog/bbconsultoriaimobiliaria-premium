"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export type ImageActionState = {
  success: boolean;
  message: string;
};

export type UploadedImageInput = {
  url: string;
  alt?: string;
};

function normalizeCode(
  value: FormDataEntryValue | null,
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function normalizeCodeString(
  value: string,
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function parseImageId(
  value: FormDataEntryValue | null,
) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
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

async function validateImage(
  code: string,
  imageId: number,
) {
  return prisma.propertyImage.findFirst({
    where: {
      id: imageId,

      property: {
        code,
      },
    },

    select: {
      id: true,
      propertyId: true,
      position: true,
      isCover: true,
      url: true,
    },
  });
}

async function normalizePositions(
  propertyId: number,
) {
  const images =
    await prisma.propertyImage.findMany({
      where: {
        propertyId,
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          id: "asc",
        },
      ],

      select: {
        id: true,
      },
    });

  await prisma.$transaction(
    images.map((image, index) =>
      prisma.propertyImage.update({
        where: {
          id: image.id,
        },

        data: {
          position: index,
        },
      }),
    ),
  );
}

function refreshPropertyPages(
  code: string,
) {
  const normalizedCode =
    code.toLowerCase();

  revalidatePath(
    `/admin/imoveis/${normalizedCode}`,
  );

  revalidatePath(
    `/imovel/${normalizedCode}`,
  );

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/imoveis",
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

  revalidatePath(
    "/",
  );
}

export async function registerUploadedImagesAction(
  codeValue: string,
  uploadedImages: UploadedImageInput[],
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const code =
    normalizeCodeString(
      codeValue,
    );

  if (!code) {
    return {
      success: false,
      message:
        "Código do imóvel não informado.",
    };
  }

  const cleanImages =
    uploadedImages
      .map((image) => ({
        url: String(
          image.url ?? "",
        ).trim(),

        alt: String(
          image.alt ?? "",
        ).trim(),
      }))
      .filter(
        (image) =>
          image.url &&
          isVercelBlobUrl(
            image.url,
          ),
      );

  if (cleanImages.length === 0) {
    return {
      success: false,
      message:
        "Nenhuma imagem válida foi recebida.",
    };
  }

  const property =
    await prisma.property.findUnique({
      where: {
        code,
      },

      select: {
        id: true,
      },
    });

  if (!property) {
    return {
      success: false,
      message:
        "Imóvel não encontrado.",
    };
  }

  try {
    await normalizePositions(
      property.id,
    );

    const existingImages =
      await prisma.propertyImage.findMany({
        where: {
          propertyId:
            property.id,
        },

        orderBy: [
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
        },
      });

    const firstPosition =
      existingImages.length;

    await prisma.propertyImage.createMany({
      data: cleanImages.map(
        (image, index) => ({
          propertyId:
            property.id,

          url:
            image.url,

          alt:
            image.alt ||
            `${code} - Foto ${
              firstPosition +
              index +
              1
            }`,

          position:
            firstPosition +
            index,

          isCover:
            existingImages.length ===
              0 &&
            index === 0,
        }),
      ),
    });

    refreshPropertyPages(code);

    return {
      success: true,
      message:
        cleanImages.length === 1
          ? "1 nova fotografia adicionada com sucesso."
          : `${cleanImages.length} novas fotografias adicionadas com sucesso.`,
    };
  } catch (error) {
    console.error(
      "Erro ao registrar imagens enviadas:",
      error,
    );

    return {
      success: false,
      message:
        "As fotos foram enviadas, mas não foi possível registrá-las no banco de dados.",
    };
  }
}

export async function setCoverImageAction(
  _previousState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const code =
    normalizeCode(
      formData.get("code"),
    );

  const imageId =
    parseImageId(
      formData.get("imageId"),
    );

  if (!code || !imageId) {
    return {
      success: false,
      message:
        "Não foi possível identificar a imagem.",
    };
  }

  const image =
    await validateImage(
      code,
      imageId,
    );

  if (!image) {
    return {
      success: false,
      message:
        "A imagem não foi encontrada neste imóvel.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.propertyImage.updateMany({
        where: {
          propertyId:
            image.propertyId,
        },

        data: {
          isCover: false,
        },
      }),

      prisma.propertyImage.update({
        where: {
          id: image.id,
        },

        data: {
          isCover: true,
        },
      }),
    ]);

    refreshPropertyPages(code);

    return {
      success: true,
      message:
        "Imagem de capa atualizada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao definir imagem de capa:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível alterar a imagem de capa.",
    };
  }
}

export async function moveImageAction(
  _previousState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const code =
    normalizeCode(
      formData.get("code"),
    );

  const imageId =
    parseImageId(
      formData.get("imageId"),
    );

  const direction =
    String(
      formData.get(
        "direction",
      ) ?? "",
    );

  if (
    !code ||
    !imageId ||
    !["up", "down"].includes(
      direction,
    )
  ) {
    return {
      success: false,
      message:
        "Dados inválidos para reorganizar a imagem.",
    };
  }

  const image =
    await validateImage(
      code,
      imageId,
    );

  if (!image) {
    return {
      success: false,
      message:
        "A imagem não foi encontrada neste imóvel.",
    };
  }

  try {
    await normalizePositions(
      image.propertyId,
    );

    const orderedImages =
      await prisma.propertyImage.findMany({
        where: {
          propertyId:
            image.propertyId,
        },

        orderBy: {
          position: "asc",
        },

        select: {
          id: true,
          position: true,
        },
      });

    const currentIndex =
      orderedImages.findIndex(
        (item) =>
          item.id === imageId,
      );

    if (currentIndex === -1) {
      return {
        success: false,
        message:
          "Não foi possível localizar a posição da imagem.",
      };
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        orderedImages.length
    ) {
      return {
        success: false,
        message:
          direction === "up"
            ? "Esta imagem já é a primeira da galeria."
            : "Esta imagem já é a última da galeria.",
      };
    }

    const current =
      orderedImages[
        currentIndex
      ];

    const target =
      orderedImages[
        targetIndex
      ];

    await prisma.$transaction([
      prisma.propertyImage.update({
        where: {
          id: current.id,
        },

        data: {
          position:
            target.position,
        },
      }),

      prisma.propertyImage.update({
        where: {
          id: target.id,
        },

        data: {
          position:
            current.position,
        },
      }),
    ]);

    refreshPropertyPages(code);

    return {
      success: true,
      message:
        "Ordem das imagens atualizada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao reorganizar imagem:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível reorganizar a imagem.",
    };
  }
}

export async function removeImageAction(
  _previousState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message:
        "Sessão expirada. Faça login novamente.",
    };
  }

  const code =
    normalizeCode(
      formData.get("code"),
    );

  const imageId =
    parseImageId(
      formData.get("imageId"),
    );

  if (!code || !imageId) {
    return {
      success: false,
      message:
        "Não foi possível identificar a imagem.",
    };
  }

  const image =
    await validateImage(
      code,
      imageId,
    );

  if (!image) {
    return {
      success: false,
      message:
        "A imagem não foi encontrada neste imóvel.",
    };
  }

  try {
    await prisma.propertyImage.delete({
      where: {
        id: image.id,
      },
    });

    await normalizePositions(
      image.propertyId,
    );

    if (image.isCover) {
      const firstImage =
        await prisma.propertyImage.findFirst({
          where: {
            propertyId:
              image.propertyId,
          },

          orderBy: {
            position: "asc",
          },

          select: {
            id: true,
          },
        });

      if (firstImage) {
        await prisma.propertyImage.update({
          where: {
            id: firstImage.id,
          },

          data: {
            isCover: true,
          },
        });
      }
    }

    /*
      As imagens antigas do BBC0001 estão em /public,
      portanto não são apagadas fisicamente.

      Somente arquivos hospedados no Vercel Blob
      são removidos do armazenamento.
    */
    if (
      isVercelBlobUrl(
        image.url,
      )
    ) {
      try {
        await del(
          image.url,
        );
      } catch (blobError) {
        console.error(
          "Registro removido, mas não foi possível apagar o arquivo do Vercel Blob:",
          blobError,
        );
      }
    }

    refreshPropertyPages(code);

    return {
      success: true,
      message:
        "Imagem removida do cadastro com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao remover imagem:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível remover a imagem.",
    };
  }
}