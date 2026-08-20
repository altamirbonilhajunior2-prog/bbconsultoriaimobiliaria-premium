"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
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
import type {
  HomeSearchState,
} from "./HomeSearchExperience";

type PropertyType = keyof typeof propertyTypes;

type PropertyPurpose =
  | "Venda"
  | "Locação"
  | "Venda e locação";

type PropertySearchProps = {
  showPurpose?: boolean;
  defaultPurpose?: PropertyPurpose;
  showCustomSearchCTA?: boolean;
  searchState?: HomeSearchState;
};

const opportunityProfiles = [
  "Moradia",
  "Investimento",
  "Renda",
  "Valorização",
  "Lançamento",
] as const;

const customPropertyTypes = [
  "Casa",
  "Apartamento",
  "Terreno",
  "Comercial",
] as const;

const customValueRanges = [
  "Até R$ 500 mil",
  "De R$ 500 mil a R$ 1 milhão",
  "De R$ 1 milhão a R$ 2 milhões",
  "De R$ 2 milhões a R$ 3 milhões",
  "Acima de R$ 3 milhões",
  "Ainda não defini",
] as const;

const customObjectives = [
  "Moradia",
  "Investimento",
  "Renda",
  "Outro",
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

function isPropertyType(
  value: string,
): value is PropertyType {
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
  showCustomSearchCTA = false,
  searchState,
}: PropertySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType =
    searchParams.get("tipo") ||
    allPropertyTypesLabel;

  const initialPurpose =
    searchParams.get("finalidade") ||
    defaultPurpose;

  const [purpose, setPurpose] =
    useState<PropertyPurpose>(
      isPropertyPurpose(initialPurpose)
        ? initialPurpose
        : defaultPurpose,
    );

  const [
    opportunityProfile,
    setOpportunityProfile,
  ] = useState(
    searchParams.get("perfil") ||
      allProfilesLabel,
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

  const [
    neighborhood,
    setNeighborhood,
  ] = useState(
    searchParams.get("bairro") ||
      allNeighborhoodsLabel,
  );

  const [
    development,
    setDevelopment,
  ] = useState(
    searchParams.get("empreendimento") ||
      allDevelopmentsLabel,
  );

  const [
    propertyType,
    setPropertyType,
  ] = useState<
    PropertyType |
      typeof allPropertyTypesLabel
  >(
    isPropertyType(initialType)
      ? initialType
      : allPropertyTypesLabel,
  );

  const [category, setCategory] =
    useState(
      searchParams.get("categoria") ||
        allCategoriesLabel,
    );

  const [bedroom, setBedroom] =
    useState(
      searchParams.get("dormitorios") ||
        allBedroomsLabel,
    );

  const [value, setValue] =
    useState(
      searchParams.get("valor") ||
        allValuesLabel,
    );

  const [
    isCustomSearchOpen,
    setIsCustomSearchOpen,
  ] = useState(false);

  const cities = useMemo(
    () => [
      ...getCities(
        state as "SP",
      ),
    ],
    [state],
  );

  const neighborhoods =
    useMemo(
      () => [
        ...getNeighborhoods(
          city,
        ),
      ],
      [city],
    );

  const categories =
    useMemo(() => {
      if (
        propertyType ===
        allPropertyTypesLabel
      ) {
        return [];
      }

      return [
        ...propertyTypes[
          propertyType
        ],
      ];
    }, [propertyType]);

  const developments =
    useMemo(() => {
      if (
        neighborhood ===
        allNeighborhoodsLabel
      ) {
        return [];
      }

      const condominiums = [
        ...getCondominiums(
          neighborhood,
        ),
      ];

      const buildings = [
        ...getBuildings(
          neighborhood,
        ),
      ];

      return Array.from(
        new Set([
          ...condominiums,
          ...buildings,
        ]),
      );
    }, [neighborhood]);

  const shouldShowBedrooms =
    propertyType ===
      allPropertyTypesLabel ||
    propertyType === "Casa" ||
    propertyType ===
      "Apartamento";

  useEffect(() => {
    const purposeFromUrl =
      searchParams.get(
        "finalidade",
      );

    if (
      purposeFromUrl &&
      isPropertyPurpose(
        purposeFromUrl,
      )
    ) {
      setPurpose(
        purposeFromUrl,
      );

      return;
    }

    if (!showPurpose) {
      setPurpose(
        defaultPurpose,
      );
    }
  }, [
    defaultPurpose,
    showPurpose,
    searchParams,
  ]);

  useEffect(() => {
    if (!searchState) {
      return;
    }

    if (
      searchState.propertyType ===
      "Cobertura"
    ) {
      setPropertyType(
        "Apartamento",
      );

      setCategory(
        "Cobertura",
      );
    } else if (
      searchState.propertyType ===
      allPropertyTypesLabel
    ) {
      setPropertyType(
        allPropertyTypesLabel,
      );

      setCategory(
        allCategoriesLabel,
      );
    } else if (
      isPropertyType(
        searchState.propertyType,
      )
    ) {
      setPropertyType(
        searchState.propertyType,
      );

      setCategory(
        allCategoriesLabel,
      );
    }

    if (
      searchState.location ===
      "São José dos Campos"
    ) {
      setNeighborhood(
        allNeighborhoodsLabel,
      );
    } else {
      setNeighborhood(
        searchState.location,
      );
    }

    setDevelopment(
      allDevelopmentsLabel,
    );

    setValue(
      searchState.priceRange,
    );
  }, [searchState]);

  useEffect(() => {
    if (
      !shouldShowBedrooms
    ) {
      setBedroom(
        allBedroomsLabel,
      );
    }
  }, [
    shouldShowBedrooms,
  ]);

  useEffect(() => {
    if (
      !isCustomSearchOpen
    ) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setIsCustomSearchOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.body.style.overflow =
        "";
    };
  }, [
    isCustomSearchOpen,
  ]);

  function handleStateChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedState =
      event.target.value;

    const nextCities = [
      ...getCities(
        selectedState as "SP",
      ),
    ];

    const nextCity =
      nextCities[0] || "";

    setState(
      selectedState,
    );

    setCity(
      nextCity,
    );

    setNeighborhood(
      allNeighborhoodsLabel,
    );

    setDevelopment(
      allDevelopmentsLabel,
    );
  }

  function handleCityChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setCity(
      event.target.value,
    );

    setNeighborhood(
      allNeighborhoodsLabel,
    );

    setDevelopment(
      allDevelopmentsLabel,
    );
  }

  function handleNeighborhoodChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setNeighborhood(
      event.target.value,
    );

    setDevelopment(
      allDevelopmentsLabel,
    );
  }

  function handlePropertyTypeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedType =
      event.target.value;

    if (
      selectedType ===
      allPropertyTypesLabel
    ) {
      setPropertyType(
        allPropertyTypesLabel,
      );

      setCategory(
        allCategoriesLabel,
      );

      return;
    }

    if (
      isPropertyType(
        selectedType,
      )
    ) {
      setPropertyType(
        selectedType,
      );

      setCategory(
        allCategoriesLabel,
      );
    }
  }

  function handlePurposeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedPurpose =
      event.target.value;

    if (
      isPropertyPurpose(
        selectedPurpose,
      )
    ) {
      setPurpose(
        selectedPurpose,
      );
    }
  }

  function handleSearch() {
    const params =
      new URLSearchParams();

    const effectivePurpose =
      showPurpose
        ? purpose
        : defaultPurpose;

    params.set(
      "finalidade",
      effectivePurpose,
    );

    params.set(
      "estado",
      state,
    );

    if (city) {
      params.set(
        "cidade",
        city,
      );
    }

    if (
      opportunityProfile !==
      allProfilesLabel
    ) {
      params.set(
        "perfil",
        opportunityProfile,
      );
    }

    if (
      neighborhood !==
      allNeighborhoodsLabel
    ) {
      params.set(
        "bairro",
        neighborhood,
      );
    }

    if (
      development !==
      allDevelopmentsLabel
    ) {
      params.set(
        "empreendimento",
        development,
      );
    }

    if (
      propertyType !==
      allPropertyTypesLabel
    ) {
      params.set(
        "tipo",
        propertyType,
      );
    }

    if (
      propertyType !==
        allPropertyTypesLabel &&
      category !==
        allCategoriesLabel
    ) {
      params.set(
        "categoria",
        category,
      );
    }

    if (
      shouldShowBedrooms &&
      bedroom !==
        allBedroomsLabel
    ) {
      params.set(
        "dormitorios",
        bedroom,
      );
    }

    if (
      value !==
      allValuesLabel
    ) {
      params.set(
        "valor",
        value,
      );
    }

    const destination =
      effectivePurpose ===
      "Locação"
        ? "/alugar"
        : "/comprar";

    router.push(
      `${destination}?${params.toString()}`,
    );
  }

  function handleCustomSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget,
      );

    const customType =
      String(
        formData.get(
          "customType",
        ) || "",
      );

    const customRegion =
      String(
        formData.get(
          "customRegion",
        ) || "",
      );

    const customValue =
      String(
        formData.get(
          "customValue",
        ) || "",
      );

    const customObjective =
      String(
        formData.get(
          "customObjective",
        ) || "",
      );

    const customDetails =
      String(
        formData.get(
          "customDetails",
        ) || "",
      ).trim();

    const message = [
      "Olá, gostaria que a B&B me ajudasse a encontrar um imóvel.",
      "",
      `Tipo de imóvel: ${customType}`,
      `Bairro ou região: ${customRegion}`,
      `Faixa de valor: ${customValue}`,
      `Objetivo: ${customObjective}`,
      "",
      "Detalhes adicionais:",
      customDetails ||
        "Não informado.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/5512978140636?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <>
      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {showPurpose && (
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                  Finalidade
                </span>

                <select
                  value={
                    purpose
                  }
                  onChange={
                    handlePurposeChange
                  }
                  className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
                >
                  <option value="Venda">
                    Venda
                  </option>

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
                value={
                  opportunityProfile
                }
                onChange={(event) =>
                  setOpportunityProfile(
                    event.target.value,
                  )
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option
                  value={
                    allProfilesLabel
                  }
                >
                  {
                    allProfilesLabel
                  }
                </option>

                {opportunityProfiles.map(
                  (profile) => (
                    <option
                      key={profile}
                      value={profile}
                    >
                      {profile}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Estado
              </span>

              <select
                value={state}
                onChange={
                  handleStateChange
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                {stateOptions.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Cidade
              </span>

              <select
                value={city}
                onChange={
                  handleCityChange
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                {cities.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Bairro
              </span>

              <select
                value={
                  neighborhood
                }
                onChange={
                  handleNeighborhoodChange
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option
                  value={
                    allNeighborhoodsLabel
                  }
                >
                  {
                    allNeighborhoodsLabel
                  }
                </option>

                {neighborhoods.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Condomínio ou edifício
              </span>

              <select
                value={
                  development
                }
                onChange={(event) =>
                  setDevelopment(
                    event.target.value,
                  )
                }
                disabled={
                  neighborhood ===
                  allNeighborhoodsLabel
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                <option
                  value={
                    allDevelopmentsLabel
                  }
                >
                  {neighborhood ===
                  allNeighborhoodsLabel
                    ? "Selecione o bairro primeiro"
                    : allDevelopmentsLabel}
                </option>

                {developments.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Tipo de imóvel
              </span>

              <select
                value={
                  propertyType
                }
                onChange={
                  handlePropertyTypeChange
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option
                  value={
                    allPropertyTypesLabel
                  }
                >
                  {
                    allPropertyTypesLabel
                  }
                </option>

                {Object.keys(
                  propertyTypes,
                ).map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Categoria
              </span>

              <select
                value={
                  category
                }
                onChange={(event) =>
                  setCategory(
                    event.target.value,
                  )
                }
                disabled={
                  propertyType ===
                  allPropertyTypesLabel
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                {propertyType ===
                allPropertyTypesLabel ? (
                  <option
                    value={
                      allCategoriesLabel
                    }
                  >
                    Selecione o tipo primeiro
                  </option>
                ) : (
                  <>
                    <option
                      value={
                        allCategoriesLabel
                      }
                    >
                      {
                        allCategoriesLabel
                      }
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </>
                )}
              </select>
            </label>

            {shouldShowBedrooms && (
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                  Dormitórios
                </span>

                <select
                  value={
                    bedroom
                  }
                  onChange={(event) =>
                    setBedroom(
                      event.target.value,
                    )
                  }
                  className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
                >
                  <option
                    value={
                      allBedroomsLabel
                    }
                  >
                    {
                      allBedroomsLabel
                    }
                  </option>

                  {bedroomOptions.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    ),
                  )}
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
                  setValue(
                    event.target.value,
                  )
                }
                className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
              >
                <option
                  value={
                    allValuesLabel
                  }
                >
                  {
                    allValuesLabel
                  }
                </option>

                {values
                  .filter(
                    (item) =>
                      item !==
                      "Todos os valores",
                  )
                  .map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
              </select>
            </label>

            {showCustomSearchCTA ? (
              <div className="grid gap-5 md:col-span-2 xl:col-span-3 xl:grid-cols-2 2xl:col-span-5">
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="min-h-14 w-full bg-amber-500 px-7 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
                  >
                    Buscar imóveis
                  </button>
                </div>

                <div className="border border-amber-500/30 bg-[#0a0a0a] p-5 sm:p-6">
                  <p className="font-serif text-xl font-normal text-white sm:text-2xl">
                    Não encontrou o imóvel que procura?
                  </p>

                  <p className="mt-1 font-serif text-xl font-normal text-amber-400 sm:text-2xl">
                    Nós encontramos para você.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Conte o que busca e a B&amp;B faz a curadoria das
                    melhores oportunidades.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setIsCustomSearchOpen(
                        true,
                      )
                    }
                    className="mt-5 min-h-12 w-full border border-amber-500 px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
                  >
                    Encontrar meu imóvel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  handleSearch
                }
                className="min-h-14 bg-amber-500 px-7 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 md:self-end"
              >
                Buscar imóveis
              </button>
            )}
          </div>
        </div>
      </section>

      {isCustomSearchOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-search-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsCustomSearchOpen(
                false,
              );
            }
          }}
        >
          <div className="my-auto w-full max-w-3xl border border-amber-500/30 bg-[#080808] shadow-2xl">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 p-6 sm:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                  Busca personalizada B&amp;B
                </p>

                <h2
                  id="custom-search-title"
                  className="mt-3 font-serif text-3xl font-normal text-white sm:text-4xl"
                >
                  Conte o que você procura.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  Responda algumas perguntas rápidas e nossa equipe recebe
                  sua busca pelo WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCustomSearchOpen(
                    false,
                  )
                }
                aria-label="Fechar questionário"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-xl text-zinc-400 transition hover:border-amber-500 hover:text-amber-400"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleCustomSearchSubmit
              }
              className="p-6 sm:p-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    1. Qual tipo de imóvel você procura?
                  </span>

                  <select
                    name="customType"
                    required
                    defaultValue=""
                    className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    {customPropertyTypes.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    2. Em qual bairro ou região?
                  </span>

                  <input
                    type="text"
                    name="customRegion"
                    required
                    placeholder="Ex.: Urbanova, Aquarius..."
                    className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-amber-500"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    3. Qual faixa de valor?
                  </span>

                  <select
                    name="customValue"
                    required
                    defaultValue=""
                    className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    {customValueRanges.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    4. Qual é o seu objetivo?
                  </span>

                  <select
                    name="customObjective"
                    required
                    defaultValue=""
                    className="h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    {customObjectives.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              <label className="mt-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                  Conte um pouco mais sobre o imóvel que procura
                </span>

                <textarea
                  name="customDetails"
                  rows={5}
                  placeholder="Metragem, dormitórios, condomínio específico, prazo, preferências etc."
                  className="w-full resize-y border border-white/10 bg-[#111111] px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 transition focus:border-amber-500"
                />
              </label>

              <button
                type="submit"
                className="mt-7 min-h-14 w-full bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
              >
                Enviar minha busca para a B&amp;B
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-zinc-500">
                Suas respostas serão enviadas para o WhatsApp da B&amp;B
                Consultoria Imobiliária.
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}