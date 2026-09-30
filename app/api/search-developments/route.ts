import { NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams =
    request.nextUrl.searchParams;

  const state =
    searchParams
      .get("estado")
      ?.trim() ?? "";

  const city =
    searchParams
      .get("cidade")
      ?.trim() ?? "";

  const neighborhood =
    searchParams
      .get("bairro")
      ?.trim() ?? "";

  const where = {
    active: true,

    ...(state
      ? {
          state: {
            equals:
              state.toUpperCase(),
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(city
      ? {
          city: {
            equals: city,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(neighborhood
      ? {
          neighborhood: {
            equals: neighborhood,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const developments =
    await prisma.development.findMany({
      where,

      select: {
        name: true,
      },

      orderBy: {
        name: "asc",
      },
    });

  return NextResponse.json(
    developments.map(
      (development) =>
        development.name,
    ),
  );
}