CREATE TYPE "DevelopmentType" AS ENUM ('CONDOMINIO', 'EDIFICIO');

CREATE TABLE "Development" (
  "id" SERIAL NOT NULL,
  "type" "DevelopmentType" NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "normalizedName" VARCHAR(180) NOT NULL,
  "state" VARCHAR(2) NOT NULL DEFAULT 'SP',
  "city" VARCHAR(120) NOT NULL,
  "neighborhood" VARCHAR(150) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Development_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Development_state_city_neighborhood_normalizedName_key"
ON "Development"("state", "city", "neighborhood", "normalizedName");

CREATE INDEX "Development_state_city_idx"
ON "Development"("state", "city");

CREATE INDEX "Development_neighborhood_idx"
ON "Development"("neighborhood");

CREATE INDEX "Development_type_idx"
ON "Development"("type");

CREATE INDEX "Development_active_idx"
ON "Development"("active");
