import type { Property } from "../types";

export const properties: Property[] = [
  {
    id: 1,
    code: "BBC0001",
    title: "Casa contemporânea no Alphaville II",

    purpose: "Venda",
    opportunityProfile: ["Moradia", "Valorização"],

    propertyType: "Casa",
    category: "Sobrado",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Urbanova",
    development: "Alphaville II",

    location: "Urbanova • São José dos Campos/SP",

    price: "R$ 3.300.000",
    numericPrice: 3300000,

    image: "/imoveis/bbc0001/01-fachada-principal.jpg",
    tag: "Exclusivo",

    status: "Disponível",
    highlight: true,
    consultantScore: 95,

    area: "310 m²",
    landArea: "479 m²",

    bedrooms: "4",
    suites: "4",
    bathrooms: "5",
    parking: "4",

    condominium: "R$ 940,00",
    iptu: "R$ 2.800,00",

    description:
      "Casa contemporânea de alto padrão localizada no Condomínio Alphaville II, no Urbanova, uma das regiões mais valorizadas de São José dos Campos. O condomínio possui fácil acesso às principais vias da cidade, à Via Dutra e ao Anel Viário, além de estar próximo a supermercados, escolas, farmácias, academias, restaurantes e diversos serviços essenciais. Com 310 m² de área construída em um terreno de 479 m², a residência foi projetada para oferecer integração entre os ambientes, iluminação natural e conforto. O imóvel dispõe de quatro suítes, living amplo com pé-direito elevado, cozinha planejada, espaço gourmet integrado, piscina, lavabo, área de serviço e quatro vagas de garagem. O Condomínio Alphaville II oferece segurança 24 horas, controle de acesso, piscina, academia, salão de festas, espaço gourmet, playground, áreas verdes e espaços de convivência.",

    gallery: [
      "/imoveis/bbc0001/01-fachada-principal.jpg",
      "/imoveis/bbc0001/02-fachada-noturna.jpg",
      "/imoveis/bbc0001/03-garagem.jpg",
      "/imoveis/bbc0001/04-living.jpg",
      "/imoveis/bbc0001/05-living-segundo-angulo.jpg",
      "/imoveis/bbc0001/06-escada-pe-direito.jpg",
      "/imoveis/bbc0001/07-cozinha.jpg",
      "/imoveis/bbc0001/08-lavanderia.jpg",
      "/imoveis/bbc0001/09-espaco-gourmet.jpg",
      "/imoveis/bbc0001/10-piscina.jpg",
      "/imoveis/bbc0001/11-area-externa.jpg",
      "/imoveis/bbc0001/12-fachada-fundos.jpg",
      "/imoveis/bbc0001/13-suite-master.jpg",
      "/imoveis/bbc0001/14-closet.jpg",
      "/imoveis/bbc0001/15-banheiro-master.jpg",
      "/imoveis/bbc0001/16-suite-02.jpg",
      "/imoveis/bbc0001/17-banheiro-suite-02.jpg",
      "/imoveis/bbc0001/18-suite-03.jpg",
      "/imoveis/bbc0001/19-banheiro-suite-03.jpg",
      "/imoveis/bbc0001/20-suite-04.jpg",
      "/imoveis/bbc0001/21-lavabo.jpg",
      "/imoveis/bbc0001/22-fachada-vista-geral.jpg",
    ],

    features: [
      "Living amplo com pé-direito elevado",
      "Quatro suítes",
      "Cozinha planejada",
      "Espaço gourmet integrado",
      "Piscina",
      "Lavabo",
      "Área de serviço",
      "Ambientes integrados",
      "Iluminação natural",
      "Quatro vagas de garagem",
      "Condomínio fechado",
      "Segurança 24 horas",
    ],
  },

  {
    id: 2,
    code: "BBC0002",
    title: "Residência com arquitetura integrada",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Casa",
    category: "Sobrado",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Urbanova",

    location: "Urbanova • São José dos Campos/SP",

    price: "Sob consulta",

    image: "/hero-clean.png",
    tag: "Exclusivo",

    status: "Em análise",
    highlight: true,

    area: "420 m²",

    bedrooms: "4",
    parking: "5",
  },

  {
    id: 3,
    code: "BBA0001",
    title: "Apartamento com vista privilegiada",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Apartamento",
    category: "Padrão",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Jardim Aquarius",

    location: "Jardim Aquarius • São José dos Campos/SP",

    price: "Sob consulta",

    image: "/hero-clean.png",
    tag: "Oportunidade",

    status: "Em análise",
    highlight: true,

    area: "158 m²",

    bedrooms: "3",
    parking: "3",
  },

  {
    id: 4,
    code: "BBC0003",
    title: "Casa térrea integrada à natureza",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Casa",
    category: "Térrea",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Colinas do Parahyba",

    location: "Colinas do Parahyba • São José dos Campos/SP",

    price: "R$ 3.980.000",
    numericPrice: 3980000,

    image: "/hero-clean.png",
    tag: "Selecionado",

    status: "Em análise",
    highlight: true,

    area: "360 m²",

    bedrooms: "4",
    parking: "6",
  },

  {
    id: 5,
    code: "BBA0002",
    title: "Apartamento de alto padrão",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Apartamento",
    category: "Padrão",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Jardim Aquarius",

    location: "Jardim Aquarius • São José dos Campos/SP",

    price: "R$ 2.180.000",
    numericPrice: 2180000,

    image: "/hero-clean.png",
    tag: "Novo",

    status: "Em análise",
    highlight: false,

    area: "185 m²",

    bedrooms: "3",
    parking: "3",
  },

  {
    id: 6,
    code: "BBC0004",
    title: "Residência exclusiva",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Casa",
    category: "Sobrado",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Urbanova",

    location: "Urbanova • São José dos Campos/SP",

    price: "R$ 4.250.000",
    numericPrice: 4250000,

    image: "/hero-clean.png",
    tag: "Exclusivo",

    status: "Em análise",
    highlight: false,

    area: "440 m²",

    bedrooms: "4",
    parking: "6",
  },

  {
    id: 7,
    code: "BBA0003",
    title: "Cobertura com vista panorâmica",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Apartamento",
    category: "Cobertura",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Colinas",

    location: "Colinas • São José dos Campos/SP",

    price: "Sob consulta",

    image: "/hero-clean.png",
    tag: "Destaque",

    status: "Em análise",
    highlight: false,

    area: "290 m²",

    bedrooms: "4",
    parking: "4",
  },

  {
    id: 8,
    code: "BBC0005",
    title: "Casa moderna integrada",

    purpose: "Venda",
    opportunityProfile: ["Moradia"],

    propertyType: "Casa",
    category: "Sobrado",

    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Altos do Esplanada",

    location: "Altos do Esplanada • São José dos Campos/SP",

    price: "R$ 3.650.000",
    numericPrice: 3650000,

    image: "/hero-clean.png",
    tag: "Oportunidade",

    status: "Em análise",
    highlight: false,

    area: "335 m²",

    bedrooms: "4",
    parking: "4",
  },
];