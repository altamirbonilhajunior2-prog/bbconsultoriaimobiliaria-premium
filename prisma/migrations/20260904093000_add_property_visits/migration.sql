-- CreateEnum
CREATE TYPE "VisitInterest" AS ENUM ('ALTO', 'MEDIO', 'BAIXO');

-- CreateEnum
CREATE TYPE "VisitReturnType" AS ENUM ('PROPOSTA', 'NOVA_VISITA', 'SEM_INTERESSE');

-- CreateTable
CREATE TABLE "PropertyVisit" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "visitorName" VARCHAR(180) NOT NULL,
    "visitorDocument" VARCHAR(40),
    "visitorPhone" VARCHAR(30),
    "visitorEmail" VARCHAR(180),
    "visitorBirthDate" TIMESTAMP(3),
    "visitorAddress" VARCHAR(300),
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitTime" VARCHAR(10),
    "companions" TEXT,
    "interest" "VisitInterest",
    "returnType" "VisitReturnType",
    "notes" TEXT,
    "visitorSignature" TEXT,
    "responsibleSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyVisit_propertyId_idx" ON "PropertyVisit"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyVisit_visitDate_idx" ON "PropertyVisit"("visitDate");

-- CreateIndex
CREATE INDEX "PropertyVisit_visitorName_idx" ON "PropertyVisit"("visitorName");

-- CreateIndex
CREATE INDEX "PropertyVisit_visitorPhone_idx" ON "PropertyVisit"("visitorPhone");

-- AddForeignKey
ALTER TABLE "PropertyVisit"
ADD CONSTRAINT "PropertyVisit_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;