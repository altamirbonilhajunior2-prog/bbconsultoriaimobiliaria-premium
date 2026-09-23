import { NextResponse } from "next/server";

import { interpretIrisMessage } from "../../../../lib/iris/interpret";

type IrisInterpretRequest = {
  message?: string;
};

export async function POST(
  request: Request,
) {
  try {
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

    const interpreted =
      await interpretIrisMessage(
        message,
      );

    return NextResponse.json({
      success: true,
      interpreted,
    });
  } catch (error) {
    console.error(
      "Erro na interpretação da Íris:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message.includes(
        "OPENAI_API_KEY",
      )
    ) {
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