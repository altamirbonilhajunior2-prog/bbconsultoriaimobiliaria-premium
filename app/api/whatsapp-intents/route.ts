import { operationalSource } from "../../../lib/privacy/attribution";
import { attachAttribution } from "../../../lib/privacy/server-consent";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { interactionId, recordWhatsAppIntent } from "../../../lib/privacy/whatsapp-intent";

const MAX_SOURCE_LENGTH = 1000;

function optionalText(
  value: unknown,
  maximumLength: number,
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized
    ? normalized.slice(
        0,
        maximumLength,
      )
    : null;
}

function isAllowedOrigin(
  request: NextRequest,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  const allowedOrigins =
    new Set([
      request.nextUrl.origin,
      "https://www.bbconsultoriaimoveis.com.br",
    ]);

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    allowedOrigins.add(
      "http://localhost:3000",
    );

    allowedOrigins.add(
      "http://127.0.0.1:3000",
    );
  }

  return allowedOrigins.has(
    origin,
  );
}

function jsonResponse(
  request: NextRequest,
  body: Record<
    string,
    unknown
  >,
  init?: {
    status?: number;
  },
) {
  return NextResponse.json(
    body,
    {
      ...init,

      headers: {
        "Access-Control-Allow-Origin":
          request.headers.get(
            "origin",
          ) ??
          request.nextUrl.origin,

        "Access-Control-Allow-Methods":
          "POST, OPTIONS",

        "Access-Control-Allow-Headers":
          "Content-Type",

        Vary: "Origin",
      },
    },
  );
}

export function OPTIONS(
  request: NextRequest,
) {
  if (
    !isAllowedOrigin(
      request,
    )
  ) {
    return new NextResponse(
      null,
      {
        status: 403,
      },
    );
  }

  return new NextResponse(
    null,
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          request.headers.get(
            "origin",
          ) ??
          request.nextUrl.origin,

        "Access-Control-Allow-Methods":
          "POST, OPTIONS",

        "Access-Control-Allow-Headers":
          "Content-Type",

        Vary: "Origin",
      },
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  if (
    !isAllowedOrigin(
      request,
    )
  ) {
    return jsonResponse(
      request,
      {
        error:
          "Origem não autorizada.",
      },
      {
        status: 403,
      },
    );
  }

  let body: Record<
    string,
    unknown
  >;

  try {
    body =
      (await request.json()) as Record<
        string,
        unknown
      >;
  } catch {
    return jsonResponse(
      request,
      {
        error:
          "Dados inválidos.",
      },
      {
        status: 400,
      },
    );
  }

  if (!body || typeof body !== "object") return jsonResponse(request, { error: "Dados inválidos." }, { status: 400 });

  const propertyCode =
    optionalText(
      body.propertyCode,
      30,
    )?.toUpperCase() ??
    null;

  const rawSourcePage =
    optionalText(
      body.sourcePage,
      MAX_SOURCE_LENGTH,
    );

  if (!rawSourcePage) {
    return jsonResponse(
      request,
      {
        error:
          "Página de origem não informada.",
      },
      {
        status: 400,
      },
    );
  }

  const sourcePage = operationalSource(rawSourcePage);

  let operation: string;
  try { operation = interactionId(body.interactionId); }
  catch { return jsonResponse(request, { error: "Interação inválida." }, { status: 400 }); }
  const intent = await recordWhatsAppIntent({ interactionId: operation, propertyCode, sourcePage });
  if (intent.created) await attachAttribution(request, body, "whatsapp", intent.id);

  return jsonResponse(
    request,
    {
      success: true,
      intentId:
        intent.id,
    },
    {
      status: intent.created ? 201 : 200,
    },
  );
}
