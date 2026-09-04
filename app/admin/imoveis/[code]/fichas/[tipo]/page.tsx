import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getAccessContext } from "../../../../../../lib/admin/access";
import { prisma } from "../../../../../../lib/prisma";
import PrintControls from "./PrintControls";
import SignaturePad from "./SignaturePad";

export const dynamic = "force-dynamic";

type PrintableSheetPageProps = {
  params: Promise<{
    code: string;
    tipo: string;
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
}: {
  label: string;
  name: string;
  wide?: boolean;
  type?: "text" | "email" | "tel" | "date" | "time";
  placeholder?: string;
}) {
  return (
    <label
      className={`block ${
        wide ? "col-span-2" : ""
      }`}
    >
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1 h-9 w-full border-0 border-b border-zinc-400 bg-transparent px-1 text-[11px] text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-0 print:text-zinc-950"
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
}: {
  label: string;
  name: string;
  wide?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label
      className={`block ${
        wide ? "col-span-2" : ""
      }`}
    >
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>

      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-none border border-zinc-300 bg-transparent p-2 text-[10px] leading-5 text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-0 print:text-zinc-950"
      />
    </label>
  );
}

function CheckOption({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5">
      <input
        type="checkbox"
        name={name}
        value={value}
        className="h-3.5 w-3.5 border-zinc-400 accent-amber-500"
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
    <header className="flex items-center justify-between gap-6 border-b-2 border-amber-500 pb-4">
      <div className="flex items-center gap-4">
        <Image
          src="/logo-bb.png"
          alt="B&B Consultoria Imobiliária"
          width={72}
          height={72}
          className="h-16 w-16 object-cover"
          priority
        />

        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-700">
            B&amp;B Consultoria Imobiliária
          </p>

          <h1 className="mt-1 font-serif text-2xl font-semibold text-zinc-950">
            {title}
          </h1>
        </div>
      </div>

      <div className="border border-zinc-300 px-4 py-3 text-right">
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
}: PrintableSheetPageProps) {
  const { code, tipo } = await params;

  if (
    tipo !== "visita" &&
    tipo !== "imovel"
  ) {
    notFound();
  }

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

  const isVisitSheet =
    tipo === "visita";

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

          input,
          textarea {
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

          .signature-box {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <PrintControls
        backHref={backHref}
        printLabel={
          isVisitSheet
            ? "Imprimir ficha de visita"
            : "Imprimir ficha do imóvel"
        }
      />

      <article className="print-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-[12mm] shadow-2xl print:p-0">
        <SheetHeader
          title={
            isVisitSheet
              ? "Ficha de visita"
              : "Ficha do imóvel"
          }
          code={property.code}
        />

        {isVisitSheet ? (
          <>
            <section className="mt-6">
              <SectionTitle>
                Identificação do imóvel
              </SectionTitle>

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
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

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                <EditableField
                  label="Nome completo"
                  name="visitorName"
                  wide
                  placeholder="Digite o nome completo"
                />

                <EditableField
                  label="CPF ou RG"
                  name="visitorDocument"
                  placeholder="CPF ou RG"
                />

                <EditableField
                  label="Telefone"
                  name="visitorPhone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                />

                <EditableField
                  label="E-mail"
                  name="visitorEmail"
                  type="email"
                  placeholder="nome@email.com"
                />

                <EditableField
                  label="Data de nascimento"
                  name="visitorBirthDate"
                  type="date"
                />

                <EditableField
                  label="Endereço"
                  name="visitorAddress"
                  wide
                  placeholder="Rua, número, bairro, cidade"
                />

                <EditableField
                  label="Data da visita"
                  name="visitDate"
                  type="date"
                />

                <EditableField
                  label="Horário"
                  name="visitTime"
                  type="time"
                />

                <EditableField
                  label="Acompanhantes"
                  name="companions"
                  wide
                  placeholder="Informe os acompanhantes, se houver"
                />
              </div>
            </section>

            <section className="mt-7">
              <SectionTitle>
                Impressões da visita
              </SectionTitle>

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 text-[10px] text-zinc-700">
                <div>
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Interesse
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <CheckOption
                      name="interest"
                      value="alto"
                      label="Alto"
                    />

                    <CheckOption
                      name="interest"
                      value="medio"
                      label="Médio"
                    />

                    <CheckOption
                      name="interest"
                      value="baixo"
                      label="Baixo"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Retorno
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <CheckOption
                      name="returnType"
                      value="proposta"
                      label="Proposta"
                    />

                    <CheckOption
                      name="returnType"
                      value="nova-visita"
                      label="Nova visita"
                    />

                    <CheckOption
                      name="returnType"
                      value="sem-interesse"
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
                />

                <SignaturePad
                  label="Assinatura do responsável pela visita"
                />
              </div>
            </section>

            <p className="mt-7 border-t border-zinc-200 pt-3 text-[8px] leading-4 text-zinc-500">
              Os dados preenchidos nesta ficha devem ser utilizados exclusivamente para o atendimento imobiliário e protegidos contra acesso indevido.
            </p>
          </>
        ) : (
          <>
            <section className="mt-6">
              <div className="flex items-start justify-between gap-6 border-b border-zinc-200 pb-4">
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

                <span className="shrink-0 border border-zinc-300 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-700">
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

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
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

              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  ["Área útil", formatArea(property.area)],
                  ["Área do terreno", formatArea(property.landArea)],
                  ["Dormitórios", property.bedrooms],
                  ["Suítes", property.suites],
                  ["Banheiros", property.bathrooms],
                  ["Vagas", property.parking],
                  ["Bairro", property.neighborhood],
                  ["Empreendimento", property.development ?? "Não informado"],
                ].map(([label, value]) => (
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
                ))}
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

              {property.features.length > 0 ? (
                <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] leading-4 text-zinc-700">
                  {property.features.map(
                    (feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-amber-500" />
                        <span>{feature}</span>
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
              <div className="grid grid-cols-2 gap-8">
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
          </>
        )}

        <footer className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-3 text-[7px] uppercase tracking-[0.1em] text-zinc-400">
          <span>
            Documento interno • B&amp;B Consultoria Imobiliária
          </span>

          <span>
            Gerado em {generatedAt}
          </span>
        </footer>
      </article>
    </main>
  );
}