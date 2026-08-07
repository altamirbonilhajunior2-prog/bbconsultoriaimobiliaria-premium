export const citiesByState = {
  SP: [
    "São José dos Campos",
    "Jacareí",
    "Caçapava",
    "Taubaté",
  ],
} as const;

export type StateCode = keyof typeof citiesByState;

export function getCitiesByState(state: string) {
  if (!(state in citiesByState)) {
    return [];
  }

  return citiesByState[state as StateCode];
}