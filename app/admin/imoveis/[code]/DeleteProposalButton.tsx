"use client";

import { useTransition } from "react";

type DeleteProposalButtonProps = {
  onDelete: () => Promise<void>;
};

export default function DeleteProposalButton({
  onDelete,
}: DeleteProposalButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta proposta? Esta ação não poderá ser desfeita.",
      );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await onDelete();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex min-h-11 items-center justify-center bg-red-600 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Excluindo..."
        : "Excluir proposta"}
    </button>
  );
}