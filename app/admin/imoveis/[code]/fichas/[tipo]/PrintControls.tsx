"use client";

import Link from "next/link";
import { useState } from "react";

type PrintControlsProps = {
  backHref: string;
  printLabel: string;
  fillable?: boolean;
  propertyCode?: string;
};

export default function PrintControls({
  backHref,
  printLabel,
  fillable = false,
  propertyCode = "",
}: PrintControlsProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  function handlePrint() {
    window.print();
  }

  async function handleSavePdf() {
    if (!fillable) {window.print();return;}
    setExporting(true);
    setError("");
    try {
      const article = document.querySelector<HTMLElement>("form .print-sheet");
      if (!article) throw new Error("Ficha não encontrada. Reabra a página e tente novamente.");
      const [{readSheet},{createFillableSheet},response] = await Promise.all([
        import("../../../../../../lib/pdf/sheet-model"),
        import("../../../../../../lib/pdf/fillable-sheet"),
        fetch("/logo-bb.png"),
      ]);
      if (!response.ok) throw new Error("Não foi possível carregar a marca da ficha. Tente novamente.");
      const model = readSheet(article, propertyCode);
      const bytes = await createFillableSheet(model,new Uint8Array(await response.arrayBuffer()));
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:"application/pdf"}));
      const link = document.createElement("a");
      link.href=url;
      link.download=`${model.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-${propertyCode}.pdf`;
      document.body.appendChild(link);link.click();link.remove();
      // Keep the URL alive long enough for mobile browsers to finish the download.
      setTimeout(()=>URL.revokeObjectURL(url),60_000);
    } catch (cause) {
      setError(cause instanceof Error && !cause.message.includes("WinAnsi") ? cause.message : "Há caracteres não suportados no PDF. Revise o texto ou use Imprimir ficha.");
    } finally {setExporting(false);}
  }

  return (
    <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-wrap items-start justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
      >
        ← {backHref.startsWith("/admin/clientes/") ? "Voltar para o cliente" : "Voltar para o imóvel"}
      </Link>

      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
        >
          {printLabel}
        </button>

        <button
          type="button"
          onClick={handleSavePdf}
          disabled={exporting}
          className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
        >
          {exporting ? "Preparando PDF…" : fillable ? "Baixar PDF preenchível" : "Baixar ficha em PDF"}
        </button>
        {fillable && <p className="max-w-sm text-[11px] leading-4 text-zinc-700">
          No celular, abra o PDF em um leitor compatível, como Adobe Acrobat Reader. Para desenhar a assinatura, use “Preencher e assinar”. Alterações no arquivo não atualizam o CRM.
        </p>}
        {error && <p role="alert" className="max-w-sm text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
