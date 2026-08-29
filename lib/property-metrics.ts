type DecimalLike = { toString(): string } | null;

function toNumber(value: DecimalLike) {
  if (value === null) return null;

  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculatePricePerSquareMeter({
  price,
  area,
}: {
  price: DecimalLike;
  area: DecimalLike;
}) {
  const numericPrice = toNumber(price);
  const numericArea = toNumber(area);

  if (
    numericPrice === null ||
    numericArea === null ||
    numericPrice <= 0 ||
    numericArea <= 0
  ) {
    return null;
  }

  return numericPrice / numericArea;
}

export function formatPricePerSquareMeter(value: number | null) {
  if (value === null) return "Consulte a B&B";

  return `${new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)}/m²`;
}
