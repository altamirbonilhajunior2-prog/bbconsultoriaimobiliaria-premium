-- Vincula leads do portal ao corretor responsavel pela distribuicao da roleta.

ALTER TABLE "PortalLead"
ADD COLUMN "agentId" INTEGER;

CREATE INDEX "PortalLead_agentId_idx"
ON "PortalLead"("agentId");

ALTER TABLE "PortalLead"
ADD CONSTRAINT "PortalLead_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
