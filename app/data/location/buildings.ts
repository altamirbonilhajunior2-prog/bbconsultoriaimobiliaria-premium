export const buildingsByNeighborhood = {
  Urbanova: [],

  "Jardim Aquarius": [],

  "Jardim das Colinas": [],

  Colinas: [],

  "Altos do Esplanada": [],

  "Jardim Esplanada": [],

  "Vila Adyana": [],

  "Vila Ema": [],

  "Jardim Apolo": [],

  "Jardim São Dimas": [],

  Centro: [],
} as const;

export type BuildingNeighborhoodName =
  keyof typeof buildingsByNeighborhood;

export function getBuildings(neighborhood: string) {
  if (!(neighborhood in buildingsByNeighborhood)) {
    return [];
  }

  return buildingsByNeighborhood[
    neighborhood as BuildingNeighborhoodName
  ] as readonly string[];
}