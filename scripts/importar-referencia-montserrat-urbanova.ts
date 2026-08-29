import "dotenv/config";

import { prisma } from "../lib/prisma";

const evidences = [
  {
    source: "Imovelweb",
    sourceUrl:
      "https://www.imovelweb.com.br/propriedades/sobrado-de-alto-padrao-no-montserrat-urbanova-4-3034977232.html",
    area: 584,
    bedrooms: 4,
    price: 5_900_000,
  },
  {
    source: "Chaves na Mão",
    sourceUrl:
      "https://www.chavesnamao.com.br/imovel/casa-em-condominio-a-venda-4-quartos-com-garagem-sp-sao-jose-dos-campos-urbanova-600m2-RS5750000/id-38814741/",
    area: 584,
    bedrooms: 4,
    price: 5_750_000,
  },
  {
    source: "Chaves na Mão",
    sourceUrl:
      "https://www.chavesnamao.com.br/imovel/casa-em-condominio-a-venda-4-quartos-com-garagem-sp-sao-jose-dos-campos-condominio-residencial-montserrat-521m2-RS5549000/id-41619834/",
    area: 535,
    bedrooms: 4,
    price: 5_549_000,
  },
  {
    source: "Chaves na Mão",
    sourceUrl:
      "https://www.chavesnamao.com.br/casas-em-condominio-com-piscina/sp-sao-jose-dos-campos/condominio-residencial-montserrat/",
    area: 512,
    bedrooms: 4,
    price: 5_500_000,
  },
  {
    source: "Arbo Imóveis",
    sourceUrl:
      "https://www.arboimoveis.com.br/imovel/casa/venda/sao-jose-dos-campos/sp/condominio-residencial-montserrat/CA2896_FREI",
    area: 410,
    bedrooms: 4,
    price: 5_000_000,
  },
  {
    source: "Chaves na Mão",
    sourceUrl:
      "https://www.chavesnamao.com.br/imovel/casa-em-condominio-para-alugar-4-quartos-com-garagem-sp-sao-jose-dos-campos-urbanova-450m2-RS14700/id-44304177/",
    area: 400,
    bedrooms: 4,
    price: 4_500_000,
  },
] as const;

async function main() {
  const existing = await prisma.marketReference.findFirst({
    where: {
      state: "SP",
      city: "São José dos Campos",
      neighborhood: {
        in: ["Urbanova", "Montserrat - Urbanova"],
      },
      purpose: "VENDA",
      propertyType: "CASA",
      bedrooms: 4,
      areaMin: 400,
      areaMax: 600,
    },
    select: { id: true },
  });

  const data = {
    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Urbanova",
    purpose: "VENDA" as const,
    propertyType: "CASA" as const,
    bedrooms: 4,
    areaMin: 400,
    areaMax: 600,
    pricePerSquareMeterMin: 9_800,
    pricePerSquareMeterMax: 12_200,
    sampleSize: evidences.length,
    active: true,
    calculatedAt: new Date(),
    notes:
      "Casas de alto padrão com 4 dormitórios no Residencial Montserrat, entre 400 m² e 584 m² de área construída. Faixa arredondada a partir de seis ofertas públicas comparáveis.",
  };

  await prisma.$transaction(async (tx) => {
    const reference = existing
      ? await tx.marketReference.update({ where: { id: existing.id }, data })
      : await tx.marketReference.create({ data });

    await tx.marketEvidence.deleteMany({
      where: { marketReferenceId: reference.id },
    });
    await tx.marketEvidence.createMany({
      data: evidences.map((evidence) => ({
        marketReferenceId: reference.id,
        source: evidence.source,
        sourceUrl: evidence.sourceUrl,
        propertyType: "CASA",
        purpose: "VENDA",
        area: evidence.area,
        bedrooms: evidence.bedrooms,
        price: evidence.price,
        pricePerSquareMeter: evidence.price / evidence.area,
        development: "Residencial Montserrat",
        notes:
          "Oferta pública de casa no mesmo condomínio usada como comparável.",
      })),
    });
  });

  console.log(
    "Referência do Montserrat - Urbanova importada com 6 comparáveis.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
