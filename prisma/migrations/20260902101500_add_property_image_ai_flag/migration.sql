ALTER TABLE "PropertyImage"
ADD COLUMN "isAiGenerated" BOOLEAN NOT NULL DEFAULT false;

-- Preserva imagens antigas ja reconhecidas como ambientadas por IA.
UPDATE "PropertyImage"
SET "isAiGenerated" = true
WHERE COALESCE("alt", '') ~* 'BB[A-Z][[:space:]]*[0-9]+[[:space:]]*-[[:space:]]*[0-9]{2}_'
   OR REPLACE(COALESCE("url", ''), '%20', ' ') ~* 'BB[A-Z][[:space:]]*[0-9]+[[:space:]]*-[[:space:]]*[0-9]{2}_';
