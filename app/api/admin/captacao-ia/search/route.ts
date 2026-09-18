import { NextResponse } from "next/server";
import OpenAI from "openai";

import { auth } from "../../../../../auth";

type CaptacaoSearchRequest = {
  query?: string;

  purpose?: string;
  propertyType?: string;

  state?: string;
  city?: string;
  neighborhood?: string;
  development?: string;

  maxPrice?: number | string | null;
  minPrice?: number | string | null;

  minBedrooms?: number | string | null;
  minSuites?: number | string | null;
  minParking?: number | string | null;

  details?: string;
};

type SearchOpportunity = {
  title: string;

  sourceName: string;
  sourceType: string;
  sourceUrl: string;

  city: string;
  neighborhood: string;
  development: string;

  purpose: string;
  propertyType: string;

  price: number | null;
  priceText: string;

  bedrooms: number | null;
  suites: number | null;
  parking: number | null;
  area: number | null;

  compatibility: number;
  compatibilityReason: string;

  notes: string;
};

function textValue(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function numberValue(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const raw = String(value)
    .replace(/[^\d,.-]/g, "")
    .trim();

  if (!raw) {
    return null;
  }

  let normalized = raw;

  if (normalized.includes(",")) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function integerValue(value: unknown) {
  const parsed = numberValue(value);

  if (parsed === null) {
    return null;
  }

  return Math.max(
    0,
    Math.trunc(parsed),
  );
}

function formatMoney(value: number | null) {
  if (value === null) {
    return "";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function buildProfileText(
  body: CaptacaoSearchRequest,
) {
  const query =
    textValue(body.query);

  if (query) {
    return query;
  }

  const purpose =
    textValue(body.purpose);

  const propertyType =
    textValue(body.propertyType);

  const state =
    textValue(body.state) || "SP";

  const city =
    textValue(body.city) ||
    "São José dos Campos";

  const neighborhood =
    textValue(body.neighborhood);

  const development =
    textValue(body.development);

  const minPrice =
    numberValue(body.minPrice);

  const maxPrice =
    numberValue(body.maxPrice);

  const minBedrooms =
    integerValue(body.minBedrooms);

  const minSuites =
    integerValue(body.minSuites);

  const minParking =
    integerValue(body.minParking);

  const details =
    textValue(body.details);

  const lines: string[] = [];

  if (purpose) {
    lines.push(
      `Finalidade: ${purpose}`,
    );
  }

  if (propertyType) {
    lines.push(
      `Tipo de imóvel: ${propertyType}`,
    );
  }

  lines.push(
    `Cidade: ${city}`,
  );

  lines.push(
    `Estado: ${state}`,
  );

  if (neighborhood) {
    lines.push(
      `Bairro/região: ${neighborhood}`,
    );
  }

  if (development) {
    lines.push(
      `Condomínio/empreendimento: ${development}`,
    );
  }

  if (
    minPrice !== null &&
    maxPrice !== null
  ) {
    lines.push(
      `Faixa de valor: ${formatMoney(
        minPrice,
      )} até ${formatMoney(
        maxPrice,
      )}`,
    );
  } else if (
    maxPrice !== null
  ) {
    lines.push(
      `Valor máximo: ${formatMoney(
        maxPrice,
      )}`,
    );
  } else if (
    minPrice !== null
  ) {
    lines.push(
      `Valor mínimo: ${formatMoney(
        minPrice,
      )}`,
    );
  }

  if (minBedrooms !== null) {
    lines.push(
      `Dormitórios mínimos: ${minBedrooms}`,
    );
  }

  if (minSuites !== null) {
    lines.push(
      `Suítes mínimas: ${minSuites}`,
    );
  }

  if (minParking !== null) {
    lines.push(
      `Vagas mínimas: ${minParking}`,
    );
  }

  if (details) {
    lines.push(
      `Observações: ${details}`,
    );
  }

  return lines.join("\n");
}

function normalizeDomain(
  url: string,
) {
  try {
    const hostname =
      new URL(url).hostname
        .toLowerCase()
        .replace(/^www\./, "");

    if (
      hostname.includes("olx.")
    ) {
      return "OLX";
    }

    if (
      hostname.includes(
        "zapimoveis",
      )
    ) {
      return "ZAP Imóveis";
    }

    if (
      hostname.includes(
        "vivareal",
      )
    ) {
      return "Viva Real";
    }

    if (
      hostname.includes(
        "imovelweb",
      )
    ) {
      return "Imovelweb";
    }

    return hostname;
  } catch {
    return "";
  }
}

export async function POST(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sessão expirada. Faça login novamente.",
        },
        {
          status: 401,
        },
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OPENAI_API_KEY não está configurada.",
        },
        {
          status: 503,
        },
      );
    }

    const body =
      (await request.json()) as CaptacaoSearchRequest;

    const profile =
      buildProfileText(body);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Informe o perfil do imóvel que deseja localizar.",
        },
        {
          status: 400,
        },
      );
    }

    const openai =
      new OpenAI({
        apiKey,
      });

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",

        max_output_tokens: 12_000,

        tools: [
          {
            type: "web_search",

            search_context_size:
              "medium",

            user_location: {
              type: "approximate",

              country: "BR",

              region: "SP",

              city:
                textValue(
                  body.city,
                ) ||
                "São José dos Campos",
            },
          },
        ],

        input: [
          {
            role: "system",

            content: [
              "Você é o motor de pesquisa externa do módulo Captação IA da B&B Consultoria Imobiliária.",
              "",
              "Sua única função é localizar oportunidades de imóveis anunciados PUBLICAMENTE fora da carteira da B&B.",
              "",
              "IMPORTANTE:",
              "- NÃO pesquise nem recomende imóveis do site bbconsultoriaimoveis.com.br.",
              "- NÃO invente anúncios, preços, características, imobiliárias ou URLs.",
              "- Cada oportunidade precisa ter um link público real encontrado na web.",
              "- Priorize anúncios ativos e páginas específicas do imóvel.",
              "- Pesquise múltiplas fontes antes de concluir a busca.",
              "- Não limite a busca a grandes portais.",
              "- Não limite a busca às primeiras fontes encontradas.",
              "- Procure também sites próprios de imobiliárias, corretores, parceiros e portais regionais.",
              "- Não copie fotos.",
              "- Não faça contato com anunciante.",
              "- Não tente captar automaticamente.",
              "- Apenas encontre e classifique oportunidades para que um captador humano da B&B abra o link e faça a abordagem.",
              "",
              "ESTRATÉGIA DE PESQUISA:",
              "- Faça uma pesquisa ampla na web para o perfil solicitado.",
              "- Quando a cidade for São José dos Campos ou região, pesquise explicitamente imobiliárias locais relevantes.",
              "- Entre as fontes locais prioritárias, procure resultados da I9 Vale.",
              "- Procure resultados da Pirâmide Imóveis.",
              "- Procure resultados da Riccio Imóveis.",
              "- Procure resultados da Nova Freitas.",
              "- Procure também outras imobiliárias relevantes de São José dos Campos encontradas durante a pesquisa.",
              "- A lista de imobiliárias locais não é fechada: descubra e utilize outras fontes confiáveis quando possuírem imóveis compatíveis.",
              "- Pesquise também OLX.",
              "- Pesquise também ZAP Imóveis.",
              "- Pesquise também Viva Real.",
              "- Pesquise também Imovelweb.",
              "- Considere outros portais imobiliários relevantes quando houver resultados compatíveis.",
              "- Use pesquisas direcionadas por domínio quando isso ajudar a encontrar anúncios específicos.",
              "- Pesquisas direcionadas podem ser equivalentes a consultas do tipo site:dominio perfil-do-imovel.",
              "- Combine localização, bairro, condomínio, tipo, finalidade, dormitórios e faixa de preço nas consultas quando essas informações estiverem disponíveis.",
              "- Não force resultados de uma fonte que não tenha anúncios compatíveis.",
              "- Busque diversidade de fontes para evitar que todos os resultados venham do mesmo portal ou da mesma imobiliária.",
              "",
              "SÃO JOSÉ DOS CAMPOS:",
              "- Para pesquisas em São José dos Campos, procure especialmente imóveis anunciados por imobiliárias locais e regionais.",
              "- Considere bairros e regiões como Urbanova, Jardim Aquarius, Jardim das Colinas, Vila Ema, Jardim Esplanada, Jardim das Indústrias, Bosque dos Eucaliptos, Jardim Satélite e outras regiões compatíveis com o perfil solicitado.",
              "- Quando houver condomínio ou empreendimento informado, pesquise pelo nome exato e também por variações razoáveis do nome.",
              "- Quando houver bairro informado, priorize resultados realmente localizados nesse bairro ou em região claramente compatível.",
              "",
              "DUPLICIDADES:",
              "- A mesma propriedade pode aparecer em vários sites.",
              "- Tente identificar quando OLX, ZAP, Viva Real, Imovelweb ou uma imobiliária estiverem anunciando o mesmo imóvel.",
              "- Evite repetir claramente o mesmo imóvel apenas porque apareceu em fontes diferentes.",
              "- Considere semelhanças de preço, área, dormitórios, vagas, condomínio, localização e descrição para reconhecer possíveis duplicidades.",
              "- Quando existirem várias URLs para o mesmo imóvel, prefira a página mais específica, clara e útil para o captador.",
              "- Quando houver dúvida real sobre duplicidade, mantenha o resultado e indique isso em notes.",
              "",
              "QUALIDADE DA FONTE:",
              "- Prefira páginas específicas do imóvel em vez de páginas genéricas de busca.",
              "- Prefira URLs que permitam ao captador conferir diretamente o anúncio.",
              "- Não apresente uma homepage de imobiliária como se fosse um anúncio específico.",
              "- Não utilize páginas sem evidência suficiente de que o imóvel anunciado corresponde ao resultado apresentado.",
              "- Se um anúncio aparentar estar removido, expirado ou indisponível, não o priorize.",
              "",
              "RELEVÂNCIA:",
              "- Localização é um critério muito importante.",
              "- Finalidade precisa ser compatível.",
              "- Tipo de imóvel precisa ser compatível.",
              "- Respeite o limite de preço informado.",
              "- Dormitórios, suítes, vagas, área e condomínio devem ser considerados quando informados.",
              "- Não aumente artificialmente a compatibilidade apenas porque o anúncio pertence a uma fonte prioritária.",
              "- A compatibilidade deve refletir o imóvel encontrado, não a notoriedade do portal ou da imobiliária.",
              "",
              "COMPATIBILIDADE:",
              "- Dê uma nota de 0 a 100.",
              "- 90 a 100 = oportunidade muito forte.",
              "- 75 a 89 = boa oportunidade.",
              "- 60 a 74 = compatibilidade parcial.",
              "- Abaixo de 60 = só inclua se houver poucos resultados melhores.",
              "",
              "RETORNO:",
              "- Retorne no máximo 15 oportunidades.",
              "- Ordene da maior compatibilidade para a menor.",
              "- Procure trazer oportunidades de fontes diferentes sempre que houver opções compatíveis.",
              "- sourceName deve identificar corretamente o portal, imobiliária ou fonte original encontrada.",
              "- sourceType deve indicar de forma objetiva o tipo da fonte, por exemplo portal imobiliário, imobiliária local, imobiliária regional ou anúncio classificado.",
              "- sourceUrl deve apontar para a URL pública real do anúncio.",
              "- price deve ser numérico em reais quando for possível identificar.",
              "- Se um dado não estiver disponível, use null para números e string vazia para textos.",
              "- Seja conciso: compatibilityReason e notes devem ter no máximo 180 caracteres cada.",
            ].join("\n"),
          },

          {
            role: "user",

            content: [
              "Pesquise no mercado imobiliário externo brasileiro oportunidades compatíveis com este perfil:",
              "",
              profile,
              "",
              "Faça uma pesquisa ampla e distribuída entre diferentes fontes.",
              "Inclua web geral, imobiliárias locais e grandes portais imobiliários.",
              "Para São José dos Campos, procure também I9 Vale, Pirâmide Imóveis, Riccio Imóveis, Nova Freitas e outras imobiliárias relevantes da cidade.",
              "Pesquise também OLX, ZAP Imóveis, Viva Real, Imovelweb e outros portais relevantes.",
              "Use buscas direcionadas por domínio quando forem úteis.",
              "Não concentre todos os resultados em uma única fonte se houver alternativas compatíveis.",
              "Retorne apenas oportunidades que possuam URL pública real e verificável.",
            ].join("\n"),
          },
        ],

        text: {
          format: {
            type: "json_schema",

            name:
              "bb_captacao_external_search",

            strict: true,

            schema: {
              type: "object",

              properties: {
                summary: {
                  type: "string",
                },

                totalFound: {
                  type: "integer",
                },

                strongOpportunities: {
                  type: "integer",
                },

                opportunities: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      title: {
                        type: "string",
                      },

                      sourceName: {
                        type: "string",
                      },

                      sourceType: {
                        type: "string",
                      },

                      sourceUrl: {
                        type: "string",
                      },

                      city: {
                        type: "string",
                      },

                      neighborhood: {
                        type: "string",
                      },

                      development: {
                        type: "string",
                      },

                      purpose: {
                        type: "string",
                      },

                      propertyType: {
                        type: "string",
                      },

                      price: {
                        anyOf: [
                          {
                            type: "number",
                          },
                          {
                            type: "null",
                          },
                        ],
                      },

                      priceText: {
                        type: "string",
                      },

                      bedrooms: {
                        anyOf: [
                          {
                            type: "integer",
                          },
                          {
                            type: "null",
                          },
                        ],
                      },

                      suites: {
                        anyOf: [
                          {
                            type: "integer",
                          },
                          {
                            type: "null",
                          },
                        ],
                      },

                      parking: {
                        anyOf: [
                          {
                            type: "integer",
                          },
                          {
                            type: "null",
                          },
                        ],
                      },

                      area: {
                        anyOf: [
                          {
                            type: "number",
                          },
                          {
                            type: "null",
                          },
                        ],
                      },

                      compatibility: {
                        type: "integer",

                        minimum: 0,

                        maximum: 100,
                      },

                      compatibilityReason: {
                        type: "string",
                      },

                      notes: {
                        type: "string",
                      },
                    },

                    required: [
                      "title",
                      "sourceName",
                      "sourceType",
                      "sourceUrl",
                      "city",
                      "neighborhood",
                      "development",
                      "purpose",
                      "propertyType",
                      "price",
                      "priceText",
                      "bedrooms",
                      "suites",
                      "parking",
                      "area",
                      "compatibility",
                      "compatibilityReason",
                      "notes",
                    ],

                    additionalProperties:
                      false,
                  },
                },
              },

              required: [
                "summary",
                "totalFound",
                "strongOpportunities",
                "opportunities",
              ],

              additionalProperties:
                false,
            },
          },
        },
      });

    if (response.status !== "completed") {
      const reason =
        response.incomplete_details
          ?.reason || response.status;

      throw new Error(
        `A busca externa retornou uma resposta incompleta: ${reason}.`,
      );
    }

    const output =
      response.output_text;

    if (!output) {
      throw new Error(
        "A busca externa não retornou dados.",
      );
    }

    const parsed =
      JSON.parse(output) as {
        summary: string;
        totalFound: number;
        strongOpportunities: number;
        opportunities:
          SearchOpportunity[];
      };

    const opportunities =
      parsed.opportunities
        .filter((item) => {
          if (
            !item.sourceUrl ||
            !/^https?:\/\//i.test(
              item.sourceUrl,
            )
          ) {
            return false;
          }

          try {
            const hostname =
              new URL(
                item.sourceUrl,
              ).hostname.toLowerCase();

            return (
              !hostname.includes(
                "bbconsultoriaimoveis.com.br",
              )
            );
          } catch {
            return false;
          }
        })
        .map((item) => ({
          ...item,

          sourceName:
            item.sourceName ||
            normalizeDomain(
              item.sourceUrl,
            ),
        }))
        .sort(
          (a, b) =>
            b.compatibility -
            a.compatibility,
        )
        .slice(0, 15);

    const strongOpportunities =
      opportunities.filter(
        (item) =>
          item.compatibility >=
          90,
      ).length;

    return NextResponse.json({
      success: true,

      profile,

      summary:
        parsed.summary,

      totalFound:
        opportunities.length,

      strongOpportunities,

      opportunities,
    });
  } catch (error) {
    console.error(
      "Erro na busca externa da Captação IA:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido.";

    return NextResponse.json(
      {
        success: false,

        message:
          "Não foi possível realizar a busca externa agora.",

        technicalMessage:
          process.env.NODE_ENV ===
          "development"
            ? message
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}