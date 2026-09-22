import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

type WhatsAppTextMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
};

type WhatsAppContact = {
  profile?: {
    name?: string;
  };
  wa_id?: string;
};

type WhatsAppWebhookValue = {
  messaging_product?: string;

  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };

  contacts?: WhatsAppContact[];

  messages?: WhatsAppTextMessage[];
};

type WhatsAppWebhookPayload = {
  object?: string;

  entry?: Array<{
    id?: string;

    changes?: Array<{
      field?: string;
      value?: WhatsAppWebhookValue;
    }>;
  }>;
};

type IncomingWhatsAppMessage = {
  messageId: string;
  from: string;
  contactName: string | null;
  phoneNumberId: string | null;
  text: string;
};

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

function maskPhone(
  value: string,
) {
  if (value.length <= 4) {
    return "****";
  }

  return `${"*".repeat(
    Math.max(
      0,
      value.length - 4,
    ),
  )}${value.slice(-4)}`;
}

function extractTextMessages(
  payload: WhatsAppWebhookPayload,
): IncomingWhatsAppMessage[] {
  const extracted:
    IncomingWhatsAppMessage[] =
    [];

  for (
    const entry of
      payload.entry ?? []
  ) {
    for (
      const change of
        entry.changes ?? []
    ) {
      if (
        change.field !==
        "messages"
      ) {
        continue;
      }

      const value =
        change.value;

      if (!value) {
        continue;
      }

      const contact =
        value.contacts?.[0];

      const contactName =
        contact?.profile?.name?.trim() ||
        null;

      const phoneNumberId =
        value.metadata
          ?.phone_number_id
          ?.trim() ||
        null;

      for (
        const message of
          value.messages ?? []
      ) {
        if (
          message.type !==
          "text"
        ) {
          continue;
        }

        const text =
          message.text?.body?.trim();

        const from =
          message.from?.trim();

        const messageId =
          message.id?.trim();

        if (
          !text ||
          !from ||
          !messageId
        ) {
          continue;
        }

        extracted.push({
          messageId,
          from,
          contactName,
          phoneNumberId,
          text,
        });
      }
    }
  }

  return extracted;
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

  let body:
    WhatsAppWebhookPayload;

  try {
    body =
      JSON.parse(
        rawBody,
      ) as WhatsAppWebhookPayload;
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

  const messages =
    extractTextMessages(
      body,
    );

  for (
    const message of messages
  ) {
    console.info(
      "WhatsApp: mensagem de texto recebida.",
      {
        messageId:
          message.messageId,
        from:
          maskPhone(
            message.from,
          ),
        contactName:
          message.contactName,
        phoneNumberId:
          message.phoneNumberId,
        textLength:
          message.text.length,
      },
    );
  }

  /*
   * Nesta etapa:
   *
   * - a assinatura da Meta é validada;
   * - mensagens de texto são identificadas;
   * - remetente, nome e phone_number_id são extraídos;
   * - não armazenamos o texto nos logs;
   * - não gravamos no banco;
   * - não acionamos a Íris;
   * - não enviamos resposta automática.
   */

  return NextResponse.json(
    {
      received: true,
      textMessages:
        messages.length,
    },
    {
      status: 200,
    },
  );
}