-- Vincula opcionalmente a conversa da Íris ao imóvel de origem sem alterar dados existentes.

ALTER TABLE "IrisConversation"
ADD COLUMN "propertyId" INTEGER;

CREATE INDEX "IrisConversation_propertyId_idx"
ON "IrisConversation"("propertyId");

ALTER TABLE "IrisConversation"
ADD CONSTRAINT "IrisConversation_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
