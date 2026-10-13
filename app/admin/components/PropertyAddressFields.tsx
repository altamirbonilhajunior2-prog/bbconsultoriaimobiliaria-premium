
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import NeighborhoodGeolocationField from "./NeighborhoodGeolocationField";

type CepResult = {
  found: boolean;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  error?: string;
};

type AddressSearchResult = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  ibge: string;
};

type AddressSearchResponse = {
  found: boolean;
  count?: number;
  results?: AddressSearchResult[];
  error?: string;
};

type PropertyAddressFieldsProps = {
  inputClass: string;
  labelClass?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultNeighborhood?: string;
  defaultAddress?: string;
  defaultZipCode?: string;
  defaultDevelopment?: string;
  canCreateDevelopment?: boolean;
};

type DevelopmentSelection = {
  name: string;
  locationKey: string;
};

type DevelopmentOptions = {
  names: string[];
  locationKey: string;
};

function normalizeLocationPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

function makeLocationKey(
  state: string,
  city: string,
  neighborhood: string,
) {
  return JSON.stringify([
    state.trim().toUpperCase(),
    normalizeLocationPart(city),
    normalizeLocationPart(neighborhood),
  ]);
}

function uniqueSortedNames(values: string[]) {
  return Array.from(
    new Set(values.filter((value) => value.trim())),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function PropertyAddressFields({
  inputClass,
  labelClass = "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500",
  defaultState = "SP",
  defaultCity = "São José dos Campos",
  defaultNeighborhood = "",
  defaultAddress = "",
  defaultZipCode = "",
  defaultDevelopment = "",
  canCreateDevelopment = false,
}: PropertyAddressFieldsProps) {
  const [state, setState] = useState(defaultState);
  const [city, setCity] = useState(defaultCity);

  const [neighborhood, setNeighborhood] = useState(
    defaultNeighborhood,
  );

  const [address, setAddress] = useState(defaultAddress);

  const [zipCode, setZipCode] = useState(
    formatCep(defaultZipCode),
  );

  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingStreetSearch, setLoadingStreetSearch] =
    useState(false);

  const [cepMessage, setCepMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [addressResults, setAddressResults] =
    useState<AddressSearchResult[]>([]);

  const locationKey = makeLocationKey(
    state,
    city,
    neighborhood,
  );

  const latestLocationKeyRef = useRef(locationKey);

  const [developmentOptions, setDevelopmentOptions] =
    useState<DevelopmentOptions>(() => ({
      names: [],
      locationKey: makeLocationKey(
        defaultState,
        defaultCity,
        defaultNeighborhood,
      ),
    }));

  const [developmentSelection, setDevelopmentSelection] =
    useState<DevelopmentSelection>(() => ({
      name: defaultDevelopment,
      locationKey: makeLocationKey(
        defaultState,
        defaultCity,
        defaultNeighborhood,
      ),
    }));

  const [loadingDevelopments, setLoadingDevelopments] =
    useState(false);

  const [developmentLoadError, setDevelopmentLoadError] =
    useState<string | null>(null);

  const [showDevelopmentForm, setShowDevelopmentForm] =
    useState(false);

  const [newDevelopmentType, setNewDevelopmentType] =
    useState<"CONDOMINIO" | "EDIFICIO">("CONDOMINIO");

  const [newDevelopmentName, setNewDevelopmentName] =
    useState("");

  const [creatingDevelopment, setCreatingDevelopment] =
    useState(false);

  const [developmentMessage, setDevelopmentMessage] =
    useState<string | null>(null);

  const development =
    developmentSelection.locationKey === locationKey
      ? developmentSelection.name
      : "";

  const availableDevelopments =
    developmentOptions.locationKey === locationKey
      ? developmentOptions.names
      : [];

  // Preserva o empreendimento atualmente salvo no imóvel
  // enquanto sua localização não for alterada.
  const visibleDevelopments = uniqueSortedNames([
    ...availableDevelopments,
    ...(development ? [development] : []),
  ]);

  useEffect(() => {
    latestLocationKeyRef.current = locationKey;
  }, [locationKey]);

  function clearSearchResults() {
    setAddressResults([]);
  }

  function invalidateDevelopment() {
    latestLocationKeyRef.current = "";

    setDevelopmentSelection({
      name: "",
      locationKey: "",
    });

    setShowDevelopmentForm(false);
    setNewDevelopmentName("");
    setDevelopmentMessage(null);
  }

  function updateLocation(
    nextState: string,
    nextCity: string,
    nextNeighborhood: string,
  ) {
    if (
      makeLocationKey(
        nextState,
        nextCity,
        nextNeighborhood,
      ) !== locationKey
    ) {
      invalidateDevelopment();
    }

    setState(nextState);
    setCity(nextCity);
    setNeighborhood(nextNeighborhood);
  }

  function handleZipCodeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setZipCode(formatCep(event.target.value));
    setCepMessage(null);
    clearSearchResults();
  }

  function handleAddressChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setAddress(event.target.value);
    setCepMessage(null);
    clearSearchResults();
  }

  async function lookupCep() {
    const digits = zipCode.replace(/\D/g, "");

    if (digits.length !== 8) {
      setCepMessage({
        type: "error",
        text: "Informe um CEP válido com 8 dígitos.",
      });
      return;
    }

    setLoadingCep(true);
    setCepMessage(null);
    clearSearchResults();

    try {
      const response = await fetch(
        `/api/admin/cep?cep=${encodeURIComponent(digits)}`,
        { cache: "no-store" },
      );

      const payload = (await response.json()) as CepResult;

      if (!response.ok || !payload.found) {
        setCepMessage({
          type: "error",
          text: payload.error ?? "CEP não encontrado.",
        });
        return;
      }

      updateLocation(
        payload.state || state,
        payload.city || city,
        payload.neighborhood || neighborhood,
      );

      if (payload.cep) {
        setZipCode(formatCep(payload.cep));
      }

      if (payload.street) {
        setAddress(payload.street);
      }

      setCepMessage({
        type: "success",
        text:
          "Endereço localizado pelo CEP. Confira os dados e complete o número do imóvel.",
      });
    } catch {
      setCepMessage({
        type: "error",
        text: "Não foi possível consultar o CEP agora.",
      });
    } finally {
      setLoadingCep(false);
    }
  }

  async function lookupCepByStreet() {
    const normalizedState = state.trim().toUpperCase();
    const normalizedCity = city.trim();

    const normalizedStreet = normalizeStreetForSearch(
      address,
    );

    if (normalizedState.length !== 2) {
      setCepMessage({
        type: "error",
        text: "Informe a UF com 2 caracteres.",
      });
      return;
    }

    if (normalizedCity.length < 3) {
      setCepMessage({
        type: "error",
        text: "Informe a cidade antes de buscar o CEP.",
      });
      return;
    }

    if (normalizedStreet.length < 3) {
      setCepMessage({
        type: "error",
        text:
          "Informe pelo menos 3 caracteres do nome da rua.",
      });
      return;
    }

    setLoadingStreetSearch(true);
    setCepMessage(null);
    clearSearchResults();

    try {
      const query = new URLSearchParams({
        state: normalizedState,
        city: normalizedCity,
        street: normalizedStreet,
      });

      const response = await fetch(
        `/api/admin/cep?${query.toString()}`,
        { cache: "no-store" },
      );

      const payload =
        (await response.json()) as AddressSearchResponse;

      if (!response.ok || !payload.found) {
        setCepMessage({
          type: "error",
          text:
            payload.error ??
            "Nenhum CEP encontrado para este endereço.",
        });
        return;
      }

      const results = payload.results ?? [];

      if (results.length === 0) {
        setCepMessage({
          type: "error",
          text:
            "Nenhum CEP encontrado para este endereço.",
        });
        return;
      }

      if (results.length === 1) {
        applyAddressResult(results[0]);

        setCepMessage({
          type: "success",
          text: "CEP localizado pelo endereço.",
        });
        return;
      }

      setAddressResults(results);

      setCepMessage({
        type: "success",
        text:
          "Encontramos mais de um CEP possível. Selecione o endereço correto abaixo.",
      });
    } catch {
      setCepMessage({
        type: "error",
        text:
          "Não foi possível pesquisar o CEP pela rua agora.",
      });
    } finally {
      setLoadingStreetSearch(false);
    }
  }

  function applyAddressResult(result: AddressSearchResult) {
    updateLocation(
      result.state || state,
      result.city || city,
      result.neighborhood || neighborhood,
    );

    if (result.cep) {
      setZipCode(formatCep(result.cep));
    }

    if (result.street) {
      setAddress(result.street);
    }

    clearSearchResults();
  }

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadDevelopments() {
      setDevelopmentLoadError(null);

      if (
        !state.trim() ||
        !city.trim() ||
        !neighborhood.trim()
      ) {
        setDevelopmentOptions({
          names: [],
          locationKey,
        });
        setLoadingDevelopments(false);
        return;
      }

      setLoadingDevelopments(true);

      try {
        const query = new URLSearchParams({
          estado: state.trim(),
          cidade: city.trim(),
          bairro: neighborhood.trim(),
        });

        const response = await fetch(
          `/api/search-developments?${query.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Falha na consulta.");
        }

        const payload: unknown = await response.json();

        if (
          !Array.isArray(payload) ||
          !payload.every(
            (item) => typeof item === "string",
          )
        ) {
          throw new Error("Lista de condomínios inválida.");
        }

        if (cancelled) {
          return;
        }

        const names = payload as string[];

        setDevelopmentOptions((current) => ({
          locationKey,
          names: uniqueSortedNames([
            ...(current.locationKey === locationKey
              ? current.names
              : []),
            ...names,
          ]),
        }));
      } catch {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setDevelopmentLoadError(
          "Não foi possível carregar os condomínios e edifícios desta localização.",
        );
      } finally {
        if (!cancelled) {
          setLoadingDevelopments(false);
        }
      }
    }

    void loadDevelopments();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [state, city, neighborhood, locationKey]);

  async function createDevelopmentInline() {
    if (creatingDevelopment) {
      return;
    }

    const name = newDevelopmentName.trim();

    if (!name) {
      setDevelopmentMessage(
        "Informe o nome do condomínio ou edifício.",
      );
      return;
    }

    if (
      state.trim().length !== 2 ||
      !city.trim() ||
      !neighborhood.trim()
    ) {
      setDevelopmentMessage(
        "Informe corretamente estado, cidade e bairro antes do cadastro.",
      );
      return;
    }

    const requestedLocationKey = locationKey;

    setCreatingDevelopment(true);
    setDevelopmentMessage(null);

    try {
      const response = await fetch(
        "/api/admin/developments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: newDevelopmentType,
            name,
            state: state.trim().toUpperCase(),
            city: city.trim(),
            neighborhood: neighborhood.trim(),
          }),
        },
      );

      const payload = (await response.json()) as {
        success?: boolean;
        existing?: boolean;
        error?: string;
        development?: {
          name?: string;
          active?: boolean;
        };
      };

      if (
        !response.ok ||
        !payload.success ||
        !payload.development?.name ||
        payload.development.active === false
      ) {
        setDevelopmentMessage(
          payload.error ?? "Não foi possível cadastrar.",
        );
        return;
      }

      const createdName = payload.development.name;

      // Se o usuário mudou de localização durante a
      // requisição, não associar o cadastro à localização nova.
      if (
        latestLocationKeyRef.current !==
        requestedLocationKey
      ) {
        setDevelopmentMessage(
          "O empreendimento foi cadastrado na localização anterior, mas o imóvel mudou de bairro ou cidade. Selecione um empreendimento válido para a localização atual.",
        );
        return;
      }

      setDevelopmentOptions((current) => ({
        locationKey: requestedLocationKey,
        names: uniqueSortedNames([
          ...(current.locationKey === requestedLocationKey
            ? current.names
            : []),
          createdName,
        ]),
      }));

      setDevelopmentSelection({
        name: createdName,
        locationKey: requestedLocationKey,
      });

      setNewDevelopmentName("");
      setShowDevelopmentForm(false);

      setDevelopmentMessage(
        payload.existing
          ? "Empreendimento existente localizado e selecionado."
          : "Empreendimento cadastrado e selecionado.",
      );
    } catch {
      setDevelopmentMessage(
        "Não foi possível cadastrar agora.",
      );
    } finally {
      setCreatingDevelopment(false);
    }
  }

  return (
    <>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Estado</span>

        <input
          name="state"
          type="text"
          required
          maxLength={2}
          value={state}
          onChange={(event) => {
            const nextState =
              event.target.value.toUpperCase();

            if (nextState !== state) {
              invalidateDevelopment();
            }

            setState(nextState);
            clearSearchResults();
          }}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Cidade</span>

        <input
          name="city"
          type="text"
          required
          value={city}
          onChange={(event) => {
            const nextCity = event.target.value;

            if (nextCity !== city) {
              invalidateDevelopment();
            }

            setCity(nextCity);
            clearSearchResults();
          }}
          className={inputClass}
        />
      </label>

      <NeighborhoodGeolocationField
        value={neighborhood}
        onValueChange={(nextNeighborhood) => {
          if (nextNeighborhood !== neighborhood) {
            invalidateDevelopment();
          }

          setNeighborhood(nextNeighborhood);
        }}
        state={state}
        city={city}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="property-development"
          className={labelClass}
        >
          Condomínio ou edifício
        </label>

        <select
          id="property-development"
          name="development"
          value={development}
          onChange={(event) => {
            setDevelopmentSelection({
              name: event.target.value,
              locationKey,
            });

            setDevelopmentMessage(null);
          }}
          className={inputClass}
        >
          <option value="">
            Sem condomínio / edifício
          </option>

          {visibleDevelopments.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {loadingDevelopments ? (
          <p className="text-xs text-zinc-500">
            Carregando condomínios e edifícios...
          </p>
        ) : null}

        {developmentLoadError ? (
          <p className="text-xs text-red-300">
            {developmentLoadError}
          </p>
        ) : null}

        {canCreateDevelopment ? (
          <button
            type="button"
            onClick={() => {
              setShowDevelopmentForm(
                (current) => !current,
              );

              setDevelopmentMessage(null);
            }}
            className="min-h-10 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400"
          >
            {showDevelopmentForm
              ? "Cancelar novo cadastro"
              : "Cadastrar novo"}
          </button>
        ) : null}
      </div>

      {canCreateDevelopment && showDevelopmentForm ? (
        <div className="border border-amber-500/20 bg-amber-500/5 p-5 md:col-span-2 xl:col-span-4">
          <div className="grid gap-4 md:grid-cols-[180px_1fr_auto]">
            <select
              value={newDevelopmentType}
              disabled={creatingDevelopment}
              onChange={(event) =>
                setNewDevelopmentType(
                  event.target.value as
                    | "CONDOMINIO"
                    | "EDIFICIO",
                )
              }
              className={inputClass}
            >
              <option value="CONDOMINIO">
                Condomínio
              </option>

              <option value="EDIFICIO">
                Edifício
              </option>
            </select>

            <input
              type="text"
              value={newDevelopmentName}
              disabled={creatingDevelopment}
              onChange={(event) =>
                setNewDevelopmentName(
                  event.target.value,
                )
              }
              placeholder="Nome do condomínio ou edifício"
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => {
                void createDevelopmentInline();
              }}
              disabled={creatingDevelopment}
              className="min-h-12 bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
              {creatingDevelopment
                ? "Cadastrando..."
                : "Cadastrar"}
            </button>
          </div>
        </div>
      ) : null}

      {developmentMessage ? (
        <p className="text-xs leading-5 text-amber-300 md:col-span-2 xl:col-span-4">
          {developmentMessage}
        </p>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className={labelClass}>
          CEP (obrigatório se não informar o endereço)
        </span>

        <input
          name="zipCode"
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={zipCode}
          onChange={handleZipCodeChange}
          onBlur={() => {
            if (zipCode.replace(/\D/g, "").length === 8) {
              void lookupCep();
            }
          }}
          placeholder="00000-000"
          className={inputClass}
        />

        <button
          type="button"
          onClick={() => {
            void lookupCep();
          }}
          disabled={loadingCep}
          className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingCep
            ? "Buscando CEP..."
            : "Buscar endereço pelo CEP"}
        </button>
      </label>

      <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
        <span className={labelClass}>
          Endereço (obrigatório se não informar o CEP)
        </span>

        <input
          name="address"
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Rua, avenida e número"
          className={inputClass}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void lookupCepByStreet();
            }}
            disabled={loadingStreetSearch}
            className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingStreetSearch
              ? "Buscando CEP..."
              : "Buscar CEP pela rua"}
          </button>
        </div>

        <span className="text-[10px] leading-5 text-zinc-600">
          Informe obrigatoriamente o endereço ou um CEP
          válido. Para buscar o CEP pela rua, informe
          também a cidade e a UF. Quando o endereço
          for localizado pelo CEP, complete manualmente
          o número do imóvel quando necessário.
        </span>
      </label>

      {cepMessage ? (
        <div
          className={`md:col-span-2 xl:col-span-4 ${
            cepMessage.type === "success"
              ? "text-emerald-300"
              : "text-red-300"
          }`}
        >
          <p className="text-sm leading-6">
            {cepMessage.text}
          </p>
        </div>
      ) : null}

      {addressResults.length > 0 ? (
        <div className="md:col-span-2 xl:col-span-4">
          <div className="border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Selecione o CEP correto
            </p>

            <div className="mt-4 space-y-3">
              {addressResults.map((result, index) => (
                <button
                  key={`${result.cep}-${result.street}-${index}`}
                  type="button"
                  onClick={() => {
                    applyAddressResult(result);

                    setCepMessage({
                      type: "success",
                      text:
                        "CEP selecionado e endereço preenchido.",
                    });
                  }}
                  className="block w-full border border-white/10 bg-[#111111] p-4 text-left transition hover:border-amber-500/60"
                >
                  <p className="text-sm font-semibold text-white">
                    {result.street ||
                      "Logradouro não informado"}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    {result.neighborhood
                      ? `${result.neighborhood} — `
                      : ""}
                    {result.city}/{result.state}
                  </p>

                  <p className="mt-2 text-xs font-bold text-amber-400">
                    CEP {formatCep(result.cep)}
                  </p>

                  {result.complement ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      {result.complement}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function normalizeStreetForSearch(value: string) {
  return value
    .trim()
    .replace(
      /\s+\d+[A-Za-z]?(?:\s*[-/]\s*\d+[A-Za-z]?)?\s*$/,
      "",
    )
    .trim();
}

function formatCep(value: string) {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
