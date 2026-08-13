ALTER TABLE "Property"
ADD COLUMN "coCaptorId" INTEGER;


CREATE INDEX "Property_coCaptorId_idx"
ON "Property"("coCaptorId");


ALTER TABLE "Property"
ADD CONSTRAINT "Property_coCaptorId_fkey"
FOREIGN KEY ("coCaptorId")
REFERENCES "Agent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;