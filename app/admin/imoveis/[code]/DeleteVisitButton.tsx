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
      className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Excluindo..."
        : "Excluir visita"}
    </button>
  );
}