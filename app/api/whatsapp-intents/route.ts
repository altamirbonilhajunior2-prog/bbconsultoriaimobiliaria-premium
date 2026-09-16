import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "../../../lib/prisma";

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

  const propertyCode =
    optionalText(
      body.propertyCode,
      30,
    )?.toUpperCase() ??
    null;

  const sourcePage =
    optionalText(
      body.sourcePage,
      MAX_SOURCE_LENGTH,
    );

  if (!sourcePage) {
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

  const property =
    propertyCode
      ? await prisma.property.findFirst(
          {
            where: {
              code:
                propertyCode,
            },

            select: {
              id: true,
              code: true,
            },
          },
        )
      : null;

  const duplicateWindow =
    new Date(
      Date.now() -
        5 *
          60 *
          1000,
    );

  const existingIntent =
    await prisma.whatsAppLeadIntent.findFirst(
      {
        where: {
          propertyId:
            property?.id ??
            null,

          sourcePage,

          createdAt: {
            gte:
              duplicateWindow,
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          id: true,
        },
      },
    );

  if (existingIntent) {
    return jsonResponse(
      request,
      {
        success: true,
        intentId:
          existingIntent.id,
      },
    );
  }

  const intent =
    await prisma.whatsAppLeadIntent.create(
      {
        data: {
          propertyId:
            property?.id ??
            null,

          propertyCode:
            property?.code ??
            propertyCode,

          sourcePage,

          referrer:
            optionalText(
              body.referrer,
              MAX_SOURCE_LENGTH,
            ),

          utmSource:
            optionalText(
              body.utmSource,
              180,
            ),

          utmMedium:
            optionalText(
              body.utmMedium,
              180,
            ),

          utmCampaign:
            optionalText(
              body.utmCampaign,
              250,
            ),

          utmTerm:
            optionalText(
              body.utmTerm,
              250,
            ),

          utmContent:
            optionalText(
              body.utmContent,
              250,
            ),

          gclid:
            optionalText(
              body.gclid,
              255,
            ),
        },

        select: {
          id: true,
        },
      },
    );

  return jsonResponse(
    request,
    {
      success: true,
      intentId:
        intent.id,
    },
    {
      status: 201,
    },
  );
}