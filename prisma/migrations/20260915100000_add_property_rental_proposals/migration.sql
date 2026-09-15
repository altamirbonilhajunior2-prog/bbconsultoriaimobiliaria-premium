-- CreateEnum
CREATE TYPE "RentalGuaranteeType" AS ENUM (
  'CAUCAO',
  'FIADOR',
  'SEGURO_FIANCA',
  'TITULO_CAPITALIZACAO',
  'OUTRA'
);

-- CreateTable
CREATE TABLE "PropertyRentalProposal" (
  "id" SERIAL NOT NULL,
  "propertyId" INTEGER NOT NULL,
  "clientId" INTEGER,
  "agentId" INTEGER,

  "tenantName" VARCHAR(180) NOT NULL,
  "tenantDocument" VARCHAR(40),
  "tenantPhone" VARCHAR(30),
  "tenantEmail" VARCHAR(180),

  "offeredRentValue" DECIMAL(15,2) NOT NULL,
  "condominiumValue" DECIMAL(12,2),
  "iptuValue" DECIMAL(12,2),
  "securityDepositValue" DECIMAL(15,2),

  "desiredStartDate" TIMESTAMP(3),
  "leaseTermMonths" INTEGER,

  "guaranteeType" "RentalGuaranteeType",
  "guaranteeDetails" TEXT,
  "specialConditions" TEXT,
  "validUntil" TIMESTAMP(3),
  "notes" TEXT,

  "counterOfferRent" DECIMAL(15,2),
  "counterOfferTerms" TEXT,
  "counterOfferNotes" TEXT,

  "status" "PropertyProposalStatus" NOT NULL DEFAULT 'EM_ANALISE',

  "tenantSignature" TEXT,
  "ownerSignature" TEXT,
  "agentSignature" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PropertyRentalProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyRentalProposal_propertyId_idx"
ON "PropertyRentalProposal"("propertyId");

CREATE INDEX "PropertyRentalProposal_clientId_idx"
ON "PropertyRentalProposal"("clientId");

CREATE INDEX "PropertyRentalProposal_agentId_idx"
ON "PropertyRentalProposal"("agentId");

CREATE INDEX "PropertyRentalProposal_status_idx"
ON "PropertyRentalProposal"("status");

CREATE INDEX "PropertyRentalProposal_createdAt_idx"
ON "PropertyRentalProposal"("createdAt");

CREATE INDEX "PropertyRentalProposal_tenantName_idx"
ON "PropertyRentalProposal"("tenantName");

-- AddForeignKey
ALTER TABLE "PropertyRentalProposal"
ADD CONSTRAINT "PropertyRentalProposal_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PropertyRentalProposal"
ADD CONSTRAINT "PropertyRentalProposal_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PropertyRentalProposal"
ADD CONSTRAINT "PropertyRentalProposal_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
