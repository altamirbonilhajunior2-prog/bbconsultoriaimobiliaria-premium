-- CreateEnum
CREATE TYPE "AcquisitionSource" AS ENUM ('OLX', 'ZAP', 'VIVAREAL', 'IMOVELWEB', 'SITE_IMOBILIARIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "AcquisitionOrigin" AS ENUM ('PROPRIETARIO', 'IMOBILIARIA', 'CORRETOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "AcquisitionStatus" AS ENUM ('ENCONTRADO', 'SELECIONADO', 'CONTATADO', 'AGUARDANDO_AUTORIZACAO', 'AUTORIZADO', 'PUBLICADO', 'DESCARTADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('NAO_SOLICITADA', 'PENDENTE', 'AUTORIZADA', 'NEGADA', 'REVOGADA');

-- CreateTable
CREATE TABLE "AcquisitionOpportunity" (
    "id" SERIAL NOT NULL,
    "source" "AcquisitionSource" NOT NULL,
    "sourceUrl" VARCHAR(1000) NOT NULL,
    "origin" "AcquisitionOrigin",
    "status" "AcquisitionStatus" NOT NULL DEFAULT 'ENCONTRADO',
    "authorizationStatus" "AuthorizationStatus" NOT NULL DEFAULT 'NAO_SOLICITADA',
    "sourceTitle" VARCHAR(250),
    "state" VARCHAR(2) NOT NULL DEFAULT 'SP',
    "city" VARCHAR(120) NOT NULL DEFAULT 'São José dos Campos',
    "neighborhood" VARCHAR(150),
    "development" VARCHAR(180),
    "location" VARCHAR(250),
    "purpose" "PropertyPurpose",
    "propertyType" "PropertyType",
    "price" DECIMAL(15,2),
    "rentalPrice" DECIMAL(15,2),
    "condominium" DECIMAL(12,2),
    "iptu" DECIMAL(12,2),
    "area" DECIMAL(10,2),
    "landArea" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "suites" INTEGER,
    "bathrooms" INTEGER,
    "parking" INTEGER,
    "contactName" VARCHAR(180),
    "contactPhone" VARCHAR(30),
    "contactEmail" VARCHAR(180),
    "score" INTEGER,
    "scoreReason" TEXT,
    "internalNotes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "authorizationRequestedAt" TIMESTAMP(3),
    "authorizationAt" TIMESTAMP(3),
    "authorizationNotes" TEXT,
    "authorizedToAdvertise" BOOLEAN NOT NULL DEFAULT false,
    "authorizedToUseImages" BOOLEAN NOT NULL DEFAULT false,
    "authorizedToEditImages" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcquisitionOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcquisitionOpportunity_sourceUrl_key" ON "AcquisitionOpportunity"("sourceUrl");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_source_idx" ON "AcquisitionOpportunity"("source");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_origin_idx" ON "AcquisitionOpportunity"("origin");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_status_idx" ON "AcquisitionOpportunity"("status");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_authorizationStatus_idx" ON "AcquisitionOpportunity"("authorizationStatus");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_city_idx" ON "AcquisitionOpportunity"("city");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_neighborhood_idx" ON "AcquisitionOpportunity"("neighborhood");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_price_idx" ON "AcquisitionOpportunity"("price");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_score_idx" ON "AcquisitionOpportunity"("score");

-- CreateIndex
CREATE INDEX "AcquisitionOpportunity_createdAt_idx" ON "AcquisitionOpportunity"("createdAt");
