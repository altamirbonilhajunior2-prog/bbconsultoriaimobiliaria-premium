"use client";

import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import {
  type PublicationActionState,
  updatePublicationAction,
} from "./publication-actions";

type PublicationControlProps = {
  code: string;
  published: boolean;
  publishedAt: string | null;
};

const initialState: PublicationActionState = {
  success: false,
  message: "",
};

export default function PublicationControl({
  code,
  published,
  publishedAt,
}: PublicationControlProps) {
  const router = useRouter();

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updatePublicationAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Publicação
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal text-white">
            Status no portal
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-500">
            O cadastro pode permanecer salvo no painel sem ficar
            disponível para visitantes do site.
          </p>
        </div>

        <div
          className={`border px-5 py-4 ${
            published
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-white/10 bg-[#111111]"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Situação atual
          </p>

          <p
            className={`mt-2 text-lg font-semibold ${
              published
                ? "text-emerald-300"
                : "text-zinc-300"
            }`}
          >
            {published
              ? "Publicado"
              : "Não publicado"}
          </p>

          {published && publishedAt ? (
            <p className="mt-2 text-xs text-zinc-500">
              Publicado em{" "}
              {new Intl.DateTimeFormat(
                "pt-BR",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                },
              ).format(
                new Date(
                  publishedAt,
                ),
              )}
            </p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <div
          className={`mt-6 border px-5 py-4 ${
            state.success
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <p
            className={`text-sm ${
              state.success
                ? "text-emerald-300"
                : "text-red-300"
            }`}
          >
            {state.message}
          </p>
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-7"
        onSubmit={(event) => {
          const message =
            published
              ? `Retirar o imóvel ${code} do portal público?`
              : `Publicar o imóvel ${code} no portal público?`;

          if (
            !window.confirm(
              message,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input
          type="hidden"
          name="code"
          value={code}
        />

        <input
          type="hidden"
          name="publicationAction"
          value={
            published
              ? "unpublish"
              : "publish"
          }
        />

        <button
          type="submit"
          disabled={isPending}
          className={`inline-flex min-h-14 items-center justify-center px-8 text-xs font-bold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
            published
              ? "border border-red-500/30 text-red-300 hover:border-red-400 hover:text-red-200"
              : "bg-amber-500 text-black hover:bg-amber-400"
          }`}
        >
          {isPending
            ? "Processando..."
            : published
              ? "Retirar do ar"
              : "Publicar imóvel"}
        </button>
      </form>

      <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-sm leading-7 text-amber-200">
          Este controle altera somente a publicação. Os dados e as
          fotografias cadastradas permanecem preservados.
        </p>
      </div>
    </section>
  );
}