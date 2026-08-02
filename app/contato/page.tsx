import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata = {
  title: "Contato | B&B Consultoria Imobiliária",
};

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="/hero-clean.png"
          alt="Contato B&B"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Contato
            </p>

            <h1 className="mt-6 font-serif text-5xl lg:text-6xl">
              Vamos conversar sobre o seu próximo imóvel.
            </h1>

            <p className="mt-6 text-lg leading-8 text-zinc-300">
              Nós estamos prontos para entender seu objetivo e indicar as melhores
              oportunidades em São José dos Campos.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-3">

          <div className="border border-white/10 bg-[#0b0b0b] p-8">
            <h2 className="font-serif text-2xl">
              WhatsApp
            </h2>

            <p className="mt-5 text-zinc-400 leading-8">
              Atendimento rápido e personalizado.
            </p>

            <a
              href="https://wa.me/5512978140636"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded bg-amber-500 px-6 py-4 font-bold text-black"
            >
              Conversar agora
            </a>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-8">
            <h2 className="font-serif text-2xl">
              E-mail
            </h2>

            <p className="mt-5 text-zinc-400 leading-8">
              contato@bbconsultoriaimobiliaria.com.br
            </p>

            <p className="mt-8 text-zinc-500">
              Resposta em horário comercial.
            </p>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-8">
            <h2 className="font-serif text-2xl">
              Área de atuação
            </h2>

            <p className="mt-5 leading-8 text-zinc-400">
              São José dos Campos
              <br />
              Urbanova
              <br />
              Jardim Aquarius
              <br />
              Colinas
              <br />
              Altos do Esplanada
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}