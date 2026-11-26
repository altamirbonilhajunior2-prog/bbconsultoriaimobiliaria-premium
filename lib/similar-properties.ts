import type { Prisma, Property } from "../generated/prisma/client";

type Profile = Pick<Property, "code" | "propertyType" | "category" | "city" | "state" | "purpose" | "bedrooms" | "suites" | "price" | "rentalPrice">;
export const SIMILAR_PRICE_MARGIN = 0.2;

export function similarPrice(property: Pick<Profile, "price" | "rentalPrice">, purpose: Profile["purpose"]) {
  const value = purpose === "LOCACAO" ? property.rentalPrice : property.price;
  return value === null ? 0 : Number(value);
}

export function similarPropertyWhere(source: Profile): Prisma.PropertyWhereInput | null {
  const price = similarPrice(source, source.purpose);
  if (!Number.isFinite(price) || price <= 0) return null;
  const range = { gte: Math.round(price * (1 - SIMILAR_PRICE_MARGIN) * 100) / 100, lte: Math.round(price * (1 + SIMILAR_PRICE_MARGIN) * 100) / 100 };
  return {
    published: true, status: "DISPONIVEL", code: { not: source.code },
    propertyType: source.propertyType,
    category: { equals: source.category, mode: "insensitive" },
    city: { equals: source.city, mode: "insensitive" }, state: source.state,
    bedrooms: source.bedrooms, suites: source.suites,
    purpose: { in: source.purpose === "LOCACAO" ? ["LOCACAO", "VENDA_E_LOCACAO"] : ["VENDA", "VENDA_E_LOCACAO"] },
    ...(source.purpose === "LOCACAO" ? { rentalPrice: range } : { price: range }),
  };
}

export function closestSimilarProperties<T extends Pick<Profile, "code" | "price" | "rentalPrice">>(source: Profile, candidates: T[]) {
  const price = similarPrice(source, source.purpose);
  return [...candidates].sort((a, b) =>
    Math.abs(similarPrice(a, source.purpose) - price) - Math.abs(similarPrice(b, source.purpose) - price)
    || a.code.localeCompare(b.code, "pt-BR", { numeric: true }),
  ).slice(0, 4);
}
