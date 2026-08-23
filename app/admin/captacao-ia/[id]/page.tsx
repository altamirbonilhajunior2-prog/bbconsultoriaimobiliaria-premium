import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import AuthorizationRequestPanel from "./AuthorizationRequestPanel";
import AuthorizationResponsePanel from "./AuthorizationResponsePanel";
import { registerContactAction } from "./actions";

const sourceLabels: Record<string, string> = {
  OLX: "OLX",
  ZAP: "ZAP",
  VIVAREAL: "Viva Real",
  IMOVELWEB: "Imovelweb",
  SITE_IMOBILIARIA: "Site de imobiliária",
  OUTRO: "Outro",
};

const originLabels: Record<string, string> = {
  PROPRIETARIO: "Proprietário",
  IMOBILIARIA: "Imobiliária",
  CORRETOR: "Corretor",
  OUTRO: "Outro",
};

const statusLabels: Record<string, string> = {
  ENCONTRADO: "Encontrado",
  SELECIONADO: "Selecionado",
  CONTATADO: "Contatado",
  AGUARDANDO_AUTORIZACAO:
    "Aguardando autorização",
  AUTORIZADO: "Autorizado",
  PUBLICADO: "Publicado",
  DESCARTADO: "Descartado",
  ARQUIVADO: "Arquivado",
};

const authorizationLabels: Record<string, string> = {
  NAO_SOLICITADA: "Não solicitada",
  PENDENTE: "Pendente",
  AUTORIZADA: "Autorizada",
  NEGADA: "Negada",
  REVOGADA: "Revogada",
};

const purposeLabels: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_E_LOCACAO: "Venda e locação",
};

const propertyTypeLabels: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
  OUTRO: "Outro",
};

function formatCurrency(
  value:
    | {
        toString(): string;
      }
    | null,
) {
  if (!value) {
    return "Não informado";
  }

  const parsedValue = Number(value.toString());

  if (!Number.isFinite(parsedValue)) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsedValue);
}

function formatArea(
  value:
    | {
        toString(): string;
      }
    | null,
) {
  if (!value) {
    return "Não informado";
  }

  const parsedValue = Number(value.toString());

  if (!Number.isFinite(parsedValue)) {
    return "Não informado";
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(parsedValue)} m²`;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Não registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function getStatusClass(status: string) {
  switch (status) {
    case "AUTORIZADO":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

    case "PUBLICADO":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";

    case "CONTATADO":
    case "AGUARDANDO_AUTORIZACAO":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "DESCARTADO":
    case "ARQUIVADO":
      return "border-zinc-600 bg-zinc-800 text-zinc-300";

    default:
      return "border-white/10 bg-white/5 text-zinc-200";
  }
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10 pb-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <div className="text-sm leading-6 text-zinc-200">
        {value}
      </div>
    </div>
  );
}

export default async function AcquisitionOpportunityPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = await params;

  const opportunityId = Number.parseInt(
    resolvedParams.id,
    10,
  );

  if (
    !Number.isInteger(opportunityId) ||
    opportunityId <= 0
  ) {
    notFound();
  }

  const opportunity =
    await prisma.acquisitionOpportunity.findUnique({
      where: {
        id: opportunityId,
      },
    });

  if (!opportunity) {
    notFound();
  }

  const locationParts = [
    opportunity.neighborhood,
    opportunity.city,
    opportunity.state,
  ].filter(Boolean);

  const canRegisterContact =
    opportunity.status === "ENCONTRADO" ||
    opportunity.status === "SELECIONADO";

  const contactAlreadyRegistered =
    opportunity.contactedAt !== null;

  const canRequestAuthorization =
    opportunity.status === "CONTATADO" &&
    opportunity.contactedAt !== null &&
    opportunity.authorizationStatus ===
      "NAO_SOLICITADA";

  const authorizationPending =
    opportunity.status ===
      "AGUARDANDO_AUTORIZACAO" ||
    opportunity.authorizationStatus ===
      "PENDENTE";

  const canRegisterResponse =
    opportunity.status ===
      "AGUARDANDO_AUTORIZACAO" &&
    opportunity.authorizationStatus ===
      "PENDENTE";

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/admin/captacao-ia"
              className="mb-5 inline-flex items-center text-sm text-zinc-400 transition hover:text-white"
            >
              ← Voltar para Captação IA
            </Link>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
              Captação IA B&B
            </p>

            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {opportunity.sourceTitle ||
                `Captação #${opportunity.id}`}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                  opportunity.status,
                )}`}
              >
                {statusLabels[opportunity.status] ??
                  opportunity.status}
              </span>

              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                Autorização:{" "}
                {authorizationLabels[
                  opportunity.authorizationStatus
                ] ??
                  opportunity.authorizationStatus}
              </span>

              {opportunity.score !== null && (
                <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  Score B&B: {opportunity.score}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Abrir anúncio original
            </a>

            <form action={registerContactAction}>
              <input
                type="hidden"
                name="opportunityId"
                value={opportunity.id}
              />

              <button
                type="submit"
                disabled={!canRegisterContact}
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold transition sm:w-auto ${
                  canRegisterContact
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-500"
                }`}
              >
                {canRegisterContact
                  ? "Registrar contato"
                  : contactAlreadyRegistered
                    ? "Contato registrado"
                    : "Contato indisponível"}
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  01
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Origem da oportunidade
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                  label="Fonte"
                  value={
                    sourceLabels[opportunity.source] ??
                    opportunity.source
                  }
                />

                <InfoItem
                  label="Origem do contato"
                  value={
                    opportunity.origin
                      ? originLabels[
                          opportunity.origin
                        ] ?? opportunity.origin
                      : "Não informado"
                  }
                />

                <InfoItem
                  label="Link original"
                  value={
                    <a
                      href={opportunity.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-amber-400 hover:text-amber-300"
                    >
                      {opportunity.sourceUrl}
                    </a>
                  }
                />

                <InfoItem
                  label="Encontrado em"
                  value={formatDate(
                    opportunity.firstSeenAt,
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  02
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Imóvel e localização
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                  label="Localização"
                  value={
                    locationParts.length > 0
                      ? locationParts.join(" · ")
                      : "Não informado"
                  }
                />

                <InfoItem
                  label="Condomínio / empreendimento"
                  value={
                    opportunity.development ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Referência de localização"
                  value={
                    opportunity.location ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Finalidade"
                  value={
                    opportunity.purpose
                      ? purposeLabels[
                          opportunity.purpose
                        ] ?? opportunity.purpose
                      : "Não informado"
                  }
                />

                <InfoItem
                  label="Tipo de imóvel"
                  value={
                    opportunity.propertyType
                      ? propertyTypeLabels[
                          opportunity.propertyType
                        ] ??
                        opportunity.propertyType
                      : "Qualquer / não informado"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  03
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Valores e características
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  label="Valor de venda"
                  value={formatCurrency(
                    opportunity.price,
                  )}
                />

                <InfoItem
                  label="Valor de locação"
                  value={formatCurrency(
                    opportunity.rentalPrice,
                  )}
                />

                <InfoItem
                  label="Condomínio"
                  value={formatCurrency(
                    opportunity.condominium,
                  )}
                />

                <InfoItem
                  label="IPTU"
                  value={formatCurrency(
                    opportunity.iptu,
                  )}
                />

                <InfoItem
                  label="Área"
                  value={formatArea(
                    opportunity.area,
                  )}
                />

                <InfoItem
                  label="Área do terreno"
                  value={formatArea(
                    opportunity.landArea,
                  )}
                />

                <InfoItem
                  label="Dormitórios"
                  value={
                    opportunity.bedrooms ??
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Suítes"
                  value={
                    opportunity.suites ??
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Banheiros"
                  value={
                    opportunity.bathrooms ??
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Vagas"
                  value={
                    opportunity.parking ??
                    "Não informado"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  04
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Análise B&B
                </h2>
              </div>

              <div className="space-y-5">
                <InfoItem
                  label="Score B&B"
                  value={
                    opportunity.score !== null
                      ? `${opportunity.score} / 100`
                      : "Não informado"
                  }
                />

                <InfoItem
                  label="Motivo do score"
                  value={
                    opportunity.scoreReason ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Observações internas"
                  value={
                    opportunity.internalNotes ||
                    "Nenhuma observação registrada."
                  }
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  Contato
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Proprietário / parceiro
                </h2>
              </div>

              <div className="space-y-5">
                <InfoItem
                  label="Nome"
                  value={
                    opportunity.contactName ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Telefone"
                  value={
                    opportunity.contactPhone ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="E-mail"
                  value={
                    opportunity.contactEmail ||
                    "Não informado"
                  }
                />

                <InfoItem
                  label="Contato realizado"
                  value={formatDate(
                    opportunity.contactedAt,
                  )}
                />
              </div>
            </section>

            <AuthorizationRequestPanel
              opportunityId={opportunity.id}
              canRequestAuthorization={
                canRequestAuthorization
              }
              authorizationPending={
                authorizationPending
              }
            />

            <AuthorizationResponsePanel
              opportunityId={opportunity.id}
              canRegisterResponse={
                canRegisterResponse
              }
            />

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  Autorização
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Controle de permissões
                </h2>
              </div>

              <div className="space-y-5">
                <InfoItem
                  label="Status"
                  value={
                    authorizationLabels[
                      opportunity.authorizationStatus
                    ] ??
                    opportunity.authorizationStatus
                  }
                />

                <InfoItem
                  label="Solicitada em"
                  value={formatDate(
                    opportunity.authorizationRequestedAt,
                  )}
                />

                <InfoItem
                  label="Autorizada em"
                  value={formatDate(
                    opportunity.authorizationAt,
                  )}
                />

                <InfoItem
                  label="Divulgar imóvel"
                  value={
                    opportunity.authorizedToAdvertise
                      ? "Autorizado"
                      : "Não autorizado"
                  }
                />

                <InfoItem
                  label="Usar imagens"
                  value={
                    opportunity.authorizedToUseImages
                      ? "Autorizado"
                      : "Não autorizado"
                  }
                />

                <InfoItem
                  label="Editar imagens"
                  value={
                    opportunity.authorizedToEditImages
                      ? "Autorizado"
                      : "Não autorizado"
                  }
                />

                <InfoItem
                  label="Observações da autorização"
                  value={
                    opportunity.authorizationNotes ||
                    "Nenhuma observação registrada."
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6">
              <p className="text-sm font-semibold text-amber-300">
                Controle de publicação
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Esta oportunidade permanece privada no
                CRM. O cadastro nesta área não autoriza
                publicação nem uso de imagens no Portal
                B&B.
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                A liberação para divulgação será feita
                somente após o registro explícito das
                autorizações correspondentes.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Registro
              </p>

              <div className="mt-5 space-y-4 text-sm text-zinc-300">
                <p>
                  Criado:{" "}
                  <span className="text-white">
                    {formatDate(
                      opportunity.createdAt,
                    )}
                  </span>
                </p>

                <p>
                  Atualizado:{" "}
                  <span className="text-white">
                    {formatDate(
                      opportunity.updatedAt,
                    )}
                  </span>
                </p>

                <p>
                  Última conferência da fonte:{" "}
                  <span className="text-white">
                    {formatDate(
                      opportunity.lastCheckedAt,
                    )}
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}