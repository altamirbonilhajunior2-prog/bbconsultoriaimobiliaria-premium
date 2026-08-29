import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";
import EditPropertyForm from "./EditPropertyForm";
import ImageManager from "./ImageManager";
import PublicationControl from "./PublicationControl";

export const dynamic = "force-dynamic";

type EditarImovelPageProps = {
  params: Promise<{
    code: string;
  }>;
};

const purposeLabels = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_E_LOCACAO: "Venda e locação",
} as const;

const propertyTypeLabels = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
} as const;

const statusLabels = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  EM_ANALISE: "Em análise",
} as const;

const opportunityProfileLabels = {
  MORADIA: "Moradia",
  INVESTIMENTO: "Investimento",
  RENDA: "Renda",
  VALORIZACAO: "Valorização",
  LANCAMENTO: "Lançamento",
} as const;

function decimalToString(
  value: { toString(): string } | null,
) {
  return value === null
    ? null
    : value.toString();
}

export default async function EditarImovelPage({
  params,
}: EditarImovelPageProps) {
  const { code } = await params;

  const access =
    await getAccessContext();

  const owners =
    await prisma.owner.findMany({
      where: access.isAdmin
        ? {}
        : {
            capturedById:
              access.agentId ?? -1,
          },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        cpf: true,
      },
    });

  const agents =
    await prisma.agent.findMany({
      where: {
        active: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        role: true,
      },
    });

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          code.toUpperCase(),
      },

      include: {
        images: {
          orderBy: [
            {
              position:
                "asc",
            },
            {
              id:
                "asc",
            },
          ],
        },
      },
    });

  if (!property) {
    notFound();
  }

  const images =
    property.images.map(
      (image) => ({
        id:
          image.id,

        url:
          image.url,

        alt:
          image.alt,

        position:
          image.position,

        isCover:
          image.isCover,
      }),
    );

  const editableProperty = {
    code:
      property.code,

    title:
      property.title,

    purpose:
      purposeLabels[
        property.purpose
      ],

    opportunityProfiles:
      property.opportunityProfiles.map(
        (profile) =>
          opportunityProfileLabels[
            profile
          ],
      ),

    propertyType:
      propertyTypeLabels[
        property.propertyType
      ],

    category:
      property.category,

    status:
      statusLabels[
        property.status
      ],

    highlight:
      property.highlight,

    internalNotes:
      property.internalNotes,

    tag:
      property.tag,

    state:
      property.state,

    city:
      property.city,

    ownerId:
      property.ownerId,

    captorId:
      property.captorId,

    coCaptorId:
      property.coCaptorId,

    neighborhood:
      property.neighborhood,

    development:
      property.development,

    location:
      property.location,

    address:
      property.address,

    zipCode:
      property.zipCode,

    latitude:
      decimalToString(
        property.latitude,
      ),

    longitude:
      decimalToString(
        property.longitude,
      ),

    googleMapsUrl:
      property.googleMapsUrl,
    mapEnabled:
      property.mapEnabled,
    mapRadiusMeters:
      property.mapRadiusMeters,

    price:
      decimalToString(
        property.price,
      ),

    rentalPrice:
      decimalToString(
        property.rentalPrice,
      ),

    condominium:
      decimalToString(
        property.condominium,
      ),

    iptu:
      decimalToString(
        property.iptu,
      ),

    area:
      decimalToString(
        property.area,
      ),

    landArea:
      decimalToString(
        property.landArea,
      ),

    bedrooms:
      property.bedrooms,

    suites:
      property.suites,

    bathrooms:
      property.bathrooms,

    parking:
      property.parking,

    description:
      property.description,

    features:
      property.features,

    video:
      property.video,

    virtualTour:
      property.virtualTour,

    brochure:
      property.brochure,

    seoTitle:
      property.seoTitle,

    seoDescription:
      property.seoDescription,

    seoImage:
      property.seoImage,

    published:
      property.published,

    images,
  };

  const publishedAt =
    property.publishedAt
      ? property.publishedAt.toISOString()
      : null;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <div className="border-b border-white/10 pb-8">
          <Link
            href="/admin/imoveis"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
          >
            ← Voltar para imóveis
          </Link>

          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Administração
          </p>

          <h1 className="mt-3 font-serif text-5xl font-normal">
            Editar imóvel
          </h1>

          <p className="mt-3 text-sm font-semibold text-amber-400">
            {property.code}
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
            Edite os dados
            administrativos e
            comerciais do imóvel. As
            alterações serão gravadas
            diretamente no banco de
            dados.
          </p>

          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm leading-6 text-amber-200">
              Salvar alterações não
              publica o imóvel
              automaticamente. A
              publicação e o
              gerenciamento das imagens
              continuam protegidos em
              controles separados.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <EditPropertyForm
            property={
              editableProperty
            }
            owners={
              owners
            }
            agents={
              agents
            }
            isAdmin={
              access.isAdmin
            }
            agentId={
              access.agentId ??
              null
            }
          />
        </div>

        <div className="mt-10">
          <PublicationControl
            code={
              property.code
            }
            published={
              property.published
            }
            publishedAt={
              publishedAt
            }
          />
        </div>

        <div className="mt-10">
          <ImageManager
            code={
              property.code
            }
            images={
              images
            }
          />
        </div>
      </div>
    </main>
  );
}
