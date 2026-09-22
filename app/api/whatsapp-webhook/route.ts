import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

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

function getMetaAppSecret() {
  const secret =
    process.env.WHATSAPP_META_APP_SECRET?.trim();

  return secret || null;
}

function isValidMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
) {
  if (
    !signatureHeader ||
    !signatureHeader.startsWith(
      "sha256=",
    )
  ) {
    return false;
  }

  const receivedHex =
    signatureHeader.slice(
      "sha256=".length,
    );

  if (
    !/^[a-f0-9]{64}$/i.test(
      receivedHex,
    )
  ) {
    return false;
  }

  const expectedHex =
    createHmac(
      "sha256",
      appSecret,
    )
      .update(
        rawBody,
        "utf8",
      )
      .digest(
        "hex",
      );

  const received =
    Buffer.from(
      receivedHex,
      "hex",
    );

  const expected =
    Buffer.from(
      expectedHex,
      "hex",
    );

  if (
    received.length !==
    expected.length
  ) {
    return false;
  }

  return timingSafeEqual(
    received,
    expected,
  );
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
  const appSecret =
    getMetaAppSecret();

  if (!appSecret) {
    console.error(
      "WHATSAPP_META_APP_SECRET não está configurado.",
    );

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

  let rawBody: string;

  try {
    rawBody =
      await request.text();
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível ler o payload.",
      },
      {
        status: 400,
      },
    );
  }

  const signature =
    request.headers.get(
      "x-hub-signature-256",
    );

  if (
    !isValidMetaSignature(
      rawBody,
      signature,
      appSecret,
    )
  ) {
    console.warn(
      "Webhook do WhatsApp rejeitado: assinatura da Meta inválida ou ausente.",
    );

    return NextResponse.json(
      {
        error:
          "Assinatura inválida.",
      },
      {
        status: 401,
      },
    );
  }

  let body: unknown;

  try {
    body =
      JSON.parse(
        rawBody,
      );
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
   * A assinatura da Meta já foi validada.
   *
   * Nesta etapa ainda não:
   * - gravamos mensagens no banco;
   * - acionamos a Íris;
   * - enviamos respostas automáticas.
   *
   * O processamento do campo "messages"
   * será adicionado na próxima etapa.
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