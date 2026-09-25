import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  IrisConversationChannel,
  IrisConversationStatus,
  IrisMessageAuthor,
  IrisMessageDirection,
  Prisma,
} from "../../../generated/prisma/client";

import {
  decideNextIrisQuestion,
  mergeIrisProfile,
} from "../../../lib/iris/conversation";

import type {
  IrisConversationProfile,
} from "../../../lib/iris/conversation";
import { buildIrisHandoffMessage } from "../../../lib/iris/handoff";
import { interpretIrisMessage } from "../../../lib/iris/interpret";
import { prisma } from "../../../lib/prisma";
import { sendWhatsAppText } from "../../../lib/whatsapp/send";

export const runtime = "nodejs";

type WhatsAppTextMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
};

type WhatsAppContact = {
  profile?: {
    name?: string;
  };
  wa_id?: string;
};

type WhatsAppWebhookValue = {
  messaging_product?: string;

  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };

  contacts?: WhatsAppContact[];

  messages?: WhatsAppTextMessage[];
};

type WhatsAppWebhookPayload = {
  object?: string;

  entry?: Array<{
    id?: string;

    changes?: Array<{
      field?: string;
      value?: WhatsAppWebhookValue;
    }>;
  }>;
};

type IncomingWhatsAppMessage = {
  messageId: string;
  from: string;
  contactName: string | null;
  phoneNumberId: string | null;
  text: string;
};

type PersistIncomingMessageResult = {
  stored: boolean;
  duplicate: boolean;
  conversationId: number | null;
  shouldProcess: boolean;
};

function getVerifyToken() {
  const token =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();

  return token || null;
}

function getMetaAppSecret() {
  const secret =
    process.env.WHATSAPP_META_APP_SECRET?.trim();

  return secret || null;
}

function isValidMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
) {
  if (
    !signatureHeader ||
    !signatureHeader.startsWith(
      "sha256=",
    )
  ) {
    return false;
  }

  const receivedHex =
    signatureHeader.slice(
      "sha256=".length,
    );

  if (
    !/^[a-f0-9]{64}$/i.test(
      receivedHex,
    )
  ) {
    return false;
  }

  const expectedHex =
    createHmac(
      "sha256",
      appSecret,
    )
      .update(
        rawBody,
        "utf8",
      )
      .digest(
        "hex",
      );

  const received =
    Buffer.from(
      receivedHex,
      "hex",
    );

  const expected =
    Buffer.from(
      expectedHex,
      "hex",
    );

  if (
    received.length !==
    expected.length
  ) {
    return false;
  }

  return timingSafeEqual(
    received,
    expected,
  );
}

function maskPhone(
  value: string,
) {
  if (value.length <= 4) {
    return "****";
  }

  return `${"*".repeat(
    Math.max(
      0,
      value.length - 4,
    ),
  )}${value.slice(-4)}`;
}

function extractPropertyCodes(
  value: string,
) {
  const matches =
    value.match(
      /\b[A-Z]{2,6}\d{3,6}\b/gi,
    ) ?? [];

  return [
    ...new Set(
      matches.map(
        (item) =>
          item.toUpperCase(),
      ),
    ),
  ].slice(0, 5);
}

async function resolvePropertyIdFromText(
  value: string,
) {
  const codes =
    extractPropertyCodes(
      value,
    );

  for (const code of codes) {
    const property =
      await prisma.property.findUnique({
        where: {
          code,
        },

        select: {
          id: true,
        },
      });

    if (property) {
      return property.id;
    }
  }

  return null;
}

function normalizeWhatsAppRecipient(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const digits =
    value.replace(
      /\D/g,
      "",
    );

  if (
    digits.length === 10 ||
    digits.length === 11
  ) {
    return `55${digits}`;
  }

  if (
    (
      digits.length === 12 ||
      digits.length === 13
    ) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  return null;
}

function splitWhatsAppText(
  value: string,
  maximumLength = 3500,
) {
  const chunks: string[] = [];

  let remaining =
    value.trim();

  while (
    remaining.length >
    maximumLength
  ) {
    let cut =
      remaining.lastIndexOf(
        "\n",
        maximumLength,
      );

    if (
      cut <
      maximumLength * 0.6
    ) {
      cut =
        maximumLength;
    }

    chunks.push(
      remaining
        .slice(
          0,
          cut,
        )
        .trim(),
    );

    remaining =
      remaining
        .slice(
          cut,
        )
        .trim();
  }

  if (remaining) {
    chunks.push(
      remaining,
    );
  }

  return chunks;
}

function normalizeIrisProfile(
  value: unknown,
): IrisConversationProfile {
  const profile =
    value &&
    typeof value === "object"
      ? value as Partial<IrisConversationProfile>
      : {};

  return {
    purpose:
      typeof profile.purpose === "string"
        ? profile.purpose
        : "",

    propertyType:
      typeof profile.propertyType === "string"
        ? profile.propertyType
        : "",

    region:
      typeof profile.region === "string"
        ? profile.region
        : "",

    value:
      typeof profile.value === "string"
        ? profile.value
        : "",

    bedrooms:
      typeof profile.bedrooms === "string"
        ? profile.bedrooms
        : "",

    objective:
      typeof profile.objective === "string"
        ? profile.objective
        : "",

    details:
      typeof profile.details === "string"
        ? profile.details
        : "",

    timeline:
      typeof profile.timeline === "string"
        ? profile.timeline
        : "",

    finalDetailsAsked:
      profile.finalDetailsAsked === true,
  };
}

function extractTextMessages(
  payload: WhatsAppWebhookPayload,
): IncomingWhatsAppMessage[] {
  const extracted:
    IncomingWhatsAppMessage[] =
    [];

  for (
    const entry of
      payload.entry ?? []
  ) {
    for (
      const change of
        entry.changes ?? []
    ) {
      if (
        change.field !==
        "messages"
      ) {
        continue;
      }

      const value =
        change.value;

      if (!value) {
        continue;
      }

      const contact =
        value.contacts?.[0];

      const contactName =
        contact?.profile?.name?.trim() ||
        null;

      const phoneNumberId =
        value.metadata
          ?.phone_number_id
          ?.trim() ||
        null;

      for (
        const message of
          value.messages ?? []
      ) {
        if (
          message.type !==
          "text"
        ) {
          continue;
        }

        const text =
          message.text?.body?.trim();

        const from =
          message.from?.trim();

        const messageId =
          message.id?.trim();

        if (
          !text ||
          !from ||
          !messageId
        ) {
          continue;
        }

        extracted.push({
          messageId,
          from,
          contactName,
          phoneNumberId,
          text,
        });
      }
    }
  }

  return extracted;
}

async function persistIncomingMessage(
  message: IncomingWhatsAppMessage,
): Promise<PersistIncomingMessageResult> {
  const existingMessage =
    await prisma.irisMessage.findUnique({
      where: {
        externalMessageId:
          message.messageId,
      },

      select: {
        conversationId: true,
      },
    });

  if (existingMessage) {
    return {
      stored: false,
      duplicate: true,
      conversationId:
        existingMessage.conversationId,
      shouldProcess: false,
    };
  }

  const resolvedPropertyId =
    await resolvePropertyIdFromText(
      message.text,
    );

  let conversation =
    await prisma.irisConversation.findFirst({
      where: {
        channel:
          IrisConversationChannel.WHATSAPP,

        externalContactId:
          message.from,

        status: {
          in: [
            IrisConversationStatus.IRIS_ATENDENDO,
            IrisConversationStatus.AGUARDANDO_CLIENTE,
            IrisConversationStatus.HANDOFF,
            IrisConversationStatus.CORRETOR_ASSUMIU,
          ],
        },
      },

      orderBy: {
        lastMessageAt:
          "desc",
      },

      select: {
        id: true,
        status: true,
        propertyId: true,
      },
    });

  if (!conversation) {
    conversation =
      await prisma.irisConversation.create({
        data: {
          channel:
            IrisConversationChannel.WHATSAPP,

          status:
            IrisConversationStatus.IRIS_ATENDENDO,

          externalContactId:
            message.from,

          contactName:
            message.contactName,

          contactPhone:
            message.from,

          propertyId:
            resolvedPropertyId,
        },

        select: {
          id: true,
          status: true,
          propertyId: true,
        },
      });
  }

  const alreadyHandedOff =
    conversation.status ===
      IrisConversationStatus.HANDOFF ||
    conversation.status ===
      IrisConversationStatus.CORRETOR_ASSUMIU;

  try {
    await prisma.$transaction([
      prisma.irisMessage.create({
        data: {
          conversationId:
            conversation.id,

          author:
            IrisMessageAuthor.CLIENTE,

          direction:
            IrisMessageDirection.ENTRADA,

          externalMessageId:
            message.messageId,

          text:
            message.text,
        },
      }),

      prisma.irisConversation.update({
        where: {
          id:
            conversation.id,
        },

        data: {
          contactName:
            message.contactName ??
            undefined,

          contactPhone:
            message.from,

          externalContactId:
            message.from,

          propertyId:
            conversation.propertyId ??
            resolvedPropertyId ??
            undefined,

          lastMessageAt:
            new Date(),

          status:
            alreadyHandedOff
              ? conversation.status
              : IrisConversationStatus.IRIS_ATENDENDO,
        },
      }),
    ]);

    return {
      stored: true,
      duplicate: false,
      conversationId:
        conversation.id,
      shouldProcess:
        !alreadyHandedOff,
    };
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        stored: false,
        duplicate: true,
        conversationId:
          conversation.id,
        shouldProcess: false,
      };
    }

    throw error;
  }
}

async function processIrisConversation(
  conversationId: number,
  text: string,
) {
  const conversation =
    await prisma.irisConversation.findUnique({
      where: {
        id:
          conversationId,
      },

      select: {
        searchProfile: true,
      },
    });

  const interpreted =
    await interpretIrisMessage(
      text,
    );

  const mergedProfile =
    mergeIrisProfile(
      conversation?.searchProfile,
      interpreted,
    );

  const decision =
    decideNextIrisQuestion(
      mergedProfile,
    );

  const nextStatus =
    IrisConversationStatus.AGUARDANDO_CLIENTE;

  let irisMessageId:
    number | null =
    null;

  await prisma.$transaction(
    async (tx) => {
      await tx.irisConversation.update({
        where: {
          id:
            conversationId,
        },

        data: {
          searchProfile:
            decision.profile as Prisma.InputJsonValue,

          status:
            nextStatus,

          lastMessageAt:
            new Date(),
        },
      });

      if (
        decision.nextQuestion
      ) {
        const irisMessage =
          await tx.irisMessage.create({
            data: {
              conversationId,

              author:
                IrisMessageAuthor.IRIS,

              direction:
                IrisMessageDirection.SAIDA,

              text:
                decision.nextQuestion,
            },

            select: {
              id: true,
            },
          });

        irisMessageId =
          irisMessage.id;
      }
    },
  );

  return {
    interpreted,
    decision,
    irisMessageId,
  };
}

async function sendIrisQuestion(
  params: {
    conversationId: number;
    irisMessageId: number;
    phoneNumberId: string;
    to: string;
    text: string;
  },
) {
  const sent =
    await sendWhatsAppText({
      phoneNumberId:
        params.phoneNumberId,

      to:
        params.to,

      text:
        params.text,
    });

  if (
    sent.externalMessageId
  ) {
    await prisma.irisMessage.update({
      where: {
        id:
          params.irisMessageId,
      },

      data: {
        externalMessageId:
          sent.externalMessageId,
      },
    });
  }

  console.info(
    "Íris: resposta enviada pelo WhatsApp.",
    {
      conversationId:
        params.conversationId,

      to:
        maskPhone(
          params.to,
        ),

      externalMessageId:
        sent.externalMessageId,
    },
  );
}

async function handoffIrisConversation(
  params: {
    conversationId: number;
    phoneNumberId: string;
  },
) {
  const conversation =
    await prisma.irisConversation.findUnique({
      where: {
        id:
          params.conversationId,
      },

      select: {
        id: true,
        contactName: true,
        contactPhone: true,
        searchProfile: true,
        handoffReason: true,

        property: {
          select: {
            code: true,
            title: true,

            captor: {
              select: {
                id: true,
                name: true,
                phone: true,
                active: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt:
              "asc",
          },

          select: {
            author: true,
            text: true,
            createdAt: true,
          },
        },
      },
    });

  if (!conversation) {
    return {
      sent: false,
      reason:
        "conversation_not_found",
    };
  }

  if (
    conversation.handoffReason
      ?.startsWith(
        "ENVIADO_CAPTADOR:",
      )
  ) {
    return {
      sent: false,
      reason:
        "already_sent",
    };
  }

  const property =
    conversation.property;

  if (!property) {
    console.warn(
      "Iris: handoff nao enviado porque o imovel nao foi identificado.",
      {
        conversationId:
          conversation.id,
      },
    );

    return {
      sent: false,
      reason:
        "property_not_identified",
    };
  }

  const captor =
    property.captor;

  if (
    !captor ||
    !captor.active
  ) {
    console.warn(
      "Iris: handoff nao enviado porque o imovel nao possui captador ativo.",
      {
        conversationId:
          conversation.id,

        propertyCode:
          property.code,
      },
    );

    return {
      sent: false,
      reason:
        "captor_not_available",
    };
  }

  const captorPhone =
    normalizeWhatsAppRecipient(
      captor.phone,
    );

  if (!captorPhone) {
    console.warn(
      "Iris: handoff nao enviado porque o captador nao possui WhatsApp valido.",
      {
        conversationId:
          conversation.id,

        propertyCode:
          property.code,

        captorId:
          captor.id,
      },
    );

    return {
      sent: false,
      reason:
        "captor_phone_invalid",
    };
  }

  const handoffMessage =
    buildIrisHandoffMessage({
      clientName:
        conversation.contactName,

      clientPhone:
        conversation.contactPhone,

      propertyCode:
        property.code,

      propertyTitle:
        property.title,

      profile:
        normalizeIrisProfile(
          conversation.searchProfile,
        ),

      messages:
        conversation.messages.map(
          (message) => ({
            author:
              message.author,

            text:
              message.text,

            createdAt:
              message.createdAt,
          }),
        ),
    });

  const chunks =
    splitWhatsAppText(
      handoffMessage,
    );

  for (
    let index = 0;
    index < chunks.length;
    index += 1
  ) {
    const chunk =
      chunks[index];

    await sendWhatsAppText({
      phoneNumberId:
        params.phoneNumberId,

      to:
        captorPhone,

      text:
        chunks.length > 1
          ? `Parte ${index + 1}/${chunks.length}\n\n${chunk}`
          : chunk,
    });
  }

  const sentAt =
    new Date();

  await prisma.$transaction([
    prisma.irisConversation.update({
      where: {
        id:
          conversation.id,
      },

      data: {
        agentId:
          captor.id,

        summary:
          handoffMessage,

        handoffReason:
          `ENVIADO_CAPTADOR:${captor.id}:${sentAt.toISOString()}`,

        status:
          IrisConversationStatus.HANDOFF,

        handedOffAt:
          sentAt,
      },
    }),

    prisma.irisMessage.create({
      data: {
        conversationId:
          conversation.id,

        author:
          IrisMessageAuthor.SISTEMA,

        direction:
          IrisMessageDirection.INTERNA,

        text:
          `Atendimento encaminhado exclusivamente ao captador ${captor.name} do imovel ${property.code}.`,
      },
    }),
  ]);

  console.info(
    "Iris: atendimento encaminhado ao captador do imovel.",
    {
      conversationId:
        conversation.id,

      propertyCode:
        property.code,

      captorId:
        captor.id,

      parts:
        chunks.length,
    },
  );

  return {
    sent: true,
    reason:
      "sent",
  };
}

export async function GET(
  request: NextRequest,
) {
  const mode =
    request.nextUrl.searchParams.get(
      "hub.mode",
    );

  const token =
    request.nextUrl.searchParams.get(
      "hub.verify_token",
    );

  const challenge =
    request.nextUrl.searchParams.get(
      "hub.challenge",
    );

  const expectedToken =
    getVerifyToken();

  if (!expectedToken) {
    return NextResponse.json(
      {
        error:
          "Webhook de WhatsApp não configurado.",
      },
      {
        status: 503,
      },
    );
  }

  if (
    mode === "subscribe" &&
    token === expectedToken &&
    challenge
  ) {
    return new NextResponse(
      challenge,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      },
    );
  }

  return NextResponse.json(
    {
      error:
        "Falha na verificação do webhook.",
    },
    {
      status: 403,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  const appSecret =
    getMetaAppSecret();

  if (!appSecret) {
    console.error(
      "WHATSAPP_META_APP_SECRET não está configurado.",
    );

    return NextResponse.json(
      {
        error:
          "Webhook de WhatsApp não configurado.",
      },
      {
        status: 503,
      },
    );
  }

  let rawBody: string;

  try {
    rawBody =
      await request.text();
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível ler o payload.",
      },
      {
        status: 400,
      },
    );
  }

  const signature =
    request.headers.get(
      "x-hub-signature-256",
    );

  if (
    !isValidMetaSignature(
      rawBody,
      signature,
      appSecret,
    )
  ) {
    console.warn(
      "Webhook do WhatsApp rejeitado: assinatura da Meta inválida ou ausente.",
    );

    return NextResponse.json(
      {
        error:
          "Assinatura inválida.",
      },
      {
        status: 401,
      },
    );
  }

  let body:
    WhatsAppWebhookPayload;

  try {
    body =
      JSON.parse(
        rawBody,
      ) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json(
      {
        error:
          "Payload inválido.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Payload inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const messages =
    extractTextMessages(
      body,
    );

  let storedMessages = 0;
  let duplicateMessages = 0;
  let interpretedMessages = 0;
  let generatedQuestions = 0;
  let sentMessages = 0;
  let handoffs = 0;
  let handoffsSent = 0;

  for (
    const message of messages
  ) {
    console.info(
      "WhatsApp: mensagem de texto recebida.",
      {
        messageId:
          message.messageId,

        from:
          maskPhone(
            message.from,
          ),

        contactName:
          message.contactName,

        phoneNumberId:
          message.phoneNumberId,

        textLength:
          message.text.length,
      },
    );

    try {
      const result =
        await persistIncomingMessage(
          message,
        );

      if (result.stored) {
        storedMessages += 1;

        console.info(
          "Íris: mensagem recebida armazenada.",
          {
            messageId:
              message.messageId,

            from:
              maskPhone(
                message.from,
              ),
          },
        );

        if (
          result.conversationId &&
          result.shouldProcess
        ) {
          try {
            const {
              interpreted,
              decision,
              irisMessageId,
            } =
              await processIrisConversation(
                result.conversationId,
                message.text,
              );

            interpretedMessages += 1;

            if (
              decision.nextQuestion
            ) {
              generatedQuestions += 1;
            }

            if (
              decision.readyForHandoff
            ) {
              handoffs += 1;
            }

            console.info(
              "Íris: conversa processada.",
              {
                conversationId:
                  result.conversationId,

                purpose:
                  interpreted.purpose,

                propertyType:
                  interpreted.propertyType,

                region:
                  interpreted.region,

                nextQuestion:
                  Boolean(
                    decision.nextQuestion,
                  ),

                readyForHandoff:
                  decision.readyForHandoff,
              },
            );

            if (
              decision.nextQuestion &&
              irisMessageId &&
              message.phoneNumberId
            ) {
              try {
                await sendIrisQuestion({
                  conversationId:
                    result.conversationId,

                  irisMessageId,

                  phoneNumberId:
                    message.phoneNumberId,

                  to:
                    message.from,

                  text:
                    decision.nextQuestion,
                });

                sentMessages += 1;
              } catch (error) {
                console.error(
                  "Erro ao enviar resposta da Íris pelo WhatsApp:",
                  error,
                );
              }
            }


            if (
              decision.readyForHandoff &&
              message.phoneNumberId
            ) {
              try {
                const handoffResult =
                  await handoffIrisConversation({
                    conversationId:
                      result.conversationId,

                    phoneNumberId:
                      message.phoneNumberId,
                  });

                if (
                  handoffResult.sent
                ) {
                  handoffsSent += 1;
                }
              } catch (error) {
                console.error(
                  "Erro ao encaminhar atendimento da Iris ao captador:",
                  error,
                );
              }
            }
          } catch (error) {
            console.error(
              "Erro ao processar conversa da Íris:",
              error,
            );
          }
        }
      }

      if (result.duplicate) {
        duplicateMessages += 1;

        console.info(
          "Íris: mensagem duplicada ignorada.",
          {
            messageId:
              message.messageId,
          },
        );
      }
    } catch (error) {
      console.error(
        "Erro ao armazenar mensagem recebida pela Íris:",
        error,
      );
    }
  }

  return NextResponse.json(
    {
      received: true,

      textMessages:
        messages.length,

      storedMessages,

      duplicateMessages,

      interpretedMessages,

      generatedQuestions,

      sentMessages,

      handoffs,
      handoffsSent,
    },
    {
      status: 200,
    },
  );
}