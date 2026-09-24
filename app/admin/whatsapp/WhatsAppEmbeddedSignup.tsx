"use client";

import { useEffect, useState } from "react";

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

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!META_APP_ID) {
      setMessage("NEXT_PUBLIC_META_APP_ID não está configurado.");
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v26.0",
      });

      setSdkReady(true);
    };

    if (window.FB) {
      window.fbAsyncInit();
      return;
    }

    const existingScript = document.getElementById("facebook-jssdk");

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/pt_BR/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    document.body.appendChild(script);
  }, []);

  function startSignup() {
    if (!META_CONFIG_ID) {
      setMessage("NEXT_PUBLIC_META_CONFIG_ID não está configurado.");
      return;
    }

    if (!window.FB || !sdkReady) {
      setMessage("O SDK da Meta ainda está carregando. Tente novamente.");
      return;
    }

    setOpening(true);
    setMessage(null);

    window.FB.login(
      (response) => {
        setOpening(false);

        const code = response.authResponse?.code;

        if (code) {
          setMessage(
            "Autorização concluída pela Meta. A conexão ainda não será finalizada automaticamente.",
          );

          console.info(
            "[B&B Íris] Embedded Signup autorizado. Código recebido com sucesso.",
          );

          return;
        }

        setMessage(
          "A configuração não foi concluída. Nenhuma alteração foi feita no WhatsApp.",
        );
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          featureType: "whatsapp_business_app_onboarding",
        },
      },
    );
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={startSignup}
        disabled={!sdkReady || opening}
        className="inline-flex min-h-12 items-center justify-center bg-emerald-500 px-6 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {opening
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
