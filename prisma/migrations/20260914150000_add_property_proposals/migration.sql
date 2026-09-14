-- CreateEnum
CREATE TYPE "PropertyProposalStatus" AS ENUM (
  'EM_ANALISE',
  'CONTRAPROPOSTA',
  'ACEITA',
  'RECUSADA',
  'CANCELADA'
);

-- CreateTable
CREATE TABLE "PropertyProposal" (
  "id" SERIAL NOT NULL,
  "propertyId" INTEGER NOT NULL,
  "clientId" INTEGER,
  "agentId" INTEGER,

  "proposerName" VARCHAR(180) NOT NULL,
  "proposerDocument" VARCHAR(40),
  "proposerPhone" VARCHAR(30),
  "proposerEmail" VARCHAR(180),

  "offeredValue" DECIMAL(15,2),
  "downPaymentValue" DECIMAL(15,2),

  "usesOwnResources" BOOLEAN NOT NULL DEFAULT false,
  "usesFinancing" BOOLEAN NOT NULL DEFAULT false,
  "usesFgts" BOOLEAN NOT NULL DEFAULT false,

  "paymentTerms" TEXT,
  "deadline" VARCHAR(180),
  "specialConditions" TEXT,
  "validUntil" TIMESTAMP(3),
  "notes" TEXT,

  "counterOfferValue" DECIMAL(15,2),
  "counterOfferTerms" TEXT,
  "counterOfferNotes" TEXT,

  "status" "PropertyProposalStatus" NOT NULL DEFAULT 'EM_ANALISE',

  "proposerSignature" TEXT,
  "ownerSignature" TEXT,
  "agentSignature" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PropertyProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyProposal_propertyId_idx"
ON "PropertyProposal"("propertyId");

CREATE INDEX "PropertyProposal_clientId_idx"
ON "PropertyProposal"("clientId");

CREATE INDEX "PropertyProposal_agentId_idx"
ON "PropertyProposal"("agentId");

CREATE INDEX "PropertyProposal_status_idx"
ON "PropertyProposal"("status");

CREATE INDEX "PropertyProposal_createdAt_idx"
ON "PropertyProposal"("createdAt");

CREATE INDEX "PropertyProposal_proposerName_idx"
ON "PropertyProposal"("proposerName");

-- AddForeignKey
ALTER TABLE "PropertyProposal"
ADD CONSTRAINT "PropertyProposal_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PropertyProposal"
ADD CONSTRAINT "PropertyProposal_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PropertyProposal"
ADD CONSTRAINT "PropertyProposal_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;