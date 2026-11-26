import Link from "next/link";
import { getAccessContext } from "../../../../lib/admin/access";
import { prisma } from "../../../../lib/prisma";
import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  await getAccessContext();
  const properties = await prisma.property.findMany({
    select: { code: true, title: true }, orderBy: { code: "asc" },
  });
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/clientes" className="text-xs font-bold tracking-wider text-amber-400">Voltar para CLIENTES/LEADS</Link>
        <h1 className="mt-7 font-serif text-4xl">Novo cliente</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">Cadastre um contato recebido por WhatsApp, telefone, indicação ou outro canal. Você pode vincular os imóveis de interesse agora ou registrar novos atendimentos depois.</p>
        <NewClientForm properties={properties} />
      </div>
    </main>
  );
}
