"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "../../../lib/admin/access";
import { normalizeLocationKey } from "../../../lib/location/normalize";
import { prisma } from "../../../lib/prisma";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function decimal(formData: FormData, name: string) {
  const value = text(formData, name);
  if (value === null) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveNeighborhoodMapLocation(formData: FormData) {
  await requireAdmin();

  const state = text(formData, "state") ?? "SP";
  const city = text(formData, "city");
  const displayName = text(formData, "displayName");
  const latitude = decimal(formData, "latitude");
  const longitude = decimal(formData, "longitude");
  const radius = Number.parseInt(text(formData, "radiusMeters") ?? "700", 10);

  if (!city || !displayName || latitude === null || longitude === null) {
    throw new Error("Preencha cidade, bairro, latitude e longitude.");
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("As coordenadas informadas são inválidas.");
  }

  const normalizedName = normalizeLocationKey(displayName);
  const aliases = (text(formData, "aliases") ?? "")
    .split(",")
    .map(normalizeLocationKey)
    .filter(Boolean);

  await prisma.neighborhoodMapLocation.upsert({
    where: {
      state_city_normalizedName: { state, city, normalizedName },
    },
    update: {
      displayName,
      aliases,
      latitude,
      longitude,
      radiusMeters: Math.min(Math.max(Number.isFinite(radius) ? radius : 700, 300), 2000),
      active: true,
      source: text(formData, "source"),
      sourceUrl: text(formData, "sourceUrl"),
      verifiedAt: new Date(),
    },
    create: {
      state,
      city,
      normalizedName,
      displayName,
      aliases,
      latitude,
      longitude,
      radiusMeters: Math.min(Math.max(Number.isFinite(radius) ? radius : 700, 300), 2000),
      active: true,
      source: text(formData, "source"),
      sourceUrl: text(formData, "sourceUrl"),
      verifiedAt: new Date(),
    },
  });

  revalidatePath("/admin/localizacoes-mapa");
  redirect("/admin/localizacoes-mapa");
}
