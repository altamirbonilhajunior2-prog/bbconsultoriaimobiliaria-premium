"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "../../../lib/admin/access";
import { prisma } from "../../../lib/prisma";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function number(formData: FormData, name: string) {
  const value = text(formData, name);
  if (value === null) return null;
  let normalized = value.replace(/[^\d,.-]/g, "");

  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createMarketReference(formData: FormData) {
  await requireAdmin();

  const city = text(formData, "city");
  const neighborhood = text(formData, "neighborhood");
  const source = text(formData, "source");
  const sourceUrl = text(formData, "sourceUrl");
  const minimum = number(formData, "pricePerSquareMeterMin");
  const maximum = number(formData, "pricePerSquareMeterMax");

  if (!city || !neighborhood || !source || !sourceUrl || minimum === null || maximum === null) {
    throw new Error("Preencha bairro, fonte, link e faixa de valor por m².");
  }

  if (minimum <= 0 || maximum < minimum) {
    throw new Error("A faixa de valor por m² é inválida.");
  }

  const purpose = formData.get("purpose") === "LOCACAO" ? "LOCACAO" : "VENDA";
  const propertyTypeValue = text(formData, "propertyType") ?? "APARTAMENTO";
  const allowedTypes = ["CASA", "APARTAMENTO", "TERRENO", "COMERCIAL", "RURAL"] as const;
  const propertyType = allowedTypes.find((item) => item === propertyTypeValue) ?? "APARTAMENTO";
  const area = number(formData, "evidenceArea");
  const price = number(formData, "evidencePrice");

  await prisma.marketReference.create({
    data: {
      state: text(formData, "state") ?? "SP",
      city,
      neighborhood,
      purpose,
      propertyType,
      areaMin: number(formData, "areaMin"),
      areaMax: number(formData, "areaMax"),
      bedrooms: number(formData, "bedrooms"),
      pricePerSquareMeterMin: minimum,
      pricePerSquareMeterMax: maximum,
      sampleSize: 1,
      notes: text(formData, "notes"),
      evidences: {
        create: {
          source,
          sourceUrl,
          propertyType,
          purpose,
          area,
          bedrooms: number(formData, "evidenceBedrooms"),
          price,
          pricePerSquareMeter:
            price !== null && area !== null && area > 0 ? price / area : null,
          development: text(formData, "development"),
          notes: text(formData, "evidenceNotes"),
        },
      },
    },
  });

  revalidatePath("/admin/referencias-mercado");
  redirect("/admin/referencias-mercado");
}
