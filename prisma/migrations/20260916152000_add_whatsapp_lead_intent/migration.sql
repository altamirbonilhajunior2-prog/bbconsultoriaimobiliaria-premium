CREATE TABLE "WhatsAppLeadIntent" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER,
    "propertyCode" VARCHAR(30),
    "sourcePage" VARCHAR(1000) NOT NULL,
    "referrer" VARCHAR(1000),
    "utmSource" VARCHAR(180),
    "utmMedium" VARCHAR(180),
    "utmCampaign" VARCHAR(250),
    "utmTerm" VARCHAR(250),
    "utmContent" VARCHAR(250),
    "gclid" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppLeadIntent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WhatsAppLeadIntent_propertyId_idx"
ON "WhatsAppLeadIntent"("propertyId");

CREATE INDEX "WhatsAppLeadIntent_propertyCode_idx"
ON "WhatsAppLeadIntent"("propertyCode");

CREATE INDEX "WhatsAppLeadIntent_utmSource_idx"
ON "WhatsAppLeadIntent"("utmSource");

CREATE INDEX "WhatsAppLeadIntent_utmCampaign_idx"
ON "WhatsAppLeadIntent"("utmCampaign");

CREATE INDEX "WhatsAppLeadIntent_gclid_idx"
ON "WhatsAppLeadIntent"("gclid");

CREATE INDEX "WhatsAppLeadIntent_createdAt_idx"
ON "WhatsAppLeadIntent"("createdAt");

ALTER TABLE "WhatsAppLeadIntent"
ADD CONSTRAINT "WhatsAppLeadIntent_propertyId_fkey"
FOREIGN KEY ("propertyId")
REFERENCES "Property"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;