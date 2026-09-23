type SendWhatsAppTextParams = {
  phoneNumberId: string;
  to: string;
  text: string;
};

type WhatsAppSendResponse = {
  messaging_product?: string;
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
  }>;
};

function getWhatsAppAccessToken() {
  const token =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "WHATSAPP_ACCESS_TOKEN não está configurado.",
    );
  }

  return token;
}

export async function sendWhatsAppText({
  phoneNumberId,
  to,
  text,
}: SendWhatsAppTextParams) {
  const accessToken =
    getWhatsAppAccessToken();

  const response =
    await fetch(
      `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            messaging_product:
              "whatsapp",

            recipient_type:
              "individual",

            to,

            type:
              "text",

            text: {
              preview_url:
                false,

              body:
                text,
            },
          }),
      },
    );

  const data =
    await response.json() as
      WhatsAppSendResponse & {
        error?: {
          message?: string;
          type?: string;
          code?: number;
        };
      };

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      `Falha ao enviar mensagem pelo WhatsApp. HTTP ${response.status}.`,
    );
  }

  const externalMessageId =
    data.messages?.[0]?.id?.trim() ||
    null;

  return {
    externalMessageId,
    response:
      data,
  };
}