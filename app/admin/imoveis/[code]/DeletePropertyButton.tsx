"use client";

import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  deletePropertyAction,
} from "./delete-property-actions";

type DeletePropertyButtonProps = {
  code: string;
};

export default function DeletePropertyButton({
  code,
}: DeletePropertyButtonProps) {
  const router = useRouter();

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const normalizedCode =
    code.trim().toUpperCase();

  const canDelete =
    confirmation
      .trim()
      .toUpperCase() ===
    normalizedCode;

  function handleDelete() {
    if (!canDelete) {
      return;
    }

    const confirmed =
      window.confirm(
        `Tem certeza que deseja excluir definitivamente o imóvel ${normalizedCode}? Esta ação não poderá ser desfeita.`,
      );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result =
        await deletePropertyAction(
          normalizedCode,
        );

      if (!result.success) {
        setMessage(
          result.message,
        );

        return;
      }

      router.push(
        "/admin/imoveis",
      );

      router.refresh();
    });
  }

  return (
    <div className="border border-red-500/25 bg-red-500/[0.05] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">
        Exclusão administrativa
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Esta função remove
        definitivamente o cadastro do
        imóvel. Use apenas para
        cadastros criados por engano.
      </p>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Para confirmar, digite o código{" "}
        <strong className="text-zinc-300">
          {normalizedCode}
        </strong>
        .
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={confirmation}
          onChange={(event) =>
            setConfirmation(
              event.target.value,
            )
          }
          disabled={isPending}
          placeholder={normalizedCode}
          className="min-h-11 flex-1 border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleDelete}
          disabled={
            isPending ||
            !canDelete
          }
          className="inline-flex min-h-11 items-center justify-center bg-red-600 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending
            ? "Excluindo..."
            : "Excluir imóvel"}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-xs leading-5 text-red-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}