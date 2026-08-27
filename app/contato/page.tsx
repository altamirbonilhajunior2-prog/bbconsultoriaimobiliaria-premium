import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";
import TrackedWhatsAppLink from "../components/TrackedWhatsAppLink";

export const metadata = {
  title: "Contato | B&B Consultoria Imobiliária",
  description:
    "Entre em contato com a B&B Consultoria Imobiliária para comprar, alugar, vender, investir, solicitar consultoria patrimonial ou avaliação de imóvel em São José dos Campos.",
};

const whatsappNumber = "5512978140636";

const services = [
  {
    title: "Comprar um imóvel",
    description:
      "Encontrar o imóvel adequado para moradia ou investimento, com análise de localização, liquidez, custos e aderência ao seu perfil.",
    message:
      "Olá, gostaria de receber uma consultoria para comprar um imóvel.",
  },
  {
    title: "Alugar um imóvel",
    description:
      "Buscar uma opção para locação considerando localização, mobilidade, qualidade de vida, estrutura e custo-benefício.",
    message:
      "Olá, gostaria de receber orientação para alugar um imóvel.",
  },
  {
    title: "Vender um imóvel",
    description:
      "Estruturar uma estratégia de comercialização baseada em posicionamento, apresentação, divulgação e negociação.",
    message:
      "Olá, gostaria de conversar sobre a venda do meu imóvel.",
  },
  {
    title: "Investir",
    description:
      "Avaliar oportunidades imobiliárias considerando potencial de valorização, liquidez, riscos e objetivos patrimoniais.",
    message:
      "Olá, gostaria de receber uma consultoria para investimento imobiliário.",
  },
  {
    title: "Consultoria patrimonial",
    description:
      "Comparar cenários, regiões e alternativas para apoiar decisões imobiliárias com critérios técnicos e visão de longo prazo.",
    message:
      "Olá, gostaria de conversar sobre uma consultoria patrimonial imobiliária.",
  },
  {
    title: "Avaliação de imóvel",
    description:
      "Compreender o posicionamento e o valor de mercado de um imóvel para apoiar decisões de venda, compra ou investimento.",
    message:
      "Olá, gostaria de solicitar uma avaliação do meu imóvel.",
  },
];

function createWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function ContatoPage() {
  const generalMessage = createWhatsAppUrl(
    "Olá, gostaria de falar com a B&B Consultoria Imobiliária.",
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Header />

      <section className="relative min-h-[520px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="Atendimento da B&B Consultoria Imobiliária"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1720px] items-center px-6 py-20 lg:px-10 xl:px-12">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Contato
            </p>

            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-normal leading-[1.05] sm:text-6xl lg:text-7xl">
              Vamos compreender seus objetivos.
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              Cada atendimento começa pela compreensão do seu momento. A partir
              disso, nós avaliamos as alternativas mais adequadas para comprar,
              alugar, vender ou investir com maior segurança.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Como podemos ajudar?
          </p>

          <h2 className="mt-4 font-serif text-4xl font-normal leading-tight sm:text-5xl">
            Escolha o assunto que melhor representa seu momento.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">
            Ao selecionar uma opção, o WhatsApp será aberto com uma mensagem
            correspondente ao serviço escolhido, facilitando o início do
            atendimento.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <TrackedWhatsAppLink
              key={service.title}
              href={createWhatsAppUrl(service.message)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${service.title}: iniciar atendimento pelo WhatsApp`}
              className="group flex min-h-[280px] flex-col border border-white/10 bg-[#0a0a0a] p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:bg-[#0d0d0d]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-7 font-serif text-3xl font-normal leading-tight text-white">
                {service.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-zinc-500">
                {service.description}
              </p>

              <span className="mt-auto pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 transition group-hover:text-amber-300">
                Iniciar atendimento →
              </span>
            </TrackedWhatsAppLink>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-20 md:grid-cols-2 xl:grid-cols-3 lg:px-10 lg:py-24">
          <article className="border border-amber-500/25 bg-black/30 p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              WhatsApp
            </p>

            <h2 className="mt-5 font-serif text-3xl font-normal">
              Atendimento direto
            </h2>

            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Converse com a B&amp;B para esclarecer dúvidas ou apresentar seu
              objetivo imobiliário.
            </p>

            <TrackedWhatsAppLink
              href={generalMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex min-h-14 w-full items-center justify-center bg-amber-500 px-6 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
            >
              Falar pelo WhatsApp
            </TrackedWhatsAppLink>
          </article>

          <article className="border border-white/10 bg-black/30 p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Atendimento
            </p>

            <h2 className="mt-5 font-serif text-3xl font-normal">
              São José dos Campos
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
              <p>Atendimento consultivo e personalizado.</p>

              <a
                href="tel:+5512978140636"
                className="block w-fit transition hover:text-white"
              >
                (12) 97814-0636
              </a>

              <p>CRECI-SP 311872-F</p>
            </div>
          </article>

          <article className="border border-white/10 bg-black/30 p-8 md:col-span-2 xl:col-span-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Regiões de atuação
            </p>

            <h2 className="mt-5 font-serif text-3xl font-normal">
              Conhecimento local
            </h2>

            <div className="mt-5 space-y-2 text-sm leading-7 text-zinc-400">
              <p>Urbanova</p>
              <p>Jardim Aquarius</p>
              <p>Colinas do Parahyba</p>
              <p>Altos do Esplanada</p>
              <p>Condomínios fechados</p>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20 text-center lg:px-10 lg:py-28">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
          Nosso compromisso
        </p>

        <h2 className="mx-auto mt-6 max-w-5xl font-serif text-4xl font-normal leading-tight sm:text-5xl">
          Cada atendimento começa pela compreensão do seu objetivo.
        </h2>

        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-400">
          Somente depois de compreender seu perfil, momento e prioridades nós
          apresentamos as alternativas mais adequadas para sua decisão.
        </p>

        <TrackedWhatsAppLink
          href={generalMessage}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex min-h-16 items-center justify-center bg-amber-500 px-9 text-center text-xs font-bold uppercase tracking-[0.17em] text-black transition hover:bg-amber-400"
        >
          Falar com a B&amp;B
        </TrackedWhatsAppLink>
      </section>

      <Footer />
    </main>
  );
}
