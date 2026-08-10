ALTER TABLE "Property"
ADD COLUMN "ownerId" INTEGER;

CREATE INDEX "Property_ownerId_idx"
ON "Property"("ownerId");

ALTER TABLE "Property"
ADD CONSTRAINT "Property_ownerId_fkey"
FOREIGN KEY ("ownerId")
REFERENCES "Owner"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;