"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: FacebookLoginOptions,
      ) => void;
    };
  }
}

type FacebookLoginResponse = {
  authResponse?: {
    code?: string;
  };
  status?: string;
};

type FacebookLoginOptions = {
  config_id: string;
  response_type: "code";
  override_default_response_type: true;
  extras: {
    featureType: "whatsapp_business_app_onboarding";
    sessionInfoVersion: "3";
  };
};

type WhatsAppSignupEventData = {
  waba_id?: string;
  phone_number_id?: string;
  [key: string]: unknown;
};

type MetaDiagnosticEntry = {
  id: number;
  time: string;
  origin: string;
  type: string | null;
  event: string | null;
  dataKeys: string[];
  wabaId: string | null;
  phoneNumberId: string | null;
  parsed: boolean;
};

type WhatsAppSignupEvent = {
  event?: string;
  type?: string;
  data?: WhatsAppSignupEventData;
};

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

const ALLOWED_META_ORIGINS =
  new Set([
    "https://www.facebook.com",
    "https://web.facebook.com",
  ]);

function isMetaOrigin(origin: string) {
  try {
    const hostname =
      new URL(origin).hostname.toLowerCase();

    return (
      hostname === "facebook.com" ||
      hostname.endsWith(".facebook.com") ||
      hostname === "facebook.net" ||
      hostname.endsWith(".facebook.net")
    );
  } catch {
    return false;
  }
}

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] =
    useState(false);

  const [opening, setOpening] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [diagnostics, setDiagnostics] =
    useState<MetaDiagnosticEntry[]>([]);

  const diagnosticCounterRef =
    useRef(0);

  const authorizationCodeRef =
    useRef<string | null>(null);

  const wabaIdRef =
    useRef<string | null>(null);

  const finishingRef =
    useRef(false);

  async function finishConnection() {
    if (finishingRef.current) {
      return;
    }

    const code =
      authorizationCodeRef.current;

    const wabaId =
      wabaIdRef.current;

    if (
      !code ||
      !wabaId
    ) {
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
                wabaId,
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
            "Não foi possível concluir a conexão com a Meta.",
        );

        return;
      }

      const number =
        data.phoneNumbers?.[0]
          ?.displayPhoneNumber;

      setMessage(
        number
          ? `Coexistência conectada com sucesso. Número identificado: ${number}.`
          : "Coexistência conectada com sucesso à conta do WhatsApp Business.",
      );
    } catch (error) {
      console.error(
        "Erro ao finalizar coexistência:",
        error,
      );

      setMessage(
        "A autorização foi recebida, mas não foi possível concluir a conexão agora.",
      );
    } finally {
      setFinishing(false);
      finishingRef.current = false;
    }
  }

  useEffect(() => {
    if (!META_APP_ID) {
      setMessage(
        "NEXT_PUBLIC_META_APP_ID não está configurado.",
      );

      return;
    }

    const handleMessage =
      (event: MessageEvent) => {
        if (!isMetaOrigin(event.origin)) {
          return;
        }

        let payload:
          WhatsAppSignupEvent | null =
            null;

        let parsed = false;

        try {
          const rawPayload =
            typeof event.data ===
            "string"
              ? JSON.parse(event.data)
              : event.data;

          if (
            rawPayload &&
            typeof rawPayload ===
              "object"
          ) {
            payload =
              rawPayload as WhatsAppSignupEvent;

            parsed = true;
          }
        } catch {
          parsed = false;
        }

        const data =
          payload?.data &&
          typeof payload.data ===
            "object"
            ? payload.data
            : undefined;

        diagnosticCounterRef.current += 1;

        const diagnosticEntry:
          MetaDiagnosticEntry = {
            id:
              diagnosticCounterRef.current,

            time:
              new Date().toLocaleTimeString(
                "pt-BR",
              ),

            origin:
              event.origin,

            type:
              typeof payload?.type ===
              "string"
                ? payload.type
                : null,

            event:
              typeof payload?.event ===
              "string"
                ? payload.event
                : null,

            dataKeys:
              data
                ? Object.keys(data)
                : [],

            wabaId:
              typeof data?.waba_id ===
              "string"
                ? data.waba_id
                : null,

            phoneNumberId:
              typeof data?.phone_number_id ===
              "string"
                ? data.phone_number_id
                : null,

            parsed,
          };

        setDiagnostics(
          (current) => [
            diagnosticEntry,
            ...current,
          ].slice(0, 20),
        );

        if (
          !ALLOWED_META_ORIGINS.has(
            event.origin,
          )
        ) {
          return;
        }

        if (!payload) {
          return;
        }

        const isFinishEvent =
          payload.event ===
            "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" ||
          payload.event ===
            "FINISH" ||
          payload.type ===
            "WA_EMBEDDED_SIGNUP";

        const wabaId =
          payload.data?.waba_id;

        if (
          isFinishEvent &&
          wabaId
        ) {
          wabaIdRef.current =
            wabaId;

          setMessage(
            "Conta do WhatsApp identificada. Concluindo a conexão...",
          );

          void finishConnection();
        }
      };

    window.addEventListener(
      "message",
      handleMessage,
    );

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId:
          META_APP_ID,

        cookie:
          true,

        xfbml:
          false,

        version:
          "v26.0",
      });

      setSdkReady(
        true,
      );
    };

    if (window.FB) {
      window.fbAsyncInit();
    } else {
      const existingScript =
        document.getElementById(
          "facebook-jssdk",
        );

      if (!existingScript) {
        const script =
          document.createElement(
            "script",
          );

        script.id =
          "facebook-jssdk";

        script.src =
          "https://connect.facebook.net/pt_BR/sdk.js";

        script.async =
          true;

        script.defer =
          true;

        script.crossOrigin =
          "anonymous";

        document.body.appendChild(
          script,
        );
      }
    }

    return () => {
      window.removeEventListener(
        "message",
        handleMessage,
      );
    };
  }, []);

  function startSignup() {
    if (!META_CONFIG_ID) {
      setMessage(
        "NEXT_PUBLIC_META_CONFIG_ID não está configurado.",
      );

      return;
    }

    if (
      !window.FB ||
      !sdkReady
    ) {
      setMessage(
        "O SDK da Meta ainda está carregando. Tente novamente.",
      );

      return;
    }

    authorizationCodeRef.current =
      null;

    wabaIdRef.current =
      null;

    diagnosticCounterRef.current =
      0;

    setDiagnostics([]);

    setOpening(
      true,
    );

    setMessage(
      null,
    );

    window.FB.login(
      (response) => {
        setOpening(
          false,
        );

        const code =
          response.authResponse
            ?.code;

        if (code) {
          authorizationCodeRef.current =
            code;

          setMessage(
            "Autorização concluída pela Meta. Aguardando os dados da conta do WhatsApp...",
          );

          void finishConnection();

          return;
        }

        setMessage(
          "A configuração não foi concluída. Nenhuma alteração foi feita no WhatsApp.",
        );
      },
      {
        config_id:
          META_CONFIG_ID,

        response_type:
          "code",

        override_default_response_type:
          true,

        extras: {
          featureType:
            "whatsapp_business_app_onboarding",

          sessionInfoVersion:
            "3",
        },
      },
    );
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={
          startSignup
        }
        disabled={
          !sdkReady ||
          opening ||
          finishing
        }
        className="inline-flex min-h-12 items-center justify-center bg-emerald-500 px-6 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {finishing
          ? "Concluindo conexão..."
          : opening
            ? "Abrindo Meta..."
            : sdkReady
              ? "Conectar WhatsApp em modo Coexistência"
              : "Carregando Meta..."}
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

      <div className="mt-6 border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="text-sm font-bold text-amber-200">
          Diagn?stico tempor?rio do Embedded Signup
        </div>

        <p className="mt-2 max-w-3xl text-xs leading-6 text-zinc-400">
          Esta ?rea mostra somente metadados t?cnicos seguros recebidos da Meta.
          Tokens, App Secret e authorization code n?o s?o exibidos.
        </p>

        {diagnostics.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-400">
            Nenhum evento Meta postMessage foi recebido nesta tentativa.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {diagnostics.map((entry) => (
              <div
                key={entry.id}
                className="border border-white/10 bg-black/30 p-3 text-xs leading-6 text-zinc-300"
              >
                <div><strong>Hor?rio:</strong> {entry.time}</div>
                <div><strong>Origin:</strong> {entry.origin}</div>
                <div><strong>Type:</strong> {entry.type ?? "(ausente)"}</div>
                <div><strong>Event:</strong> {entry.event ?? "(ausente)"}</div>
                <div>
                  <strong>Data keys:</strong>{" "}
                  {entry.dataKeys.length
                    ? entry.dataKeys.join(", ")
                    : "(nenhuma)"}
                </div>
                <div><strong>WABA ID:</strong> {entry.wabaId ?? "(ausente)"}</div>
                <div>
                  <strong>Phone Number ID:</strong>{" "}
                  {entry.phoneNumberId ?? "(ausente)"}
                </div>
                <div>
                  <strong>Payload:</strong>{" "}
                  {entry.parsed
                    ? "interpretado"
                    : "n?o interpretado"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}