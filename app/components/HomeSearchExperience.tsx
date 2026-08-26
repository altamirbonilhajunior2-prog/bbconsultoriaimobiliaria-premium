"use client";

import { Suspense, useState } from "react";
import Hero from "./Hero";
import PropertySearch from "./PropertySearch";

export type HomePropertyType =
  | "Todos os tipos"
  | "Casa"
  | "Apartamento"
  | "Cobertura"
  | "Terreno"
  | "Comercial"
  | "Chácara"
  | "Fazenda"
  | "Sítio"
  | "Área Rural";

export type HomeLocation =
  | "São José dos Campos"
  | "Urbanova"
  | "Jardim Aquarius"
  | "Colinas"
  | "Altos do Esplanada";

export type HomePriceRange =
  | "Qualquer valor"
  | "Até R$ 1 milhão"
  | "Até R$ 2 milhões"
  | "Até R$ 3 milhões"
  | "Acima de R$ 3 milhões";

export type HomeSearchState = {
  propertyType: HomePropertyType;
  location: HomeLocation;
  priceRange: HomePriceRange;
};

export default function HomeSearchExperience() {
  const [
    searchState,
    setSearchState,
  ] = useState<HomeSearchState>({
    propertyType: "Todos os tipos",
    location: "São José dos Campos",
    priceRange: "Qualquer valor",
  });

  return (
    <>
      <Hero
        searchState={searchState}
        onSearchStateChange={
          setSearchState
        }
      />

      <Suspense
        fallback={
          <section className="border-b border-white/10 bg-black">
            <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
              <div className="h-40 animate-pulse border border-white/10 bg-[#111111]" />
            </div>
          </section>
        }
      >
        <PropertySearch
          showCustomSearchCTA
          searchState={
            searchState
          }
        />
      </Suspense>
    </>
  );
}
