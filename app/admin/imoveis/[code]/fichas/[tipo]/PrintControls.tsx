"use client";

import Link from "next/link";

type PrintControlsProps = {
  backHref: string;
  printLabel: string;
};

export default function PrintControls({
  backHref,
  printLabel,
}: PrintControlsProps) {
  function handlePrint() {
    window.print();
  }

  function handleSavePdf() {
    window.print();
  }

  return (
    <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-wrap items-start justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
      >
        ← Voltar para o imóvel
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
          className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
        >
          Baixar ficha em PDF
        </button>
      </div>
    </div>
  );
}