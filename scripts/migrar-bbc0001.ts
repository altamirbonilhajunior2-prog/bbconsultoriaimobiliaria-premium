import "dotenv/config";
import { prisma } from "../lib/prisma";

const gallery = [
  "/imoveis/bbc0001/01-fachada-principal.jpg",
  "/imoveis/bbc0001/02-fachada-noturna.jpg",
  "/imoveis/bbc0001/03-garagem.jpg",
  "/imoveis/bbc0001/04-living.jpg",
  "/imoveis/bbc0001/05-living-segundo-angulo.jpg",
  "/imoveis/bbc0001/06-escada-pe-direito.jpg",
  "/imoveis/bbc0001/07-cozinha.jpg",
  "/imoveis/bbc0001/08-lavanderia.jpg",
  "/imoveis/bbc0001/09-espaco-gourmet.jpg",
  "/imoveis/bbc0001/10-piscina.jpg",
  "/imoveis/bbc0001/11-area-externa.jpg",
  "/imoveis/bbc0001/12-fachada-fundos.jpg",
  "/imoveis/bbc0001/13-suite-master.jpg",
  "/imoveis/bbc0001/14-closet.jpg",
  "/imoveis/bbc0001/15-banheiro-master.jpg",
  "/imoveis/bbc0001/16-suite-02.jpg",
  "/imoveis/bbc0001/17-banheiro-suite-02.jpg",
  "/imoveis/bbc0001/18-suite-03.jpg",
  "/imoveis/bbc0001/19-banheiro-suite-03.jpg",
  "/imoveis/bbc0001/20-suite-04.jpg",
  "/imoveis/bbc0001/21-lavabo.jpg",
  "/imoveis/bbc0001/22-fachada-vista-geral.jpg",
];

const features = [
  "Living amplo com pé-direito elevado",
  "4 suítes",
  "Cozinha planejada",
  "Espaço gourmet integrado",
  "Piscina",
  "Lavabo",
  "Área de serviço",
  "Ambientes integrados",
  "Iluminação natural",
  "4 vagas de garagem",
  "Condomínio fechado",
  "Segurança 24 horas",
];

async function main() {
  const existingProperty =
    await prisma.property.findUnique({
      where: {
        code: "BBC0001",
      },
      select: {
        id: true,
        code: true,
      },
    });

  if (existingProperty) {
    console.log(
      `MIGRACAO CANCELADA: o imóvel ${existingProperty.code} já existe no banco.`,
    );

    return;
  }

  const property =
    await prisma.$transaction(
      async (transaction) => {
        return transaction.property.create({
          data: {
            code: "BBC0001",

            title:
              "Casa contemporânea no Alphaville II",

            slug:
              "bbc0001-casa-contemporanea-no-alphaville-ii",

            purpose: "VENDA",

            opportunityProfiles: [
              "MORADIA",
              "VALORIZACAO",
            ],

            propertyType: "CASA",

            category: "Sobrado",

            status: "DISPONIVEL",

            highlight: true,

            published: false,

            consultantScore: 9.5,

            tag: "Exclusivo",

            state: "SP",

            city:
              "São José dos Campos",

            neighborhood: "Urbanova",

            development:
              "Alphaville II",

            location:
              "Urbanova • São José dos Campos/SP",

            price: 3300000,

            condominium: 940,

            iptu: 2800,

            area: 310,

            landArea: 479,

            bedrooms: 4,

            suites: 4,

            bathrooms: 5,

            parking: 4,

            description:
              "Casa contemporânea de alto padrão localizada no Condomínio Alphaville II, no Urbanova, uma das regiões mais valorizadas de São José dos Campos.",

            features,

            images: {
              create: gallery.map(
                (url, index) => ({
                  url,

                  alt:
                    index === 0
                      ? "Fachada principal da Casa contemporânea no Alphaville II"
                      : `Foto ${index + 1} da Casa contemporânea no Alphaville II`,

                  position: index,

                  isCover: index === 0,
                }),
              ),
            },
          },

          select: {
            id: true,
            code: true,
            title: true,

            images: {
              select: {
                id: true,
              },
            },
          },
        });
      },
    );

  console.log(
    "MIGRACAO PREPARADA COM SUCESSO:",
  );

  console.log({
    id: property.id,
    code: property.code,
    title: property.title,
    imagens:
      property.images.length,
  });
}

main()
  .catch((error) => {
    console.error(
      "ERRO NA MIGRACAO DO BBC0001:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });