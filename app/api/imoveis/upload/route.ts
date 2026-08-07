import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type UploadPayload = {
  code?: string;
};

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const maximumSizeInBytes =
  25 * 1024 * 1024;

function normalizeCode(
  value: string | undefined,
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export async function POST(
  request: Request,
): Promise<Response> {
  const body =
    (await request.json()) as HandleUploadPresignedBody;

  try {
    const jsonResponse =
      await handleUploadPresigned({
        body,
        request,

        getSignedToken: async (
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

          const validUntil =
            Date.now() +
            15 * 60 * 1000;

          const token =
            await issueSignedToken({
              pathname,
              operations: ["put"],
              allowedContentTypes,
              maximumSizeInBytes,
              validUntil,
            });

          return {
            token,

            urlOptions: {
              addRandomSuffix: true,
            },
          };
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
