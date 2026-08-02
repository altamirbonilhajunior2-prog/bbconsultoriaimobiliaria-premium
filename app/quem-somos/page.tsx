import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata = {
  title: "Quem Somos | B&B Consultoria Imobiliária",
};

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative h-[560px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="B&B Consultoria Imobiliária"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Quem Somos
            </p>

            <h1 className="mt-6 font-serif text-5xl lg:text-6xl">
              Mais do que vender imóveis. Nós construímos decisões seguras.
            </h1>

            <p className="mt-6 text-lg leading-8 text-zinc-300">
              A B&amp;B Consultoria Imobiliária nasceu com um propósito claro:
              oferecer uma consultoria baseada em análise, transparência e
              conhecimento de mercado.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-2">

          <div>
            <h2 className="font-serif text-4xl">
              Nossa visão
            </h2>

            <p className="mt-8 leading-8 text-zinc-400">
              Nós acreditamos que comprar um imóvel é uma decisão patrimonial.
              Por isso analisamos cada oportunidade considerando localização,
              liquidez, potencial de valorização, custos futuros e perfil do
              comprador.
            </p>

            <p className="mt-6 leading-8 text-zinc-400">
              Nossa atuação é baseada em relacionamento de longo prazo e não
              apenas na conclusão de uma venda.
            </p>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-10">

            <h2 className="font-serif text-3xl">
              Nossos diferenciais
            </h2>

            <ul className="mt-8 space-y-5 text-zinc-300">

              <li>✓ Atendimento personalizado.</li>

              <li>✓ Curadoria de imóveis.</li>

              <li>✓ Análise patrimonial.</li>

              <li>✓ Transparência durante todo o processo.</li>

              <li>✓ Especialização em São José dos Campos.</li>

              <li>✓ Foco em imóveis de médio e alto padrão.</li>

            </ul>

          </div>

        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090909]">

        <div className="mx-auto max-w-7xl px-6 py-20 text-center">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Nosso compromisso
          </p>

          <h2 className="mt-6 font-serif text-5xl">
            Nós recomendamos apenas aquilo que faz sentido para você.
          </h2>

          <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-zinc-400">
            Preferimos perder uma venda do que indicar um imóvel que não esteja
            alinhado aos seus objetivos. Esse é o compromisso que define a B&B
            Consultoria Imobiliária.
          </p>

        </div>

      </section>

      <Footer />
    </main>
  );
}