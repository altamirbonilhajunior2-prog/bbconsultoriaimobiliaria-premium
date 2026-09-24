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
  };
};

type WhatsAppSignupEventData = {
  waba_id?: string;
  phone_number_id?: string;
};

type WhatsAppSignupEvent = {
  event?: string;
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

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] =
    useState(false);

  const [opening, setOpening] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

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
        if (
          event.origin !==
          "https://www.facebook.com"
        ) {
          return;
        }

        let payload:
          WhatsAppSignupEvent;

        try {
          payload =
            typeof event.data ===
            "string"
              ? JSON.parse(
                  event.data,
                ) as WhatsAppSignupEvent
              : event.data as WhatsAppSignupEvent;
        } catch {
          return;
        }

        if (
          !payload ||
          typeof payload !==
            "object"
        ) {
          return;
        }

        if (
          payload.event ===
            "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" ||
          payload.event ===
            "FINISH"
        ) {
          const wabaId =
            payload.data?.waba_id;

          if (wabaId) {
            wabaIdRef.current =
              wabaId;

            setMessage(
              "Conta do WhatsApp identificada. Concluindo a conexão...",
            );

            void finishConnection();
          }
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
    </div>
  );
}