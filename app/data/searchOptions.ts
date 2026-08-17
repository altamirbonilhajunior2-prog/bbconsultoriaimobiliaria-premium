import { states } from "./location/states";
import { getCities } from "./location/cities";
import { getNeighborhoods } from "./location/neighborhoods";

export const propertyTypes = {
  Casa: [
    "Padrão",
    "Térrea",
    "Sobrado",
    "Assobradada",
    "Village",
    "Condomínio Fechado",
  ],

  Apartamento: [
    "Padrão",
    "Garden",
    "Studio",
    "Duplex",
    "Cobertura",
  ],

  Terreno: [
    "Condomínio Fechado",
    "Residencial",
    "Comercial",
    "Industrial",
    "Rural",
  ],

  Comercial: [
    "Sala Comercial",
    "Loja",
    "Conjunto Comercial",
    "Galpão",
    "Prédio Comercial",
  ],

  Rural: [
    "Chácara",
    "Sítio",
    "Fazenda",
  ],
} as const;

export const stateOptions = states.map((state) => ({
  label: state.name,
  value: state.abbreviation,
}));

export const cityOptions = getCities("SP");

export const neighborhoodOptions =
  getNeighborhoods("São José dos Campos");

export const values = [
  "Todos os valores",
  "Até R$ 500 mil",
  "Até R$ 1 milhão",
  "Até R$ 2 milhões",
  "Até R$ 3 milhões",
  "Acima de R$ 3 milhões",
];

export const bedrooms = [
  "1",
  "2",
  "3",
  "4+",
];