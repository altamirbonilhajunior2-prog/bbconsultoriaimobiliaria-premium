"use client";

import { useEffect, useRef, useState } from "react";

type CoexistenceApiResponse = {
  success?: boolean;
  message?: string;
  wabaId?: string;
  subscribed?: boolean;
  phoneNumbers?: Array<{
    id: string | null;
    displayPhoneNumber: string | null;
    verifiedName: string | null;
    status: string | null;
    qualityRating: string | null;
  }>;
};

const META_APP_ID =
  process.env.NEXT_PUBLIC_META_APP_ID;

const META_CONFIG_ID =
  process.env.NEXT_PUBLIC_META_CONFIG_ID;

const META_REDIRECT_URI =
  "https://www.bbconsultoriaimoveis.com.br/admin/whatsapp";

export default function WhatsAppEmbeddedSignup() {
  const [opening, setOpening] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const authorizationCodeRef =
    useRef<string | null>(null);

  const finishingRef =
    useRef(false);

  async function finishConnection() {
    if (finishingRef.current) {
      return;
    }

    const code =
      authorizationCodeRef.current;

    if (!code) {
      return;
    }

    finishingRef.current = true;
    setFinishing(true);

    try {
      const response =
        await fetch(
          "/api/admin/whatsapp/coexistence",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                code,
              }),
          },
        );

      const data =
        await response.json() as
          CoexistenceApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "N\u00e3o foi poss\u00edvel concluir a conex\u00e3o com a Meta.",
        );

        return;
      }

      const number =
        data.phoneNumbers?.[0]
          ?.displayPhoneNumber;

      setMessage(
        number
          ? `Coexist\u00eancia conectada com sucesso. N\u00famero identificado: ${number}.`
          : "Coexist\u00eancia conectada com sucesso \u00e0 conta do WhatsApp Business.",
      );
    } catch (error) {
      console.error(
        "Erro ao finalizar coexist\u00eancia:",
        error,
      );

      setMessage(
        "A autoriza\u00e7\u00e3o foi recebida, mas n\u00e3o foi poss\u00edvel concluir a conex\u00e3o agora.",
      );
    } finally {
      setFinishing(false);
      finishingRef.current = false;
    }
  }

  useEffect(() => {
    const url =
      new URL(window.location.href);

    const code =
      url.searchParams.get("code");

    const returnedState =
      url.searchParams.get("state");

    const error =
      url.searchParams.get("error");

    const errorDescription =
      url.searchParams.get(
        "error_description",
      );

    if (!code && !error) {
      return;
    }

    const cleanUrl = () => {
      [
        "code",
        "state",
        "error",
        "error_reason",
        "error_description",
      ].forEach((key) => {
        url.searchParams.delete(key);
      });

      window.history.replaceState(
        {},
        "",
        url.pathname +
          url.search +
          url.hash,
      );
    };

    if (error) {
      cleanUrl();

      setMessage(
        errorDescription ||
          "A autoriza\u00e7\u00e3o da Meta n\u00e3o foi conclu\u00edda.",
      );

      return;
    }

    const expectedState =
      window.sessionStorage.getItem(
        "bb-whatsapp-oauth-state",
      );

    if (
      !returnedState ||
      !expectedState ||
      returnedState !== expectedState
    ) {
      cleanUrl();

      window.sessionStorage.removeItem(
        "bb-whatsapp-oauth-state",
      );

      setMessage(
        "N\u00e3o foi poss\u00edvel validar o retorno da Meta. Inicie a conex\u00e3o novamente.",
      );

      return;
    }

    window.sessionStorage.removeItem(
      "bb-whatsapp-oauth-state",
    );

    authorizationCodeRef.current =
      code;

    cleanUrl();

    setMessage(
      "Autoriza\u00e7\u00e3o conclu\u00edda pela Meta. Concluindo a conex\u00e3o...",
    );

    void finishConnection();
  }, []);

  function startSignup() {
    if (!META_APP_ID) {
      setMessage(
        "NEXT_PUBLIC_META_APP_ID n\u00e3o est\u00e1 configurado.",
      );

      return;
    }

    if (!META_CONFIG_ID) {
      setMessage(
        "NEXT_PUBLIC_META_CONFIG_ID n\u00e3o est\u00e1 configurado.",
      );

      return;
    }

    authorizationCodeRef.current =
      null;

    setOpening(true);
    setMessage(null);

    const state =
      window.crypto.randomUUID();

    window.sessionStorage.setItem(
      "bb-whatsapp-oauth-state",
      state,
    );

    const oauthUrl =
      new URL(
        "https://www.facebook.com/v26.0/dialog/oauth",
      );

    oauthUrl.searchParams.set(
      "client_id",
      META_APP_ID,
    );

    oauthUrl.searchParams.set(
      "redirect_uri",
      META_REDIRECT_URI,
    );

    oauthUrl.searchParams.set(
      "response_type",
      "code",
    );

    oauthUrl.searchParams.set(
      "config_id",
      META_CONFIG_ID,
    );

    oauthUrl.searchParams.set(
      "override_default_response_type",
      "true",
    );

    oauthUrl.searchParams.set(
      "state",
      state,
    );

    oauthUrl.searchParams.set(
      "extras",
      JSON.stringify({
        setup: {},
        featureType:
          "whatsapp_business_app_onboarding",
        sessionInfoVersion:
          "3",
      }),
    );

    window.location.assign(
      oauthUrl.toString(),
    );
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={startSignup}
        disabled={
          opening ||
          finishing
        }
        className="inline-flex min-h-12 items-center justify-center bg-emerald-500 px-6 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {finishing
          ? "Concluindo conex\u00e3o..."
          : opening
            ? "Abrindo Meta..."
            : "Conectar WhatsApp em modo Coexist\u00eancia"}
      </button>

      <p className="mt-3 max-w-2xl text-xs leading-6 text-zinc-500">
        Este botão inicia exclusivamente o Embedded Signup configurado para
        coexistência entre o WhatsApp Business App e a Cloud API.
      </p>

      {message ? (
        <div
          className="mt-5 border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300"
          role="status"
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
