-- Review only: do not apply without production authorization.
CREATE TABLE "AdvertisingConsent" (
  "id" UUID NOT NULL,
  "sessionId" UUID NOT NULL,
  "revision" INTEGER NOT NULL,
  "version" VARCHAR(50) NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "AdvertisingConsent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdvertisingConsent_expiresAt_idx" ON "AdvertisingConsent"("expiresAt");
ALTER TABLE "PortalLead" ADD COLUMN "advertisingConsentId" UUID;
ALTER TABLE "WhatsAppLeadIntent" ADD COLUMN "advertisingConsentId" UUID;
-- No backfill or historical cleanup. 90-day retention remains pending approval.

CREATE UNIQUE INDEX "AdvertisingConsent_sessionId_revision_key" ON "AdvertisingConsent"("sessionId", "revision");
CREATE TABLE "AdvertisingConsentSession" (
  "id" UUID NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "activeReceiptId" UUID,
  "lastGrantAt" TIMESTAMP(3),
  CONSTRAINT "AdvertisingConsentSession_pkey" PRIMARY KEY ("id")
);

-- Local draft only. No migration was executed. Existing contacts remain unchanged.
ALTER TABLE "WhatsAppLeadIntent" ADD COLUMN "interactionId" UUID;
CREATE UNIQUE INDEX "WhatsAppLeadIntent_interactionId_key" ON "WhatsAppLeadIntent"("interactionId");
