-- CreateTable
CREATE TABLE "MarketReference" (
    "id" SERIAL NOT NULL,
    "state" VARCHAR(2) NOT NULL DEFAULT 'SP',
    "city" VARCHAR(120) NOT NULL,
    "neighborhood" VARCHAR(150) NOT NULL,
    "purpose" "PropertyPurpose" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "areaMin" DECIMAL(10,2),
    "areaMax" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "pricePerSquareMeterMin" DECIMAL(12,2) NOT NULL,
    "pricePerSquareMeterMax" DECIMAL(12,2) NOT NULL,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketEvidence" (
    "id" SERIAL NOT NULL,
    "marketReferenceId" INTEGER NOT NULL,
    "source" VARCHAR(120) NOT NULL,
    "sourceUrl" VARCHAR(1000) NOT NULL,
    "researchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propertyType" "PropertyType" NOT NULL,
    "purpose" "PropertyPurpose" NOT NULL,
    "area" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "price" DECIMAL(15,2),
    "pricePerSquareMeter" DECIMAL(12,2),
    "development" VARCHAR(180),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeighborhoodMapLocation" (
    "id" SERIAL NOT NULL,
    "state" VARCHAR(2) NOT NULL DEFAULT 'SP',
    "city" VARCHAR(120) NOT NULL,
    "normalizedName" VARCHAR(180) NOT NULL,
    "displayName" VARCHAR(180) NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 700,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" VARCHAR(180),
    "sourceUrl" VARCHAR(1000),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NeighborhoodMapLocation_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Property"
ADD COLUMN "mapEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "mapRadiusMeters" INTEGER NOT NULL DEFAULT 700;

-- Correct the neighborhood confirmed by B&B before neighborhood map matching.
UPDATE "Property"
SET "neighborhood" = 'Residencial Mantiqueira'
WHERE "state" = 'SP'
  AND "city" = 'São José dos Campos'
  AND "neighborhood" = 'Zona Norte';

UPDATE "Property"
SET "city" = 'Ubatuba',
    "neighborhood" = 'Itaguá'
WHERE "state" = 'SP'
  AND "city" = 'São José dos Campos'
  AND "neighborhood" IN ('Itaguá', 'Itaguá''');

UPDATE "Property"
SET "city" = 'Jacareí'
WHERE "state" = 'SP'
  AND "city" = 'São José dos Campos'
  AND "neighborhood" = 'Villa Branca';

-- CreateIndex
CREATE INDEX "MarketReference_city_neighborhood_idx" ON "MarketReference"("city", "neighborhood");
CREATE INDEX "MarketReference_purpose_propertyType_idx" ON "MarketReference"("purpose", "propertyType");
CREATE INDEX "MarketReference_active_calculatedAt_idx" ON "MarketReference"("active", "calculatedAt");
CREATE INDEX "MarketEvidence_marketReferenceId_idx" ON "MarketEvidence"("marketReferenceId");
CREATE INDEX "MarketEvidence_source_idx" ON "MarketEvidence"("source");
CREATE INDEX "MarketEvidence_researchedAt_idx" ON "MarketEvidence"("researchedAt");
CREATE UNIQUE INDEX "NeighborhoodMapLocation_state_city_normalizedName_key" ON "NeighborhoodMapLocation"("state", "city", "normalizedName");
CREATE INDEX "NeighborhoodMapLocation_state_city_idx" ON "NeighborhoodMapLocation"("state", "city");
CREATE INDEX "NeighborhoodMapLocation_active_idx" ON "NeighborhoodMapLocation"("active");

-- AddForeignKey
ALTER TABLE "MarketEvidence" ADD CONSTRAINT "MarketEvidence_marketReferenceId_fkey" FOREIGN KEY ("marketReferenceId") REFERENCES "MarketReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
