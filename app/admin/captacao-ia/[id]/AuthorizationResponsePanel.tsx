import { registerAuthorizationResponseAction } from "./actions";

type AuthorizationResponsePanelProps = {
  opportunityId: number;
  canRegisterResponse: boolean;
};

export default function AuthorizationResponsePanel({
  opportunityId,
  canRegisterResponse,
}: AuthorizationResponsePanelProps) {
  if (!canRegisterResponse) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
          Resposta do proprietário
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Registrar autorização
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Registre exatamente as permissões
          concedidas pelo proprietário ou
          parceiro. Nenhuma opção deve ser
          marcada sem autorização expressa.
        </p>
      </div>

      <form
        action={
          registerAuthorizationResponseAction
        }
        className="space-y-6"
      >
        <input
          type="hidden"
          name="opportunityId"
          value={opportunityId}
        />

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              name="authorizedToAdvertise"
              className="mt-1 h-4 w-4 accent-amber-500"
            />

            <span>
              <strong className="block text-sm font-semibold text-white">
                Autoriza divulgar o imóvel
              </strong>

              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Permite apresentar e anunciar
                o imóvel nos canais da
                B&amp;B.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              name="authorizedToUseImages"
              className="mt-1 h-4 w-4 accent-amber-500"
            />

            <span>
              <strong className="block text-sm font-semibold text-white">
                Autoriza utilizar as imagens
              </strong>

              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Permite utilizar as fotos
                fornecidas ou expressamente
                autorizadas pelo responsável.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              name="authorizedToEditImages"
              className="mt-1 h-4 w-4 accent-amber-500"
            />

            <span>
              <strong className="block text-sm font-semibold text-white">
                Autoriza editar as imagens
              </strong>

              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Permite ajustes de
                apresentação, mantendo a
                aparência real do imóvel.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="authorizationNotes"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500"
          >
            Observações / registro da resposta
          </label>

          <textarea
            id="authorizationNotes"
            name="authorizationNotes"
            rows={4}
            placeholder="Ex.: autorização recebida por WhatsApp em conversa com o proprietário."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500/60"
          />
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <p className="text-xs leading-5 text-zinc-400">
            As permissões acima somente serão
            consideradas se você registrar a
            resposta como{" "}
            <strong className="text-amber-300">
              Autorizado
            </strong>
            . Em caso de negativa, todas
            permanecerão bloqueadas.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            name="decision"
            value="AUTHORIZED"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Registrar como autorizado
          </button>

          <button
            type="submit"
            name="decision"
            value="DENIED"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Registrar como negado
          </button>
        </div>
      </form>
    </section>
  );
}