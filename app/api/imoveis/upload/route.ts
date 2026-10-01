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

          const isAdmin =
            session.user.role === "ADMIN";

          const agentId =
            typeof session.user.agentId ===
            "number"
              ? session.user.agentId
              : null;

          if (agentId !== null) {
            const currentAgent =
              await prisma.agent.findUnique({
                where: {
                  id: agentId,
                },
                select: {
                  active: true,
                  role: true,
                },
              });

            if (
              !currentAgent?.active ||
              currentAgent.role !==
                session.user.role
            ) {
              throw new Error(
                "Acesso não autorizado.",
              );
            }
          } else if (!isAdmin) {
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
                captorId: true,
                coCaptorId: true,
              },
            });

          if (!property) {
            throw new Error(
              "Imóvel não encontrado.",
            );
          }

          if (
            !isAdmin &&
            (
              agentId === null ||
              (
                property.captorId !==
                  agentId &&
                property.coCaptorId !==
                  agentId
              )
            )
          ) {
            throw new Error(
              "Você não tem permissão para enviar imagens para este imóvel.",
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
