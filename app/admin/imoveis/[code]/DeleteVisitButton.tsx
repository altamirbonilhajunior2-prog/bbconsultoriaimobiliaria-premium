"use client";

import { useTransition } from "react";

type DeleteVisitButtonProps = {
  onDelete: () => Promise<void>;
};

export default function DeleteVisitButton({
  onDelete,
}: DeleteVisitButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta visita? Esta ação não poderá ser desfeita.",
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
      className="inline-flex min-h-9 items-center justify-center border border-red-500/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Excluindo..."
        : "Excluir visita"}
    </button>
  );
}