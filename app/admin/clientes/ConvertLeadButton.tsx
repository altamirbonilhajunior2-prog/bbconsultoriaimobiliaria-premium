"use client";

import { useTransition } from "react";

type ConvertLeadButtonProps = {
  onConvert: () => Promise<void>;
  alreadyConverted?: boolean;
};

export default function ConvertLeadButton({
  onConvert,
  alreadyConverted = false,
}: ConvertLeadButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  if (alreadyConverted) {
    return (
      <span className="inline-flex min-h-11 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
        Cliente criado
      </span>
    );
  }

  function handleConvert() {
    const confirmed =
      window.confirm(
        "Deseja transformar este lead em cliente do CRM?",
      );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await onConvert();
    });
  }

  return (
    <button
      type="button"
      onClick={handleConvert}
      disabled={isPending}
      className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-50"
    >
      {isPending
        ? "Convertendo..."
        : "Converter em cliente"}
    </button>
  );
}