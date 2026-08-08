import Image from "next/image";
import Link from "next/link";

type PropertyCardProps = {
  code: string;
  title: string;
  location: string;
  price: string;
  image: string;
  tag: string;
  area: string;
  bedrooms: string;
  parking: string;
};

export default function PropertyCard({
  code,
  title,
  location,
  price,
  image,
  tag,
  area,
  bedrooms,
  parking,
}: PropertyCardProps) {
  const propertyUrl = `/imovel/${code.toLowerCase()}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-white/10 bg-[#0a0a0a] transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
      <Link
        href={propertyUrl}
        aria-label={`Conhecer o imóvel ${title}, referência ${code}`}
        className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
      >
        <div className="relative h-[210px] overflow-hidden">
          <Image
            src={image}
            alt={`${title}, localizado em ${location}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

          <span className="absolute left-4 top-4 border border-amber-500 bg-black/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400 backdrop-blur-sm">
            {tag}
          </span>

          <span className="absolute bottom-4 left-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75">
            Ref. {code}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-[9px] font-bold uppercase leading-5 tracking-[0.17em] text-amber-400">
            {location}
          </p>

          <h3 className="mt-2 min-h-[48px] font-serif text-[20px] font-normal leading-[1.15] text-white">
            {title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-white/10 py-3 text-[11px] text-zinc-400">
            <span>{area}</span>
            <span className="text-amber-500/70">•</span>
            <span>
          {bedrooms}{" "}
          {bedrooms === "1"
            ? "dormitório"
            : "dormitórios"}
        </span>
            <span className="text-amber-500/70">•</span>
            <span>{parking} vagas</span>
          </div>

          <div className="mt-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Valor
            </span>

            <strong className="mt-1 block font-serif text-[22px] font-normal text-amber-400">
              {price}
            </strong>
          </div>

          <div className="mt-auto pt-5">
            <span className="flex min-h-12 items-center justify-center border border-amber-500/60 px-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition group-hover:bg-amber-500 group-hover:text-black">
              Conhecer este imóvel →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}