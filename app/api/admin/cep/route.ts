import { NextResponse } from "next/server";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  estado?: string;
  regiao?: string;
  ibge?: string;
  erro?: boolean | "true";
};

type AddressResult = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  ibge: string;
};

function normalizeResult(
  data: ViaCepResponse,
): AddressResult {
  return {
    cep:
      data.cep ?? "",

    street:
      data.logradouro ?? "",

    neighborhood:
      data.bairro ?? "",

    city:
      data.localidade ?? "",

    state:
      data.uf ?? "",

    complement:
      data.complemento ?? "",

    ibge:
      data.ibge ?? "",
  };
}

async function fetchViaCep(
  url: string,
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      5000,
    );

  try {
    return await fetch(
      url,
      {
        signal:
          controller.signal,

        cache:
          "no-store",

        headers: {
          Accept:
            "application/json",
        },
      },
    );
  } finally {
    clearTimeout(
      timeout,
    );
  }
}

export async function GET(
  request: Request,
) {
  const { searchParams } =
    new URL(request.url);

  const rawCep =
    searchParams.get("cep") ??
    "";

  const rawState =
    searchParams.get("state") ??
    "";

  const rawCity =
    searchParams.get("city") ??
    "";

  const rawStreet =
    searchParams.get("street") ??
    "";

  const cep =
    rawCep.replace(
      /\D/g,
      "",
    );

  /*
   * Fluxo 1:
   * CEP -> endereço
   */
  if (rawCep) {
    if (
      cep.length !== 8
    ) {
      return NextResponse.json(
        {
          found: false,
          error:
            "Informe um CEP válido com 8 dígitos.",
        },
        {
          status: 400,
        },
      );
    }

    try {
      const response =
        await fetchViaCep(
          `https://viacep.com.br/ws/${cep}/json/`,
        );

      if (
        !response.ok
      ) {
        return NextResponse.json(
          {
            found: false,
            error:
              "Não foi possível consultar o CEP agora.",
          },
          {
            status: 502,
          },
        );
      }

      const data =
        (await response.json()) as ViaCepResponse;

      if (
        data.erro === true ||
        data.erro === "true"
      ) {
        return NextResponse.json(
          {
            found: false,
            error:
              "CEP não encontrado.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        found: true,
        ...normalizeResult(
          data,
        ),
      });
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error,
      );

      return NextResponse.json(
        {
          found: false,
          error:
            "Não foi possível consultar o CEP agora.",
        },
        {
          status: 500,
        },
      );
    }
  }

  /*
   * Fluxo 2:
   * Estado + cidade + rua -> CEP
   */
  const state =
    rawState
      .trim()
      .toUpperCase();

  const city =
    rawCity.trim();

  const street =
    rawStreet.trim();

  if (
    state.length !== 2
  ) {
    return NextResponse.json(
      {
        found: false,
        error:
          "Informe a UF com 2 caracteres.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    city.length < 3
  ) {
    return NextResponse.json(
      {
        found: false,
        error:
          "Informe pelo menos 3 caracteres da cidade.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    street.length < 3
  ) {
    return NextResponse.json(
      {
        found: false,
        error:
          "Informe pelo menos 3 caracteres da rua.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const encodedState =
      encodeURIComponent(
        state,
      );

    const encodedCity =
      encodeURIComponent(
        city,
      );

    const encodedStreet =
      encodeURIComponent(
        street,
      );

    const response =
      await fetchViaCep(
        `https://viacep.com.br/ws/${encodedState}/${encodedCity}/${encodedStreet}/json/`,
      );

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          found: false,
          error:
            "Não foi possível pesquisar o endereço agora.",
        },
        {
          status: 502,
        },
      );
    }

    const data =
      (await response.json()) as ViaCepResponse[];

    const results =
      Array.isArray(data)
        ? data
            .filter(
              (item) =>
                Boolean(
                  item.cep,
                ),
            )
            .map(
              normalizeResult,
            )
        : [];

    if (
      results.length === 0
    ) {
      return NextResponse.json(
        {
          found: false,
          error:
            "Nenhum CEP encontrado para este endereço.",
          results: [],
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      found: true,
      count:
        results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Erro ao pesquisar CEP por endereço:",
      error,
    );

    return NextResponse.json(
      {
        found: false,
        error:
          "Não foi possível pesquisar o endereço agora.",
      },
      {
        status: 500,
      },
    );
  }
}