"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  deleteAcquisitionOpportunity,
} from "./actions";

type DeleteOpportunityButtonProps = {
  opportunityId: number;
  opportunityTitle: string;
};

export default function DeleteOpportunityButton({
  opportunityId,
  opportunityTitle,
}: DeleteOpportunityButtonProps) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    error,
    setError,
  ] = useState("");

  function handleDelete() {
    const confirmed =
      window.confirm(
        `Tem certeza que deseja excluir esta oportunidade?\n\n${opportunityTitle}\n\nEsta ação não poderá ser desfeita.`,
      );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(
      async () => {
        const result =
          await deleteAcquisitionOpportunity(
            opportunityId,
          );

        if (!result.success) {
          setError(
            result.message ||
              "Não foi possível excluir a oportunidade.",
          );
        }
      },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center border border-red-500/40 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Excluindo..."
          : "Excluir"}
      </button>

      {error ? (
        <p className="max-w-[180px] text-[10px] leading-4 text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
