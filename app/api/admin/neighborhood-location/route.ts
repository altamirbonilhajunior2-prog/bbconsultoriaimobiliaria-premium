import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { normalizeLocationKey } from "../../../../lib/location/normalize";
import { prisma } from "../../../../lib/prisma";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const state = (searchParams.get("state") ?? "SP").trim().toUpperCase();
  const city = (searchParams.get("city") ?? "").trim();
  const neighborhood = (searchParams.get("neighborhood") ?? "").trim();

  if (!city || !neighborhood || state.length !== 2) {
    return NextResponse.json({ error: "Informe estado, cidade e bairro." }, { status: 400 });
  }

  const normalizedName = normalizeLocationKey(neighborhood);
  const existing = await prisma.neighborhoodMapLocation.findFirst({
    where: {
      active: true,
      state,
      city,
      OR: [{ normalizedName }, { aliases: { has: normalizedName } }],
    },
  });

  if (existing) {
    return NextResponse.json({
      found: true,
      existing: true,
      latitude: Number(existing.latitude.toString()),
      longitude: Number(existing.longitude.toString()),
      displayName: `${existing.displayName}, ${existing.city}/${existing.state}`,
      source: existing.source,
      sourceUrl: existing.sourceUrl,
    });
  }

  const query = new URLSearchParams({
    q: `${neighborhood}, ${city}, ${state}, Brasil`,
    format: "jsonv2",
    addressdetails: "1",
    limit: "3",
  });
  const sourceUrl = `https://nominatim.openstreetmap.org/search?${query.toString()}`;
  const response = await fetch(sourceUrl, {
    headers: {
      "Accept-Language": "pt-BR,pt;q=0.9",
      "User-Agent": "BB-Portal-CRM/1.0 (https://www.bbconsultoriaimoveis.com.br/)",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "O serviço de localização não respondeu." }, { status: 502 });
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];
  if (!result) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    existing: false,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    displayName: result.display_name,
    source: "OpenStreetMap Nominatim",
    sourceUrl,
  });
}
