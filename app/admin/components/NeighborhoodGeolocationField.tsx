"use client";

import { useRef, useState } from "react";

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

type Props = {
  defaultValue?: string;
  inputClass: string;
  labelClass?: string;
};

export default function NeighborhoodGeolocationField({
  defaultValue = "",
  inputClass,
  labelClass = "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function locateNeighborhood() {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    const data = new FormData(form);
    const state = String(data.get("state") ?? "SP").trim();
    const city = String(data.get("city") ?? "").trim();
    const neighborhood = input.value.trim();

    if (!state || !city || !neighborhood) {
      setResult({ found: false, error: "Preencha estado, cidade e bairro antes de localizar." });
      return;
    }

    setLoading(true);
    setConfirmed(false);
    try {
      const query = new URLSearchParams({ state, city, neighborhood });
      const response = await fetch(`/api/admin/neighborhood-location?${query.toString()}`);
      const payload = (await response.json()) as LookupResult;
      setResult(payload);
      setConfirmed(Boolean(payload.found && payload.existing));
    } catch {
      setResult({ found: false, error: "Não foi possível consultar o mapa agora." });
    } finally {
      setLoading(false);
    }
  }

  const hasCoordinates =
    result?.found &&
    Number.isFinite(result.latitude) &&
    Number.isFinite(result.longitude);
  const latitude = hasCoordinates ? result.latitude! : 0;
  const longitude = hasCoordinates ? result.longitude! : 0;
  const delta = 0.012;
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "";

  return (
    <>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Bairro</span>
        <input
          ref={inputRef}
          name="neighborhood"
          required
          defaultValue={defaultValue}
          placeholder="Ex.: Urbanova"
          className={inputClass}
          onChange={() => {
            setResult(null);
            setConfirmed(false);
          }}
        />
        <button
          type="button"
          onClick={locateNeighborhood}
          disabled={loading}
          className="min-h-11 border border-amber-500/50 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 disabled:opacity-50"
        >
          {loading ? "Localizando..." : "Localizar bairro no mapa"}
        </button>
        <span className="text-xs font-normal normal-case tracking-normal text-zinc-500">
          Bairros novos são incluídos com a localização após a confirmação do pin.
        </span>
      </label>

      {result?.error ? (
        <p className="text-sm text-red-300 md:col-span-2 xl:col-span-4">{result.error}</p>
      ) : null}
      {result && !result.found && !result.error ? (
        <p className="text-sm text-amber-300 md:col-span-2 xl:col-span-4">Bairro não encontrado. Confira a grafia e a cidade.</p>
      ) : null}

      {hasCoordinates ? (
        <div className="border border-white/10 bg-black p-4 md:col-span-2 xl:col-span-4">
          <p className="text-sm text-zinc-300">{result.displayName}</p>
          <iframe title="Conferência do bairro" src={mapUrl} className="mt-4 h-64 w-full border-0" loading="lazy" />
          {result.existing ? (
            <p className="mt-4 text-sm text-emerald-300">Bairro já validado na base da B&B.</p>
          ) : (
            <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 accent-amber-500" />
              Confirmo que o pin está dentro do bairro informado.
            </label>
          )}
        </div>
      ) : null}

      <input type="hidden" name="neighborhoodMapConfirmed" value={confirmed ? "1" : "0"} />
      <input type="hidden" name="neighborhoodLatitude" value={hasCoordinates ? String(latitude) : ""} />
      <input type="hidden" name="neighborhoodLongitude" value={hasCoordinates ? String(longitude) : ""} />
      <input type="hidden" name="neighborhoodLocationSource" value={result?.source ?? ""} />
      <input type="hidden" name="neighborhoodLocationSourceUrl" value={result?.sourceUrl ?? ""} />
    </>
  );
}
