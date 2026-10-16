import { attachAttribution, emptyAttribution } from "../../../lib/privacy/server-consent";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PORTAL_LEAD_CONSENT_TEXT,
  PORTAL_LEAD_CONSENT_VERSION,
} from "../../../lib/leads/consent";
import { prisma } from "../../../lib/prisma";
import { operationalSource } from "../../../lib/privacy/attribution";

const MAX_SOURCE_LENGTH = 1000;

const LANDING_ORIGIN =
  "https://altamirbonilhajunior2-prog.github.io";

const GENERAL_LEAD_CODE = "GERAL";
const GENERAL_LEAD_TITLE =
  "Atendimento geral";

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

function normalizeBrazilianPhone(
  value: unknown,
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const digits =
    value.replace(/\D/g, "");

  if (
    digits.length === 10 ||
    digits.length === 11
  ) {
    return `55${digits}`;
  }

  if (
    (
      digits.length === 12 ||
      digits.length === 13
    ) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  return null;
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
      LANDING_ORIGIN,
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

    allowedOrigins.add(
      "http://localhost:4173",
    );

    allowedOrigins.add(
      "http://127.0.0.1:4173",
    );
  }

  return allowedOrigins.has(
    origin,
  );
}

function corsHeaders(
  request: NextRequest,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  if (
    !origin ||
    !isAllowedOrigin(request)
  ) {
    return undefined;
  }

  return {
    "Access-Control-Allow-Origin":
      origin,

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    Vary: "Origin",
  };
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
      headers:
        corsHeaders(request),
    },
  );
}

export function OPTIONS(
  request: NextRequest,
) {
  if (
    !isAllowedOrigin(request)
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
      headers:
        corsHeaders(request),
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  if (
    !isAllowedOrigin(request)
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

  // Campo invisível usado
  // como proteção contra robôs.
  if (
    optionalText(
      body.company,
      100,
    )
  ) {
    return jsonResponse(
      request,
      {
        success: true,
      },
      {
        status: 201,
      },
    );
  }

  const propertyCode =
    optionalText(
      body.propertyCode,
      30,
    )?.toUpperCase() ??
    null;

  const name =
    optionalText(
      body.name,
      120,
    );

  const phone =
    normalizeBrazilianPhone(
      body.phone,
    );

  const consent =
    body.consent === true;

  if (
    !name ||
    name.length < 2 ||
    !phone ||
    !consent
  ) {
    return jsonResponse(
      request,
      {
        error:
          "Preencha seu nome, um WhatsApp válido e autorize o contato.",
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
              published:
                true,
            },

            select: {
              id: true,
              code: true,
              title: true,
            },
          },
        )
      : null;

  if (
    propertyCode &&
    !property
  ) {
    return jsonResponse(
      request,
      {
        error:
          "Imóvel não encontrado.",
      },
      {
        status: 404,
      },
    );
  }

  const duplicateWindow =
    new Date(
      Date.now() -
        30 *
          60 *
          1000,
    );

  const existingLead =
    await prisma.portalLead.findFirst(
      {
        where: {
          propertyId:
            property?.id ??
            null,

          phone,

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

  if (existingLead) {
    return jsonResponse(
      request,
      {
        success: true,
        leadId:
          existingLead.id,
      },
    );
  }

  const sourcePage = operationalSource(
    optionalText(body.sourcePage, MAX_SOURCE_LENGTH) ??
      (property ? "/imovel/" + property.code.toLowerCase() : "/"),
  );

  const lead =
    await prisma.$transaction(
      async (tx) => {
        await tx.$queryRawUnsafe(
          "SELECT pg_advisory_xact_lock(2026093001)",
        );

        // Recheck after the allocation lock: concurrent submissions may pass the fast lookup together.
        const duplicate = await tx.portalLead.findFirst({
          where: { propertyId: property?.id ?? null, phone, createdAt: { gte: duplicateWindow } },
          orderBy: { createdAt: "desc" }, select: { id: true },
        });
        if (duplicate) return { id: duplicate.id, created: false };
        const activeAgents =
          await tx.agent.findMany({
            where: {
              role: "CAPTADOR",
              active: true,
            },

            select: {
              id: true,

              portalLeads: {
                orderBy: {
                  createdAt: "desc",
                },

                take: 1,

                select: {
                  createdAt: true,
                },
              },
            },
          });

        activeAgents.sort(
          (agentA, agentB) => {
            const lastLeadA =
              agentA.portalLeads[0]
                ?.createdAt.getTime() ??
              0;

            const lastLeadB =
              agentB.portalLeads[0]
                ?.createdAt.getTime() ??
              0;

            if (
              lastLeadA !== lastLeadB
            ) {
              return (
                lastLeadA -
                lastLeadB
              );
            }

            return (
              agentA.id -
              agentB.id
            );
          },
        );

        const assignedAgentId =
          activeAgents[0]?.id ??
          null;

        const created = await tx.portalLead.create(
          {
            data: {
              propertyId:
                property?.id ??
                null,

              agentId:
                assignedAgentId,

              propertyCode:
                property?.code ??
                GENERAL_LEAD_CODE,

              propertyTitle:
                property?.title ??
                GENERAL_LEAD_TITLE,

              name,
              phone,

              sourcePage,

              ...emptyAttribution,

              consentVersion:
                PORTAL_LEAD_CONSENT_VERSION,

              consentText:
                PORTAL_LEAD_CONSENT_TEXT,
            },

            select: {
              id: true,
            },
          },
        );
        return { id: created.id, created: true };
      },
    );

  if (lead.created) await attachAttribution(request, body, "lead", lead.id);

  return jsonResponse(
    request,
    {
      success: true,
      leadId: lead.id,
    },
    {
      status: lead.created ? 201 : 200,
    },
  );
}