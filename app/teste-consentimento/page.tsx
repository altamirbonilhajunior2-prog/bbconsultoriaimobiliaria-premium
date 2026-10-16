import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Teste local de consentimento",
  robots: { index: false, follow: false },
};

export default function ConsentTestPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  // PrivacyConsent and ConsentAwareTagManager are reused from the root layout.
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-5">
        <p className="text-sm uppercase tracking-widest text-amber-400">B&amp;B · Ambiente local</p>
        <h1 className="text-3xl font-semibold">Teste de consentimento</h1>
        <p>Use o painel de privacidade para aceitar, recusar ou revisar sua escolha.</p>
        <p>Esta página não contém formulários, consultas ao banco ou ações de conversão.</p>
      </div>
    </main>
  );
}