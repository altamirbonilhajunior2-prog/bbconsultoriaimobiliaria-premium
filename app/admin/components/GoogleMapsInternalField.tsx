"use client";

import { useMemo, useState } from "react";

type GoogleMapsInternalFieldProps = {
  defaultValue?: string | null;
  inputClassName: string;
  className?: string;
};

const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500";

function getSafeGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const isGoogleMapsHost =
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host === "google.com.br" ||
      host.endsWith(".google.com.br") ||
      host === "goo.gl" ||
      host.endsWith(".goo.gl");

    return url.protocol === "https:" && isGoogleMapsHost
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function GoogleMapsInternalField({
  defaultValue,
  inputClassName,
  className = "",
}: GoogleMapsInternalFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const routeUrl = useMemo(() => getSafeGoogleMapsUrl(value), [value]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="flex flex-col gap-2">
        <span className={labelClassName}>
          Link Google Maps (opcional)
        </span>

        <input
          name="googleMapsUrl"
          type="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://maps.google.com/..."
          className={inputClassName}
        />
      </label>

      {routeUrl ? (
        <a
          href={routeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center border border-amber-500/40 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:border-amber-400 hover:text-amber-300 sm:self-start"
        >
          Abrir localização/rota
        </a>
      ) : (
        <p className="text-xs leading-6 text-zinc-600">
          Cole um link válido do Google Maps para habilitar a rota interna.
        </p>
      )}
    </div>
  );
}
