"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type PropertyGalleryProps = {
  images: string[];
  aiImageIndexes?: number[];
  title: string;
  tag: string;
};

export default function PropertyGallery({
  images,
  aiImageIndexes = [],
  title,
  tag,
}: PropertyGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/hero-clean.png"];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const selectedImage = safeImages[selectedIndex];
  const isSelectedImageAi = aiImageIndexes.includes(selectedIndex);

  const formattedCurrentIndex = String(selectedIndex + 1).padStart(2, "0");
  const formattedTotalImages = String(safeImages.length).padStart(2, "0");

  function selectImage(index: number) {
    setSelectedIndex(index);
  }

  const showPreviousImage = useCallback(() => {
  setSelectedIndex((currentIndex) =>
    currentIndex === 0 ? safeImages.length - 1 : currentIndex - 1,
  );
}, [safeImages.length]);
  const showNextImage = useCallback(() => {
  setSelectedIndex((currentIndex) =>
    currentIndex === safeImages.length - 1 ? 0 : currentIndex + 1,
  );
}, [safeImages.length]);
  function openLightbox() {
    setIsLightboxOpen(true);
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
  }

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    }, [
    isLightboxOpen,
    safeImages.length,
    showPreviousImage,
    showNextImage,
  ]);

  return (
    <>
      <div>
        <div className="relative min-h-[420px] overflow-hidden border border-white/10 bg-[#0a0a0a] sm:min-h-[580px]">
          <button
            type="button"
            onClick={openLightbox}
            aria-label={`Ampliar foto ${selectedIndex + 1} de ${title}`}
            className="absolute inset-0 z-10 cursor-zoom-in"
          >
            <span className="sr-only">Ampliar imagem</span>
          </button>

          <Image
            key={selectedImage}
            src={selectedImage}
            alt={`${title} — foto ${selectedIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

          <span className="pointer-events-none absolute left-5 top-5 z-20 border border-amber-500 bg-black/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            {tag}
          </span>

          <div className="pointer-events-none absolute bottom-20 right-5 z-30 h-20 w-48 opacity-70 sm:right-6 sm:h-24 sm:w-52">
            <Image
              src="/logo-bb.png"
              alt=""
              fill
              sizes="208px"
              className="object-contain"
            />
          </div>

          <span className="pointer-events-none absolute bottom-5 right-5 z-20 border border-white/20 bg-black/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {formattedCurrentIndex} / {formattedTotalImages}
          </span>

          {isSelectedImageAi && (
            <span className="pointer-events-none absolute bottom-5 left-5 right-32 z-20 border border-amber-500/70 bg-black/85 px-3 py-2 text-left text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-white backdrop-blur-sm sm:right-auto sm:px-4 sm:text-[10px] sm:tracking-[0.12em]">
              Imagem meramente ilustrativa produzida por IA
            </span>
          )}

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
                aria-label="Mostrar foto anterior"
                className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/70 text-2xl text-white backdrop-blur-sm transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
                aria-label="Mostrar próxima foto"
                className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/70 text-2xl text-white backdrop-blur-sm transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {safeImages.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Mostrar foto ${index + 1}`}
                className={`group relative min-h-[115px] overflow-hidden border bg-[#0a0a0a] transition ${
                  isSelected
                    ? "border-amber-500"
                    : "border-white/10 hover:border-amber-500/60"
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} — miniatura ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div
                  className={`absolute inset-0 transition ${
                    isSelected
                      ? "bg-transparent"
                      : "bg-black/20 group-hover:bg-transparent"
                  }`}
                />

                <span
                  className={`absolute bottom-2 right-2 px-2 py-1 text-[9px] ${
                    isSelected
                      ? "bg-amber-500 font-bold text-black"
                      : "bg-black/75 text-zinc-300"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria ampliada de ${title}`}
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Fechar galeria"
            className="absolute right-5 top-5 z-30 flex h-12 w-12 items-center justify-center border border-white/25 bg-black/70 text-2xl text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black sm:right-8 sm:top-8"
          >
            ×
          </button>

          <div
            onClick={(event) => event.stopPropagation()}
            className="relative h-[78vh] w-full max-w-[1500px]"
          >
            <Image
              key={`lightbox-${selectedImage}`}
              src={selectedImage}
              alt={`${title} — foto ampliada ${selectedIndex + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            <div className="pointer-events-none absolute bottom-8 right-8 z-30 h-24 w-60 opacity-70 sm:bottom-10 sm:right-10 sm:h-28 sm:w-64">
              <Image
                src="/logo-bb.png"
                alt=""
                fill
                sizes="256px"
                className="object-contain"
              />
            </div>

            {isSelectedImageAi && (
              <span className="pointer-events-none absolute bottom-4 left-4 right-4 z-30 mx-auto w-fit max-w-[calc(100%-2rem)] border border-amber-500/70 bg-black/85 px-3 py-2 text-center text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-white backdrop-blur-sm sm:bottom-8 sm:left-8 sm:right-auto sm:mx-0 sm:max-w-none sm:px-4 sm:text-[10px] sm:tracking-[0.12em]">
                Imagem meramente ilustrativa produzida por IA
              </span>
            )}

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Foto anterior"
                  className="absolute left-0 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/70 text-3xl text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black sm:left-4"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Próxima foto"
                  className="absolute right-0 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/70 text-3xl text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black sm:right-4"
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 border border-white/20 bg-black/80 px-5 py-3 text-center backdrop-blur-sm sm:bottom-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              {formattedCurrentIndex} / {formattedTotalImages}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
