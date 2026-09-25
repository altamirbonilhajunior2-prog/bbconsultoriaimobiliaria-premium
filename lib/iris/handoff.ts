import type {
  IrisConversationProfile,
} from "./conversation";

type HandoffMessage = {
  author: string;
  text: string;
  createdAt: Date;
};

type BuildIrisHandoffParams = {
  clientName: string | null;
  clientPhone: string | null;

  propertyCode: string;
  propertyTitle: string;

  profile:
    IrisConversationProfile;

  messages:
    HandoffMessage[];
};

function labelAuthor(
  author: string,
) {
  if (author === "CLIENTE") {
    return "Cliente";
  }

  if (author === "IRIS") {
    return "?ris";
  }

  if (author === "CORRETOR") {
    return "Corretor";
  }

  return "Sistema";
}

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

function detectVisitOrProposal(
  messages: HandoffMessage[],
) {
  const clientText =
    messages
      .filter(
        (message) =>
          message.author ===
          "CLIENTE",
      )
      .map(
        (message) =>
          message.text,
      )
      .join(" ")
      .toLowerCase();

  const visit =
    /visita|visitar|conhecer o im[o?]vel|agendar|agenda/.test(
      clientText,
    );

  const proposal =
    /proposta|oferta|negociar|negocia[c?][a?]o|contraproposta/.test(
      clientText,
    );

  if (
    visit &&
    proposal
  ) {
    return "Cliente mencionou interesse em visita e proposta/negocia??o.";
  }

  if (visit) {
    return "Cliente mencionou interesse em visita/agendamento.";
  }

  if (proposal) {
    return "Cliente mencionou interesse em proposta/negocia??o.";
  }

  return "Nenhum pedido expl?cito de visita ou proposta foi identificado.";
}

function detectObjections(
  messages: HandoffMessage[],
) {
  const clientText =
    messages
      .filter(
        (message) =>
          message.author ===
          "CLIENTE",
      )
      .map(
        (message) =>
          message.text,
      )
      .join(" ")
      .toLowerCase();

  const hasObjection =
    /caro|pre[c?]o|valor alto|acima|financi|entrada|condom[i?]nio|iptu|prazo|problema|d[u?]vida|receio|mas |por[e?]m/.test(
      clientText,
    );

  return hasObjection
    ? "H? poss?veis obje??es ou d?vidas no hist?rico completo abaixo; revisar antes do contato."
    : "Nenhuma obje??o expl?cita foi identificada automaticamente.";
}

export function buildIrisHandoffMessage({
  clientName,
  clientPhone,
  propertyCode,
  propertyTitle,
  profile,
  messages,
}: BuildIrisHandoffParams) {
  const transcript =
    messages
      .map(
        (message) =>
          `[${formatDate(
            message.createdAt,
          )}] ${labelAuthor(
            message.author,
          )}: ${message.text}`,
      )
      .join("\n");

  const qualifiedData = [
    profile.purpose
      ? `Finalidade: ${profile.purpose}`
      : null,

    profile.propertyType
      ? `Tipo: ${profile.propertyType}`
      : null,

    profile.region
      ? `Regi?o: ${profile.region}`
      : null,

    profile.value
      ? `Faixa de valor: ${profile.value}`
      : null,

    profile.bedrooms
      ? `Dormit?rios: ${profile.bedrooms}`
      : null,

    profile.objective
      ? `Objetivo: ${profile.objective}`
      : null,

    profile.timeline
      ? `Prazo: ${profile.timeline}`
      : null,

    profile.details
      ? `Detalhes: ${profile.details}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "B&B ?RIS ? ATENDIMENTO QUALIFICADO",
    "",
    "RESUMO EXECUTIVO",
    `Cliente: ${clientName || "N?o informado"}`,
    `WhatsApp: ${clientPhone || "N?o informado"}`,
    `Im?vel: ${propertyCode} ? ${propertyTitle}`,
    "",
    "Objetivo do contato:",
    profile.objective ||
      profile.purpose ||
      "Interesse no im?vel informado.",
    "",
    "Informa??es qualificadas:",
    qualifiedData ||
      "Consultar hist?rico completo.",
    "",
    "Interesse demonstrado:",
    `Cliente iniciou atendimento relacionado ao im?vel ${propertyCode}.`,
    "",
    "Eventuais obje??es:",
    detectObjections(
      messages,
    ),
    "",
    "Visita / proposta:",
    detectVisitOrProposal(
      messages,
    ),
    "",
    "Pr?ximo passo recomendado:",
    "O captador do im?vel deve assumir o atendimento e dar continuidade ao cliente.",
    "",
    "HIST?RICO COMPLETO DA CONVERSA",
    "--------------------------------",
    transcript ||
      "Nenhuma mensagem registrada.",
  ].join("\n");
}
