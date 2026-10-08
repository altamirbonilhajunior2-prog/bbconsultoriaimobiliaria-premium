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

  const neighborhoods =
    searchParams
      .getAll("bairro")
      .map((item) =>
        item.trim(),
      )
      .filter(Boolean);

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

    ...(neighborhoods.length > 0
      ? {
          OR: neighborhoods.map(
            (neighborhood) => ({
              neighborhood: {
                equals:
                  neighborhood,
                mode: "insensitive" as const,
              },
            }),
          ),
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
    Array.from(
      new Set(
        developments.map(
          (development) =>
            development.name,
        ),
      ),
    ),
  );
}