"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBuildings } from "../data/location/buildings";
import { getCities } from "../data/location/cities";
import { getCondominiums } from "../data/location/condominiums";
import { getNeighborhoods } from "../data/location/neighborhoods";
import {
  propertyTypes,
  stateOptions,
  values,
} from "../data/searchOptions";

type PropertyType = keyof typeof propertyTypes;

type PropertyPurpose =
  | "Venda"
  | "Locação"
  | "Venda e locação";

type PropertySearchProps = {
  showPurpose?: boolean;
  defaultPurpose?: PropertyPurpose;
};

const opportunityProfiles = [
  "Moradia",
  "Investimento",
  "Renda",
  "Valorização",
  "Lançamento",
] as const;

const allPropertyTypesLabel = "Todos os tipos";
const allCategoriesLabel = "Todas as categorias";
const allNeighborhoodsLabel = "Todos os bairros";
const allDevelopmentsLabel = "Todos os empreendimentos";
const allBedroomsLabel = "Qualquer quantidade";
const allValuesLabel = "Qualquer valor";
const allProfilesLabel = "Todos os perfis";

const bedroomOptions = [
  { value: "1", label: "01" },
  { value: "2", label: "02" },
  { value: "3", label: "03" },
  { value: "4+", label: "04 ou mais" },
];

function isPropertyType(value: string): value is PropertyType {
  return value in propertyTypes;
}

function isPropertyPurpose(
  value: string,
): value is PropertyPurpose {
  return (
    value === "Venda" ||
    value === "Locação" ||
    value === "Venda e locação"
  );
}

export default function PropertySearch({
  showPurpose = true,
  defaultPurpose = "Venda",
}: PropertySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType =
    searchParams.get("tipo") || allPropertyTypesLabel;

  const initialPurpose =
    searchParams.get("finalidade") || defaultPurpose;

  const [purpose, setPurpose] = useState<PropertyPurpose>(
    isPropertyPurpose(initialPurpose)
      ? initialPurpose
      : defaultPurpose,
  );

  const [opportunityProfile, setOpportunityProfile] =
    useState(
      searchParams.get("perfil") || allProfilesLabel,
    );

  const [state, setState] = useState(
    searchParams.get("estado") ||
      stateOptions[0]?.value ||
      "SP",
  );

  const [city, setCity] = useState(
    searchParams.get("cidade") ||
      "São José dos Campos",
  );

  const [neighborhood, setNeighborhood] = useState(
    searchParams.get("bairro") ||
      allNeighborhoodsLabel,
  );

  const [development, setDevelopment] = useState(
    searchParams.get("empreendimento") ||
      allDevelopmentsLabel,
  );

  const [propertyType, setPropertyType] = useState<
    PropertyType | typeof allPropertyTypesLabel
  >(
    isPropertyType(initialType)
      ? initialType
      : allPropertyTypesLabel,
  );

  const [category, setCategory] = useState(
    searchParams.get("categoria") ||
      allCategoriesLabel,
  );

  const [bedroom, setBedroom] = useState(
    searchParams.get("dormitorios") ||
      allBedroomsLabel,
  );

  const [value, setValue] = useState(
    searchParams.get("valor") ||
      allValuesLabel,
  );

  const cities = useMemo(
    () => [...getCities(state as "SP")],
    [state],
  );

  const neighborhoods = useMemo(
    () => [...getNeighborhoods(city)],
    [city],
  );

  const categories = useMemo(() => {
    if (propertyType === allPropertyTypesLabel) {
      return [];
    }

    return [...propertyTypes[propertyType]];
  }, [propertyType]);

  const developments = useMemo(() => {
    if (neighborhood === allNeighborhoodsLabel) {
      return [];
    }

    const condominiums = [
      ...getCondominiums(neighborhood),
    ];

    const buildings = [...getBuildings(neighborhood)];

    return Array.from(
      new Set([...condominiums, ...buildings]),
    );
  }, [neighborhood]);

  const shouldShowBedrooms =
    propertyType === allPropertyTypesLabel ||
    propertyType === "Casa" ||
    propertyType === "Apartamento";

  useEffect(() => {
    const purposeFromUrl =
      searchParams.get("finalidade");

    if (
      purposeFromUrl &&
      isPropertyPurpose(purposeFromUrl)
    ) {
      setPurpose(purposeFromUrl);
      return;
    }

    if (!showPurpose) {
      setPurpose(defaultPurpose);
    }
  }, [
    defaultPurpose,
    showPurpose,
    searchParams,
  ]);

  useEffect(() => {
    if (!shouldShowBedrooms) {
      setBedroom(allBedroomsLabel);
    }
  }, [shouldShowBedrooms]);

  function handleStateChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedState = event.target.value;

    const nextCities = [
      ...getCities(selectedState as "SP"),
    ];

    const nextCity = nextCities[0] || "";

    setState(selectedState);
    setCity(nextCity);
    setNeighborhood(allNeighborhoodsLabel);
    setDevelopment(allDevelopmentsLabel);
  }

  function handleCityChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setCity(event.target.value);
    setNeighborhood(allNeighborhoodsLabel);
    setDevelopment(allDevelopmentsLabel);
  }

  function handleNeighborhoodChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setNeighborhood(event.target.value);
    setDevelopment(allDevelopmentsLabel);
  }

  function handlePropertyTypeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedType = event.target.value;

    if (selectedType === allPropertyTypesLabel) {
      setPropertyType(allPropertyTypesLabel);
      setCategory(allCategoriesLabel);
      return;
    }

    if (isPropertyType(selectedType)) {
      setPropertyType(selectedType);
      setCategory(propertyTypes[selectedType][0]);
    }
  }

  function handlePurposeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedPurpose = event.target.value;

    if (isPropertyPurpose(selectedPurpose)) {
      setPurpose(selectedPurpose);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();

    const effectivePurpose =
      showPurpose
        ? purpose
        : defaultPurpose;

    params.set("finalidade", effectivePurpose);
    params.set("estado", state);

    if (city) {
      params.set("cidade", city);
    }

    if (opportunityProfile !== allProfilesLabel) {
      params.set("perfil", opportunityProfile);
    }

    if (neighborhood !== allNeighborhoodsLabel) {
      params.set("bairro", neighborhood);
    }

    if (development !== allDevelopmentsLabel) {
      params.set("empreendimento", development);
    }

    if (propertyType !== allPropertyTypesLabel) {
      params.set("tipo", propertyType);
    }

    if (
      propertyType !== allPropertyTypesLabel &&
      category !== allCategoriesLabel
    ) {
      params.set("categoria", category);
    }

    if (
      shouldShowBedrooms &&
      bedroom !== allBedroomsLabel
    ) {
      params.set("dormitorios", bedroom);
    }

    if (value !== allValuesLabel) {
      params.set("valor", value);
    }

    const destination =
      effectivePurpose === "Locação"
        ? "/alugar"
        : "/comprar";

    router.push(
      `${destination}?${params.toString()}`,
    );
  }

  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {showPurpose && (
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Finalidade
              </span>

              <select
                value={purpose}
                onChange={handlePurposeChange}
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option value="Venda">Venda</option>

                <option value="Locação">
                  Locação
                </option>

                <option value="Venda e locação">
                  Venda e locação
                </option>
              </select>
            </label>
          )}

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Perfil da oportunidade
            </span>

            <select
              value={opportunityProfile}
              onChange={(event) =>
                setOpportunityProfile(event.target.value)
              }
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              <option value={allProfilesLabel}>
                {allProfilesLabel}
              </option>

              {opportunityProfiles.map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Estado
            </span>

            <select
              value={state}
              onChange={handleStateChange}
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              {stateOptions.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Cidade
            </span>

            <select
              value={city}
              onChange={handleCityChange}
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Bairro
            </span>

            <select
              value={neighborhood}
              onChange={handleNeighborhoodChange}
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              <option value={allNeighborhoodsLabel}>
                {allNeighborhoodsLabel}
              </option>

              {neighborhoods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Condomínio ou edifício
            </span>

            <select
              value={development}
              onChange={(event) =>
                setDevelopment(event.target.value)
              }
              disabled={
                neighborhood === allNeighborhoodsLabel
              }
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:text-zinc-600"
            >
              <option value={allDevelopmentsLabel}>
                {neighborhood === allNeighborhoodsLabel
                  ? "Selecione o bairro primeiro"
                  : allDevelopmentsLabel}
              </option>

              {developments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Tipo de imóvel
            </span>

            <select
              value={propertyType}
              onChange={handlePropertyTypeChange}
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              <option value={allPropertyTypesLabel}>
                {allPropertyTypesLabel}
              </option>

              {Object.keys(propertyTypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Categoria
            </span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              disabled={
                propertyType === allPropertyTypesLabel
              }
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:text-zinc-600"
            >
              {propertyType === allPropertyTypesLabel ? (
                <option value={allCategoriesLabel}>
                  Selecione o tipo primeiro
                </option>
              ) : (
                categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </label>

          {shouldShowBedrooms && (
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Dormitórios
              </span>

              <select
                value={bedroom}
                onChange={(event) =>
                  setBedroom(event.target.value)
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option value={allBedroomsLabel}>
                  {allBedroomsLabel}
                </option>

                {bedroomOptions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Valor
            </span>

            <select
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
            >
              <option value={allValuesLabel}>
                {allValuesLabel}
              </option>

              {values
                .filter(
                  (item) =>
                    item !== "Todos os valores",
                )
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSearch}
            className="min-h-14 bg-amber-500 px-7 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 md:self-end"
          >
            Buscar imóveis
          </button>
        </div>
      </div>
    </section>
  );
}