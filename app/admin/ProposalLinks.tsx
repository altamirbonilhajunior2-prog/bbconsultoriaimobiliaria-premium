import Link from "next/link";

export default function ProposalLinks({ code, purpose, visitId }: {
  code: string; purpose: string; visitId: number;
}) {
  const base = `/admin/imoveis/${code.toLowerCase()}/fichas`;
  const className = "inline-flex min-h-11 items-center border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/20";
  return <div className="mt-4 flex flex-wrap gap-3 print:hidden">
    {purpose !== "LOCACAO" && <Link className={className} href={`${base}/proposta?visitId=${visitId}`}>Nova proposta de compra</Link>}
    {purpose !== "VENDA" && <Link className={className} href={`${base}/proposta-locacao?visitId=${visitId}`}>Nova proposta de locação</Link>}
  </div>;
}
