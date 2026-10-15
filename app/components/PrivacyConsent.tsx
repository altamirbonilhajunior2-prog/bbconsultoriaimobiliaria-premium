"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CONSENT_KEY,
  isPublicPath,
  type Choice,
} from "../../lib/privacy/consent";
import {
  readChoice,
} from "../../lib/privacy/consent-store";
import {
  PRIVACY_CHOICE_EVENT,
  advertisingWasLoaded,
  clearAdvertisingCookies,
  stopAdvertising,
} from "../../lib/privacy/advertising";

import { clearCampaign, clientAttribution } from "../../lib/privacy/client-attribution";
import { browserConsent, DENIAL_EPOCH, REVOCATION_PENDING } from "../../lib/privacy/browser-consent";

type Panel = "closed" | "notice" | "preferences";

export default function PrivacyConsent() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [panel, setPanel] = useState<Panel>("closed");
  const [draftAdvertising, setDraftAdvertising] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [message, setMessage] = useState("");

  const refresh = useCallback(() => {
    let stored: Choice | null = null;
    try { stored = readChoice(window.localStorage); } catch { /* storage unavailable */ }
    setInitialized(true);
    setChoice(stored);
    setDraftAdvertising(stored?.advertising ?? false);
    setPanel((current) => stored ? current === "notice" ? "closed" : current :
      current === "closed" ? "notice" : current);
  }, []);

  useEffect(() => {
    let disposed = false;
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bb-privacy") : null;
    channelRef.current = channel;
    function block() {
      browserConsent().block();
      clearCampaign();
      stopAdvertising();
      refresh();
      if (advertisingWasLoaded()) window.location.reload();
    }
    async function sync() {
      block();
      try { await browserConsent().sync(); } catch { /* remain blocked */ }
      if (!disposed) {
        refresh();
        window.dispatchEvent(new Event(PRIVACY_CHOICE_EVENT));
        clientAttribution();
      }
    }
    function onStorage(event: StorageEvent) {
      if ([CONSENT_KEY, DENIAL_EPOCH, REVOCATION_PENDING, null].includes(event.key)) block();
    }
    function onBroadcast() { browserConsent().block(true); block(); }
    if (isPublicPath(window.location.pathname)) void sync();
    channel?.addEventListener("message", onBroadcast);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      disposed = true;
      if (channelRef.current === channel) channelRef.current = null;
      channel?.close();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, [refresh]);

  useEffect(() => { clientAttribution(); }, [pathname, choice]);

  if (!initialized || !isPublicPath(pathname)) return null;

  async function save(advertising: boolean) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    clearCampaign();
    const wasLoaded = advertisingWasLoaded();
    stopAdvertising();
    if (!advertising) {
      try { clearAdvertisingCookies(); } catch { /* browser may block cookie access */ }
    }
    try {
      channelRef.current?.postMessage("block");
      const pending = browserConsent().save(advertising);
      setChoice(null);
      window.dispatchEvent(new Event(PRIVACY_CHOICE_EVENT));
      const next = await pending;
      setChoice(next);
      setDraftAdvertising(advertising);
      setMessage("");
      setPanel("closed");
      window.dispatchEvent(new Event(PRIVACY_CHOICE_EVENT));
    } catch {
      browserConsent().block();
      setChoice(null);
      setDraftAdvertising(false);
      setMessage("Publicidade bloqueada. Não foi possível confirmar e salvar sua escolha; tente novamente.");
      setPanel("preferences");
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (wasLoaded) window.location.reload();
    }
  }

  return (
    <div className={panel === "closed" ? "fixed bottom-3 right-6 z-[1100] flex flex-col gap-2" : "fixed bottom-3 left-3 right-3 z-[1100] flex max-w-xl flex-col gap-2 sm:left-4 sm:right-auto sm:w-full"}>
      {panel !== "closed" && (
        <section
          aria-labelledby="privacy-title"
          className="max-h-[min(80vh,34rem)] overflow-y-auto rounded-xl border border-[#D5A85A]/50 bg-zinc-950 p-4 text-sm text-white shadow-2xl sm:p-5"
        >
          <h2 id="privacy-title" className="text-base font-semibold text-[#D5A85A]">
            Preferências de privacidade
          </h2>
          <p className="mt-2 leading-6 text-zinc-200">
            Tecnologias necessárias mantêm o Portal funcionando. Google Ads e Meta
            podem medir campanhas e exibir publicidade quando você autorizar.
            Sua escolha de contato nos formulários é separada.
          </p>
          <p className="mt-2">
            <Link className="underline underline-offset-2" href="/politica-de-privacidade">
              Saiba mais sobre privacidade
            </Link>
          </p>
          {panel === "preferences" && (
            <div className="mt-4 space-y-3 border-t border-white/20 pt-4">
              <div>
                <strong>Estritamente necessárias</strong>
                <p className="text-zinc-300">Funcionamento, segurança e registro desta escolha. Sempre ativas.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={draftAdvertising}
                  onChange={(event) => setDraftAdvertising(event.target.checked)}
                  className="mt-1 size-4 accent-[#D5A85A]"
                />
                <span>
                  <strong>Publicidade</strong>
                  <span className="block text-zinc-300">Google Ads e Meta. Desativada por padrão.</span>
                </span>
              </label>
            </div>
          )}
          {message && <p role="alert" className="mt-3 text-amber-200">{message}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {panel === "notice" ? (
              <>
                <button type="button" disabled={saving} onClick={() => save(true)} className="min-h-11 rounded-md border border-[#D5A85A] px-4">
                  Aceitar
                </button>
                <button type="button" disabled={saving} onClick={() => save(false)} className="min-h-11 rounded-md border border-[#D5A85A] px-4">
                  Recusar
                </button>
                <button type="button" onClick={() => setPanel("preferences")} className="min-h-11 rounded-md border border-white/40 px-4">
                  Preferências
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={saving} onClick={() => save(draftAdvertising)} className="min-h-11 rounded-md border border-[#D5A85A] px-4">
                  Salvar preferências
                </button>
                <button type="button" disabled={saving} onClick={() => save(false)} className="min-h-11 rounded-md border border-[#D5A85A] px-4">
                  Recusar publicidade
                </button>
              </>
            )}
          </div>
        </section>
      )}
      {panel === "closed" && (
        <button
          type="button"
          onClick={() => { setDraftAdvertising(choice?.advertising ?? false); setPanel("preferences"); }}
          className="self-end rounded-md border border-[#D5A85A]/60 bg-zinc-950 px-3 py-2 text-xs text-white shadow-lg"
        >
          Preferências de privacidade
        </button>
      )}
    </div>
  );
}
