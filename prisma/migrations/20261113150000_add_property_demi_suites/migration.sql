ALTER TABLE "Property" ADD COLUMN "demiSuites" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD CONSTRAINT "Property_demiSuites_nonnegative" CHECK ("demiSuites" >= 0);
