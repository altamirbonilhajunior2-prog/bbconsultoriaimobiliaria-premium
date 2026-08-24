import { NextResponse } from "next/server";
import OpenAI from "openai";

type IrisInterpretRequest = {
  message?: string;
};

export async function POST(
  request: Request,
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENAI_API_KEY não está configurada.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "A inteligência da Íris ainda não está disponível.",
        },
        {
          status: 503,
        },
      );
    }

    const openai =
      new OpenAI({
        apiKey,
      });

    const body =
      (await request.json()) as IrisInterpretRequest;

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

    const response =
      await openai.responses.create({
        model:
          "gpt-5.4-nano",

        input: [
          {
            role: "system",
            content:
              [
                "Você interpreta pedidos de busca imobiliária da B&B Consultoria Imobiliária.",
                "Extraia apenas informações explicitamente informadas ou claramente inferíveis do texto.",
                "Não invente dados.",
                "",
                "TIPO DE IMÓVEL:",
                "Use Casa, Apartamento, Terreno, Comercial ou Rural.",
                "Considere Rural quando o cliente mencionar chácara, sítio, sitio, fazenda, área rural, terreno rural ou propriedade de campo.",
                "",
                "Exemplos:",
                "Quero uma chácara em São José dos Campos -> Rural.",
                "Procuro uma fazenda para investimento -> Rural.",
                "Quero um sítio com área verde -> Rural.",
                "Terreno rural para comprar -> Rural.",
                "",
                "Região pode ser bairro, condomínio, cidade ou região.",
                "",
                "Para finalidade use Compra, Locação ou Investimento.",
                "Para objetivo use Moradia, Investimento, Renda ou Valorização patrimonial.",
                "",
                "IMPORTANTE SOBRE VALORES:",
                "",
                "Se a finalidade for Compra ou Investimento, use somente:",
                "Até R$ 500 mil",
                "De R$ 500 mil a R$ 1 milhão",
                "De R$ 1 milhão a R$ 2 milhões",
                "De R$ 2 milhões a R$ 3 milhões",
                "Acima de R$ 3 milhões",
                "Ainda não defini",
                "",
                "Se a finalidade for Locação, interprete como aluguel mensal:",
                "Até R$ 3 mil/mês",
                "De R$ 3 mil a R$ 5 mil/mês",
                "De R$ 5 mil a R$ 8 mil/mês",
                "De R$ 8 mil a R$ 12 mil/mês",
                "Acima de R$ 12 mil/mês",
                "Ainda não defini",
                "",
                "Exemplos:",
                "Quero alugar até 4 mil por mês -> Locação / De R$ 3 mil a R$ 5 mil/mês.",
                "Procuro aluguel de até 7 mil -> Locação / De R$ 5 mil a R$ 8 mil/mês.",
                "Quero uma casa para alugar por 15 mil -> Locação / Acima de R$ 12 mil/mês.",
                "Quero comprar até 900 mil -> Compra / De R$ 500 mil a R$ 1 milhão.",
              ].join("\n"),
          },
          {
            role: "user",
            content:
              message,
          },
        ],

        text: {
          format: {
            type:
              "json_schema",

            name:
              "iris_property_search",

            strict: true,

            schema: {
              type:
                "object",

              properties: {
                purpose: {
                  type:
                    "string",

                  enum: [
                    "",
                    "Compra",
                    "Locação",
                    "Investimento",
                  ],
                },

                propertyType: {
                  type:
                    "string",

                  enum: [
                    "",
                    "Casa",
                    "Apartamento",
                    "Terreno",
                    "Comercial",
                    "Rural",
                  ],
                },

                region: {
                  type:
                    "string",
                },

                value: {
                  type:
                    "string",

                  enum: [
                    "",
                    "Até R$ 500 mil",
                    "De R$ 500 mil a R$ 1 milhão",
                    "De R$ 1 milhão a R$ 2 milhões",
                    "De R$ 2 milhões a R$ 3 milhões",
                    "Acima de R$ 3 milhões",
                    "Até R$ 3 mil/mês",
                    "De R$ 3 mil a R$ 5 mil/mês",
                    "De R$ 5 mil a R$ 8 mil/mês",
                    "De R$ 8 mil a R$ 12 mil/mês",
                    "Acima de R$ 12 mil/mês",
                    "Ainda não defini",
                  ],
                },

                bedrooms: {
                  type:
                    "string",

                  enum: [
                    "",
                    "1 dormitório",
                    "2 dormitórios",
                    "3 dormitórios",
                    "4 ou mais dormitórios",
                    "Não é relevante",
                  ],
                },

                objective: {
                  type:
                    "string",

                  enum: [
                    "",
                    "Moradia",
                    "Investimento",
                    "Renda",
                    "Valorização patrimonial",
                    "Outro",
                  ],
                },

                details: {
                  type:
                    "string",
                },
              },

              required: [
                "purpose",
                "propertyType",
                "region",
                "value",
                "bedrooms",
                "objective",
                "details",
              ],

              additionalProperties:
                false,
            },
          },
        },
      });

    const output =
      response.output_text;

    if (!output) {
      throw new Error(
        "A IA não retornou dados.",
      );
    }

    const interpreted =
      JSON.parse(output);

    return NextResponse.json({
      success: true,
      interpreted,
    });

  } catch (error) {
    console.error(
      "Erro na interpretação da Íris:",
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