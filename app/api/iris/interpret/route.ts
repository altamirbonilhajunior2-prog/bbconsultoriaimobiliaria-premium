import { NextResponse } from "next/server";

type IrisInterpretRequest = {
  message?: string;
};

type Purpose =
  | ""
  | "Compra"
  | "Locação";

type PropertyType =
  | ""
  | "Casa"
  | "Apartamento"
  | "Terreno"
  | "Comercial";

type ValueOption =
  | ""
  | "Até R$ 500 mil"
  | "De R$ 500 mil a R$ 1 milhão"
  | "De R$ 1 milhão a R$ 2 milhões"
  | "De R$ 2 milhões a R$ 3 milhões"
  | "Acima de R$ 3 milhões"
  | "Ainda não defini";

type BedroomOption =
  | ""
  | "1 dormitório"
  | "2 dormitórios"
  | "3 dormitórios"
  | "4 ou mais dormitórios"
  | "Não é relevante";

type Objective =
  | ""
  | "Moradia"
  | "Investimento"
  | "Renda"
  | "Valorização patrimonial"
  | "Outro";

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function includesAny(
  text: string,
  terms: string[],
) {
  return terms.some(
    (term) =>
      text.includes(term),
  );
}

function detectPurpose(
  text: string,
): Purpose {
  if (
    includesAny(
      text,
      [
        "alugar",
        "aluguel",
        "locacao",
        "para locar",
        "quero locar",
      ],
    )
  ) {
    return "Locação";
  }

  if (
    includesAny(
      text,
      [
        "comprar",
        "compra",
        "adquirir",
        "a venda",
        "para venda",
      ],
    )
  ) {
    return "Compra";
  }

  if (
    includesAny(
      text,
      [
        "investimento",
        "investir",
        "renda",
        "valorizacao",
      ],
    )
  ) {
    return "Compra";
  }

  return "";
}

function detectPropertyType(
  text: string,
): PropertyType {
  if (
    includesAny(
      text,
      [
        "apartamento",
        "apto",
      ],
    )
  ) {
    return "Apartamento";
  }

  if (
    includesAny(
      text,
      [
        "casa",
        "sobrado",
        "residencia",
      ],
    )
  ) {
    return "Casa";
  }

  if (
    includesAny(
      text,
      [
        "terreno",
        "lote",
      ],
    )
  ) {
    return "Terreno";
  }

  if (
    includesAny(
      text,
      [
        "comercial",
        "sala comercial",
        "galpao",
        "loja",
      ],
    )
  ) {
    return "Comercial";
  }

  return "";
}

function detectBedrooms(
  text: string,
): BedroomOption {
  if (
    includesAny(
      text,
      [
        "dormitorios nao importam",
        "dormitorio nao importa",
        "quartos nao importam",
        "quarto nao importa",
      ],
    )
  ) {
    return "Não é relevante";
  }

  const match =
    text.match(
      /(\d+)\s*(?:dormitorio|dormitorios|quarto|quartos)/,
    );

  if (!match) {
    return "";
  }

  const quantity =
    Number.parseInt(
      match[1],
      10,
    );

  if (
    !Number.isInteger(
      quantity,
    )
  ) {
    return "";
  }

  if (quantity >= 4) {
    return "4 ou mais dormitórios";
  }

  if (quantity === 3) {
    return "3 dormitórios";
  }

  if (quantity === 2) {
    return "2 dormitórios";
  }

  if (quantity === 1) {
    return "1 dormitório";
  }

  return "";
}

function detectObjective(
  text: string,
): Objective {
  if (
    includesAny(
      text,
      [
        "valorizacao patrimonial",
        "valorizar patrimonio",
        "valorizacao",
      ],
    )
  ) {
    return "Valorização patrimonial";
  }

  if (
    includesAny(
      text,
      [
        "renda",
        "airbnb",
        "renda passiva",
      ],
    )
  ) {
    return "Renda";
  }

  if (
    includesAny(
      text,
      [
        "investimento",
        "investir",
        "investidor",
      ],
    )
  ) {
    return "Investimento";
  }

  if (
    includesAny(
      text,
      [
        "moradia",
        "morar",
        "residir",
        "para minha familia",
        "para a familia",
      ],
    )
  ) {
    return "Moradia";
  }

  return "";
}

function extractBudget(
  text: string,
) {
  const millionMatch =
    text.match(
      /(\d+(?:[.,]\d+)?)\s*(?:milhao|milhoes)/,
    );

  if (millionMatch) {
    const numeric =
      Number(
        millionMatch[1].replace(
          ",",
          ".",
        ),
      );

    if (
      Number.isFinite(numeric)
    ) {
      return (
        numeric *
        1000000
      );
    }
  }

  const thousandMatch =
    text.match(
      /(\d+(?:[.,]\d+)?)\s*mil\b/,
    );

  if (thousandMatch) {
    const numeric =
      Number(
        thousandMatch[1].replace(
          ",",
          ".",
        ),
      );

    if (
      Number.isFinite(numeric)
    ) {
      return (
        numeric *
        1000
      );
    }
  }

  const currencyMatch =
    text.match(
      /r\$\s*([\d.]+)/,
    );

  if (currencyMatch) {
    const numeric =
      Number(
        currencyMatch[1].replace(
          /\./g,
          "",
        ),
      );

    if (
      Number.isFinite(numeric)
    ) {
      return numeric;
    }
  }

  return null;
}

function detectValue(
  text: string,
): ValueOption {
  if (
    includesAny(
      text,
      [
        "ainda nao defini",
        "valor nao definido",
        "sem valor definido",
        "sem orcamento definido",
        "orcamento nao definido",
      ],
    )
  ) {
    return "Ainda não defini";
  }

  const budget =
    extractBudget(text);

  if (budget === null) {
    return "";
  }

  if (
    includesAny(
      text,
      [
        "acima de",
        "mais de",
        "a partir de",
      ],
    ) &&
    budget >= 3000000
  ) {
    return "Acima de R$ 3 milhões";
  }

  if (budget <= 500000) {
    return "Até R$ 500 mil";
  }

  if (budget <= 1000000) {
    return "De R$ 500 mil a R$ 1 milhão";
  }

  if (budget <= 2000000) {
    return "De R$ 1 milhão a R$ 2 milhões";
  }

  if (budget <= 3000000) {
    return "De R$ 2 milhões a R$ 3 milhões";
  }

  return "Acima de R$ 3 milhões";
}

function extractRegion(
  message: string,
) {
  const match =
    message.match(
      /\b(?:no|na|em)\s+([^,.!?]+?)(?=\s+(?:com|ate|até|acima|por|para|que)\b|[,.;!?]|$)/iu,
    );

  if (!match) {
    return "";
  }

  return match[1]
    .replace(
      /^(?:bairro|condom[ií]nio|regi[aã]o|cidade)\s+(?:do|da|de)?\s*/iu,
      "",
    )
    .trim();
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as
        IrisInterpretRequest;

    const message =
      body.message?.trim();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Informe o que você procura.",
        },
        {
          status: 400,
        },
      );
    }

    const normalized =
      normalizeText(
        message,
      );

    const purpose =
      detectPurpose(
        normalized,
      );

    const propertyType =
      detectPropertyType(
        normalized,
      );

    const value =
      detectValue(
        normalized,
      );

    const bedrooms =
      detectBedrooms(
        normalized,
      );

    const objective =
      detectObjective(
        normalized,
      );

    let region =
      extractRegion(
        message,
      );

    if (
      !region &&
      !purpose &&
      !propertyType &&
      !value &&
      !bedrooms &&
      !objective
    ) {
      const words =
        message
          .split(/\s+/)
          .filter(Boolean);

      if (
        words.length <= 5
      ) {
        region =
          message;
      }
    }

    return NextResponse.json({
      success: true,

      interpreted: {
        purpose,
        propertyType,
        region,
        value:
          value ||
          "Ainda não defini",
        bedrooms:
          bedrooms ||
          "Não é relevante",
        objective,
        details:
          message,
      },
    });
  } catch (error) {
    console.error(
      "Erro na interpretação local da Íris:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível interpretar a busca agora.",
      },
      {
        status: 500,
      },
    );
  }
}