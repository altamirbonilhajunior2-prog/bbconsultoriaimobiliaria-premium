import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const properties =
    await prisma.property.findMany({
      where: {
        published: true,
      },

      select: {
        state: true,
        city: true,
      },
    });

  const grouped =
    properties.reduce<
      Record<string, Set<string>>
    >((acc, property) => {
      const state =
        property.state.trim();

      const city =
        property.city.trim();

      if (!state || !city) {
        return acc;
      }

      if (!acc[state]) {
        acc[state] =
          new Set<string>();
      }

      acc[state].add(city);

      return acc;
    }, {});

  const citiesByState =
    Object.fromEntries(
      Object.entries(grouped).map(
        ([state, cities]) => [
          state,
          Array.from(cities).sort(
            (a, b) =>
              a.localeCompare(
                b,
                "pt-BR",
              ),
          ),
        ],
      ),
    );

  return NextResponse.json(
    citiesByState,
  );
}