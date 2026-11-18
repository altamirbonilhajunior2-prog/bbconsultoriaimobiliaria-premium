export const propertyUseLabels = {
  RESIDENCIAL: "Residencial",
  COMERCIAL: "Comercial",
  MISTO: "Misto",
} as const;

export type PropertyUseValue = keyof typeof propertyUseLabels;

export function isPropertyUse(value: unknown): value is PropertyUseValue {
  return typeof value === "string" && Object.hasOwn(propertyUseLabels, value);
}

// An omitted field preserves the stored value when an older form is submitted.
// An explicit empty option clears the classification without inferring a use.
export function parsePropertyUse(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  if (value === "") return null;
  if (isPropertyUse(value)) return value;
  throw new Error("Selecione um uso válido: Residencial, Comercial ou Misto.");
}

export function matchesPropertyUseFilter(
  propertyUse: PropertyUseValue | null,
  selectedUse: string | null | undefined,
) {
  if (!selectedUse) return true;
  return isPropertyUse(selectedUse) && propertyUse === selectedUse;
}
