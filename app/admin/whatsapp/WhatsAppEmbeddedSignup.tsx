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
        callback: (
          response: FacebookLoginResponse,
        ) => void,
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
    setup: Record<string, never>;
    featureType:
      "whatsapp_business_app_onboarding";
    sessionInfoVersion: "3";
  };
};

type WhatsAppSignupEvent = {
  type?: string;
  event?: string;

  data?: {
    waba_id?: string;
    phone_number_id?: string;
    [key: string]: unknown;
  };
};

const META_APP_ID =
  process.env.NEXT_PUBLIC_META_APP_ID;

const META_CONFIG_ID =
  process.env.NEXT_PUBLIC_META_CONFIG_ID;

function isMetaOrigin(
  origin: string,
) {
  try {
    const hostname =
      new URL(origin)
        .hostname
        .toLowerCase();

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

  const [message, setMessage] =
    useState<string | null>(null);

  const wabaIdRef =
    useRef<string | null>(null);

  const phoneNumberIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    if (!META_APP_ID) {
      setMessage(
        "NEXT_PUBLIC_META_APP_ID n?o est? configurado.",
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

        try {
          const raw =
            typeof event.data ===
            "string"
              ? JSON.parse(event.data)
              : event.data;

          if (
            raw &&
            typeof raw ===
              "object"
          ) {
            payload =
              raw as WhatsAppSignupEvent;
          }
        } catch {
          return;
        }

        if (!payload) {
          return;
        }

        const isFinish =
          payload.event ===
            "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" ||
          payload.event ===
            "FINISH" ||
          (
            payload.type ===
              "WA_EMBEDDED_SIGNUP" &&
            payload.event ===
              "FINISH"
          );

        const isCancel =
          payload.event ===
            "CANCEL" ||
          payload.event ===
            "CANCEL_WHATSAPP_BUSINESS_APP_ONBOARDING";

        if (isCancel) {
          setOpening(false);

          setMessage(
            "O onboarding de coexist?ncia foi cancelado antes da conclus?o.",
          );

          return;
        }

        if (!isFinish) {
          return;
        }

        const wabaId =
          payload.data?.waba_id;

        const phoneNumberId =
          payload.data?.phone_number_id;

        if (wabaId) {
          wabaIdRef.current =
            wabaId;
        }

        if (phoneNumberId) {
          phoneNumberIdRef.current =
            phoneNumberId;
        }

        setOpening(false);

        if (
          wabaId ||
          phoneNumberId
        ) {
          setMessage(
            "Onboarding de coexist?ncia conclu?do pela Meta. A conta do WhatsApp foi identificada. Agora vamos validar o status do n?mero e o recebimento de mensagens.",
          );
        } else {
          setMessage(
            "A Meta informou a conclus?o do onboarding, mas n?o retornou os identificadores da conta. N?o considere a ativa??o conclu?da ainda.",
          );
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

      setSdkReady(true);
    };

    if (window.FB) {
      window.fbAsyncInit();
    } else {
      const existing =
        document.getElementById(
          "facebook-jssdk",
        );

      if (!existing) {
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
        "NEXT_PUBLIC_META_CONFIG_ID n?o est? configurado.",
      );

      return;
    }

    if (
      !window.FB ||
      !sdkReady
    ) {
      setMessage(
        "O SDK da Meta ainda est? carregando. Tente novamente em alguns segundos.",
      );

      return;
    }

    wabaIdRef.current =
      null;

    phoneNumberIdRef.current =
      null;

    setOpening(true);

    setMessage(
      "Abrindo o onboarding oficial da Meta. Conclua todas as etapas, inclusive a conex?o do WhatsApp Business e o QR Code quando ele for apresentado.",
    );

    window.FB.login(
      (response) => {
        const code =
          response.authResponse
            ?.code;

        if (!code) {
          setOpening(false);

          setMessage(
            "O fluxo da Meta foi encerrado antes da autoriza??o. Nenhuma altera??o foi feita.",
          );

          return;
        }

        /*
         * Importante:
         * receber o authorization code N?O significa
         * que a coexist?ncia terminou.
         *
         * A conclus?o verdadeira ser? tratada pelo
         * evento FINISH do Embedded Signup.
         */
        setMessage(
          "Autoriza??o recebida pela Meta. Continue o onboarding at? concluir a etapa do WhatsApp Business. A conex?o s? ser? considerada conclu?da ap?s a finaliza??o do Embedded Signup.",
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
          setup: {},

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
        onClick={startSignup}
        disabled={
          !sdkReady ||
          opening
        }
        className="inline-flex min-h-12 items-center justify-center bg-emerald-500 px-6 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {opening
          ? "Onboarding em andamento..."
          : sdkReady
            ? "Conectar WhatsApp em modo Coexist?ncia"
            : "Carregando Meta..."}
      </button>

      <p className="mt-3 max-w-2xl text-xs leading-6 text-zinc-500">
        Este bot?o inicia o Embedded Signup oficial da Meta para conectar o
        WhatsApp Business App ? Cloud API em modo de coexist?ncia.
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
