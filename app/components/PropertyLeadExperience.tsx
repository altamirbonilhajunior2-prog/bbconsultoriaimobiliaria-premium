"use client";

import { FormEvent, useCallback, useState } from "react";

import { PORTAL_LEAD_CONSENT_TEXT } from "../../lib/leads/consent";
import PropertyGallery from "./PropertyGallery";

type PropertyLeadExperienceProps = {
  images: string[];
  aiImageIndexes?: number[];
  propertyCode: string;
  propertyTitle: string;
  tag: string;
};

type SubmissionState = "idle" | "sending" | "success" | "error";

const whatsappNumber = "5512978140636";

export default function PropertyLeadExperience({
  images,
  aiImageIndexes = [],
  propertyCode,
  propertyTitle,
  tag,
}: PropertyLeadExperienceProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [leadName, setLeadName] = useState("");

  const storageKey = `bb-lead-prompted:${propertyCode}`;

  const showPrompt = useCallback((imageIndex: number) => {
    if (imageIndex !== 3) return;

    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "true");
    } catch {
      // O convite continua funcionando quando o navegador bloqueia o armazenamento.
    }

    setIsPromptOpen(true);
  }, [storageKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const searchParams = new URLSearchParams(window.location.search);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyCode,
          name,
          phone: formData.get("phone"),
          consent: formData.get("consent") === "on",
          company: formData.get("company"),
          sourcePage: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer || null,
          utmSource: searchParams.get("utm_source"),
          utmMedium: searchParams.get("utm_medium"),
          utmCampaign: searchParams.get("utm_campaign"),
          utmTerm: searchParams.get("utm_term"),
          utmContent: searchParams.get("utm_content"),
          gclid: searchParams.get("gclid"),
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Não foi possível registrar seu contato.");
      }

      setLeadName(name);
      setSubmissionState("success");

      const trackedWindow = window as typeof window & {
        dataLayer?: Record<string, unknown>[];
      };

      trackedWindow.dataLayer = trackedWindow.dataLayer || [];
      trackedWindow.dataLayer.push({
        event: "portal_lead_created",
        property_code: propertyCode,
      });
    } catch (error) {
      setSubmissionState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu contato.",
      );
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Olá, sou ${leadName || "cliente"}. Acabei de demonstrar interesse no imóvel ${propertyCode} — ${propertyTitle}.`,
  );

  return (
    <>
      <div>
        <PropertyGallery
          images={images}
          aiImageIndexes={aiImageIndexes}
          title={propertyTitle}
          tag={tag}
          onImageViewed={showPrompt}
        />
      </div>

      {isPromptOpen ? (
        <aside
          role="dialog"
          aria-label={`Receber informações sobre ${propertyCode}`}
          className="fixed bottom-3 left-3 right-3 z-[1200] max-h-[calc(100vh-1.5rem)] overflow-y-auto border border-amber-500/60 bg-[#090909]/98 p-5 text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-[430px] sm:p-7"
        >
          <button
            type="button"
            onClick={() => setIsPromptOpen(false)}
            aria-label="Fechar convite"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-white/15 text-xl text-zinc-400 transition hover:border-amber-500 hover:text-amber-400"
          >
            ×
          </button>

          {submissionState === "success" ? (
            <div className="pr-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Interesse registrado
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight">
                Obrigado, {leadName}.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                A B&amp;B recebeu seu interesse no imóvel {propertyCode}. Nossa
                equipe entrará em contato pelo WhatsApp informado.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-amber-500 px-5 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
              >
                Falar agora com a B&amp;B
              </a>
            </div>
          ) : (
            <>
              <div className="pr-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  Atendimento B&amp;B
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight">
                  Gostou deste imóvel?
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Receba valores, disponibilidade e informações sobre a
                  referência {propertyCode} diretamente pelo WhatsApp.
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor={`company-${propertyCode}`}>Empresa</label>
                  <input
                    id={`company-${propertyCode}`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Seu nome
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    className="min-h-12 w-full border border-white/15 bg-black/50 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                    placeholder="Como podemos chamar você?"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    WhatsApp com DDD
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={20}
                    autoComplete="tel"
                    inputMode="tel"
                    className="min-h-12 w-full border border-white/15 bg-black/50 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                    placeholder="(12) 99999-9999"
                  />
                </label>

                <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-zinc-400">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
                  />
                  <span>
                    {PORTAL_LEAD_CONSENT_TEXT} Você poderá solicitar a
                    interrupção do contato a qualquer momento.
                  </span>
                </label>

                {submissionState === "error" ? (
                  <p role="alert" className="text-xs leading-5 text-red-300">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submissionState === "sending"}
                  className="inline-flex min-h-13 w-full items-center justify-center bg-amber-500 px-5 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {submissionState === "sending"
                    ? "Registrando..."
                    : "Receber informações"}
                </button>
              </form>
            </>
          )}
        </aside>
      ) : null}
    </>
  );
}
