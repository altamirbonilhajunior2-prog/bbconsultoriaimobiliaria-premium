import type {
  IrisInterpretedSearch,
} from "./interpret";

export type IrisConversationProfile = {
  purpose: string;
  propertyType: string;
  region: string;
  value: string;
  bedrooms: string;
  objective: string;
  details: string;
  timeline: string;
  finalDetailsAsked: boolean;
};

export type IrisConversationDecision = {
  readyForHandoff: boolean;
  nextQuestion: string | null;
  profile: IrisConversationProfile;
};

function normalizeValue(
  value: unknown,
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeBoolean(
  value: unknown,
) {
  return value === true;
}

export function mergeIrisProfile(
  currentProfile: unknown,
  interpreted: IrisInterpretedSearch,
): IrisConversationProfile {
  const current =
    currentProfile &&
    typeof currentProfile === "object"
      ? currentProfile as Partial<IrisConversationProfile>
      : {};

  return {
    purpose:
      normalizeValue(
        interpreted.purpose,
      ) ||
      normalizeValue(
        current.purpose,
      ),

    propertyType:
      normalizeValue(
        interpreted.propertyType,
      ) ||
      normalizeValue(
        current.propertyType,
      ),

    region:
      normalizeValue(
        interpreted.region,
      ) ||
      normalizeValue(
        current.region,
      ),

    value:
      normalizeValue(
        interpreted.value,
      ) ||
      normalizeValue(
        current.value,
      ),

    bedrooms:
      normalizeValue(
        interpreted.bedrooms,
      ) ||
      normalizeValue(
        current.bedrooms,
      ),

    objective:
      normalizeValue(
        interpreted.objective,
      ) ||
      normalizeValue(
        current.objective,
      ),

    details:
      normalizeValue(
        interpreted.details,
      ) ||
      normalizeValue(
        current.details,
      ),

    timeline:
      normalizeValue(
        interpreted.timeline,
      ) ||
      normalizeValue(
        current.timeline,
      ),

    finalDetailsAsked:
      normalizeBoolean(
        current.finalDetailsAsked,
      ),
  };
}

export function decideNextIrisQuestion(
  profile: IrisConversationProfile,
): IrisConversationDecision {
  if (!profile.purpose) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        "Você procura comprar, alugar ou está avaliando um imóvel para investimento?",
    };
  }

  if (!profile.propertyType) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        "Que tipo de imóvel você procura: casa, apartamento, terreno, comercial ou rural?",
    };
  }

  if (!profile.region) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        "Em qual bairro, condomínio, cidade ou região você gostaria de procurar?",
    };
  }

  if (!profile.value) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        profile.purpose === "Locação"
          ? "Qual faixa de valor de aluguel mensal você pretende considerar?"
          : "Qual faixa de valor você pretende considerar?",
    };
  }

  const shouldAskBedrooms =
    profile.propertyType === "Casa" ||
    profile.propertyType === "Apartamento";

  if (
    shouldAskBedrooms &&
    !profile.bedrooms
  ) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        "Quantos dormitórios você procura?",
    };
  }

  if (!profile.objective) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        "Qual é o principal objetivo dessa busca: moradia, investimento, renda ou valorização patrimonial?",
    };
  }

  if (!profile.timeline) {
    return {
      readyForHandoff: false,
      profile,
      nextQuestion:
        profile.purpose === "Locação"
          ? "Em quanto tempo você pretende se mudar?"
          : "Em quanto tempo você pretende realizar a compra?",
    };
  }

  if (!profile.finalDetailsAsked) {
    return {
      readyForHandoff: false,

      profile: {
        ...profile,
        finalDetailsAsked: true,
      },

      nextQuestion:
        "Antes de eu encaminhar seu atendimento para um de nossos consultores, tem mais algum detalhe que você considera importante me contar?",
    };
  }

  return {
    readyForHandoff: true,
    profile,
    nextQuestion: null,
  };
}