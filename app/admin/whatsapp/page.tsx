import Link from "next/link";

import { requireAdmin } from "../../../lib/admin/access";
import WhatsAppEmbeddedSignup from "./WhatsAppEmbeddedSignup";

export const dynamic = "force-dynamic";

export default async function WhatsAppAdminPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href="/admin"
          className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400"
        >
          ← Voltar ao CRM
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            B&amp;B Consultoria Imobiliária
          </p>

          <h1 className="mt-3 font-serif text-5xl font-normal">
            WhatsApp e Íris
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Área administrativa para configurar a integração oficial do
            WhatsApp Business com a Íris.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#0b0b0b] p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
            Coexistência
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal">
            WhatsApp Business App + Cloud API
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Conecte o WhatsApp Business utilizado pela B&amp;B à Cloud API
            através do fluxo oficial de Embedded Signup configurado para
            coexistência.
          </p>

          <div className="mt-6 border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-sm leading-7 text-amber-200">
              Esta integração foi configurada especificamente para preservar o
              uso do WhatsApp Business App durante a conexão com a Cloud API.
            </p>
          </div>

          <WhatsAppEmbeddedSignup />
        </section>
      </div>
    </main>
  );
}
