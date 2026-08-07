export const condominiumsByNeighborhood = {
  Urbanova: [
    "Alphaville I",
    "Alphaville II",
    "Altos da Serra I",
    "Altos da Serra II",
    "Altos da Serra III",
    "Altos da Serra IV",
    "Altos da Serra V",
    "Altos da Serra VI",
    "Altos da Serra VII",
    "Altos da Serra VIII",
    "Chácara Serimbura",
    "Colinas do Paratehy",
    "Condomínio Jaguary",
    "Floradas da Serra",
    "Mônaco",
    "Monte Carlo",
    "Reserva do Paratehy Norte",
    "Reserva do Paratehy Sul",
    "Residencial Jaguary",
    "Terras Alpha",
    "Verana",
    "Vivendas do Sol",
  ],

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

export type NeighborhoodName = keyof typeof condominiumsByNeighborhood;

export function getCondominiums(neighborhood: string) {
  if (!(neighborhood in condominiumsByNeighborhood)) {
    return [];
  }

  return condominiumsByNeighborhood[
    neighborhood as NeighborhoodName
  ] as readonly string[];
}