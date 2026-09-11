import type { StateAbbreviation } from "./states";

export const citiesByState: Record<
  StateAbbreviation,
  string[]
> = {
  SP: [
    "São José dos Campos",
    "Jacareí",
    "Caçapava",
    "Taubaté",
    "Ubatuba",
    "Caraguatatuba",
    "São Sebastião",
    "Ilhabela",
    "Jambeiro",
    "Monteiro Lobato",
    "Paraibuna",
    "Santa Branca",
    "Guararema",
    "Pindamonhangaba",
    "Tremembé",
    "Campos do Jordão",
  ],
};

export function getCities(
  state: StateAbbreviation,
) {
  return citiesByState[state] ?? [];
}