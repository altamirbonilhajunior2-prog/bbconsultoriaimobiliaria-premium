import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";
import EditPropertyForm from "./EditPropertyForm";
import ImageManager from "./ImageManager";
import PublicationControl from "./PublicationControl";
import DeleteVisitButton from "./DeleteVisitButton";
import { deletePropertyVisit } from "./visit-actions";

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

const visitInterestLabels = {
  ALTO: "Alto",
  MEDIO: "Médio",
  BAIXO: "Baixo",
} as const;

const visitReturnLabels = {
  PROPOSTA: "Proposta",
  NOVA_VISITA: "Nova visita",
  SEM_INTERESSE: "Sem interesse",
} as const;

function decimalToString(
  value: { toString(): string } | null,
) {
  return value === null
    ? null
    : value.toString();
}

function formatVisitDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeZone: "America/Sao_Paulo",
    },
  ).format(value);
}

function formatCreatedAt(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    },
  ).format(value);
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

        visits: {
          orderBy: [
            {
              visitDate:
                "desc",
            },
            {
              createdAt:
                "desc",
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

        isAiGenerated:
          image.isAiGenerated,
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
            Edite os dados administrativos e comerciais do imóvel.
            As alterações serão gravadas diretamente no banco de dados.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/visita`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-amber-500/40 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
            >
              Nova ficha de visita
            </Link>

            <Link
              href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/imovel`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-white/15 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-300"
            >
              Imprimir ficha do imóvel
            </Link>
          </div>

          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm leading-6 text-amber-200">
              Salvar alterações não publica o imóvel automaticamente.
              A publicação e o gerenciamento das imagens continuam
              protegidos em controles separados.
            </p>
          </div>
        </div>

        <section className="mt-10 border border-white/10 bg-white/[0.03] p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                CRM
              </p>

              <h2 className="mt-2 font-serif text-3xl font-normal">
                Histórico de visitas
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {property.visits.length === 0
                  ? "Nenhuma visita registrada para este imóvel."
                  : `${property.visits.length} ${
                      property.visits.length === 1
                        ? "visita registrada"
                        : "visitas registradas"
                    }.`}
              </p>
            </div>

            <Link
              href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/visita`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
            >
              Registrar nova visita
            </Link>
          </div>

          {property.visits.length > 0 ? (
            <div className="mt-6 space-y-4">
              {property.visits.map(
                (visit) => {
                  const deleteAction =
                    deletePropertyVisit.bind(
                      null,
                      property.code,
                      visit.id,
                    );

                  return (
                    <article
                      key={visit.id}
                      className="border border-white/10 bg-black/30 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {visit.visitorName}
                            </h3>

                            {visit.interest ? (
                              <span className="border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300">
                                Interesse{" "}
                                {
                                  visitInterestLabels[
                                    visit.interest
                                  ]
                                }
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Data da visita
                              </p>

                              <p className="mt-1">
                                {formatVisitDate(
                                  visit.visitDate,
                                )}

                                {visit.visitTime
                                  ? ` • ${visit.visitTime}`
                                  : ""}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Telefone
                              </p>

                              <p className="mt-1">
                                {visit.visitorPhone ??
                                  "Não informado"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Retorno
                              </p>

                              <p className="mt-1">
                                {visit.returnType
                                  ? visitReturnLabels[
                                      visit.returnType
                                    ]
                                  : "Não informado"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Registro criado
                              </p>

                              <p className="mt-1">
                                {formatCreatedAt(
                                  visit.createdAt,
                                )}
                              </p>
                            </div>
                          </div>

                          {visit.visitorDocument ||
                          visit.visitorEmail ||
                          visit.visitorAddress ||
                          visit.companions ? (
                            <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-sm text-zinc-400 sm:grid-cols-2">
                              {visit.visitorDocument ? (
                                <div>
                                  <span className="font-semibold text-zinc-300">
                                    CPF/RG:
                                  </span>{" "}
                                  {visit.visitorDocument}
                                </div>
                              ) : null}

                              {visit.visitorEmail ? (
                                <div>
                                  <span className="font-semibold text-zinc-300">
                                    E-mail:
                                  </span>{" "}
                                  {visit.visitorEmail}
                                </div>
                              ) : null}

                              {visit.visitorAddress ? (
                                <div>
                                  <span className="font-semibold text-zinc-300">
                                    Endereço:
                                  </span>{" "}
                                  {visit.visitorAddress}
                                </div>
                              ) : null}

                              {visit.companions ? (
                                <div>
                                  <span className="font-semibold text-zinc-300">
                                    Acompanhantes:
                                  </span>{" "}
                                  {visit.companions}
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {visit.notes ? (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Observações
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {visit.notes}
                              </p>
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                            <span
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                visit.visitorSignature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              Visitante:{" "}
                              {visit.visitorSignature
                                ? "assinado"
                                : "sem assinatura"}
                            </span>

                            <span
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                visit.responsibleSignature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              Responsável:{" "}
                              {visit.responsibleSignature
                                ? "assinado"
                                : "sem assinatura"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                          <Link
                            href={`/admin/imoveis/${property.code.toLowerCase()}/visitas/${visit.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center justify-center border border-amber-500/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
                          >
                            Abrir visita
                          </Link>

                          {access.isAdmin ? (
                            <DeleteVisitButton
                              onDelete={
                                deleteAction
                              }
                            />
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-6 border border-dashed border-white/15 px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">
                O histórico aparecerá aqui assim que a primeira
                ficha de visita for salva.
              </p>
            </div>
          )}
        </section>

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