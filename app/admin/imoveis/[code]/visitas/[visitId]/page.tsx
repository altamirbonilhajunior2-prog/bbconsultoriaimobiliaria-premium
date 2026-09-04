import { notFound } from "next/navigation";

import { getAccessContext } from "../../../../../../lib/admin/access";
import { prisma } from "../../../../../../lib/prisma";
import DeleteVisitButton from "../../DeleteVisitButton";
import { deletePropertyVisit } from "../../visit-actions";
import PrintControls from "../../fichas/[tipo]/PrintControls";

export const dynamic = "force-dynamic";

type VisitPageProps = {
  params: Promise<{
    code: string;
    visitId: string;
  }>;
};

const purposeLabels = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_E_LOCACAO: "Venda e locação",
} as const;

const interestLabels = {
  ALTO: "Alto",
  MEDIO: "Médio",
  BAIXO: "Baixo",
} as const;

const returnLabels = {
  PROPOSTA: "Proposta",
  NOVA_VISITA: "Nova visita",
  SEM_INTERESSE: "Sem interesse",
} as const;

function formatDate(
  value: Date | null,
) {
  if (!value) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeZone:
        "America/Sao_Paulo",
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
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`border-b border-zinc-300 pb-2 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="border-l-4 border-amber-500 pl-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950">
      {children}
    </h2>
  );
}

export default async function VisitPage({
  params,
}: VisitPageProps) {
  const {
    code,
    visitId,
  } = await params;

  const access =
    await getAccessContext();

  const numericVisitId =
    Number(visitId);

  if (
    !Number.isInteger(
      numericVisitId,
    ) ||
    numericVisitId <= 0
  ) {
    notFound();
  }

  const property =
    await prisma.property.findUnique({
      where: {
        code:
          code.toUpperCase(),
      },

      select: {
        id: true,
        code: true,
        title: true,
        purpose: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,

        captor: {
          select: {
            name: true,
            phone: true,
            email: true,
            creci: true,
          },
        },
      },
    });

  if (!property) {
    notFound();
  }

  const visit =
    await prisma.propertyVisit.findFirst({
      where: {
        id:
          numericVisitId,

        propertyId:
          property.id,
      },
    });

  if (!visit) {
    notFound();
  }

  const backHref =
    `/admin/imoveis/${property.code.toLowerCase()}`;

  const address = [
    property.address,
    property.neighborhood,
    `${property.city}/${property.state}`,
    property.zipCode
      ? `CEP ${property.zipCode}`
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const captorDetails = [
    property.captor?.name,
    property.captor?.creci
      ? `CRECI ${property.captor.creci}`
      : null,
    property.captor?.phone,
    property.captor?.email,
  ]
    .filter(Boolean)
    .join(" • ");

  const deleteAction =
    deletePropertyVisit.bind(
      null,
      property.code,
      visit.id,
    );

  return (
    <main className="min-h-screen bg-zinc-200 px-4 py-7 text-zinc-950 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-sheet {
            width: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .signature-image {
            max-height: 115px !important;
          }
        }
      `}</style>

      <PrintControls
        backHref={backHref}
        printLabel="Imprimir ficha de visita"
      />

      {access.isAdmin ? (
        <div className="mx-auto mb-5 flex w-full max-w-[210mm] justify-end print:hidden">
          <DeleteVisitButton
            onDelete={
              deleteAction
            }
          />
        </div>
      ) : null}

      <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-[12mm] shadow-2xl print:p-0">
        <header className="flex items-start justify-between gap-6 border-b-2 border-amber-500 pb-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-700">
              B&amp;B Consultoria Imobiliária
            </p>

            <h1 className="mt-1 font-serif text-2xl font-semibold text-zinc-950">
              Ficha de visita
            </h1>

            <p className="mt-1 text-[9px] text-zinc-500">
              Registro de visita nº {visit.id}
            </p>
          </div>

          <div className="border border-zinc-300 px-4 py-3 text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Código do imóvel
            </p>

            <p className="mt-1 text-base font-bold text-zinc-950">
              {property.code}
            </p>
          </div>
        </header>

        <section className="mt-6">
          <SectionTitle>
            Identificação do imóvel
          </SectionTitle>

          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem
              label="Imóvel"
              value={
                property.title
              }
              wide
            />

            <DetailItem
              label="Endereço da visita"
              value={
                address ||
                "Não informado"
              }
              wide
            />

            <DetailItem
              label="Finalidade"
              value={
                purposeLabels[
                  property.purpose
                ] ??
                property.purpose
              }
            />

            <DetailItem
              label="Captador responsável"
              value={
                captorDetails ||
                "Não informado"
              }
            />
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle>
            Dados do visitante
          </SectionTitle>

          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem
              label="Nome completo"
              value={
                visit.visitorName
              }
              wide
            />

            <DetailItem
              label="CPF ou RG"
              value={
                visit.visitorDocument ??
                "Não informado"
              }
            />

            <DetailItem
              label="Telefone"
              value={
                visit.visitorPhone ??
                "Não informado"
              }
            />

            <DetailItem
              label="E-mail"
              value={
                visit.visitorEmail ??
                "Não informado"
              }
            />

            <DetailItem
              label="Data de nascimento"
              value={formatDate(
                visit.visitorBirthDate,
              )}
            />

            <DetailItem
              label="Endereço"
              value={
                visit.visitorAddress ??
                "Não informado"
              }
              wide
            />

            <DetailItem
              label="Data da visita"
              value={formatDate(
                visit.visitDate,
              )}
            />

            <DetailItem
              label="Horário"
              value={
                visit.visitTime ??
                "Não informado"
              }
            />

            <DetailItem
              label="Acompanhantes"
              value={
                visit.companions ??
                "Não informado"
              }
              wide
            />
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle>
            Impressões da visita
          </SectionTitle>

          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem
              label="Interesse"
              value={
                visit.interest
                  ? interestLabels[
                      visit.interest
                    ]
                  : "Não informado"
              }
            />

            <DetailItem
              label="Retorno"
              value={
                visit.returnType
                  ? returnLabels[
                      visit.returnType
                    ]
                  : "Não informado"
              }
            />

            <DetailItem
              label="Observações, dúvidas e condições comentadas"
              value={
                visit.notes ??
                "Nenhuma observação registrada."
              }
              wide
            />
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle>
            Assinaturas
          </SectionTitle>

          <div className="mt-4 grid grid-cols-2 gap-8">
            <div>
              <div className="flex h-32 items-center justify-center border border-zinc-300 bg-white p-2">
                {visit.visitorSignature ? (
                  <img
                    src={
                      visit.visitorSignature
                    }
                    alt="Assinatura do visitante"
                    className="signature-image max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-[9px] text-zinc-400">
                    Sem assinatura
                  </p>
                )}
              </div>

              <p className="mt-2 border-t border-zinc-500 pt-2 text-center text-[9px] text-zinc-600">
                Assinatura do visitante
              </p>
            </div>

            <div>
              <div className="flex h-32 items-center justify-center border border-zinc-300 bg-white p-2">
                {visit.responsibleSignature ? (
                  <img
                    src={
                      visit.responsibleSignature
                    }
                    alt="Assinatura do responsável pela visita"
                    className="signature-image max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-[9px] text-zinc-400">
                    Sem assinatura
                  </p>
                )}
              </div>

              <p className="mt-2 border-t border-zinc-500 pt-2 text-center text-[9px] text-zinc-600">
                Assinatura do responsável pela visita
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7 border-t border-zinc-200 pt-4">
          <div className="grid grid-cols-2 gap-8 text-[8px] text-zinc-500">
            <div>
              <p className="font-bold uppercase tracking-[0.12em]">
                Registro criado em
              </p>

              <p className="mt-1">
                {formatCreatedAt(
                  visit.createdAt,
                )}
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.12em]">
                Última atualização
              </p>

              <p className="mt-1">
                {formatCreatedAt(
                  visit.updatedAt,
                )}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-7 border-t border-zinc-200 pt-3 text-[8px] leading-4 text-zinc-500">
          Os dados desta ficha são destinados exclusivamente ao atendimento imobiliário realizado pela B&amp;B Consultoria Imobiliária e devem ser protegidos contra acesso indevido.
        </p>

        <footer className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400">
          <span>
            Documento interno • B&amp;B Consultoria Imobiliária
          </span>

          <span>
            Visita nº {visit.id}
          </span>
        </footer>
      </article>
    </main>
  );
}