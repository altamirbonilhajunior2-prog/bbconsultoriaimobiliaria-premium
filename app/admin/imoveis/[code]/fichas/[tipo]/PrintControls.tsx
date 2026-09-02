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
  return (
    <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center justify-center border border-white/15 bg-black px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-300"
      >
        ← Voltar para o imóvel
      </Link>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
      >
        {printLabel}
      </button>
    </div>
  );
}
