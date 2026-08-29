import "dotenv/config";

import { prisma } from "../lib/prisma";

const evidences = [
  { source: "Viva Real", sourceUrl: "https://www.vivareal.com.br/aluguel/sp/sao-jose-dos-campos/bairros/jardim-das-colinas/apartamento_residencial/com-mobiliado/", area: 82, bedrooms: 2, price: 4100 },
  { source: "Viva Real", sourceUrl: "https://www.vivareal.com.br/aluguel/sp/sao-jose-dos-campos/bairros/jardim-das-colinas/apartamento_residencial/com-mobiliado/", area: 82, bedrooms: 2, price: 4200 },
  { source: "Viva Real", sourceUrl: "https://www.vivareal.com.br/aluguel/sp/sao-jose-dos-campos/bairros/jardim-das-colinas/apartamento_residencial/com-mobiliado/", area: 82, bedrooms: 2, price: 4590 },
  { source: "Imovelweb", sourceUrl: "https://www.imovelweb.com.br/propriedades/apartamento-com-2-dormitorios-para-alugar-82-m-por-3031577673.html", area: 82, bedrooms: 2, price: 4980 },
  { source: "Chaves na Mão", sourceUrl: "https://www.chavesnamao.com.br/imovel/apartamento-para-alugar-2-quartos-com-garagem-sp-sao-jose-dos-campos-jardim-das-colinas-84m2-RS5000/id-42009323/", area: 84, bedrooms: 2, price: 5000 },
  { source: "Chaves na Mão", sourceUrl: "https://www.chavesnamao.com.br/imovel/apartamento-para-alugar-2-quartos-com-garagem-sp-sao-jose-dos-campos-jardim-das-colinas-84m2-RS5500/id-41857627/", area: 82.19, bedrooms: 2, price: 5500 },
] as const;

async function main() {
  const existing = await prisma.marketReference.findFirst({
    where: {
      state: "SP",
      city: "São José dos Campos",
      neighborhood: "Jardim das Colinas",
      purpose: "LOCACAO",
      propertyType: "APARTAMENTO",
      bedrooms: 2,
      areaMin: 80,
      areaMax: 85,
    },
    select: { id: true },
  });

  const data = {
    state: "SP",
    city: "São José dos Campos",
    neighborhood: "Jardim das Colinas",
    purpose: "LOCACAO" as const,
    propertyType: "APARTAMENTO" as const,
    bedrooms: 2,
    areaMin: 80,
    areaMax: 85,
    pricePerSquareMeterMin: 50,
    pricePerSquareMeterMax: 67,
    sampleSize: evidences.length,
    active: true,
    calculatedAt: new Date(),
    notes: "Apartamentos mobiliados de 2 dormitórios, entre 82 m² e 84 m².",
  };

  await prisma.$transaction(async (tx) => {
    const reference = existing
      ? await tx.marketReference.update({ where: { id: existing.id }, data })
      : await tx.marketReference.create({ data });

    await tx.marketEvidence.deleteMany({ where: { marketReferenceId: reference.id } });
    await tx.marketEvidence.createMany({
      data: evidences.map((evidence) => ({
        marketReferenceId: reference.id,
        source: evidence.source,
        sourceUrl: evidence.sourceUrl,
        propertyType: "APARTAMENTO",
        purpose: "LOCACAO",
        area: evidence.area,
        bedrooms: evidence.bedrooms,
        price: evidence.price,
        pricePerSquareMeter: evidence.price / evidence.area,
        notes: "Oferta pública de apartamento mobiliado usada como comparável.",
      })),
    });
  });

  console.log("Referência do Jardim das Colinas importada com 6 comparáveis.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
