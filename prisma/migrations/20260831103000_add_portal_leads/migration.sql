-- CreateEnum
CREATE TYPE "PortalLeadStatus" AS ENUM (
  'NOVO',
  'CONTATADO',
  'VISITA_AGENDADA',
  'PROPOSTA',
  'EM_NEGOCIACAO',
  'CONVERTIDO',
  'ENCERRADO'
);

-- CreateTable
CREATE TABLE "PortalLead" (
  "id" SERIAL NOT NULL,
  "propertyId" INTEGER,
  "propertyCode" VARCHAR(30) NOT NULL,
  "propertyTitle" VARCHAR(200) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "status" "PortalLeadStatus" NOT NULL DEFAULT 'NOVO',
  "notes" TEXT,
  "sourcePage" VARCHAR(1000) NOT NULL,
  "referrer" VARCHAR(1000),
  "utmSource" VARCHAR(180),
  "utmMedium" VARCHAR(180),
  "utmCampaign" VARCHAR(250),
  "utmTerm" VARCHAR(250),
  "utmContent" VARCHAR(250),
  "gclid" VARCHAR(255),
  "consentVersion" VARCHAR(50) NOT NULL,
  "consentText" TEXT NOT NULL,
  "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "contactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalLead_propertyId_idx" ON "PortalLead"("propertyId");
CREATE INDEX "PortalLead_propertyCode_idx" ON "PortalLead"("propertyCode");
CREATE INDEX "PortalLead_phone_idx" ON "PortalLead"("phone");
CREATE INDEX "PortalLead_status_idx" ON "PortalLead"("status");
CREATE INDEX "PortalLead_createdAt_idx" ON "PortalLead"("createdAt");

-- AddForeignKey
ALTER TABLE "PortalLead"
ADD CONSTRAINT "PortalLead_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
