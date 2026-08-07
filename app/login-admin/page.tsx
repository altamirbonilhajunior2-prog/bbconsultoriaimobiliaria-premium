import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginAdminPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-12 text-white">
      <section className="w-full max-w-md border border-white/10 bg-[#0b0b0b] p-8 shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <Image
            src="/logo-bb.png"
            alt="B&B Consultoria Imobiliária"
            width={150}
            height={70}
            priority
            className="h-auto w-[150px]"
          />
        </div>

        <p className="mt-9 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Área restrita
        </p>

        <h1 className="mt-3 text-center font-serif text-4xl font-normal">
          Painel Administrativo
        </h1>

        <p className="mt-4 text-center text-sm leading-7 text-zinc-400">
          Entre com suas credenciais para administrar os imóveis e as
          configurações do portal.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}