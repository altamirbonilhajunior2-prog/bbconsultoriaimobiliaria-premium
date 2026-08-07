export type PropertyPurpose =
  | "Venda"
  | "Locação"
  | "Venda e locação";

export type OpportunityProfile =
  | "Moradia"
  | "Investimento"
  | "Renda"
  | "Valorização"
  | "Lançamento";

export type PropertyType =
  | "Casa"
  | "Apartamento"
  | "Terreno"
  | "Comercial"
  | "Rural";

export type PropertyStatus =
  | "Disponível"
  | "Reservado"
  | "Vendido"
  | "Alugado"
  | "Em análise";

export type Property = {
  id: number;

  code: string;

  title: string;

  purpose: PropertyPurpose;

  opportunityProfile?: OpportunityProfile[];

  propertyType: PropertyType;

  category: string;

  state: string;

  city: string;

  neighborhood: string;

  development?: string;

  location: string;

  address?: string;

  zipCode?: string;

  latitude?: number;

  longitude?: number;

  googleMapsUrl?: string;

  price: string;

  numericPrice?: number;

  rentalPrice?: string;

  numericRentalPrice?: number;

  image: string;

  tag: string;

  status: PropertyStatus;

  highlight: boolean;

  consultantScore?: number;

  area: string;

  landArea?: string;

  bedrooms: string;

  suites?: string;

  bathrooms?: string;

  parking: string;

  condominium?: string;

  iptu?: string;

  description?: string;

  gallery?: string[];

  features?: string[];

  video?: string;

  virtualTour?: string;

  brochure?: string;

  seoTitle?: string;

  seoDescription?: string;

  seoImage?: string;
};

export type Neighborhood = {
  name: string;
  slug: string;
  image: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  profile: string;
};