import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "../../../lib/prisma";

const MAX_SOURCE_LENGTH = 1000;

function optionalText(
  value: string | null,
  maximumLength: number,
) {
  if (!value) {
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

function getSafeWhatsAppUrl(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(value);

    if (
      url.protocol !== "https:"
    ) {
      return null;
    }

    const allowedHosts =
      new Set([
        "wa.me",
        "api.whatsapp.com",
      ]);

    if (
      !allowedHosts.has(
        url.hostname,
      )
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
) {
  const targetUrl =
    getSafeWhatsAppUrl(
      request.nextUrl.searchParams.get(
        "target",
      ),
    );

  if (!targetUrl) {
    return NextResponse.json(
      {
        error:
          "Destino do WhatsApp inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const propertyCode =
    optionalText(
      request.nextUrl.searchParams.get(
        "propertyCode",
      ),
      30,
    )?.toUpperCase() ??
    null;

  const sourcePage =
    optionalText(
      request.nextUrl.searchParams.get(
        "sourcePage",
      ),
      MAX_SOURCE_LENGTH,
    ) ?? "/";

  try {
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

    if (!existingIntent) {
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
                request.nextUrl.searchParams.get(
                  "referrer",
                ),
                MAX_SOURCE_LENGTH,
              ),

            utmSource:
              optionalText(
                request.nextUrl.searchParams.get(
                  "utmSource",
                ),
                180,
              ),

            utmMedium:
              optionalText(
                request.nextUrl.searchParams.get(
                  "utmMedium",
                ),
                180,
              ),

            utmCampaign:
              optionalText(
                request.nextUrl.searchParams.get(
                  "utmCampaign",
                ),
                250,
              ),

            utmTerm:
              optionalText(
                request.nextUrl.searchParams.get(
                  "utmTerm",
                ),
                250,
              ),

            utmContent:
              optionalText(
                request.nextUrl.searchParams.get(
                  "utmContent",
                ),
                250,
              ),

            gclid:
              optionalText(
                request.nextUrl.searchParams.get(
                  "gclid",
                ),
                255,
              ),
          },
        },
      );
    }
  } catch {
    // Mesmo que o CRM ou o banco
    // estejam indisponíveis,
    // o usuário deve conseguir
    // continuar para o WhatsApp.
  }

  return NextResponse.redirect(
    targetUrl,
    307,
  );
}