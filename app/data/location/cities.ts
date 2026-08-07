import type { StateAbbreviation } from "./states";

export const citiesByState: Record<StateAbbreviation, string[]> = {
  SP: [
    "São José dos Campos",
    "Jacareí",
    "Caçapava",
    "Taubaté",
    "Jambeiro",
    "Monteiro Lobato",
    "Paraibuna",
  ],
};

export function getCities(state: StateAbbreviation) {
  return citiesByState[state] ?? [];
}