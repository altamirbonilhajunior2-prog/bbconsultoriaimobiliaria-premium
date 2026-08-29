import "dotenv/config";

import { prisma } from "../lib/prisma";

const evidences = [
  {
    source: "Arbo Imóveis",
    sourceUrl:
      "https://www.arboimoveis.com.br/imovel/apartamento-com-dormitorios-a-venda-m2-por-r-jardim-aquarius-sao-jose-dos-campossp/AP0513_NVCA",
    area: 194,
    bedrooms: 4,
    price: 2_150_000,
  },
  {
    source: "Imovelweb",
    sourceUrl:
      "https://www.imovelweb.com.br/propriedades/apartamento-a-venda-de-194m-04-dormitorios-sendo-3032354972.html",
    area: 194,
    bedrooms: 4,
    price: 2_400_000,
  },
  {
    source: "OEO Imóveis",
    sourceUrl:
      "https://www.oeoimoveis.com.br/imovel/apartamento-sao-jose-dos-campos-4-quartos-194-m/AP2675-OLIZ",
    area: 194,
    bedrooms: 4,
    price: 2_427_400,
  },
  {
    source: "MGF Imóveis",
    sourceUrl:
      "https://sp.mgfimoveis.com.br/ra-amil-vende-apto-aquarius-resort-lindo-apartamento-de-194m-4-quartos-3-310371261",
    area: 194,
    bedrooms: 4,
    price: 2_555_000,
  },
  {
    source: "Vex Imóveis",
    sourceUrl:
      "https://www.veximoveis.com.br/empreendimento/edificio-aquarius-residence-resort/338",
    area: 194,
    bedrooms: 4,
    price: 2_900_000,
  },
  {
    source: "Vex Imóveis",
    sourceUrl:
      "https://www.veximoveis.com.br/empreendimento/edificio-aquarius-residence-resort/338",
    area: 194,
    bedrooms: 4,
    price: 2_980_000,
  },
] as const;

async function main() {
  const existing = await prisma.marketReference.findFirst({
    where: {
      state: "SP",
      city: "São José dos Campos",
      neighborhood: "Jardim Altos do Esplanada",
      purpose: "VENDA",
      propertyType: "APARTAMENTO",
      bedrooms: 4,
      areaMin: 190,
      areaMax: 198,
    },
    select: { id: true },
  });

  const data = {
    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Jardim Altos do Esplanada",
    purpose: "VENDA" as const,
    propertyType: "APARTAMENTO" as const,
    bedrooms: 4,
    areaMin: 190,
    areaMax: 198,
    pricePerSquareMeterMin: 11_100,
    pricePerSquareMeterMax: 15_400,
    sampleSize: evidences.length,
    active: true,
    calculatedAt: new Date(),
    notes:
      "Apartamentos de 4 dormitórios no Aquarius Residence Resort, com 194 m² e três vagas. Faixa arredondada a partir de seis ofertas públicas comparáveis.",
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
        propertyType: "APARTAMENTO",
        purpose: "VENDA",
        area: evidence.area,
        bedrooms: evidence.bedrooms,
        price: evidence.price,
        pricePerSquareMeter: evidence.price / evidence.area,
        development: "Aquarius Residence Resort",
        notes:
          "Oferta pública de apartamento no mesmo empreendimento usada como comparável.",
      })),
    });
  });

  console.log(
    "Referência do Jardim Altos do Esplanada importada com 6 comparáveis.",
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
