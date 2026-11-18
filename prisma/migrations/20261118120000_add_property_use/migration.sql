CREATE TYPE "PropertyUse" AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'MISTO');

ALTER TABLE "Property" ADD COLUMN "propertyUse" "PropertyUse";
