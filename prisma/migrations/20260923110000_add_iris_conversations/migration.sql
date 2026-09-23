CREATE TYPE "IrisConversationChannel" AS ENUM (
  'WHATSAPP',
  'PORTAL'
);

CREATE TYPE "IrisConversationStatus" AS ENUM (
  'IRIS_ATENDENDO',
  'AGUARDANDO_CLIENTE',
  'HANDOFF',
  'CORRETOR_ASSUMIU',
  'ENCERRADO'
);

CREATE TYPE "IrisMessageAuthor" AS ENUM (
  'CLIENTE',
  'IRIS',
  'CORRETOR',
  'SISTEMA'
);

CREATE TYPE "IrisMessageDirection" AS ENUM (
  'ENTRADA',
  'SAIDA',
  'INTERNA'
);

CREATE TABLE "IrisConversation" (
  "id" SERIAL NOT NULL,
  "channel" "IrisConversationChannel" NOT NULL,
  "status" "IrisConversationStatus" NOT NULL DEFAULT 'IRIS_ATENDENDO',
  "clientId" INTEGER,
  "agentId" INTEGER,
  "externalContactId" VARCHAR(120),
  "contactName" VARCHAR(180),
  "contactPhone" VARCHAR(30),
  "summary" TEXT,
  "searchProfile" JSONB,
  "handoffReason" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "handedOffAt" TIMESTAMP(3),
  "agentAssumedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IrisConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IrisMessage" (
  "id" SERIAL NOT NULL,
  "conversationId" INTEGER NOT NULL,
  "author" "IrisMessageAuthor" NOT NULL,
  "direction" "IrisMessageDirection" NOT NULL,
  "externalMessageId" VARCHAR(255),
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "IrisMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IrisMessage_externalMessageId_key"
ON "IrisMessage"("externalMessageId");

CREATE INDEX "IrisConversation_clientId_idx"
ON "IrisConversation"("clientId");

CREATE INDEX "IrisConversation_agentId_idx"
ON "IrisConversation"("agentId");

CREATE INDEX "IrisConversation_channel_idx"
ON "IrisConversation"("channel");

CREATE INDEX "IrisConversation_status_idx"
ON "IrisConversation"("status");

CREATE INDEX "IrisConversation_externalContactId_idx"
ON "IrisConversation"("externalContactId");

CREATE INDEX "IrisConversation_contactPhone_idx"
ON "IrisConversation"("contactPhone");

CREATE INDEX "IrisConversation_lastMessageAt_idx"
ON "IrisConversation"("lastMessageAt");

CREATE INDEX "IrisConversation_createdAt_idx"
ON "IrisConversation"("createdAt");

CREATE INDEX "IrisMessage_conversationId_idx"
ON "IrisMessage"("conversationId");

CREATE INDEX "IrisMessage_author_idx"
ON "IrisMessage"("author");

CREATE INDEX "IrisMessage_direction_idx"
ON "IrisMessage"("direction");

CREATE INDEX "IrisMessage_createdAt_idx"
ON "IrisMessage"("createdAt");

ALTER TABLE "IrisConversation"
ADD CONSTRAINT "IrisConversation_clientId_fkey"
FOREIGN KEY ("clientId")
REFERENCES "Client"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "IrisConversation"
ADD CONSTRAINT "IrisConversation_agentId_fkey"
FOREIGN KEY ("agentId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "IrisMessage"
ADD CONSTRAINT "IrisMessage_conversationId_fkey"
FOREIGN KEY ("conversationId")
REFERENCES "IrisConversation"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;