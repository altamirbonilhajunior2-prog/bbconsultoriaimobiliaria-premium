import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../components/Footer";
import Header from "../components/Header";
import TrackedWhatsAppLink from "../components/TrackedWhatsAppLink";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pátio São José | Apartamento para morar ou investir",
  description:
    "Conheça o Pátio São José: apartamento de 70 m² no Centro, com 2 dormitórios, suíte, planta adaptável, lazer e serviços para moradia ou investimento.",
  alternates: { canonical: "/patio-sao-jose" },
};

const whatsappMessage = encodeURIComponent(
  "Olá! Vim pela página do Pátio São José e gostaria de receber a apresentação, valores e condições disponíveis. Referência: BBA002.",
);

const benefits = [
  "70 m² privativos",
  "2 dormitórios, sendo 1 suíte",
  "Planta adaptável",
  "1 vaga de garagem e hobby box",
  "Varanda e ambientes bem distribuídos",
  "Fechadura eletrônica e infraestrutura para ar-condicionado",
];

const amenities = [
  "Piscina e lounge da piscina",
  "Academia e espaço yoga",
  "Office e Studio Digital",
  "Lavanderia compartilhada",
  "Cokitchen & Work Lounge",
  "Espaços gourmet e Pub/Jogos",
  "Pet Place e brinquedoteca",
  "Recepção, deliveries e fachada ativa",
];

export default async function PatioLandingPage() {
  const property = await prisma.property.findFirst({
    where: { code: "BBA002", published: true },
    include: { images: { orderBy: [{ position: "asc" }, { id: "asc" }] } },
  });

  if (!property) notFound();

  const cover = property.images.find((image) => image.isCover) ?? property.images[0];
  const gallery = property.images.filter((image) => image.id !== cover?.id).slice(0, 6);
  const scheduleUrl = `/agendar-visita?imovel=BBA002&titulo=${encodeURIComponent(property.title)}&finalidade=venda`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="relative min-h-[720px] border-b border-white/10">
        {cover ? (
          <Image src={cover.url} alt="Pátio São José" fill priority className="object-cover" sizes="100vw" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-center px-6 py-20 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Lançamento no Centro de São José dos Campos
            </p>
            <h1 className="mt-6 font-serif text-5xl font-normal leading-[1.02] sm:text-6xl lg:text-8xl">
              Pátio São José
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-zinc-200 sm:text-2xl">
              Uma planta adaptável para morar bem hoje e preservar novas possibilidades para o futuro.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-zinc-200">
              <span className="border border-white/20 bg-black/45 px-5 py-3">70 m²</span>
              <span className="border border-white/20 bg-black/45 px-5 py-3">2 dormitórios</span>
              <span className="border border-white/20 bg-black/45 px-5 py-3">1 suíte</span>
              <span className="border border-white/20 bg-black/45 px-5 py-3">1 vaga + hobby box</span>
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <TrackedWhatsAppLink
                href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
                trackingData={{ property_code: "BBA002", page_type: "landing_page", campaign: "patio_sao_jose" }}
                className="inline-flex min-h-16 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.17em] text-black transition hover:bg-amber-400"
              >
                Receber apresentação e valores
              </TrackedWhatsAppLink>
              <Link href={scheduleUrl} className="inline-flex min-h-16 items-center justify-center border border-white/35 bg-black/30 px-8 text-xs font-bold uppercase tracking-[0.17em] text-white transition hover:border-amber-400 hover:text-amber-400">
                Agendar atendimento
              </Link>
            </div>
            <p className="mt-5 text-sm text-zinc-400">Unidades a partir de R$ 590 mil*. Consulte disponibilidade e condições comerciais.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-28">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">Moradia, patrimônio e renda</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Um imóvel que acompanha diferentes momentos e estratégias.</h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-400">
            No Centro de São José dos Campos, próximo à Vila Ema, Vila Adyana e São Dimas, o Pátio reúne localização, serviços, tecnologia e flexibilidade de uso. A configuração da unidade amplia as possibilidades de moradia e locação, conforme as regras do empreendimento.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex min-h-24 items-center gap-4 border border-white/10 bg-[#0a0a0a] p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/60 text-amber-400">✓</span>
              <span className="text-sm leading-6 text-zinc-300">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className="mx-auto max-w-[1500px] px-6 pb-20 lg:px-12 lg:pb-28">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <div key={image.id} className={`relative overflow-hidden border border-white/10 ${index === 0 ? "sm:col-span-2 lg:col-span-2" : ""} min-h-80`}>
                <Image src={image.url} alt={image.alt || `Pátio São José - imagem ${index + 1}`} fill className="object-cover transition duration-700 hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto max-w-[1500px] px-6 py-20 lg:px-12 lg:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">Mais de 900 m² de áreas comuns</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">15 ambientes para ampliar sua experiência de morar.</h2>
          <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {amenities.map((item) => <div key={item} className="bg-[#090909] p-6 text-sm leading-7 text-zinc-300">{item}</div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">Atendimento consultivo B&B</p>
        <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">Receba a apresentação completa e conheça as unidades disponíveis.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">Nossa equipe apresenta as condições comerciais e ajuda a avaliar o Pátio de acordo com seu objetivo de moradia, investimento ou geração de renda.</p>
        <TrackedWhatsAppLink
          href={`https://wa.me/5512978140636?text=${whatsappMessage}`}
          trackingData={{ property_code: "BBA002", page_type: "landing_page", campaign: "patio_sao_jose", cta_position: "footer" }}
          className="mt-9 inline-flex min-h-16 items-center justify-center bg-amber-500 px-9 text-xs font-bold uppercase tracking-[0.17em] text-black transition hover:bg-amber-400"
        >
          Falar com um consultor
        </TrackedWhatsAppLink>
        <p className="mt-5 text-xs leading-6 text-zinc-600">*Valores, disponibilidade e condições podem ser alterados sem aviso prévio.</p>
      </section>

      <Footer />
    </main>
  );
}
