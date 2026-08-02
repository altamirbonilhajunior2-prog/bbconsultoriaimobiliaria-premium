import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PropertyCard from "../../components/PropertyCard";
import { properties } from "../../data/properties";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
    description: `${property.title}, localizado em ${property.location}. Consulte a B&B para mais informações.`,
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

  const whatsappMessage = encodeURIComponent(
    `Olá, gostaria de receber mais informações sobre o imóvel ${property.code} — ${property.title}.`,
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

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                {property.location}
              </p>

              <h1 className="mt-3 max-w-5xl font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
                {property.title}
              </h1>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Valor
              </p>

              <strong className="mt-2 block font-serif text-3xl font-normal text-amber-400">
                {property.price}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-6 py-8 lg:px-10 xl:px-12">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="relative min-h-[420px] overflow-hidden border border-white/10 sm:min-h-[560px]">
            <Image
              src={property.image}
              alt={property.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

            <span className="absolute left-5 top-5 border border-amber-500 bg-black/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              {property.tag}
            </span>
          </div>

          <aside className="border border-amber-500/35 bg-[#0b0b0b] p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Informações do imóvel
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/10 py-6 text-center">
              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.area}
                </strong>

                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Área
                </span>
              </div>

              <div>
                <strong className="block font-serif text-2xl font-normal">
                  {property.bedrooms}
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

            <div className="mt-7 space-y-4 text-sm text-zinc-400">
              <p>
                <span className="text-zinc-500">Código:</span>{" "}
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

            <a
              href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-14 w-full items-center justify-center bg-amber-500 px-6 text-center text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
            >
              Solicitar informações
            </a>

            <a
              href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-14 w-full items-center justify-center border border-amber-500 px-6 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Agendar visita
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1720px] gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 xl:px-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Sobre o imóvel
          </p>

          <h2 className="mt-3 font-serif text-4xl font-normal">
            Uma oportunidade analisada pela B&B
          </h2>

          <div className="mt-7 space-y-5 text-base leading-8 text-zinc-400">
            <p>
              Este imóvel integra nossa seleção por apresentar características
              compatíveis com uma decisão imobiliária de alto padrão.
            </p>

            <p>
              Antes da visita, nós orientamos a análise de localização,
              posição, padrão construtivo, custos futuros, liquidez e adequação
              ao objetivo do comprador.
            </p>

            <p>
              As informações exibidas são preliminares e devem ser confirmadas
              durante o atendimento consultivo.
            </p>
          </div>
        </div>

        <div className="border border-white/10 bg-[#0a0a0a] p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Diferenciais analisados
          </p>

          <div className="mt-6 space-y-4">
            {[
              "Localização e entorno",
              "Padrão construtivo",
              "Liquidez e facilidade de revenda",
              "Potencial de valorização",
              "Custos futuros de manutenção",
              "Adequação ao objetivo patrimonial",
            ].map((item) => (
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
        </div>
      </section>

      <Footer />
    </main>
  );
}