import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getAccessContext } from "../../../../../../lib/admin/access";
import { prisma } from "../../../../../../lib/prisma";
import PrintControls from "./PrintControls";
import SignaturePad from "./SignaturePad";
import { savePropertyProposal } from "./proposal-actions";
import { savePropertyRentalProposal } from "./rental-proposal-actions";
import { savePropertyVisit } from "./visit-actions";

export const dynamic = "force-dynamic";

type PrintableSheetPageProps = {
  params: Promise<{
    code: string;
    tipo: string;
  }>;

  searchParams: Promise<{
    salvo?: string;
    visitId?: string;
  }>;
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
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  EM_ANALISE: "Em análise",
};

function formatCurrency(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return "Sob consulta";
  }

  const numericValue = Number(
    value.toString(),
  );

  if (!Number.isFinite(numericValue)) {
    return "Sob consulta";
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

function formatArea(
  value: { toString(): string } | null,
) {
  if (value === null) {
    return "Não informada";
  }

  const numericValue = Number(
    value.toString(),
  );

  if (!Number.isFinite(numericValue)) {
    return "Não informada";
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(numericValue)} m²`;
}

function formatInputDate(
  value: Date | null | undefined,
) {
  if (!value) {
    return "";
  }

  return value
    .toISOString()
    .slice(0, 10);
}

function InfoItem({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
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

      <div className="mt-1 text-[11px] leading-5 text-zinc-950">
        {children}
      </div>
    </div>
  );
}

function EditableField({
  label,
  name,
  wide = false,
  type = "text",
  placeholder = "",
  required = false,
  defaultValue = "",
}: {
  label: string;
  name: string;
  wide?: boolean;
  type?:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "time";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label
      className={`block ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full border-0 border-b border-zinc-400 bg-transparent px-1 text-[11px] text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-0 print:text-zinc-950"
      />
    </label>
  );
}

function EditableTextArea({
  label,
  name,
  wide = false,
  rows = 4,
  placeholder = "",
  defaultValue = "",
}: {
  label: string;
  name: string;
  wide?: boolean;
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label
      className={`block ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>

      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full resize-none border border-zinc-300 bg-transparent p-3 text-[10px] leading-5 text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-0 print:text-zinc-950"
      />
    </label>
  );
}

function ChoiceOption({
  name,
  value,
  label,
  defaultChecked = false,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5 border-zinc-400 accent-amber-500"
      />

      <span>{label}</span>
    </label>
  );
}

function CheckboxOption({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 border border-zinc-300 px-3 py-2 text-[10px] text-zinc-700 transition hover:border-amber-500">
      <input
        type="checkbox"
        name={name}
        className="h-4 w-4 accent-amber-500"
      />

      <span>{label}</span>
    </label>
  );
}

function SheetHeader({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  return (
    <header className="flex flex-col gap-4 border-b-2 border-amber-500 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-center gap-4">
        <Image
          src="/logo-bb.png"
          alt="B&B Consultoria Imobiliária"
          width={120}
          height={120}
          className="h-24 w-24 shrink-0 object-contain"
          priority
        />

        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-700">
            B&amp;B Consultoria Imobiliária
          </p>

          <h1 className="mt-1 font-serif text-xl font-semibold text-zinc-950 sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="w-fit border border-zinc-300 px-4 py-3 sm:text-right">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Código do imóvel
        </p>

        <p className="mt-1 text-base font-bold text-zinc-950">
          {code}
        </p>
      </div>
    </header>
  );
}

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2 className="border-l-4 border-amber-500 pl-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950">
      {children}
    </h2>
  );
}

export default async function PrintableSheetPage({
  params,
  searchParams,
}: PrintableSheetPageProps) {
  const { code, tipo } = await params;

  const {
    salvo,
    visitId,
  } = await searchParams;

  if (
    tipo !== "visita" &&
    tipo !== "imovel" &&
    tipo !== "proposta" &&
    tipo !== "proposta-locacao"
  ) {
    notFound();
  }

  const access =
    await getAccessContext();

  const property =
    await prisma.property.findUnique({
      where: {
        code: code.toUpperCase(),
      },

      include: {
        captor: {
          select: {
            name: true,
            phone: true,
            email: true,
            creci: true,
          },
        },

        coCaptor: {
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

  if (
    (tipo === "proposta" &&
      property.purpose === "LOCACAO") ||
    (tipo === "proposta-locacao" &&
      property.purpose === "VENDA")
  ) {
    notFound();
  }

  const isVisitSheet =
    tipo === "visita";

  const isProposalSheet =
    tipo === "proposta";

  const isRentalProposalSheet =
    tipo === "proposta-locacao";

  const isPropertySheet =
    tipo === "imovel";

  let numericVisitId:
    | number
    | null = null;

  if (
    isVisitSheet &&
    visitId
  ) {
    const parsedVisitId =
      Number(visitId);

    if (
      !Number.isInteger(
        parsedVisitId,
      ) ||
      parsedVisitId <= 0
    ) {
      notFound();
    }

    numericVisitId =
      parsedVisitId;
  }

  const scheduledVisit =
    isVisitSheet &&
    numericVisitId
      ? await prisma.propertyVisit.findFirst({
          where: {
            id:
              numericVisitId,

            propertyId:
              property.id,

            status:
              "AGENDADA",
          },

          select: {
            id: true,
            clientId: true,
            status: true,

            visitorName: true,
            visitorDocument: true,
            visitorPhone: true,
            visitorEmail: true,
            visitorBirthDate: true,
            visitorAddress: true,

            visitDate: true,
            visitTime: true,
            companions: true,
            notes: true,
          },
        })
      : null;

  if (
    isVisitSheet &&
    numericVisitId &&
    !scheduledVisit
  ) {
    notFound();
  }

  const activeAgents =
    (isProposalSheet ||
      isRentalProposalSheet) &&
    access.isAdmin
      ? await prisma.agent.findMany({
          where: {
            active: true,
          },

          orderBy: {
            name: "asc",
          },

          select: {
            id: true,
            name: true,
            creci: true,
          },
        })
      : [];

  const currentAgent =
    (isProposalSheet ||
      isRentalProposalSheet) &&
    access.agentId
      ? await prisma.agent.findUnique({
          where: {
            id: access.agentId,
          },

          select: {
            name: true,
            creci: true,
          },
        })
      : null;

  const backHref =
    scheduledVisit?.clientId
      ? `/admin/clientes/${scheduledVisit.clientId}`
      : `/admin/imoveis/${property.code.toLowerCase()}`;

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

  const captorName =
    property.captor?.name ??
    "Não informado";

  const captorDetails = [
    property.captor?.creci
      ? `CRECI ${property.captor.creci}`
      : null,
    property.captor?.phone,
    property.captor?.email,
  ]
    .filter(Boolean)
    .join(" • ");

  const generatedAt =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
        timeZone:
          "America/Sao_Paulo",
      },
    ).format(new Date());

  const saveVisitAction =
    savePropertyVisit.bind(
      null,
      property.code,
    );

  const saveProposalAction =
    savePropertyProposal.bind(
      null,
      property.code,
    );

  const saveRentalProposalAction =
    savePropertyRentalProposal.bind(
      null,
      property.code,
    );

  const printLabel =
    isVisitSheet
      ? "Imprimir ficha de visita"
      : isProposalSheet
        ? "Imprimir proposta"
        : isRentalProposalSheet
          ? "Imprimir proposta de locação"
          : "Imprimir ficha do imóvel";

  return (
    <main className="min-h-screen bg-zinc-200 px-3 py-5 text-zinc-950 sm:px-4 sm:py-7 print:bg-white print:p-0">
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

          input,
          textarea,
          select {
            color: #09090b !important;
            -webkit-text-fill-color: #09090b !important;
          }

          textarea {
            resize: none !important;
          }

          canvas {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .signature-box,
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <PrintControls
        backHref={backHref}
        printLabel={printLabel}
      />

      {isVisitSheet &&
      scheduledVisit ? (
        <div className="mx-auto mb-4 w-full max-w-[210mm] border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-900 print:hidden">
          <span className="font-semibold">
            Visita agendada carregada.
          </span>{" "}
          Complete a ficha após a visita e
          clique em Salvar visita. O mesmo
          registro será marcado como realizado.
        </div>
      ) : null}

      {isVisitSheet &&
      salvo === "1" ? (
        <div className="mx-auto mb-4 w-full max-w-[210mm] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 print:hidden">
          Visita salva com sucesso.
        </div>
      ) : null}

      {isProposalSheet &&
      salvo === "1" ? (
        <div className="mx-auto mb-4 w-full max-w-[210mm] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 print:hidden">
          Proposta salva com sucesso.
        </div>
      ) : null}

      {isRentalProposalSheet &&
      salvo === "1" ? (
        <div className="mx-auto mb-4 w-full max-w-[210mm] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 print:hidden">
          Proposta de locação salva com sucesso.
        </div>
      ) : null}

      {isVisitSheet ? (
        <form action={saveVisitAction}>
          {scheduledVisit ? (
            <input
              type="hidden"
              name="visitId"
              value={
                scheduledVisit.id
              }
            />
          ) : null}

          <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-5 shadow-2xl sm:p-[12mm] print:p-0">
            <SheetHeader
              title="Ficha de visita"
              code={property.code}
            />

            <section className="mt-6">
              <SectionTitle>
                Identificação do imóvel
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <InfoItem
                  label="Imóvel"
                  wide
                >
                  {property.title}
                </InfoItem>

                <InfoItem
                  label="Endereço da visita"
                  wide
                >
                  {address}
                </InfoItem>

                <InfoItem label="Finalidade">
                  {purposeLabels[
                    property.purpose
                  ] ?? property.purpose}
                </InfoItem>

                <InfoItem label="Captador responsável">
                  <span className="font-semibold">
                    {captorName}
                  </span>

                  {captorDetails ? (
                    <span className="block text-[9px] text-zinc-600">
                      {captorDetails}
                    </span>
                  ) : null}
                </InfoItem>
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Dados do visitante
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Nome completo"
                  name="visitorName"
                  wide
                  required
                  placeholder="Digite o nome completo"
                  defaultValue={
                    scheduledVisit
                      ?.visitorName ??
                    ""
                  }
                />

                <EditableField
                  label="CPF ou RG"
                  name="visitorDocument"
                  placeholder="CPF ou RG"
                  defaultValue={
                    scheduledVisit
                      ?.visitorDocument ??
                    ""
                  }
                />

                <EditableField
                  label="Telefone"
                  name="visitorPhone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  defaultValue={
                    scheduledVisit
                      ?.visitorPhone ??
                    ""
                  }
                />

                <EditableField
                  label="E-mail"
                  name="visitorEmail"
                  type="email"
                  placeholder="nome@email.com"
                  defaultValue={
                    scheduledVisit
                      ?.visitorEmail ??
                    ""
                  }
                />

                <EditableField
                  label="Data de nascimento"
                  name="visitorBirthDate"
                  type="date"
                  defaultValue={
                    formatInputDate(
                      scheduledVisit
                        ?.visitorBirthDate,
                    )
                  }
                />

                <EditableField
                  label="Endereço"
                  name="visitorAddress"
                  wide
                  placeholder="Rua, número, bairro, cidade"
                  defaultValue={
                    scheduledVisit
                      ?.visitorAddress ??
                    ""
                  }
                />

                <EditableField
                  label="Data da visita"
                  name="visitDate"
                  type="date"
                  required
                  defaultValue={
                    formatInputDate(
                      scheduledVisit
                        ?.visitDate,
                    )
                  }
                />

                <EditableField
                  label="Horário"
                  name="visitTime"
                  type="time"
                  defaultValue={
                    scheduledVisit
                      ?.visitTime ??
                    ""
                  }
                />

                <EditableField
                  label="Acompanhantes"
                  name="companions"
                  wide
                  placeholder="Informe os acompanhantes, se houver"
                  defaultValue={
                    scheduledVisit
                      ?.companions ??
                    ""
                  }
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Impressões da visita
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 text-[10px] text-zinc-700 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Interesse
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <ChoiceOption
                      name="interest"
                      value="ALTO"
                      label="Alto"
                    />

                    <ChoiceOption
                      name="interest"
                      value="MEDIO"
                      label="Médio"
                    />

                    <ChoiceOption
                      name="interest"
                      value="BAIXO"
                      label="Baixo"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Retorno
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <ChoiceOption
                      name="returnType"
                      value="PROPOSTA"
                      label="Proposta"
                    />

                    <ChoiceOption
                      name="returnType"
                      value="NOVA_VISITA"
                      label="Nova visita"
                    />

                    <ChoiceOption
                      name="returnType"
                      value="SEM_INTERESSE"
                      label="Sem interesse"
                    />
                  </div>
                </div>

                <EditableTextArea
                  label="Observações, dúvidas e condições comentadas"
                  name="visitNotes"
                  wide
                  rows={4}
                  placeholder="Digite aqui as observações da visita..."
                  defaultValue={
                    scheduledVisit
                      ?.notes ??
                    ""
                  }
                />
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle>
                Assinaturas
              </SectionTitle>

              <p className="mt-2 text-[8px] leading-4 text-zinc-500 print:hidden">
                As assinaturas podem ser feitas com dedo, caneta touch ou mouse.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
                <SignaturePad
                  label="Assinatura do visitante"
                  name="visitorSignature"
                />

                <SignaturePad
                  label="Assinatura do responsável pela visita"
                  name="responsibleSignature"
                />
              </div>
            </section>

            <div className="mt-8 flex justify-end print:hidden">
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center bg-emerald-600 px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 sm:w-auto"
              >
                Salvar visita
              </button>
            </div>

            <p className="mt-7 border-t border-zinc-200 pt-3 text-[8px] leading-4 text-zinc-500">
              Os dados preenchidos nesta ficha devem ser utilizados exclusivamente para o atendimento imobiliário e protegidos contra acesso indevido.
            </p>

            <footer className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Documento interno • B&amp;B Consultoria Imobiliária
              </span>

              <span>
                Gerado em {generatedAt}
              </span>
            </footer>
          </article>
        </form>
      ) : null}

      {isProposalSheet ? (
        <form action={saveProposalAction}>
          <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-5 shadow-2xl sm:p-[12mm] print:p-0">
            <SheetHeader
              title="Proposta de compra"
              code={property.code}
            />

            <section className="mt-6">
              <SectionTitle>
                Identificação do imóvel
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <InfoItem
                  label="Imóvel"
                  wide
                >
                  {property.title}
                </InfoItem>

                <InfoItem
                  label="Endereço"
                  wide
                >
                  {address}
                </InfoItem>

                <InfoItem label="Finalidade">
                  {purposeLabels[
                    property.purpose
                  ] ?? property.purpose}
                </InfoItem>

                <InfoItem label="Valor anunciado">
                  {property.price
                    ? formatCurrency(
                        property.price,
                      )
                    : "Sob consulta"}
                </InfoItem>
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Dados do proponente
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Nome completo"
                  name="proposerName"
                  wide
                  required
                  placeholder="Nome completo do proponente"
                />

                <EditableField
                  label="CPF"
                  name="proposerDocument"
                  placeholder="000.000.000-00"
                />

                <EditableField
                  label="Telefone"
                  name="proposerPhone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                />

                <EditableField
                  label="E-mail"
                  name="proposerEmail"
                  type="email"
                  placeholder="nome@email.com"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Condições financeiras
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Valor oferecido"
                  name="offeredValue"
                  required
                  placeholder="R$ 0,00"
                />

                <EditableField
                  label="Sinal / entrada"
                  name="downPaymentValue"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Origem dos recursos
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <CheckboxOption
                    name="usesOwnResources"
                    label="Recursos próprios"
                  />

                  <CheckboxOption
                    name="usesFinancing"
                    label="Financiamento bancário"
                  />

                  <CheckboxOption
                    name="usesFgts"
                    label="FGTS"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableTextArea
                  label="Condições de pagamento"
                  name="paymentTerms"
                  wide
                  rows={4}
                  placeholder="Descreva a composição do pagamento, parcelas, financiamento e demais condições..."
                />

                <EditableField
                  label="Prazo para conclusão / pagamento"
                  name="deadline"
                  placeholder="Ex.: 30 dias após o aceite"
                />

                <EditableField
                  label="Validade da proposta"
                  name="validUntil"
                  type="date"
                />

                <EditableTextArea
                  label="Condições especiais"
                  name="specialConditions"
                  wide
                  rows={4}
                  placeholder="Informe condições especiais, bens incluídos, dependência de financiamento ou outras condições..."
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Observações
              </SectionTitle>

              <div className="mt-4">
                <EditableTextArea
                  label="Observações adicionais da proposta"
                  name="proposalNotes"
                  wide
                  rows={4}
                  placeholder="Registre aqui informações complementares relevantes..."
                />
              </div>
            </section>

            <section className="mt-7 border border-amber-200 bg-amber-50/40 p-4">
              <SectionTitle>
                Contraproposta do proprietário
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Valor da contraproposta"
                  name="counterOfferValue"
                  placeholder="R$ 0,00"
                />

                <EditableTextArea
                  label="Condições da contraproposta"
                  name="counterOfferTerms"
                  wide
                  rows={3}
                  placeholder="Condições apresentadas pelo proprietário..."
                />

                <EditableTextArea
                  label="Observações da contraproposta"
                  name="counterOfferNotes"
                  wide
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Situação da proposta
              </SectionTitle>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-zinc-700">
                <ChoiceOption
                  name="proposalStatus"
                  value="EM_ANALISE"
                  label="Em análise"
                  defaultChecked
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="CONTRAPROPOSTA"
                  label="Contraproposta"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="ACEITA"
                  label="Aceita"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="RECUSADA"
                  label="Recusada"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="CANCELADA"
                  label="Cancelada"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Corretor responsável
              </SectionTitle>

              <div className="mt-4">
                {access.isAdmin ? (
                  <label className="block">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                      Selecione o corretor
                    </span>

                    <select
                      name="agentId"
                      defaultValue=""
                      className="mt-2 h-11 w-full border border-zinc-300 bg-white px-3 text-[11px] text-zinc-950 outline-none focus:border-amber-500"
                    >
                      <option value="">
                        Selecione
                      </option>

                      {activeAgents.map(
                        (agent) => (
                          <option
                            key={agent.id}
                            value={agent.id}
                          >
                            {agent.name}
                            {agent.creci
                              ? ` • CRECI ${agent.creci}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                ) : (
                  <InfoItem label="Responsável">
                    <span className="font-semibold">
                      {currentAgent?.name ??
                        "Corretor logado"}
                    </span>

                    {currentAgent?.creci ? (
                      <span className="block text-[9px] text-zinc-600">
                        CRECI {currentAgent.creci}
                      </span>
                    ) : null}
                  </InfoItem>
                )}
              </div>
            </section>

            <section className="mt-8 print-avoid-break">
              <SectionTitle>
                Assinaturas
              </SectionTitle>

              <p className="mt-2 text-[8px] leading-4 text-zinc-500 print:hidden">
                As assinaturas podem ser feitas com dedo, caneta touch ou mouse.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3 print:grid-cols-3">
                <SignaturePad
                  label="Proponente"
                  name="proposerSignature"
                />

                <SignaturePad
                  label="Proprietário"
                  name="ownerSignature"
                />

                <SignaturePad
                  label="Corretor responsável"
                  name="agentSignature"
                />
              </div>
            </section>

            <div className="mt-8 flex justify-end print:hidden">
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center bg-emerald-600 px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 sm:w-auto"
              >
                Salvar proposta
              </button>
            </div>

            <div className="mt-7 border-t border-zinc-200 pt-4 text-[8px] leading-4 text-zinc-500">
              <p>
                Esta ficha registra as condições apresentadas pelas partes durante a negociação imobiliária. O aceite de uma proposta não substitui os instrumentos jurídicos e contratuais necessários à formalização definitiva do negócio.
              </p>

              <p className="mt-2">
                Os dados pessoais constantes neste documento devem ser utilizados exclusivamente para a finalidade do atendimento e da negociação imobiliária, observadas as medidas adequadas de proteção e confidencialidade.
              </p>
            </div>

            <footer className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                B&amp;B Consultoria Imobiliária • Proposta de compra
              </span>

              <span>
                Gerado em {generatedAt}
              </span>
            </footer>
          </article>
        </form>
      ) : null}

      {isRentalProposalSheet ? (
        <form action={saveRentalProposalAction}>
          <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-5 shadow-2xl sm:p-[12mm] print:p-0">
            <SheetHeader
              title="Proposta de locação"
              code={property.code}
            />

            <section className="mt-6">
              <SectionTitle>
                Identificação do imóvel
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <InfoItem
                  label="Imóvel"
                  wide
                >
                  {property.title}
                </InfoItem>

                <InfoItem
                  label="Endereço"
                  wide
                >
                  {address}
                </InfoItem>

                <InfoItem label="Finalidade">
                  {purposeLabels[
                    property.purpose
                  ] ?? property.purpose}
                </InfoItem>

                <InfoItem label="Aluguel anunciado">
                  {property.rentalPrice
                    ? formatCurrency(
                        property.rentalPrice,
                      )
                    : "Sob consulta"}
                </InfoItem>
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Dados do pretendente à locação
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Nome completo"
                  name="tenantName"
                  wide
                  required
                  placeholder="Nome completo do pretendente"
                />

                <EditableField
                  label="CPF ou CNPJ"
                  name="tenantDocument"
                  placeholder="Documento do pretendente"
                />

                <EditableField
                  label="Telefone"
                  name="tenantPhone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                />

                <EditableField
                  label="E-mail"
                  name="tenantEmail"
                  type="email"
                  placeholder="nome@email.com"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Condições da locação
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Valor mensal proposto"
                  name="offeredRentValue"
                  required
                  placeholder="R$ 0,00"
                />

                <EditableField
                  label="Condomínio considerado"
                  name="condominiumValue"
                  placeholder="R$ 0,00"
                />

                <EditableField
                  label="IPTU considerado"
                  name="iptuValue"
                  placeholder="R$ 0,00"
                />

                <EditableField
                  label="Início pretendido"
                  name="desiredStartDate"
                  type="date"
                />

                <EditableField
                  label="Prazo da locação em meses"
                  name="leaseTermMonths"
                  placeholder="Ex.: 30"
                />

                <EditableField
                  label="Validade da proposta"
                  name="validUntil"
                  type="date"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Garantia locatícia
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Modalidade de garantia
                  </span>

                  <select
                    name="guaranteeType"
                    defaultValue=""
                    className="mt-1 h-10 w-full border-0 border-b border-zinc-400 bg-transparent px-1 text-[11px] text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-0"
                  >
                    <option value="">
                      A definir
                    </option>
                    <option value="CAUCAO">
                      Caução
                    </option>
                    <option value="FIADOR">
                      Fiador
                    </option>
                    <option value="SEGURO_FIANCA">
                      Seguro-fiança
                    </option>
                    <option value="TITULO_CAPITALIZACAO">
                      Título de capitalização
                    </option>
                    <option value="OUTRA">
                      Outra
                    </option>
                  </select>
                </label>

                <EditableField
                  label="Valor da caução / garantia"
                  name="securityDepositValue"
                  placeholder="R$ 0,00"
                />

                <EditableTextArea
                  label="Detalhes da garantia"
                  name="guaranteeDetails"
                  wide
                  rows={3}
                  placeholder="Informe fiador, seguradora, quantidade de depósitos ou outros detalhes..."
                />

                <EditableTextArea
                  label="Condições especiais"
                  name="specialConditions"
                  wide
                  rows={4}
                  placeholder="Descreva condições, benfeitorias, móveis, carência ou outros pontos negociados..."
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Observações
              </SectionTitle>

              <div className="mt-4">
                <EditableTextArea
                  label="Observações adicionais da proposta"
                  name="proposalNotes"
                  wide
                  rows={4}
                  placeholder="Registre informações complementares relevantes..."
                />
              </div>
            </section>

            <section className="mt-7 border border-amber-200 bg-amber-50/40 p-4">
              <SectionTitle>
                Contraproposta do proprietário
              </SectionTitle>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <EditableField
                  label="Aluguel da contraproposta"
                  name="counterOfferRent"
                  placeholder="R$ 0,00"
                />

                <EditableTextArea
                  label="Condições da contraproposta"
                  name="counterOfferTerms"
                  wide
                  rows={3}
                  placeholder="Condições apresentadas pelo proprietário..."
                />

                <EditableTextArea
                  label="Observações da contraproposta"
                  name="counterOfferNotes"
                  wide
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Situação da proposta
              </SectionTitle>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-zinc-700">
                <ChoiceOption
                  name="proposalStatus"
                  value="EM_ANALISE"
                  label="Em análise"
                  defaultChecked
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="CONTRAPROPOSTA"
                  label="Contraproposta"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="ACEITA"
                  label="Aceita"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="RECUSADA"
                  label="Recusada"
                />

                <ChoiceOption
                  name="proposalStatus"
                  value="CANCELADA"
                  label="Cancelada"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Corretor responsável
              </SectionTitle>

              <div className="mt-4">
                {access.isAdmin ? (
                  <label className="block">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                      Selecione o corretor
                    </span>

                    <select
                      name="agentId"
                      defaultValue=""
                      className="mt-2 h-11 w-full border border-zinc-300 bg-white px-3 text-[11px] text-zinc-950 outline-none focus:border-amber-500"
                    >
                      <option value="">
                        Selecione
                      </option>

                      {activeAgents.map(
                        (agent) => (
                          <option
                            key={agent.id}
                            value={agent.id}
                          >
                            {agent.name}
                            {agent.creci
                              ? ` • CRECI ${agent.creci}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                ) : (
                  <InfoItem label="Responsável">
                    <span className="font-semibold">
                      {currentAgent?.name ??
                        "Corretor logado"}
                    </span>

                    {currentAgent?.creci ? (
                      <span className="block text-[9px] text-zinc-600">
                        CRECI {currentAgent.creci}
                      </span>
                    ) : null}
                  </InfoItem>
                )}
              </div>
            </section>

            <section className="mt-8 print-avoid-break">
              <SectionTitle>
                Assinaturas
              </SectionTitle>

              <p className="mt-2 text-[8px] leading-4 text-zinc-500 print:hidden">
                As assinaturas podem ser feitas com dedo, caneta touch ou mouse.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3 print:grid-cols-3">
                <SignaturePad
                  label="Pretendente à locação"
                  name="tenantSignature"
                />

                <SignaturePad
                  label="Proprietário"
                  name="ownerSignature"
                />

                <SignaturePad
                  label="Corretor responsável"
                  name="agentSignature"
                />
              </div>
            </section>

            <div className="mt-8 flex justify-end print:hidden">
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center bg-emerald-600 px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 sm:w-auto"
              >
                Salvar proposta de locação
              </button>
            </div>

            <div className="mt-7 border-t border-zinc-200 pt-4 text-[8px] leading-4 text-zinc-500">
              <p>
                Esta ficha registra condições preliminares de locação. O aceite não substitui a análise cadastral, a aprovação da garantia e o contrato definitivo.
              </p>

              <p className="mt-2">
                Os dados pessoais devem ser utilizados exclusivamente para o atendimento e a negociação imobiliária, com proteção e confidencialidade adequadas.
              </p>
            </div>

            <footer className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                B&amp;B Consultoria Imobiliária • Proposta de locação
              </span>

              <span>
                Gerado em {generatedAt}
              </span>
            </footer>
          </article>
        </form>
      ) : null}

      {isPropertySheet ? (
        <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-5 shadow-2xl sm:p-[12mm] print:p-0">
          <SheetHeader
            title="Ficha do imóvel"
            code={property.code}
          />

          <section className="mt-6">
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-amber-700">
                  {propertyTypeLabels[
                    property.propertyType
                  ] ?? property.propertyType}
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight text-zinc-950">
                  {property.title}
                </h2>

                <p className="mt-2 text-[10px] leading-5 text-zinc-600">
                  {address}
                </p>
              </div>

              <span className="w-fit shrink-0 border border-zinc-300 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-700">
                {statusLabels[
                  property.status
                ] ?? property.status}
              </span>
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>
              Informações comerciais
            </SectionTitle>

            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <InfoItem label="Finalidade">
                {purposeLabels[
                  property.purpose
                ] ?? property.purpose}
              </InfoItem>

              <InfoItem label="Categoria">
                {property.category}
              </InfoItem>

              <InfoItem label="Valor de venda">
                {formatCurrency(
                  property.price,
                )}
              </InfoItem>

              <InfoItem label="Valor de locação">
                {formatCurrency(
                  property.rentalPrice,
                )}
              </InfoItem>

              <InfoItem label="Condomínio">
                {formatCurrency(
                  property.condominium,
                )}
              </InfoItem>

              <InfoItem label="IPTU">
                {formatCurrency(
                  property.iptu,
                )}
              </InfoItem>
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>
              Características
            </SectionTitle>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [
                  "Área útil",
                  formatArea(
                    property.area,
                  ),
                ],
                [
                  "Área do terreno",
                  formatArea(
                    property.landArea,
                  ),
                ],
                [
                  "Dormitórios",
                  property.bedrooms,
                ],
                [
                  "Suítes",
                  property.suites,
                ],
                [
                  "Banheiros",
                  property.bathrooms,
                ],
                [
                  "Vagas",
                  property.parking,
                ],
                [
                  "Bairro",
                  property.neighborhood,
                ],
                [
                  "Empreendimento",
                  property.development ??
                    "Não informado",
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={String(label)}
                    className="border border-zinc-300 p-3"
                  >
                    <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                      {label}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-4 text-zinc-950">
                      {value}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>
              Descrição do imóvel
            </SectionTitle>

            <p className="mt-3 whitespace-pre-wrap text-[10px] leading-5 text-zinc-700">
              {property.description ??
                "Descrição não informada."}
            </p>
          </section>

          <section className="mt-6">
            <SectionTitle>
              Diferenciais e comodidades
            </SectionTitle>

            {property.features.length >
            0 ? (
              <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[10px] leading-4 text-zinc-700 sm:grid-cols-2">
                {property.features.map(
                  (feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-amber-500" />

                      <span>
                        {feature}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="mt-3 text-[10px] text-zinc-600">
                Nenhum diferencial cadastrado.
              </p>
            )}
          </section>

          <section className="mt-6 border-t border-zinc-300 pt-4">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <InfoItem label="Captador responsável">
                <span className="font-semibold">
                  {captorName}
                </span>

                {captorDetails ? (
                  <span className="block text-[9px] text-zinc-600">
                    {captorDetails}
                  </span>
                ) : null}
              </InfoItem>

              <InfoItem label="Cocaptador">
                {property.coCaptor ? (
                  <>
                    <span className="font-semibold">
                      {property.coCaptor.name}
                    </span>

                    <span className="block text-[9px] text-zinc-600">
                      {[
                        property.coCaptor.creci
                          ? `CRECI ${property.coCaptor.creci}`
                          : null,
                        property.coCaptor.phone,
                        property.coCaptor.email,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </>
                ) : (
                  "Não informado"
                )}
              </InfoItem>
            </div>
          </section>

          <footer className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Documento interno • B&amp;B Consultoria Imobiliária
            </span>

            <span>
              Gerado em {generatedAt}
            </span>
          </footer>
        </article>
      ) : null}
    </main>
  );
}