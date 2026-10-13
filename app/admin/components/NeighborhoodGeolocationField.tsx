
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type LookupResult = {
  found: boolean;
  existing?: boolean;
  latitude?: number;
  longitude?: number;
  displayName?: string;
  source?: string | null;
  sourceUrl?: string | null;
  error?: string;
};

type LocationParams = {
  state: string;
  city: string;
  neighborhood: string;
};

type Props = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  state?: string;
  city?: string;
  inputClass: string;
  labelClass?: string;
};

function hasValidCoordinates(
  result: LookupResult,
): boolean {
  const { latitude, longitude } = result;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

export default function NeighborhoodGeolocationField({
  defaultValue = "",
  value,
  onValueChange,
  state,
  city,
  inputClass,
  labelClass = "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const [internalValue, setInternalValue] = useState(
    value ?? defaultValue,
  );

  const neighborhood = value ?? internalValue;

  const [result, setResult] = useState<LookupResult | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [searchedLocation, setSearchedLocation] =
    useState<LocationParams | null>(null);

  const invalidateLookup = useCallback(() => {
    requestIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;

    setResult(null);
    setConfirmed(false);
    setSearchedLocation(null);
    setLoading(false);
  }, []);

  // Invalida a confirmação se bairro, cidade ou UF mudar.
  useEffect(() => {
    invalidateLookup();
  }, [state, city, neighborhood, invalidateLookup]);

  // Interrompe pesquisas pendentes ao desmontar o componente.
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    };
  }, []);

  function handleNeighborhoodChange(nextValue: string) {
    invalidateLookup();

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  async function locateNeighborhood() {
    const input = inputRef.current;
    const form = input?.form;

    if (!input || !form) {
      setResult({
        found: false,
        error: "Formulário de localização não encontrado.",
      });
      return;
    }

    const data = new FormData(form);

    const location: LocationParams = {
      state: (
        state ?? String(data.get("state") ?? "")
      ).trim().toUpperCase(),
      city: (
        city ?? String(data.get("city") ?? "")
      ).trim(),
      neighborhood: neighborhood.trim(),
    };

    invalidateLookup();

    if (
      location.state.length !== 2 ||
      !location.city ||
      !location.neighborhood
    ) {
      setResult({
        found: false,
        error:
          "Preencha corretamente estado, cidade e bairro antes de localizar.",
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    controllerRef.current = controller;
    setLoading(true);
    setSearchedLocation(location);

    try {
      const query = new URLSearchParams({
        state: location.state,
        city: location.city,
        neighborhood: location.neighborhood,
      });

      const response = await fetch(
        `/api/admin/neighborhood-location?${query.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as LookupResult;

      // Nunca aplica uma resposta de pesquisa ultrapassada.
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok) {
        setResult({
          found: false,
          error:
            payload.error ??
            "Não foi possível consultar a localização.",
        });
        return;
      }

      if (payload.found && !hasValidCoordinates(payload)) {
        setResult({
          found: false,
          error:
            "O serviço retornou coordenadas inválidas. Tente novamente.",
        });
        return;
      }

      setResult(payload);

      setConfirmed(
        Boolean(payload.found && payload.existing),
      );
    } catch {
      if (
        controller.signal.aborted ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setResult({
        found: false,
        error: "Não foi possível consultar o mapa agora.",
      });
    } finally {
      if (requestId === requestIdRef.current) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }

  const matchesLookup =
    searchedLocation !== null &&
    searchedLocation.neighborhood === neighborhood.trim() &&
    searchedLocation.state ===
      (state ?? searchedLocation.state).trim().toUpperCase() &&
    searchedLocation.city ===
      (city ?? searchedLocation.city).trim();

  const hasCoordinates = Boolean(
    matchesLookup &&
      result?.found &&
      result &&
      hasValidCoordinates(result),
  );

  const latitude = hasCoordinates
    ? Number(result?.latitude)
    : 0;

  const longitude = hasCoordinates
    ? Number(result?.longitude)
    : 0;

  const confirmedForCurrentLocation =
    hasCoordinates && confirmed;

  const delta = 0.012;

  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        longitude - delta
      }%2C${latitude - delta}%2C${
        longitude + delta
      }%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "";

  return (
    <>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Bairro</span>

        <input
          ref={inputRef}
          name="neighborhood"
          required
          value={neighborhood}
          placeholder="Ex.: Urbanova"
          className={inputClass}
          onChange={(event) => {
            handleNeighborhoodChange(event.target.value);
          }}
        />

        <button
          type="button"
          onClick={() => {
            void locateNeighborhood();
          }}
          disabled={loading}
          className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 disabled:opacity-50"
        >
          {loading
            ? "Localizando..."
            : "Localizar bairro no mapa"}
        </button>

        <span className="text-xs font-normal normal-case tracking-normal text-zinc-500">
          Bairros novos são incluídos com a localização
          após a confirmação do pin e o salvamento do imóvel.
        </span>
      </label>

      {result?.error ? (
        <p className="text-sm text-red-300 md:col-span-2 xl:col-span-4">
          {result.error}
        </p>
      ) : null}

      {result && !result.found && !result.error ? (
        <p className="text-sm text-amber-300 md:col-span-2 xl:col-span-4">
          Bairro não encontrado. Confira a grafia e a cidade.
        </p>
      ) : null}

      {hasCoordinates ? (
        <div className="border border-white/10 bg-black p-4 md:col-span-2 xl:col-span-4">
          <p className="text-sm text-zinc-300">
            {result?.displayName}
          </p>

          <iframe
            title="Conferência do bairro"
            src={mapUrl}
            className="mt-4 h-64 w-full border-0"
            loading="lazy"
          />

          {result?.existing ? (
            <p className="mt-4 text-sm text-emerald-300">
              Bairro já validado na base da B&B.
            </p>
          ) : (
            <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={confirmedForCurrentLocation}
                onChange={(event) => {
                  setConfirmed(event.target.checked);
                }}
                className="mt-1 accent-amber-500"
              />

              Confirmo que o pin está dentro do bairro
              informado.
            </label>
          )}
        </div>
      ) : null}

      <input
        type="hidden"
        name="neighborhoodMapConfirmed"
        value={confirmedForCurrentLocation ? "1" : "0"}
      />

      <input
        type="hidden"
        name="neighborhoodLatitude"
        value={hasCoordinates ? String(latitude) : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLongitude"
        value={hasCoordinates ? String(longitude) : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLocationSource"
        value={hasCoordinates ? result?.source ?? "" : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLocationSourceUrl"
        value={hasCoordinates ? result?.sourceUrl ?? "" : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLookupState"
        value={hasCoordinates ? searchedLocation?.state ?? "" : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLookupCity"
        value={hasCoordinates ? searchedLocation?.city ?? "" : ""}
      />

      <input
        type="hidden"
        name="neighborhoodLookupName"
        value={hasCoordinates ? searchedLocation?.neighborhood ?? "" : ""}
      />
    </>
  );
}
