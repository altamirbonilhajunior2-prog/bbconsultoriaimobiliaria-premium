
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";

type DevelopmentType = "CONDOMINIO" | "EDIFICIO";

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const body = (await request.json()) as {
    type?: string;
    name?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
  };

  const type: DevelopmentType =
    body.type === "EDIFICIO" ? "EDIFICIO" : "CONDOMINIO";

  const name = body.name?.trim() ?? "";

  const state = (
    body.state?.trim() ?? "SP"
  ).toUpperCase();

  const city = body.city?.trim() ?? "";

  const neighborhood = body.neighborhood?.trim() ?? "";

  if (!name || !city || !neighborhood) {
    return NextResponse.json(
      {
        success: false,
        error: "Preencha nome, cidade e bairro.",
      },
      { status: 400 },
    );
  }

  if (state.length !== 2) {
    return NextResponse.json(
      {
        success: false,
        error: "Informe a UF com 2 caracteres.",
      },
      { status: 400 },
    );
  }

  const normalizedName = normalizeName(name);

  const where = {
    state_city_neighborhood_normalizedName: {
      state,
      city,
      neighborhood,
      normalizedName,
    },
  };

  const existing = await prisma.development.findUnique({
    where,
  });

  if (existing) {
    // Nunca informar sucesso para um cadastro desativado.
    if (!existing.active) {
      return NextResponse.json(
        {
          success: false,
          existing: true,
          error:
            "Este condomínio ou edifício já está cadastrado, mas encontra-se inativo. Solicite a reativação antes de utilizá-lo.",
        },
        { status: 409 },
      );
    }

    // Impede utilizar um empreendimento existente
    // com classificação diferente.
    if (existing.type !== type) {
      return NextResponse.json(
        {
          success: false,
          existing: true,
          error:
            "Já existe um empreendimento com este nome nesta localização, mas com outro tipo cadastrado. Verifique o cadastro existente.",
        },
        { status: 409 },
      );
    }

    // Reutiliza o cadastro ativo sem criar duplicidade.
    return NextResponse.json({
      success: true,
      development: {
        id: existing.id,
        type: existing.type,
        name: existing.name,
        state: existing.state,
        city: existing.city,
        neighborhood: existing.neighborhood,
        active: existing.active,
      },
      existing: true,
    });
  }

  // Cria somente quando não existe cadastro correspondente.
  const development = await prisma.development.create({
    data: {
      type,
      name,
      normalizedName,
      state,
      city,
      neighborhood,
      active: true,
    },
  });

  return NextResponse.json({
    success: true,
    development: {
      id: development.id,
      type: development.type,
      name: development.name,
      state: development.state,
      city: development.city,
      neighborhood: development.neighborhood,
      active: development.active,
    },
    existing: false,
  });
}
