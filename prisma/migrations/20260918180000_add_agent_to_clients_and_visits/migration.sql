-- Vincula clientes e visitas ao corretor responsável sem alterar dados existentes.

ALTER TABLE "Client"
ADD COLUMN "agentId" INTEGER;

ALTER TABLE "PropertyVisit"
ADD COLUMN "agentId" INTEGER;

CREATE INDEX "Client_agentId_idx"
ON "Client"("agentId");

CREATE INDEX "PropertyVisit_agentId_idx"
ON "PropertyVisit"("agentId");

ALTER TABLE "Client"
ADD CONSTRAINT "Client_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PropertyVisit"
ADD CONSTRAINT "PropertyVisit_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;