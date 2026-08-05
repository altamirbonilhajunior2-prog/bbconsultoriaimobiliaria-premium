import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PropertyCard from "../../components/PropertyCard";
import PropertyGallery from "../../components/PropertyGallery";
import { properties } from "../../data/properties";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const defaultFeatures = [
  "Arquitetura contemporânea",
  "Ambientes integrados",
  "Área gourmet",
  "Suítes confortáveis",
  "Iluminação natural",
  "Paisagismo",
  "Acabamentos selecionados",
  "Condomínio fechado",
];

const analyzedDifferentials = [
  "Localização e qualidade do entorno",
  "Padrão construtivo",
  "Liquidez e facilidade de revenda",
  "Potencial de valorização",
  "Custos futuros de manutenção",
  "Adequação ao objetivo patrimonial",
];

export function generateStaticParams() {
  return properties.map((property) => ({
    id: property.code.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { id } = await params;

  const property = properties.find(
    (item) => item.code.toLowerCase() === id.toLowerCase(),
  );

  if (!property) {
    return {
      title: "Imóvel não encontrado | B&B Consultoria Imobiliária",
    };
  }

  return {
    title: `${property.title} | B&B Consultoria Imobiliária`,
    description:
      property.description ||
      `${property.title}, localizado em ${property.location}. Consulte a B&B para mais informações.`,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;

  const property = properties.find(
    (item) => item.code.toLowerCase() === id.toLowerCase(),
  );

  if (!property) {
    notFound();
  }

  const relatedProperties = properties
    .filter((item) => item.code !== property.code)
    .slice(0, 4);

  const galleryImages =
    property.gallery && property.gallery.length > 0
      ? property.gallery
      : [property.image];

  const features =
    property.features && property.features.length > 0
      ? property.features
      : defaultFeatures;

  const whatsappMessage = encodeURIComponent(
    `Olá, gostaria de receber mais informações sobre o imóvel ${property.code} — ${property.title}.`,
  );

  const visitMessage = encodeURIComponent(
    `Olá, gostaria de agendar uma visita ao imóvel ${property.code} — ${property.title}.`,
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
          <Link
            href="/comprar"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:text-amber-300"
          >
            ← Voltar para imóveis
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-amber-500 bg-amber-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                  {property.tag}
                </span>

                <span className="border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Disponível
                </span>
              </div>

              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                {property.location}
              </p>

              <h1 className="mt-3 max-w-5xl font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
                {property.title}
              </h1>

              {property.code === "BBP001" && (
                <p className="mt-3 text-lg text-zinc-300">
                  Condomínio Alphaville II
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                <span>
                  Referência:{" "}
                  <strong className="font-medium text-zinc-200">
                    {property.code}
                  </strong>
                </span>

                <span>{property.area} construídos</span>

                {property.landArea && (
                  <span>{property.landArea} de terreno</span>
                )}
              </div>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Valor de venda
              </p>

              <strong className="mt-2 block font-serif text-3xl font-normal text-amber-400 sm:text-4xl">
                {property.price}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_0.8fr]">
          <PropertyGallery
            images={galleryImages}
            title={property.title}
            tag={property.tag}
          />

          <aside className="h-fit border border-amber-500/35 bg-[#0b0b0b] p-7 lg:sticky lg:top-[150px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                  Informações do imóvel
                </p>

                {property.code === "BBP001" && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Condomínio Alphaville II
                  </p>
                )}
              </div>

              <span className="border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                Disponível
              </span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/10 py-6 text-center">
              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.area}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Área construída
                </span>
              </div>

              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.suites || property.bedrooms}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Suítes
                </span>
              </div>

              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.parking}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Vagas
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Área do terreno
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.landArea || "Consulte"}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Dormitórios
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.bedrooms}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Banheiros
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.bathrooms || "Consulte"}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Condomínio
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.condominium || "Consulte"}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  IPTU
                </span>

                <strong className="mt-2 block font-medium text-white">
                  {property.iptu || "Consulte"}
                </strong>
              </div>

              <div className="border-b border-white/10 pb-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Disponibilidade
                </span>

                <strong className="mt-2 block font-medium text-white">
                  Confirmar
                </strong>
              </div>
            </div>

            <div className="mt-7 space-y-4 text-sm text-zinc-400">
              <p>
                <span className="text-zinc-500">Referência:</span>{" "}
                <strong className="font-medium text-white">
                  {property.code}
                </strong>
              </p>

              <p>
                <span className="text-zinc-500">Localização:</span>{" "}
                <strong className="font-medium text-white">
                  {property.location}
                </strong>
              </p>
            </div>

            <div className="mt-8 border border-amber-500/25 bg-black/40 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Valor de venda
              </p>

              <p className="mt-2 font-serif text-3xl text-amber-400">
                {property.price}
              </p>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Consulte condições comerciais e disponibilidade.
              </p>
            </div>

            <a
              href={`https://wa.me/5512978140636?text=${visitMessage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-16 w-full items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-amber-400"
            >
              Agendar visita
            </a>

            <a
              href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-16 w-full items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Solicitar informações
            </a>

            <p className="mt-6 text-center text-[10px] leading-5 text-zinc-500">
              Nós analisamos cada imóvel antes de indicá-lo aos nossos clientes.
              Durante o atendimento, apresentaremos nossa avaliação consultiva.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1720px] gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 xl:px-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Sobre o imóvel
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal">
            {property.title}
          </h2>

          <div className="mt-7 whitespace-pre-line text-base leading-8 text-zinc-400">
            {property.description ||
              "Entre em contato com a B&B Consultoria Imobiliária para receber a apresentação completa deste imóvel."}
          </div>
        </div>

        <div className="border border-white/10 bg-[#0a0a0a] p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Diferenciais analisados
          </p>

          <div className="mt-6 space-y-4">
            {analyzedDifferentials.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-500 text-xs text-amber-400">
                  ✓
                </span>

                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Características
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal">
            Estrutura e diferenciais do imóvel
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex min-h-20 items-center gap-4 border border-white/10 bg-black/30 px-5 py-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/60 text-sm text-amber-400">
                  ✓
                </span>

                <span className="text-sm text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-16 lg:px-10 xl:px-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Outras oportunidades
        </p>

        <div className="mt-4 flex items-end justify-between gap-6">
          <h2 className="font-serif text-4xl font-normal">
            Imóveis semelhantes
          </h2>

          <Link
            href="/comprar"
            className="hidden border-b border-amber-500 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 sm:inline-flex"
          >
            Ver todos →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProperties.map((item) => (
            <PropertyCard
              key={item.code}
              code={item.code}
              title={item.title}
              location={item.location}
              price={item.price}
              image={item.image}
              tag={item.tag}
              area={item.area}
              bedrooms={item.bedrooms}
              parking={item.parking}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}