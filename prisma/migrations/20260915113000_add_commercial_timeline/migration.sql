-- AlterEnum
ALTER TYPE "PortalLeadStatus"
ADD VALUE IF NOT EXISTS 'QUALIFICADO';

-- CreateEnum
CREATE TYPE "CommercialEventType" AS ENUM (
  'NOVO_CONTATO',
  'CONTATO_REALIZADO',
  'CLIENTE_QUALIFICADO',
  'IMOVEIS_APRESENTADOS',
  'VISITA_AGENDADA',
  'VISITA_REALIZADA',
  'POS_VISITA',
  'PROPOSTA_APRESENTADA',
  'CONTRAPROPOSTA',
  'NEGOCIACAO',
  'PROPOSTA_ACEITA',
  'DOCUMENTACAO',
  'NEGOCIO_CONCLUIDO',
  'PERDIDO_ENCERRADO'
);

-- CreateTable
CREATE TABLE "CommercialEvent" (
  "id" SERIAL NOT NULL,
  "clientId" INTEGER NOT NULL,
  "agentId" INTEGER,
  "leadId" INTEGER,
  "type" "CommercialEventType" NOT NULL,
  "description" TEXT,
  "amount" DECIMAL(15,2),
  "eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommercialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialEventProperty" (
  "id" SERIAL NOT NULL,
  "commercialEventId" INTEGER NOT NULL,
  "propertyId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommercialEventProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommercialEvent_clientId_idx"
ON "CommercialEvent"("clientId");

CREATE INDEX "CommercialEvent_agentId_idx"
ON "CommercialEvent"("agentId");

CREATE INDEX "CommercialEvent_leadId_idx"
ON "CommercialEvent"("leadId");

CREATE INDEX "CommercialEvent_type_idx"
ON "CommercialEvent"("type");

CREATE INDEX "CommercialEvent_eventAt_idx"
ON "CommercialEvent"("eventAt");

CREATE UNIQUE INDEX "CommercialEventProperty_commercialEventId_propertyId_key"
ON "CommercialEventProperty"("commercialEventId", "propertyId");

CREATE INDEX "CommercialEventProperty_commercialEventId_idx"
ON "CommercialEventProperty"("commercialEventId");

CREATE INDEX "CommercialEventProperty_propertyId_idx"
ON "CommercialEventProperty"("propertyId");

-- AddForeignKey
ALTER TABLE "CommercialEvent"
ADD CONSTRAINT "CommercialEvent_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "CommercialEvent"
ADD CONSTRAINT "CommercialEvent_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "CommercialEvent"
ADD CONSTRAINT "CommercialEvent_leadId_fkey"
FOREIGN KEY ("leadId")
REFERENCES "PortalLead"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "CommercialEventProperty"
ADD CONSTRAINT "CommercialEventProperty_commercialEventId_fkey"
FOREIGN KEY ("commercialEventId")
REFERENCES "CommercialEvent"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "CommercialEventProperty"
ADD CONSTRAINT "CommercialEventProperty_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;