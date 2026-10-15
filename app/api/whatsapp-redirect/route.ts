import { attachAttribution } from "../../../lib/privacy/server-consent";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { interactionId, recordWhatsAppIntent } from "../../../lib/privacy/whatsapp-intent";
import { operationalSource, sanitizeWhatsAppTarget } from "../../../lib/privacy/attribution";

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

function getSafeWhatsAppUrl(value: string | null) {
  const sanitized = value ? sanitizeWhatsAppTarget(value) : null;
  return sanitized ? new URL(sanitized) : null;
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

  const sourcePage = operationalSource(
    request.nextUrl.searchParams.get("sourcePage") ?? "/",
  );

  try {
    const intent = await recordWhatsAppIntent({
      interactionId: interactionId(request.nextUrl.searchParams.get("interactionId")), propertyCode, sourcePage,
    });
    if (intent.created) await attachAttribution(request, Object.fromEntries(request.nextUrl.searchParams), "whatsapp", intent.id);
  } catch {
    // Mesmo que o CRM ou o banco
    // estejam indisponíveis,
    // o usuário deve conseguir
    // continuar para o WhatsApp.
  }

  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}