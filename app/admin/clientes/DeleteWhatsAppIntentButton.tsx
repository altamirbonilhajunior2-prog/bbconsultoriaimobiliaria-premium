"use client";

import { useTransition } from "react";

type DeleteWhatsAppIntentButtonProps = {
  onDelete: () => Promise<void>;
};

export default function DeleteWhatsAppIntentButton({
  onDelete,
}: DeleteWhatsAppIntentButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir este registro de intenção de contato pelo WhatsApp? Esta ação não poderá ser desfeita.",
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
      className="inline-flex min-h-10 items-center justify-center border border-red-500/30 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Excluindo..."
        : "Excluir registro"}
    </button>
  );
}
