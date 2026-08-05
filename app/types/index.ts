export type Property = {
  code: string;
  title: string;
  location: string;
  price: string;
  image: string;
  tag: string;

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