"use client";

import {
  ChangeEvent,
  useMemo,
  useState,
} from "react";
import { getCities } from "../data/location/cities";
import { getNeighborhoods } from "../data/location/neighborhoods";
import {
  propertyTypes,
  values,
} from "../data/searchOptions";

type PropertyType = keyof typeof propertyTypes;

type PropertyPurpose =
  | "Venda"
  | "Locação"
  | "Venda e locação";

const bedrooms = [
  "Qualquer quantidade",
  "1",
  "2",
  "3",
  "4+",
];

export default function SearchPanel() {
  const cities = useMemo(
    () => [...getCities("SP")],
    [],
  );

  const [purpose, setPurpose] =
    useState<PropertyPurpose>("Venda");

  const [propertyType, setPropertyType] =
    useState<PropertyType>("Casa");

  const [category, setCategory] =
    useState<string>(
      propertyTypes.Casa[0],
    );

  const [city, setCity] =
    useState<string>(
      cities[0] ||
        "São José dos Campos",
    );

  const [neighborhood, setNeighborhood] =
    useState<string>(
      "Todos os bairros",
    );

  const [bedroom, setBedroom] =
    useState<string>(
      bedrooms[0],
    );

  const [value, setValue] =
    useState<string>(
      values[0],
    );

  const categories = useMemo(
    () => [
      ...propertyTypes[
        propertyType
      ],
    ],
    [propertyType],
  );

  const neighborhoods = useMemo(
    () => [
      ...getNeighborhoods(city),
    ],
    [city],
  );

  function handlePropertyTypeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const newPropertyType =
      event.target.value as PropertyType;

    setPropertyType(
      newPropertyType,
    );

    setCategory(
      propertyTypes[
        newPropertyType
      ][0],
    );
  }

  function handleCityChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setCity(
      event.target.value,
    );

    setNeighborhood(
      "Todos os bairros",
    );
  }

  function handleSearch() {
    const searchParams =
      new URLSearchParams();

    searchParams.set(
      "finalidade",
      purpose,
    );

    searchParams.set(
      "estado",
      "SP",
    );

    searchParams.set(
      "tipo",
      propertyType,
    );

    searchParams.set(
      "categoria",
      category,
    );

    searchParams.set(
      "cidade",
      city,
    );

    if (
      neighborhood !==
      "Todos os bairros"
    ) {
      searchParams.set(
        "bairro",
        neighborhood,
      );
    }

    if (
      bedroom !==
      "Qualquer quantidade"
    ) {
      searchParams.set(
        "dormitorios",
        bedroom,
      );
    }

    if (
      value !==
      "Qualquer valor"
    ) {
      searchParams.set(
        "valor",
        value,
      );
    }

    const destination =
      purpose === "Locação"
        ? "/alugar"
        : "/comprar";

    window.location.href =
      `${destination}?${searchParams.toString()}`;
  }

  return (
    <section className="relative z-20">
      <div className="mx-auto max-w-[1720px] px-6 lg:px-10 xl:px-12">
        <div className="grid gap-6 border border-white/10 bg-black/85 p-6 backdrop-blur-md md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Finalidade
            </span>

            <select
              value={purpose}
              onChange={(event) =>
                setPurpose(
                  event.target
                    .value as PropertyPurpose,
                )
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              <option
                value="Venda"
                className="bg-zinc-900"
              >
                Venda
              </option>

              <option
                value="Locação"
                className="bg-zinc-900"
              >
                Locação
              </option>

              <option
                value="Venda e locação"
                className="bg-zinc-900"
              >
                Venda e locação
              </option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Tipo de imóvel
            </span>

            <select
              value={propertyType}
              onChange={
                handlePropertyTypeChange
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              {Object.keys(
                propertyTypes,
              ).map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-zinc-900"
                >
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Categoria
            </span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-zinc-900"
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Cidade
            </span>

            <select
              value={city}
              onChange={
                handleCityChange
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              {cities.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-zinc-900"
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Bairro
            </span>

            <select
              value={neighborhood}
              onChange={(event) =>
                setNeighborhood(
                  event.target.value,
                )
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              <option
                value="Todos os bairros"
                className="bg-zinc-900"
              >
                Todos os bairros
              </option>

              {neighborhoods.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-zinc-900"
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Dormitórios
            </span>

            <select
              value={bedroom}
              onChange={(event) =>
                setBedroom(
                  event.target.value,
                )
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              {bedrooms.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-zinc-900"
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-3 border-b border-white/15 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D5A85A]">
              Valor
            </span>

            <select
              value={value}
              onChange={(event) =>
                setValue(
                  event.target.value,
                )
              }
              className="h-11 w-full min-w-0 bg-transparent text-base text-white outline-none"
            >
              {values.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-zinc-900"
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSearch}
            className="min-h-16 bg-[#D5A85A] px-7 text-sm font-bold uppercase tracking-[0.18em] text-black transition-colors duration-300 hover:bg-[#E5BC6B] 2xl:min-h-full"
          >
            Buscar imóveis
          </button>
        </div>
      </div>
    </section>
  );
}