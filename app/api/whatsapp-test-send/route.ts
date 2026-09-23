import {
  NextRequest,
  NextResponse,
} from "next/server";

import { sendWhatsAppText } from "../../../lib/whatsapp/send";

export const runtime = "nodejs";

const TEST_PHONE_NUMBER_ID =
  "1298075746724983";

const TEST_DESTINATION =
  "5512978140636";

export async function POST(
  request: NextRequest,
) {
  const expectedSecret =
    process.env.WHATSAPP_TEST_SEND_SECRET?.trim();

  if (!expectedSecret) {
    return NextResponse.json(
      {
        success: false,
        message:
          "WHATSAPP_TEST_SEND_SECRET não está configurado.",
      },
      {
        status: 503,
      },
    );
  }

  const providedSecret =
    request.headers
      .get("x-whatsapp-test-secret")
      ?.trim();

  if (
    !providedSecret ||
    providedSecret !==
      expectedSecret
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Não autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result =
      await sendWhatsAppText({
        phoneNumberId:
          TEST_PHONE_NUMBER_ID,

        to:
          TEST_DESTINATION,

        text:
          "Olá! Este é um teste de envio da Íris pela integração oficial da B&B Consultoria Imobiliária.",
      });

    return NextResponse.json({
      success: true,
      externalMessageId:
        result.externalMessageId,
    });
  } catch (error) {
    console.error(
      "Erro no teste de envio do WhatsApp:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Falha no envio de teste.",
      },
      {
        status: 500,
      },
    );
  }
}