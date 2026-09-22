import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

function getVerifyToken() {
  const token =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();

  return token || null;
}

export async function GET(
  request: NextRequest,
) {
  const mode =
    request.nextUrl.searchParams.get(
      "hub.mode",
    );

  const token =
    request.nextUrl.searchParams.get(
      "hub.verify_token",
    );

  const challenge =
    request.nextUrl.searchParams.get(
      "hub.challenge",
    );

  const expectedToken =
    getVerifyToken();

  if (!expectedToken) {
    return NextResponse.json(
      {
        error:
          "Webhook de WhatsApp não configurado.",
      },
      {
        status: 503,
      },
    );
  }

  if (
    mode === "subscribe" &&
    token === expectedToken &&
    challenge
  ) {
    return new NextResponse(
      challenge,
      {
        status: 200,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      },
    );
  }

  return NextResponse.json(
    {
      error:
        "Falha na verificação do webhook.",
    },
    {
      status: 403,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Payload inválido.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Payload inválido.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Nesta primeira etapa, apenas confirmamos
   * o recebimento do webhook.
   *
   * Não gravamos no banco.
   * Não acionamos a Íris.
   * Não respondemos mensagens.
   *
   * A validação da assinatura da Meta e o
   * processamento de mensagens serão
   * adicionados antes do uso em produção.
   */

  return NextResponse.json(
    {
      received: true,
    },
    {
      status: 200,
    },
  );
}