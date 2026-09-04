CREATE TYPE "ClientStatus" AS ENUM (
  'ATIVO',
  'INATIVO',
  'CONVERTIDO'
);

CREATE TABLE "Client" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "phone" VARCHAR(30) NOT NULL,
  "email" VARCHAR(180),
  "document" VARCHAR(40),
  "birthDate" TIMESTAMP(3),
  "address" VARCHAR(300),
  "notes" TEXT,
  "status" "ClientStatus" NOT NULL DEFAULT 'ATIVO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PortalLead"
ADD COLUMN "clientId" INTEGER;

ALTER TABLE "PropertyVisit"
ADD COLUMN "clientId" INTEGER;

CREATE INDEX "Client_name_idx"
ON "Client"("name");

CREATE INDEX "Client_phone_idx"
ON "Client"("phone");

CREATE INDEX "Client_email_idx"
ON "Client"("email");

CREATE INDEX "Client_status_idx"
ON "Client"("status");

CREATE INDEX "PortalLead_clientId_idx"
ON "PortalLead"("clientId");

CREATE INDEX "PropertyVisit_clientId_idx"
ON "PropertyVisit"("clientId");

ALTER TABLE "PortalLead"
ADD CONSTRAINT "PortalLead_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PropertyVisit"
ADD CONSTRAINT "PropertyVisit_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;