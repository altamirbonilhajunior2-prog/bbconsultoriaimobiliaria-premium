export const neighborhoodsByCity = {
  "São José dos Campos": [
    "Urbanova",
    "Jardim Aquarius",
    "Jardim das Colinas",
    "Colinas",
    "Altos do Esplanada",
    "Jardim Esplanada",
    "Vila Adyana",
    "Vila Ema",
    "Jardim Apolo",
    "Jardim São Dimas",
    "Centro",
    "Jardim Satélite",
    "Bosque dos Eucaliptos",
    "Floradas de São José",
    "Jardim América",
    "Jardim Oriente",
    "Jardim Alvorada",
    "Parque Industrial",
    "Vista Verde",
    "Putim",
    "Torrão de Ouro",
    "Eugênio de Melo",
    "Jardim Motorama",
    "Santa Inês",
    "Alto da Ponte",
    "Santana",
    "Jardim Paulista",
    "Vila Industrial",
    "Jardim Ismênia",
    "Jardim Portugal",
    "Palmeiras de São José",
    "Jardim Santa Júlia",
    "Campo dos Alemães",
    "Conjunto 31 de Março",
    "Cidade Morumbi",
    "Jardim Sul",
    "Jardim das Indústrias",
    "Limoeiro",
    "Capão Grosso",
    "Buquirinha",
    "Colinas do Parahyba",
  ],

  Jacareí: [],

  Caçapava: [],

  Taubaté: [],

  Jambeiro: [],

  "Monteiro Lobato": [],

  Paraibuna: [],
} as const;

export type CityName = keyof typeof neighborhoodsByCity;

export function getNeighborhoods(city: string) {
  if (!(city in neighborhoodsByCity)) {
    return [];
  }

  return neighborhoodsByCity[
    city as CityName
  ] as readonly string[];
}