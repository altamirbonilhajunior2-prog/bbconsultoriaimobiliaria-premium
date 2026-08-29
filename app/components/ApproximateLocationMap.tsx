type ApproximateLocationMapProps = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  neighborhood: string;
  city: string;
};

export default function ApproximateLocationMap({
  latitude,
  longitude,
  radiusMeters,
  neighborhood,
  city,
}: ApproximateLocationMapProps) {
  const latitudeSpan = Math.max(radiusMeters / 55_660, 0.009);
  const longitudeScale = Math.cos((latitude * Math.PI) / 180);
  const longitudeSpan = Math.max(radiusMeters / (55_660 * longitudeScale), 0.009);
  const bbox = [
    longitude - longitudeSpan,
    latitude - latitudeSpan,
    longitude + longitudeSpan,
    latitude + latitudeSpan,
  ].join(",");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;

  return (
    <section className="border-y border-white/10 bg-[#090909]">
      <div className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Localização
        </p>

        <div className="mt-4">
          <h2 className="font-serif text-4xl font-normal">
            {neighborhood}, {city}
          </h2>
        </div>

        <div className="relative mt-8 h-[420px] overflow-hidden border border-white/10 bg-[#111]">
          <iframe
            title={`Mapa de ${neighborhood}`}
            src={mapUrl}
            className="h-full w-full grayscale-[0.35]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_0_18px_rgba(245,158,11,0.08)] sm:h-44 sm:w-44">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-12 w-12 drop-shadow-[0_5px_8px_rgba(0,0,0,0.65)]"
              >
                <path
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  d="M12 2a7 7 0 0 0-7 7c0 5.35 7 13 7 13s7-7.65 7-13a7 7 0 0 0-7-7Z"
                />
                <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-6 text-zinc-500">
          Mapa © OpenStreetMap contributors.
        </p>
      </div>
    </section>
  );
}
