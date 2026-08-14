ALTER TABLE "Property"
RENAME COLUMN "consultantScore" TO "internalNotes";

ALTER TABLE "Property"
ALTER COLUMN "internalNotes" TYPE TEXT
USING "internalNotes"::text;