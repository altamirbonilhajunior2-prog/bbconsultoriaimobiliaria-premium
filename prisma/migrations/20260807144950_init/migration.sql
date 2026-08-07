-- CreateEnum
CREATE TYPE "PropertyPurpose" AS ENUM ('VENDA', 'LOCACAO', 'VENDA_E_LOCACAO');

-- CreateEnum
CREATE TYPE "OpportunityProfile" AS ENUM ('MORADIA', 'INVESTIMENTO', 'RENDA', 'VALORIZACAO', 'LANCAMENTO');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'RURAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'EM_ANALISE');

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220),
    "purpose" "PropertyPurpose" NOT NULL,
    "opportunityProfiles" "OpportunityProfile"[] DEFAULT ARRAY[]::"OpportunityProfile"[],
    "propertyType" "PropertyType" NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'EM_ANALISE',
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "consultantScore" DECIMAL(3,1),
    "tag" VARCHAR(100),
    "state" VARCHAR(2) NOT NULL DEFAULT 'SP',
    "city" VARCHAR(120) NOT NULL DEFAULT 'São José dos Campos',
    "neighborhood" VARCHAR(150) NOT NULL,
    "development" VARCHAR(180),
    "location" VARCHAR(250),
    "address" VARCHAR(250),
    "zipCode" VARCHAR(12),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "googleMapsUrl" TEXT,
    "price" DECIMAL(15,2),
    "rentalPrice" DECIMAL(15,2),
    "condominium" DECIMAL(12,2),
    "iptu" DECIMAL(12,2),
    "area" DECIMAL(10,2),
    "landArea" DECIMAL(10,2),
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "suites" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "parking" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video" TEXT,
    "virtualTour" TEXT,
    "brochure" TEXT,
    "seoTitle" VARCHAR(200),
    "seoDescription" VARCHAR(300),
    "seoImage" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "alt" VARCHAR(250),
    "position" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_code_key" ON "Property"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_purpose_idx" ON "Property"("purpose");

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_neighborhood_idx" ON "Property"("neighborhood");

-- CreateIndex
CREATE INDEX "Property_highlight_idx" ON "Property"("highlight");

-- CreateIndex
CREATE INDEX "Property_published_idx" ON "Property"("published");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_position_idx" ON "PropertyImage"("propertyId", "position");

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
