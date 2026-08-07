import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const code = "TESTEEDIT";

  const property =
    await prisma.property.findUnique({
      where: {
        code,
      },

      select: {
        id: true,
        code: true,
        title: true,
      },
    });

  if (!property) {
    console.log(
      `Nenhum imóvel com o código ${code} foi encontrado.`,
    );

    return;
  }

  console.log(
    "IMÓVEL LOCALIZADO:",
    property,
  );

  const result =
    await prisma.property.deleteMany({
      where: {
        code,
      },
    });

  console.log(
    `REGISTROS ${code} REMOVIDOS:`,
    result.count,
  );
}

main()
  .catch((error) => {
    console.error(
      "ERRO AO REMOVER TESTEEDIT:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });