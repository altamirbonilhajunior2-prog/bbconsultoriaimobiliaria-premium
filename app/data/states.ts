export const states = [
  {
    name: "São Paulo",
    abbreviation: "SP",
  },
] as const;

export type StateName = (typeof states)[number]["name"];
export type StateAbbreviation = (typeof states)[number]["abbreviation"];