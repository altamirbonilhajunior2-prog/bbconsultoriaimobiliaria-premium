import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type UploadPayload = {
  code?: string;
};

function normalizeCode(value: string | undefined) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  const body =
    (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
      ) => {
        const session = await auth();

        if (!session?.user) {
          throw new Error(
            "Acesso não autorizado.",
          );
        }

        let payload: UploadPayload = {};

        if (clientPayload) {
          try {
            payload = JSON.parse(
              clientPayload,
            ) as UploadPayload;
          } catch {
            throw new Error(
              "Dados do upload inválidos.",
            );
          }
        }

        const code = normalizeCode(
          payload.code,
        );

        if (!code) {
          throw new Error(
            "Código do imóvel não informado.",
          );
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
          throw new Error(
            "Imóvel não encontrado.",
          );
        }

        const expectedPrefix =
          `imoveis/${code.toLowerCase()}/`;

        if (
          !pathname.startsWith(
            expectedPrefix,
          )
        ) {
          throw new Error(
            "Destino de upload inválido.",
          );
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],

          maximumSizeInBytes:
            25 * 1024 * 1024,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            code,
            propertyId: property.id,
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        console.log(
          "Upload concluído no Vercel Blob:",
          {
            url: blob.url,
            tokenPayload,
          },
        );
      },
    });

    return NextResponse.json(
      jsonResponse,
    );
  } catch (error) {
    console.error(
      "Erro no upload de imagem:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível processar o upload.",
      },
      {
        status: 400,
      },
    );
  }
}