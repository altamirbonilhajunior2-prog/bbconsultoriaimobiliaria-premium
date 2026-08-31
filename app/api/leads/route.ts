import { NextRequest, NextResponse } from "next/server";

import {
  PORTAL_LEAD_CONSENT_TEXT,
  PORTAL_LEAD_CONSENT_VERSION,
} from "../../../lib/leads/consent";
import { prisma } from "../../../lib/prisma";

const MAX_SOURCE_LENGTH = 1000;

function optionalText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maximumLength) : null;
}

function normalizeBrazilianPhone(value: unknown) {
  if (typeof value !== "string") return null;

  const digits = value.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  return null;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([
    request.nextUrl.origin,
    "https://www.bbconsultoriaimoveis.com.br",
  ]);

  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.add("http://localhost:3000");
    allowedOrigins.add("http://127.0.0.1:3000");
    allowedOrigins.add("http://localhost:4173");
    allowedOrigins.add("http://127.0.0.1:4173");
  }

  return allowedOrigins.has(origin);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Dados inválidos." },
      { status: 400 },
    );
  }

  // Campo invisível preenchido por robôs de formulário.
  if (optionalText(body.company, 100)) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const propertyCode = optionalText(body.propertyCode, 30)?.toUpperCase();
  const name = optionalText(body.name, 120);
  const phone = normalizeBrazilianPhone(body.phone);
  const consent = body.consent === true;

  if (!propertyCode || !name || name.length < 2 || !phone || !consent) {
    return NextResponse.json(
      {
        error:
          "Preencha seu nome, um WhatsApp válido e autorize o contato.",
      },
      { status: 400 },
    );
  }

  const property = await prisma.property.findFirst({
    where: {
      code: propertyCode,
      published: true,
    },
    select: {
      id: true,
      code: true,
      title: true,
    },
  });

  if (!property) {
    return NextResponse.json(
      { error: "Imóvel não encontrado." },
      { status: 404 },
    );
  }

  const duplicateWindow = new Date(Date.now() - 30 * 60 * 1000);
  const existingLead = await prisma.portalLead.findFirst({
    where: {
      propertyId: property.id,
      phone,
      createdAt: { gte: duplicateWindow },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (existingLead) {
    return NextResponse.json({ success: true, leadId: existingLead.id });
  }

  const lead = await prisma.portalLead.create({
    data: {
      propertyId: property.id,
      propertyCode: property.code,
      propertyTitle: property.title,
      name,
      phone,
      sourcePage:
        optionalText(body.sourcePage, MAX_SOURCE_LENGTH) ??
        `/imovel/${property.code.toLowerCase()}`,
      referrer: optionalText(body.referrer, MAX_SOURCE_LENGTH),
      utmSource: optionalText(body.utmSource, 180),
      utmMedium: optionalText(body.utmMedium, 180),
      utmCampaign: optionalText(body.utmCampaign, 250),
      utmTerm: optionalText(body.utmTerm, 250),
      utmContent: optionalText(body.utmContent, 250),
      gclid: optionalText(body.gclid, 255),
      consentVersion: PORTAL_LEAD_CONSENT_VERSION,
      consentText: PORTAL_LEAD_CONSENT_TEXT,
    },
    select: { id: true },
  });

  return NextResponse.json(
    { success: true, leadId: lead.id },
    { status: 201 },
  );
}
