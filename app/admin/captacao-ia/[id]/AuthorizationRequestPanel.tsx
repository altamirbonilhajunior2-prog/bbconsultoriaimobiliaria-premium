"use client";

import { useState } from "react";

import { requestAuthorizationAction } from "./actions";

const authorizationMessage = `Olá! Tudo bem?

Meu nome é Altamir, da B&B Consultoria Imobiliária, em São José dos Campos.

Identificamos seu imóvel anunciado e temos interesse em incluí-lo em nossa carteira de oportunidades para apresentar aos nossos clientes.

Gostaríamos de solicitar sua autorização para divulgarmos e intermediarmos a negociação do imóvel, mantendo sempre as informações, condições e disponibilidade alinhadas com você.

Caso autorize, também podemos utilizar as fotos fornecidas por você para apresentação do imóvel em nosso portal e canais de divulgação.

Ficamos à disposição e aguardamos sua autorização.

B&B Consultoria Imobiliária`;

type AuthorizationRequestPanelProps = {
  opportunityId: number;
  canRequestAuthorization: boolean;
  authorizationPending: boolean;
};

export default function AuthorizationRequestPanel({
  opportunityId,
  canRequestAuthorization,
  authorizationPending,
}: AuthorizationRequestPanelProps) {
  const [copied, setCopied] =
    useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(
        authorizationMessage,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
          Solicitação de autorização
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Abordagem ao proprietário
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Utilize a mensagem abaixo para
          solicitar formalmente a autorização
          antes de qualquer divulgação do
          imóvel ou uso de imagens.
        </p>
      </div>

      <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300">
        {authorizationMessage}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={copyMessage}
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-amber-500/50 hover:text-amber-300"
        >
          {copied
            ? "Mensagem copiada"
            : "Copiar mensagem"}
        </button>

        {canRequestAuthorization ? (
          <form
            action={
              requestAuthorizationAction
            }
          >
            <input
              type="hidden"
              name="opportunityId"
              value={opportunityId}
            />

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-amber-500 px-5 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Registrar solicitação de autorização
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-zinc-500"
          >
            {authorizationPending
              ? "Autorização aguardando resposta"
              : "Solicitação indisponível"}
          </button>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Registrar a solicitação não significa
        que o imóvel foi autorizado. As
        permissões de divulgação, uso e edição
        de imagens permanecem bloqueadas até o
        registro da resposta do proprietário.
      </p>
    </section>
  );
}