import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";

export const runtime = "nodejs";

type CoexistenceRequest = {
  code?: string;
  wabaId?: string;
};

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

type MetaSubscribeResponse = {
  success?: boolean;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

type MetaPhoneNumber = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  status?: string;
  quality_rating?: string;
};

type MetaPhoneNumbersResponse = {
  data?: MetaPhoneNumber[];
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

function maskId(
  value: string,
) {
  if (value.length <= 6) {
    return "******";
  }

  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

export async function POST(
  request: Request,
) {
  const session =
    await auth();

  if (
    !session?.user ||
    session.user.role !== "ADMIN"
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

  const appId =
    process.env.NEXT_PUBLIC_META_APP_ID?.trim();

  const appSecret =
    process.env.WHATSAPP_META_APP_SECRET?.trim();


  const configuredWabaId =
    process.env.WHATSAPP_WABA_ID?.trim();
  if (
    !appId ||
    !appSecret ||
    !configuredWabaId ||
    !/^\d+$/.test(configuredWabaId)
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Configuração da Meta incompleta no servidor.",
      },
      {
        status: 503,
      },
    );
  }

  let body:
    CoexistenceRequest;

  try {
    body =
      (await request.json()) as CoexistenceRequest;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Requisição inválida.",
      },
      {
        status: 400,
      },
    );
  }

  const code =
    body.code?.trim();

  const requestedWabaId =
    body.wabaId?.trim();

  if (
    !code ||
    (requestedWabaId &&
      !/^\d+$/.test(requestedWabaId))
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "C\u00f3digo de autoriza\u00e7\u00e3o ou WABA inv\u00e1lidos.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    requestedWabaId &&
    requestedWabaId !== configuredWabaId
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A conta do WhatsApp informada n\u00e3o corresponde \u00e0 conta comercial configurada.",
      },
      {
        status: 400,
      },
    );
  }

  const wabaId =
    requestedWabaId ?? configuredWabaId;

  try {
    const tokenUrl =
      new URL(
        "https://graph.facebook.com/v26.0/oauth/access_token",
      );

    tokenUrl.searchParams.set(
      "client_id",
      appId,
    );

    tokenUrl.searchParams.set(
      "client_secret",
      appSecret,
    );

    tokenUrl.searchParams.set(
      "code",
      code,
    );

    tokenUrl.searchParams.set(
      "redirect_uri",
      "https://www.bbconsultoriaimoveis.com.br/admin/whatsapp",
    );

    const tokenResponse =
      await fetch(
        tokenUrl,
        {
          method: "GET",
          cache: "no-store",
        },
      );

    const tokenData =
      await tokenResponse.json() as MetaTokenResponse;

    const accessToken =
      tokenData.access_token?.trim();

    if (
      !tokenResponse.ok ||
      !accessToken
    ) {
      console.error(
        "Meta: falha ao trocar código do Embedded Signup.",
        {
          status:
            tokenResponse.status,

          metaCode:
            tokenData.error?.code,

          type:
            tokenData.error?.type,

          message:
            tokenData.error?.message,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            tokenData.error?.message ||
            "Não foi possível concluir a autorização com a Meta.",
        },
        {
          status: 502,
        },
      );
    }

    const subscribeResponse =
      await fetch(
        `https://graph.facebook.com/v26.0/${wabaId}/subscribed_apps`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },

          cache:
            "no-store",
        },
      );

    const subscribeData =
      await subscribeResponse.json() as MetaSubscribeResponse;

    if (
      !subscribeResponse.ok ||
      subscribeData.success !== true
    ) {
      console.error(
        "Meta: falha ao assinar app na WABA.",
        {
          wabaId:
            maskId(
              wabaId,
            ),

          status:
            subscribeResponse.status,

          metaCode:
            subscribeData.error?.code,

          type:
            subscribeData.error?.type,

          message:
            subscribeData.error?.message,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            subscribeData.error?.message ||
            "Não foi possível assinar a WABA no webhook.",
        },
        {
          status: 502,
        },
      );
    }

    const phoneNumbersResponse =
      await fetch(
        `https://graph.facebook.com/v26.0/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,status,quality_rating`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },

          cache:
            "no-store",
        },
      );

    const phoneNumbersData =
      await phoneNumbersResponse.json() as MetaPhoneNumbersResponse;

    if (
      !phoneNumbersResponse.ok
    ) {
      console.error(
        "Meta: não foi possível consultar os números da WABA.",
        {
          wabaId:
            maskId(
              wabaId,
            ),

          status:
            phoneNumbersResponse.status,

          metaCode:
            phoneNumbersData.error?.code,

          type:
            phoneNumbersData.error?.type,

          message:
            phoneNumbersData.error?.message,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            phoneNumbersData.error?.message ||
            "A WABA foi conectada, mas não foi possível consultar seus números.",
        },
        {
          status: 502,
        },
      );
    }

    const phoneNumbers =
      (phoneNumbersData.data ?? []).map(
        (phone) => ({
          id:
            phone.id ?? null,

          displayPhoneNumber:
            phone.display_phone_number ?? null,

          verifiedName:
            phone.verified_name ?? null,

          status:
            phone.status ?? null,

          qualityRating:
            phone.quality_rating ?? null,
        }),
      );

    console.info(
      "B&B Íris: Embedded Signup concluído no servidor.",
      {
        wabaId:
          maskId(
            wabaId,
          ),

        phoneNumbers:
          phoneNumbers.length,
      },
    );

    return NextResponse.json({
      success: true,
      wabaId,
      subscribed:
        true,
      phoneNumbers,
    });
  } catch (error) {
    console.error(
      "Erro ao concluir Embedded Signup da Íris:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível concluir a conexão com o WhatsApp agora.",
      },
      {
        status: 500,
      },
    );
  }
}