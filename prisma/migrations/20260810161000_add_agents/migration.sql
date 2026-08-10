CREATE TYPE "AgentRole" AS ENUM ('ADMIN', 'CAPTADOR');

CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(30),
    "creci" VARCHAR(50),
    "role" "AgentRole" NOT NULL DEFAULT 'CAPTADOR',
    "passwordHash" VARCHAR(200) NOT NULL,
    "passwordSalt" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Agent_email_key"
ON "Agent"("email");

CREATE INDEX "Agent_name_idx"
ON "Agent"("name");

CREATE INDEX "Agent_role_idx"
ON "Agent"("role");

CREATE INDEX "Agent_active_idx"
ON "Agent"("active");

ALTER TABLE "Owner"
ADD COLUMN "capturedById" INTEGER;

ALTER TABLE "Property"
ADD COLUMN "captorId" INTEGER;

CREATE INDEX "Owner_capturedById_idx"
ON "Owner"("capturedById");

CREATE INDEX "Property_captorId_idx"
ON "Property"("captorId");

ALTER TABLE "Owner"
ADD CONSTRAINT "Owner_capturedById_fkey"
FOREIGN KEY ("capturedById")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Property"
ADD CONSTRAINT "Property_captorId_fkey"
FOREIGN KEY ("captorId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;