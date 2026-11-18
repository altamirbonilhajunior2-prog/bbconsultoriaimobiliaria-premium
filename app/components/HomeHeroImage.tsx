const imageUrl = (file: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(`/${file}`)}&w=${width}&q=75`;

export default function HomeHeroImage() {
  return (
    <picture>
      <source
        media="(min-width: 640px)"
        srcSet={[1080, 1920, 2560].map((width) => `${imageUrl("hero-clean.png", width)} ${width}w`).join(", ")}
        sizes="100vw"
      />
      {/* A single picture lets the browser request only the matching mobile or desktop artwork. */}
      <img
        src={imageUrl("hero-mobile.png", 750)}
        srcSet={[640, 750, 1080].map((width) => `${imageUrl("hero-mobile.png", width)} ${width}w`).join(", ")}
        sizes="100vw"
        alt="Imóveis de alto padrão em São José dos Campos e região"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[right_68%] sm:object-center"
        style={{ filter: "brightness(1.16) saturate(1.08) contrast(1.02)" }}
      />
    </picture>
  );
}
