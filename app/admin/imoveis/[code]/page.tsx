import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../../lib/prisma";
import { getAccessContext } from "../../../../lib/admin/access";
import EditPropertyForm from "./EditPropertyForm";
import ImageManager from "./ImageManager";
import PublicationControl from "./PublicationControl";
import DeleteVisitButton from "./DeleteVisitButton";
import DeleteProposalButton from "./DeleteProposalButton";
import DeletePropertyButton from "./DeletePropertyButton";
import { deletePropertyVisit } from "./visit-actions";
import {
  deletePropertyProposal,
  deletePropertyRentalProposal,
  finalizePropertyRental,
  finalizePropertySale,
  updatePropertyProposalCommercialStage,
  updatePropertyRentalProposalCommercialStage,
} from "./proposal-actions";

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

const proposalStatusLabels = {
  EM_ANALISE: "Em análise",
  CONTRAPROPOSTA: "Contraproposta",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
} as const;

const rentalGuaranteeLabels = {
  CAUCAO: "Caução",
  FIADOR: "Fiador",
  SEGURO_FIANCA: "Seguro-fiança",
  TITULO_CAPITALIZACAO: "Título de capitalização",
  OUTRA: "Outra",
} as const;

function decimalToString(
  value: { toString(): string } | null,
) {
  return value === null
    ? null
    : value.toString();
}

function formatCurrency(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return "Não informado";
  }

  const numericValue = Number(
    value.toString(),
  );

  if (!Number.isFinite(numericValue)) {
    return "Não informado";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(numericValue);
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

function formatOptionalDate(
  value: Date | null,
) {
  if (!value) {
    return "Não informada";
  }

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

  const propertyAccess = await prisma.property.findUnique({
    where: {
      code: code.toUpperCase(),
    },
    select: {
      id: true,
      ownerId: true,
      captorId: true,
      coCaptorId: true,
    },
  });

  if (!propertyAccess) {
    notFound();
  }

  const canManageProperty =
    access.isAdmin ||
    (access.agentId !== null &&
      (propertyAccess.captorId === access.agentId ||
        propertyAccess.coCaptorId === access.agentId));

  const owners = canManageProperty
    ? await prisma.owner.findMany({
        where: access.isAdmin
          ? {}
          : {
              OR: [
                { capturedById: access.agentId ?? -1 },
                { id: propertyAccess.ownerId ?? -1 },
              ],
            },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          cpf: true,
        },
      })
    : [];

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
          where: canManageProperty
            ? undefined
            : { id: -1 },
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

        proposals: {
          where:
            access.isAdmin || canManageProperty
              ? undefined
              : { agentId: access.agentId ?? -1 },
          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            agent: {
              select: {
                id: true,
                name: true,
                creci: true,
              },
            },
          },
        },

        rentalProposals: {
          where:
            access.isAdmin || canManageProperty
              ? undefined
              : { agentId: access.agentId ?? -1 },
          orderBy: {
            createdAt: "desc",
          },

          include: {
            agent: {
              select: {
                id: true,
                name: true,
                creci: true,
              },
            },
          },
        },
      },
    });

  if (!property) {
    notFound();
  }

  const captorName =
    agents.find((agent) => agent.id === property.captorId)?.name ??
    "Não informado";
  const coCaptorName = property.coCaptorId
    ? agents.find((agent) => agent.id === property.coCaptorId)?.name ??
      "Não informado"
    : null;

  const allowsSale =
    property.purpose === "VENDA" ||
    property.purpose === "VENDA_E_LOCACAO";

  const allowsRental =
    property.purpose === "LOCACAO" ||
    property.purpose === "VENDA_E_LOCACAO";

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
            {canManageProperty ? "Editar imóvel" : "Consultar imóvel"}
          </h1>

          <p className="mt-3 text-sm font-semibold text-amber-400">
            {property.code}
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
            {canManageProperty
              ? "Edite os dados administrativos e comerciais do imóvel. As alterações serão gravadas diretamente no banco de dados."
              : "Consulta comercial do imóvel. Dados do proprietário e informações internas da captação permanecem restritos ao captador responsável, co-captador e administradores."}
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

            {allowsSale ? (
              <Link
                href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/proposta`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
              >
                Nova proposta de compra
              </Link>
            ) : null}

            {allowsRental ? (
              <Link
                href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/proposta-locacao`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
              >
                Nova proposta de locação
              </Link>
            ) : null}

            {canManageProperty ? (
              <Link
                href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/imovel`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center border border-white/15 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-300"
              >
                Imprimir ficha do imóvel
              </Link>
            ) : null}
          </div>

          {canManageProperty ? (
            <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-sm leading-6 text-amber-200">
                Salvar alterações não publica o imóvel automaticamente.
                A publicação e o gerenciamento das imagens continuam
                protegidos em controles separados.
              </p>
            </div>
          ) : null}
        </div>

        {access.isAdmin ? (
          <div className="mt-6">
            <DeletePropertyButton
              code={property.code}
            />
          </div>
        ) : null}

        {!canManageProperty ? (
          <section className="mt-10 border border-white/10 bg-white/[0.03] p-6 lg:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Consulta comercial
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal">
              {property.title}
            </h2>
            <div className="mt-6 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Finalidade</p><p className="mt-1">{purposeLabels[property.purpose]}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Tipo</p><p className="mt-1">{propertyTypeLabels[property.propertyType]}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Situação</p><p className="mt-1">{statusLabels[property.status]}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Bairro</p><p className="mt-1">{property.neighborhood}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Empreendimento</p><p className="mt-1">{property.development ?? "Não informado"}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Venda</p><p className="mt-1">{formatCurrency(property.price)}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Locação</p><p className="mt-1">{formatCurrency(property.rentalPrice)}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Área</p><p className="mt-1">{property.area ? `${property.area.toString()} m²` : "Não informada"}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Dormitórios</p><p className="mt-1">{property.bedrooms}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Suítes</p><p className="mt-1">{property.suites}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Vagas</p><p className="mt-1">{property.parking}</p></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Captador responsável</p><p className="mt-1">{captorName}</p></div>
              {coCaptorName ? (
                <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Co-captador</p><p className="mt-1">{coCaptorName}</p></div>
              ) : null}
            </div>
            {property.description ? (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Descrição comercial</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{property.description}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {canManageProperty ? (
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
                            href={
                              visit.status === "AGENDADA"
                                ? `/admin/imoveis/${property.code.toLowerCase()}/fichas/visita?visitId=${visit.id}`
                                : `/admin/imoveis/${property.code.toLowerCase()}/visitas/${visit.id}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center justify-center border border-amber-500/40 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
                          >
                            {visit.status === "AGENDADA"
                              ? "Realizar visita"
                              : "Abrir visita"}
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
        ) : null}

        {allowsSale || property.proposals.length > 0 ? (
        <section className="mt-10 border border-white/10 bg-white/[0.03] p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                CRM
              </p>

              <h2 className="mt-2 font-serif text-3xl font-normal">
                Histórico de propostas de compra
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {property.proposals.length === 0
                  ? "Nenhuma proposta registrada para este imóvel."
                  : `${property.proposals.length} ${
                      property.proposals.length === 1
                        ? "proposta registrada"
                        : "propostas registradas"
                    }.`}
              </p>
            </div>

            {allowsSale ? (
              <Link
                href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/proposta`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
              >
                Registrar proposta de compra
              </Link>
            ) : null}
          </div>

          {property.proposals.length > 0 ? (
            <div className="mt-6 space-y-4">
              {property.proposals.map(
                (proposal) => {
                  const deleteProposalAction =
                    deletePropertyProposal.bind(
                      null,
                      property.code,
                      proposal.id,
                    );

                  const updateCommercialStageAction =
                    updatePropertyProposalCommercialStage.bind(
                      null,
                      property.code,
                      proposal.id,
                    );

                  const finalizeSaleAction =
                    finalizePropertySale.bind(
                      null,
                      property.code,
                      proposal.id,
                    );

                  const canManageProposal =
                    access.isAdmin ||
                    proposal.agentId ===
                      access.agentId;

                  const resourceLabels = [
                    proposal.usesOwnResources
                      ? "Recursos próprios"
                      : null,

                    proposal.usesFinancing
                      ? "Financiamento"
                      : null,

                    proposal.usesFgts
                      ? "FGTS"
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                  return (
                    <article
                      key={proposal.id}
                      className="border border-white/10 bg-black/30 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {proposal.proposerName}
                            </h3>

                            <span
                              className={`border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                proposal.status ===
                                "ACEITA"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : proposal.status ===
                                      "RECUSADA" ||
                                    proposal.status ===
                                      "CANCELADA"
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              }`}
                            >
                              {
                                proposalStatusLabels[
                                  proposal.status
                                ]
                              }
                            </span>
                          </div>

                          <div className="mt-4 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Valor oferecido
                              </p>

                              <p className="mt-1 font-semibold text-white">
                                {formatCurrency(
                                  proposal.offeredValue,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Sinal / entrada
                              </p>

                              <p className="mt-1">
                                {formatCurrency(
                                  proposal.downPaymentValue,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Validade
                              </p>

                              <p className="mt-1">
                                {formatOptionalDate(
                                  proposal.validUntil,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Registro criado
                              </p>

                              <p className="mt-1">
                                {formatCreatedAt(
                                  proposal.createdAt,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-sm text-zinc-400 sm:grid-cols-2">
                            <div>
                              <span className="font-semibold text-zinc-300">
                                CPF:
                              </span>{" "}
                              {proposal.proposerDocument ??
                                "Não informado"}
                            </div>

                            <div>
                              <span className="font-semibold text-zinc-300">
                                Telefone:
                              </span>{" "}
                              {proposal.proposerPhone ??
                                "Não informado"}
                            </div>

                            <div>
                              <span className="font-semibold text-zinc-300">
                                E-mail:
                              </span>{" "}
                              {proposal.proposerEmail ??
                                "Não informado"}
                            </div>

                            <div>
                              <span className="font-semibold text-zinc-300">
                                Corretor:
                              </span>{" "}
                              {proposal.agent ? (
                                <>
                                  {proposal.agent.name}

                                  {proposal.agent.creci
                                    ? ` • CRECI ${proposal.agent.creci}`
                                    : ""}
                                </>
                              ) : (
                                "Não informado"
                              )}
                            </div>
                          </div>

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Origem dos recursos
                            </p>

                            <p className="mt-2 text-sm text-zinc-300">
                              {resourceLabels ||
                                "Não informada"}
                            </p>
                          </div>

                          {proposal.paymentTerms ? (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Condições de pagamento
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {proposal.paymentTerms}
                              </p>
                            </div>
                          ) : null}

                          {proposal.deadline ? (
                            <div className="mt-4">
                              <span className="font-semibold text-zinc-300">
                                Prazo:
                              </span>{" "}
                              <span className="text-sm text-zinc-400">
                                {proposal.deadline}
                              </span>
                            </div>
                          ) : null}

                          {proposal.specialConditions ? (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Condições especiais
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {
                                  proposal.specialConditions
                                }
                              </p>
                            </div>
                          ) : null}

                          {proposal.notes ? (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Observações
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {proposal.notes}
                              </p>
                            </div>
                          ) : null}

                          {proposal.counterOfferValue ||
                          proposal.counterOfferTerms ||
                          proposal.counterOfferNotes ? (
                            <div className="mt-5 border border-amber-500/20 bg-amber-500/5 p-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300">
                                Contraproposta do proprietário
                              </p>

                              {proposal.counterOfferValue ? (
                                <p className="mt-3 text-sm text-zinc-300">
                                  <span className="font-semibold">
                                    Valor:
                                  </span>{" "}
                                  {formatCurrency(
                                    proposal.counterOfferValue,
                                  )}
                                </p>
                              ) : null}

                              {proposal.counterOfferTerms ? (
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                  {
                                    proposal.counterOfferTerms
                                  }
                                </p>
                              ) : null}

                              {proposal.counterOfferNotes ? (
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                                  {
                                    proposal.counterOfferNotes
                                  }
                                </p>
                              ) : null}
                            </div>
                          ) : null}

                          {canManageProposal ? (
                            <form
                              action={
                                updateCommercialStageAction
                              }
                              className="mt-5 border border-amber-500/20 bg-amber-500/[0.04] p-4"
                            >
                              <div className="flex flex-col gap-2">
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
                                  Andamento da negociação
                                </p>

                                <p className="text-xs leading-5 text-zinc-500">
                                  Atualize esta mesma proposta sem criar um novo registro.
                                  Cada etapa será registrada automaticamente na linha do
                                  tempo comercial do cliente vinculado.
                                </p>
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <label className="block">
                                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Nova etapa
                                  </span>

                                  <select
                                    name="commercialStage"
                                    required
                                    defaultValue=""
                                    className="min-h-11 w-full border border-white/15 bg-[#111] px-3 text-sm text-white outline-none focus:border-amber-500"
                                  >
                                    <option value="" disabled>
                                      Selecione a etapa
                                    </option>
                                    <option value="CONTRAPROPOSTA">
                                      Contraproposta
                                    </option>
                                    <option value="NEGOCIACAO">
                                      Negociação em andamento
                                    </option>
                                    <option value="ACEITA">
                                      Proposta aceita
                                    </option>
                                    <option value="DOCUMENTACAO">
                                      Documentação
                                    </option>
                                    <option value="CONCLUIDO">
                                      Negócio concluído
                                    </option>
                                    <option value="PERDIDO">
                                      Perdido / encerrado
                                    </option>
                                  </select>
                                </label>

                                <label className="block">
                                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Valor da contraproposta
                                  </span>

                                  <input
                                    name="counterOfferValue"
                                    inputMode="decimal"
                                    placeholder="Ex.: 3.100.000,00"
                                    defaultValue={
                                      proposal.counterOfferValue
                                        ? proposal.counterOfferValue.toString()
                                        : ""
                                    }
                                    className="min-h-11 w-full border border-white/15 bg-[#111] px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                                  />
                                </label>
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <label className="block">
                                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Condições da contraproposta
                                  </span>

                                  <textarea
                                    name="counterOfferTerms"
                                    rows={3}
                                    defaultValue={
                                      proposal.counterOfferTerms ??
                                      ""
                                    }
                                    placeholder="Condições definidas pelo proprietário."
                                    className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                                  />
                                </label>

                                <label className="block">
                                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                    Observações da contraproposta
                                  </span>

                                  <textarea
                                    name="counterOfferNotes"
                                    rows={3}
                                    defaultValue={
                                      proposal.counterOfferNotes ??
                                      ""
                                    }
                                    placeholder="Observações complementares."
                                    className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                                  />
                                </label>
                              </div>

                              <label className="mt-4 block">
                                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                  Observação da etapa
                                </span>

                                <textarea
                                  name="negotiationNotes"
                                  rows={3}
                                  placeholder="Ex.: Cliente analisando documentos, aguardando retorno do proprietário, motivo do encerramento etc."
                                  className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-500"
                                />
                              </label>

                              <div className="mt-4 border border-white/10 bg-black/20 px-4 py-3">
                                <p className="text-xs leading-5 text-zinc-500">
                                  Atenção: “Proposta aceita” não conclui o negócio.
                                  “Negócio concluído” registra o fechamento na linha do tempo
                                  comercial, mas não altera automaticamente a situação do
                                  imóvel nem o status do cliente.
                                </p>
                              </div>

                              <button
                                type="submit"
                                className="mt-4 inline-flex min-h-11 items-center justify-center bg-amber-500 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
                              >
                                Registrar etapa comercial
                              </button>
                            </form>
                          ) : null}

                          {access.isAdmin &&
                          proposal.status === "ACEITA" ? (
                            property.status === "VENDIDO" ? (
                              <div className="mt-5 border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                                  Venda finalizada
                                </p>

                                <p className="mt-2 text-xs leading-5 text-zinc-400">
                                  O imóvel está marcado como vendido. O cliente vinculado
                                  foi convertido no fechamento administrativo.
                                </p>
                              </div>
                            ) : (
                              <form
                                action={finalizeSaleAction}
                                className="mt-5 border border-emerald-500/25 bg-emerald-500/[0.05] p-4"
                              >
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                                  Fechamento administrativo
                                </p>

                                <p className="mt-2 text-xs leading-5 text-zinc-400">
                                  Use somente depois de registrar “Negócio concluído”.
                                  Esta ação marca o imóvel como vendido e o cliente como
                                  convertido.
                                </p>

                                <button
                                  type="submit"
                                  className="mt-4 inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
                                >
                                  Finalizar venda
                                </button>
                              </form>
                            )
                          ) : null}

                          <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                            <span
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                proposal.proposerSignature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              Proponente:{" "}
                              {proposal.proposerSignature
                                ? "assinado"
                                : "sem assinatura"}
                            </span>

                            <span
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                proposal.ownerSignature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              Proprietário:{" "}
                              {proposal.ownerSignature
                                ? "assinado"
                                : "sem assinatura"}
                            </span>

                            <span
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                proposal.agentSignature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              Corretor:{" "}
                              {proposal.agentSignature
                                ? "assinado"
                                : "sem assinatura"}
                            </span>
                          </div>
                        </div>

                        {access.isAdmin ? (
                          <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                            <DeleteProposalButton
                              onDelete={
                                deleteProposalAction
                              }
                            />
                          </div>
                        ) : null}
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
                proposta for salva.
              </p>
            </div>
          )}
        </section>
        ) : null}

        {allowsRental || property.rentalProposals.length > 0 ? (
        <section className="mt-10 border border-emerald-500/20 bg-emerald-500/[0.04] p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                CRM
              </p>

              <h2 className="mt-2 font-serif text-3xl font-normal">
                Histórico de propostas de locação
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {property.rentalProposals.length === 0
                  ? "Nenhuma proposta de locação registrada para este imóvel."
                  : `${property.rentalProposals.length} ${
                      property.rentalProposals.length === 1
                        ? "proposta de locação registrada"
                        : "propostas de locação registradas"
                    }.`}
              </p>
            </div>

            {allowsRental ? (
              <Link
                href={`/admin/imoveis/${property.code.toLowerCase()}/fichas/proposta-locacao`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
              >
                Registrar proposta de locação
              </Link>
            ) : null}
          </div>

          {property.rentalProposals.length > 0 ? (
            <div className="mt-6 space-y-4">
              {property.rentalProposals.map((proposal) => {
                const deleteRentalProposalAction =
                  deletePropertyRentalProposal.bind(
                    null,
                    property.code,
                    proposal.id,
                  );

                const updateRentalCommercialStageAction =
                  updatePropertyRentalProposalCommercialStage.bind(
                    null,
                    property.code,
                    proposal.id,
                  );

                const finalizeRentalAction =
                  finalizePropertyRental.bind(
                    null,
                    property.code,
                    proposal.id,
                  );

                const canManageRentalProposal =
                  access.isAdmin ||
                  proposal.agentId ===
                    access.agentId;

                return (
                  <article
                    key={proposal.id}
                    className="border border-emerald-500/15 bg-black/30 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">
                            {proposal.tenantName}
                          </h3>

                          <span
                            className={`border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              proposal.status === "ACEITA"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : proposal.status === "RECUSADA" ||
                                    proposal.status === "CANCELADA"
                                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {proposalStatusLabels[proposal.status]}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Aluguel proposto
                            </p>
                            <p className="mt-1 font-semibold text-white">
                              {formatCurrency(proposal.offeredRentValue)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Garantia
                            </p>
                            <p className="mt-1">
                              {proposal.guaranteeType
                                ? rentalGuaranteeLabels[
                                    proposal.guaranteeType
                                  ]
                                : "A definir"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Início pretendido
                            </p>
                            <p className="mt-1">
                              {formatOptionalDate(
                                proposal.desiredStartDate,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Registro criado
                            </p>
                            <p className="mt-1">
                              {formatCreatedAt(proposal.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-sm text-zinc-400 sm:grid-cols-2">
                          <div>
                            <span className="font-semibold text-zinc-300">
                              CPF/CNPJ:
                            </span>{" "}
                            {proposal.tenantDocument ?? "Não informado"}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              Telefone:
                            </span>{" "}
                            {proposal.tenantPhone ?? "Não informado"}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              E-mail:
                            </span>{" "}
                            {proposal.tenantEmail ?? "Não informado"}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              Corretor:
                            </span>{" "}
                            {proposal.agent ? (
                              <>
                                {proposal.agent.name}
                                {proposal.agent.creci
                                  ? ` • CRECI ${proposal.agent.creci}`
                                  : ""}
                              </>
                            ) : (
                              "Não informado"
                            )}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <span className="font-semibold text-zinc-300">
                              Condomínio:
                            </span>{" "}
                            {formatCurrency(proposal.condominiumValue)}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              IPTU:
                            </span>{" "}
                            {formatCurrency(proposal.iptuValue)}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              Caução/garantia:
                            </span>{" "}
                            {formatCurrency(
                              proposal.securityDepositValue,
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-300">
                              Prazo:
                            </span>{" "}
                            {proposal.leaseTermMonths
                              ? `${proposal.leaseTermMonths} meses`
                              : "Não informado"}
                          </div>
                        </div>

                        {proposal.guaranteeDetails ? (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Detalhes da garantia
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {proposal.guaranteeDetails}
                            </p>
                          </div>
                        ) : null}

                        {proposal.specialConditions ? (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Condições especiais
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {proposal.specialConditions}
                            </p>
                          </div>
                        ) : null}

                        {proposal.notes ? (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                              Observações
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {proposal.notes}
                            </p>
                          </div>
                        ) : null}

                        {proposal.counterOfferRent ||
                        proposal.counterOfferTerms ||
                        proposal.counterOfferNotes ? (
                          <div className="mt-5 border border-amber-500/20 bg-amber-500/5 p-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300">
                              Contraproposta do proprietário
                            </p>
                            {proposal.counterOfferRent ? (
                              <p className="mt-3 text-sm text-zinc-300">
                                <span className="font-semibold">
                                  Aluguel:
                                </span>{" "}
                                {formatCurrency(
                                  proposal.counterOfferRent,
                                )}
                              </p>
                            ) : null}
                            {proposal.counterOfferTerms ? (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {proposal.counterOfferTerms}
                              </p>
                            ) : null}
                            {proposal.counterOfferNotes ? (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                                {proposal.counterOfferNotes}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        {canManageRentalProposal ? (
                          <form
                            action={updateRentalCommercialStageAction}
                            className="mt-5 border border-emerald-500/20 bg-emerald-500/[0.04] p-4"
                          >
                            <div className="flex flex-col gap-2">
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                                Andamento da locação
                              </p>

                              <p className="text-xs leading-5 text-zinc-500">
                                Atualize esta mesma proposta sem criar um novo registro.
                                Cada etapa será registrada automaticamente na linha do
                                tempo comercial do cliente vinculado.
                              </p>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                              <label className="block">
                                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                  Nova etapa
                                </span>

                                <select
                                  name="commercialStage"
                                  required
                                  defaultValue=""
                                  className="min-h-11 w-full border border-white/15 bg-[#111] px-3 text-sm text-white outline-none focus:border-emerald-500"
                                >
                                  <option value="" disabled>
                                    Selecione a etapa
                                  </option>
                                  <option value="CONTRAPROPOSTA">
                                    Contraproposta
                                  </option>
                                  <option value="NEGOCIACAO">
                                    Negociação em andamento
                                  </option>
                                  <option value="ACEITA">
                                    Proposta aceita
                                  </option>
                                  <option value="DOCUMENTACAO">
                                    Documentação
                                  </option>
                                  <option value="CONCLUIDO">
                                    Locação concluída
                                  </option>
                                  <option value="PERDIDO">
                                    Perdido / encerrado
                                  </option>
                                </select>
                              </label>

                              <label className="block">
                                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                  Aluguel da contraproposta
                                </span>

                                <input
                                  name="counterOfferRent"
                                  inputMode="decimal"
                                  placeholder="Ex.: 8.500,00"
                                  defaultValue={
                                    proposal.counterOfferRent
                                      ? proposal.counterOfferRent.toString()
                                      : ""
                                  }
                                  className="min-h-11 w-full border border-white/15 bg-[#111] px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500"
                                />
                              </label>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                              <label className="block">
                                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                  Condições da contraproposta
                                </span>

                                <textarea
                                  name="counterOfferTerms"
                                  rows={3}
                                  defaultValue={
                                    proposal.counterOfferTerms ??
                                    ""
                                  }
                                  placeholder="Condições definidas pelo proprietário."
                                  className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                  Observações da contraproposta
                                </span>

                                <textarea
                                  name="counterOfferNotes"
                                  rows={3}
                                  defaultValue={
                                    proposal.counterOfferNotes ??
                                    ""
                                  }
                                  placeholder="Observações complementares."
                                  className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500"
                                />
                              </label>
                            </div>

                            <label className="mt-4 block">
                              <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                                Observação da etapa
                              </span>

                              <textarea
                                name="negotiationNotes"
                                rows={3}
                                placeholder="Ex.: Análise cadastral, garantia em aprovação, contrato em elaboração, motivo do encerramento etc."
                                className="w-full resize-y border border-white/15 bg-[#111] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500"
                              />
                            </label>

                            <div className="mt-4 border border-white/10 bg-black/20 px-4 py-3">
                              <p className="text-xs leading-5 text-zinc-500">
                                Atenção: “Proposta aceita” não conclui a locação.
                                “Locação concluída” registra o fechamento na linha do tempo
                                comercial, mas não altera automaticamente a situação do
                                imóvel nem o status do cliente.
                              </p>
                            </div>

                            <button
                              type="submit"
                              className="mt-4 inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
                            >
                              Registrar etapa da locação
                            </button>
                          </form>
                        ) : null}

                        {access.isAdmin &&
                        proposal.status === "ACEITA" ? (
                          property.status === "ALUGADO" ? (
                            <div className="mt-5 border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                                Locação finalizada
                              </p>

                              <p className="mt-2 text-xs leading-5 text-zinc-400">
                                O imóvel está marcado como alugado. O cliente vinculado
                                foi convertido no fechamento administrativo.
                              </p>
                            </div>
                          ) : (
                            <form
                              action={finalizeRentalAction}
                              className="mt-5 border border-emerald-500/25 bg-emerald-500/[0.05] p-4"
                            >
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                                Fechamento administrativo da locação
                              </p>

                              <p className="mt-2 text-xs leading-5 text-zinc-400">
                                Use somente depois de registrar “Locação concluída”.
                                Esta ação marca o imóvel como alugado e o cliente como
                                convertido.
                              </p>

                              <button
                                type="submit"
                                className="mt-4 inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
                              >
                                Finalizar locação
                              </button>
                            </form>
                          )
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                          {[
                            ["Pretendente", proposal.tenantSignature],
                            ["Proprietário", proposal.ownerSignature],
                            ["Corretor", proposal.agentSignature],
                          ].map(([label, signature]) => (
                            <span
                              key={label}
                              className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] ${
                                signature
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-white/10 text-zinc-500"
                              }`}
                            >
                              {label}: {signature ? "assinado" : "sem assinatura"}
                            </span>
                          ))}
                        </div>
                      </div>

                      {access.isAdmin ? (
                        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                          <DeleteProposalButton
                            onDelete={deleteRentalProposalAction}
                          />
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 border border-dashed border-white/15 px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">
                O histórico aparecerá aqui assim que a primeira proposta de locação for salva.
              </p>
            </div>
          )}
        </section>
        ) : null}

        {canManageProperty ? (
          <>
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
            </>
        ) : null}
      </div>
    </main>
  );
}
