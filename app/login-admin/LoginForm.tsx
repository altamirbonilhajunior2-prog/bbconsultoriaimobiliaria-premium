"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-10 space-y-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-zinc-400"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
          placeholder="seu e-mail administrativo"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-zinc-400"
        >
          Senha
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-14 w-full border border-white/15 bg-[#111] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
          placeholder="sua senha"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-14 w-full items-center justify-center bg-amber-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}