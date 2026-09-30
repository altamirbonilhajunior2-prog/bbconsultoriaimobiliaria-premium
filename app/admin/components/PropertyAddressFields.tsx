"use client";

import {
  useEffect,
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
  const [
    state,
    setState,
  ] = useState(
    defaultState,
  );

  const [
    city,
    setCity,
  ] = useState(
    defaultCity,
  );

  const [
    neighborhood,
    setNeighborhood,
  ] = useState(
    defaultNeighborhood,
  );

  const [
    address,
    setAddress,
  ] = useState(
    defaultAddress,
  );

  const [
    zipCode,
    setZipCode,
  ] = useState(
    formatCep(
      defaultZipCode,
    ),
  );

  const [
    loadingCep,
    setLoadingCep,
  ] = useState(false);

  const [
    loadingStreetSearch,
    setLoadingStreetSearch,
  ] = useState(false);

  const [
    cepMessage,
    setCepMessage,
  ] = useState<
    | {
        type:
          | "success"
          | "error";
        text: string;
      }
    | null
  >(null);

  const [
    addressResults,
    setAddressResults,
  ] = useState<
    AddressSearchResult[]
  >([]);

  const [developments, setDevelopments] =
    useState<string[]>([]);

  const [development, setDevelopment] =
    useState(defaultDevelopment);

  const [
    showDevelopmentForm,
    setShowDevelopmentForm,
  ] = useState(false);

  const [
    newDevelopmentType,
    setNewDevelopmentType,
  ] = useState<"CONDOMINIO" | "EDIFICIO">(
    "CONDOMINIO",
  );

  const [
    newDevelopmentName,
    setNewDevelopmentName,
  ] = useState("");

  const [
    creatingDevelopment,
    setCreatingDevelopment,
  ] = useState(false);

  const [
    developmentMessage,
    setDevelopmentMessage,
  ] = useState<string | null>(null);

  function clearSearchResults() {
    setAddressResults(
      [],
    );
  }

  function handleZipCodeChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const formatted =
      formatCep(
        event.target.value,
      );

    setZipCode(
      formatted,
    );

    setCepMessage(
      null,
    );

    clearSearchResults();
  }

  function handleAddressChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    setAddress(
      event.target.value,
    );

    setCepMessage(
      null,
    );

    clearSearchResults();
  }

  async function lookupCep() {
    const digits =
      zipCode.replace(
        /\D/g,
        "",
      );

    if (
      digits.length !== 8
    ) {
      setCepMessage({
        type: "error",
        text:
          "Informe um CEP válido com 8 dígitos.",
      });

      return;
    }

    setLoadingCep(true);
    setCepMessage(null);
    clearSearchResults();

    try {
      const response =
        await fetch(
          `/api/admin/cep?cep=${encodeURIComponent(
            digits,
          )}`,
          {
            cache:
              "no-store",
          },
        );

      const payload =
        (await response.json()) as CepResult;

      if (
        !response.ok ||
        !payload.found
      ) {
        setCepMessage({
          type: "error",
          text:
            payload.error ??
            "CEP não encontrado.",
        });

        return;
      }

      if (
        payload.cep
      ) {
        setZipCode(
          formatCep(
            payload.cep,
          ),
        );
      }

      if (
        payload.state
      ) {
        setState(
          payload.state,
        );
      }

      if (
        payload.city
      ) {
        setCity(
          payload.city,
        );
      }

      if (
        payload.neighborhood
      ) {
        setNeighborhood(
          payload.neighborhood,
        );
      }

      if (
        payload.street
      ) {
        setAddress(
          payload.street,
        );
      }

      setCepMessage({
        type: "success",
        text:
          "Endereço localizado pelo CEP. Confira os dados e complete o número do imóvel.",
      });
    } catch {
      setCepMessage({
        type: "error",
        text:
          "Não foi possível consultar o CEP agora.",
      });
    } finally {
      setLoadingCep(false);
    }
  }

  async function lookupCepByStreet() {
    const normalizedState =
      state
        .trim()
        .toUpperCase();

    const normalizedCity =
      city.trim();

    const normalizedStreet =
      normalizeStreetForSearch(
        address,
      );

    if (
      normalizedState.length !== 2
    ) {
      setCepMessage({
        type: "error",
        text:
          "Informe a UF com 2 caracteres.",
      });

      return;
    }

    if (
      normalizedCity.length < 3
    ) {
      setCepMessage({
        type: "error",
        text:
          "Informe a cidade antes de buscar o CEP.",
      });

      return;
    }

    if (
      normalizedStreet.length < 3
    ) {
      setCepMessage({
        type: "error",
        text:
          "Informe pelo menos 3 caracteres do nome da rua.",
      });

      return;
    }

    setLoadingStreetSearch(
      true,
    );

    setCepMessage(
      null,
    );

    clearSearchResults();

    try {
      const query =
        new URLSearchParams({
          state:
            normalizedState,
          city:
            normalizedCity,
          street:
            normalizedStreet,
        });

      const response =
        await fetch(
          `/api/admin/cep?${query.toString()}`,
          {
            cache:
              "no-store",
          },
        );

      const payload =
        (await response.json()) as AddressSearchResponse;

      if (
        !response.ok ||
        !payload.found
      ) {
        setCepMessage({
          type: "error",
          text:
            payload.error ??
            "Nenhum CEP encontrado para este endereço.",
        });

        return;
      }

      const results =
        payload.results ??
        [];

      if (
        results.length === 0
      ) {
        setCepMessage({
          type: "error",
          text:
            "Nenhum CEP encontrado para este endereço.",
        });

        return;
      }

      if (
        results.length === 1
      ) {
        applyAddressResult(
          results[0],
        );

        setCepMessage({
          type: "success",
          text:
            "CEP localizado pelo endereço.",
        });

        return;
      }

      setAddressResults(
        results,
      );

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
      setLoadingStreetSearch(
        false,
      );
    }
  }

  function applyAddressResult(
    result:
      AddressSearchResult,
  ) {
    if (
      result.cep
    ) {
      setZipCode(
        formatCep(
          result.cep,
        ),
      );
    }

    if (
      result.street
    ) {
      setAddress(
        result.street,
      );
    }

    if (
      result.neighborhood
    ) {
      setNeighborhood(
        result.neighborhood,
      );
    }

    if (
      result.city
    ) {
      setCity(
        result.city,
      );
    }

    if (
      result.state
    ) {
      setState(
        result.state,
      );
    }

    clearSearchResults();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDevelopments() {
      if (!city.trim() || !neighborhood.trim()) {
        setDevelopments(
          defaultDevelopment
            ? [defaultDevelopment]
            : [],
        );
        return;
      }

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
          },
        );

        if (!response.ok || cancelled) {
          return;
        }

        const data =
          (await response.json()) as string[];

        const options =
          defaultDevelopment &&
          !data.includes(defaultDevelopment)
            ? [defaultDevelopment, ...data]
            : data;

        if (!cancelled) {
          setDevelopments(
            Array.from(
              new Set(options),
            ).sort((a, b) =>
              a.localeCompare(b, "pt-BR"),
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setDevelopments(
            defaultDevelopment
              ? [defaultDevelopment]
              : [],
          );
        }
      }
    }

    void loadDevelopments();

    return () => {
      cancelled = true;
    };
  }, [
    state,
    city,
    neighborhood,
    defaultDevelopment,
  ]);

  async function createDevelopmentInline() {
    const name =
      newDevelopmentName.trim();

    if (!name) {
      setDevelopmentMessage(
        "Informe o nome do condom?nio ou edif?cio.",
      );
      return;
    }

    if (!city.trim() || !neighborhood.trim()) {
      setDevelopmentMessage(
        "Informe cidade e bairro antes do cadastro.",
      );
      return;
    }

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
            state: state.trim(),
            city: city.trim(),
            neighborhood:
              neighborhood.trim(),
          }),
        },
      );

      const payload =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          development?: {
            name?: string;
          };
        };

      if (
        !response.ok ||
        !payload.success ||
        !payload.development?.name
      ) {
        setDevelopmentMessage(
          payload.error ??
            "N?o foi poss?vel cadastrar.",
        );
        return;
      }

      const createdName =
        payload.development.name;

      setDevelopments((current) =>
        Array.from(
          new Set([
            ...current,
            createdName,
          ]),
        ).sort((a, b) =>
          a.localeCompare(b, "pt-BR"),
        ),
      );

      setDevelopment(createdName);
      setNewDevelopmentName("");
      setShowDevelopmentForm(false);

      setDevelopmentMessage(
        "Empreendimento cadastrado e selecionado.",
      );
    } catch {
      setDevelopmentMessage(
        "N?o foi poss?vel cadastrar agora.",
      );
    } finally {
      setCreatingDevelopment(false);
    }
  }

  return (
    <>
      <label className="flex flex-col gap-2">
        <span
          className={
            labelClass
          }
        >
          Estado
        </span>

        <input
          name="state"
          type="text"
          required
          maxLength={2}
          value={state}
          onChange={(
            event,
          ) => {
            setState(
              event.target.value.toUpperCase(),
            );

            clearSearchResults();
          }}
          className={
            inputClass
          }
        />
      </label>

      <label className="flex flex-col gap-2">
        <span
          className={
            labelClass
          }
        >
          Cidade
        </span>

        <input
          name="city"
          type="text"
          required
          value={city}
          onChange={(
            event,
          ) => {
            setCity(
              event.target.value,
            );

            clearSearchResults();
          }}
          className={
            inputClass
          }
        />
      </label>

      <NeighborhoodGeolocationField
        value={
          neighborhood
        }
        onValueChange={
          setNeighborhood
        }
        inputClass={
          inputClass
        }
        labelClass={
          labelClass
        }
      />

      <label className="flex flex-col gap-2">
        <span className={labelClass}>
          Condomínio ou edifício
        </span>

        <select
          name="development"
          value={development}
          onChange={(event) =>
            setDevelopment(
              event.target.value,
            )
          }
          className={inputClass}
        >
          <option value="">
            Sem condomínio / edifício
          </option>

          {developments.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

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
      </label>

      {canCreateDevelopment &&
      showDevelopmentForm ? (
        <div className="border border-amber-500/20 bg-amber-500/5 p-5 md:col-span-2 xl:col-span-4">
          <div className="grid gap-4 md:grid-cols-[180px_1fr_auto]">
            <select
              value={newDevelopmentType}
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
              onChange={(event) =>
                setNewDevelopmentName(
                  event.target.value,
                )
              }
              placeholder="Nome do condom?nio ou edif?cio"
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
        <span
          className={
            labelClass
          }
        >
          CEP (obrigatório se não informar o endereço)
        </span>

        <input
          name="zipCode"
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={zipCode}
          onChange={
            handleZipCodeChange
          }
          onBlur={() => {
            if (
              zipCode.replace(
                /\D/g,
                "",
              ).length === 8
            ) {
              void lookupCep();
            }
          }}
          placeholder="00000-000"
          className={
            inputClass
          }
        />

        <button
          type="button"
          onClick={() => {
            void lookupCep();
          }}
          disabled={
            loadingCep
          }
          className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingCep
            ? "Buscando CEP..."
            : "Buscar endereço pelo CEP"}
        </button>
      </label>

      <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
        <span
          className={
            labelClass
          }
        >
          Endereço (obrigatório se não informar o CEP)
        </span>

        <input
          name="address"
          type="text"
          value={address}
          onChange={
            handleAddressChange
          }
          placeholder="Rua, avenida e número"
          className={
            inputClass
          }
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void lookupCepByStreet();
            }}
            disabled={
              loadingStreetSearch
            }
            className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingStreetSearch
              ? "Buscando CEP..."
              : "Buscar CEP pela rua"}
          </button>
        </div>

        <span className="text-[10px] leading-5 text-zinc-600">
          Informe obrigatoriamente o endereço ou um CEP válido. Para buscar o CEP pela rua, informe também a cidade e a UF. Quando o endereço for localizado pelo CEP, complete manualmente o número do imóvel quando necessário.
        </span>
      </label>

      {cepMessage ? (
        <div
          className={`md:col-span-2 xl:col-span-4 ${
            cepMessage.type ===
            "success"
              ? "text-emerald-300"
              : "text-red-300"
          }`}
        >
          <p className="text-sm leading-6">
            {
              cepMessage.text
            }
          </p>
        </div>
      ) : null}

      {addressResults.length >
      0 ? (
        <div className="md:col-span-2 xl:col-span-4">
          <div className="border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
              Selecione o CEP correto
            </p>

            <div className="mt-4 space-y-3">
              {addressResults.map(
                (
                  result,
                  index,
                ) => (
                  <button
                    key={`${result.cep}-${result.street}-${index}`}
                    type="button"
                    onClick={() => {
                      applyAddressResult(
                        result,
                      );

                      setCepMessage({
                        type:
                          "success",
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
                      {result.city}/
                      {result.state}
                    </p>

                    <p className="mt-2 text-xs font-bold text-amber-400">
                      CEP{" "}
                      {formatCep(
                        result.cep,
                      )}
                    </p>

                    {result.complement ? (
                      <p className="mt-2 text-xs text-zinc-500">
                        {
                          result.complement
                        }
                      </p>
                    ) : null}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function normalizeStreetForSearch(
  value: string,
) {
  return value
    .trim()
    .replace(
      /\s+\d+[A-Za-z]?(?:\s*[-/]\s*\d+[A-Za-z]?)?\s*$/,
      "",
    )
    .trim();
}

function formatCep(
  value: string,
) {
  const digits =
    value
      .replace(
        /\D/g,
        "",
      )
      .slice(
        0,
        8,
      );

  if (
    digits.length <= 5
  ) {
    return digits;
  }

  return `${digits.slice(
    0,
    5,
  )}-${digits.slice(5)}`;
}