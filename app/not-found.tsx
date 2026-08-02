import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Erro 404
          </p>

          <h1 className="mt-6 font-serif text-5xl md:text-7xl">
            Página não encontrada
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            A página que você tentou acessar não existe ou foi movida.
            Utilize o menu acima ou volte para a página inicial.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center bg-amber-500 px-8 text-sm font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
            >
              Voltar para Home
            </Link>

            <Link
              href="/comprar"
              className="inline-flex h-14 items-center justify-center border border-amber-500 px-8 text-sm font-bold uppercase tracking-[0.15em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Ver imóveis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}