-- CreateEnum
CREATE TYPE "PropertyVisitStatus" AS ENUM (
  'AGENDADA',
  'REALIZADA',
  'CANCELADA'
);

-- AlterTable
ALTER TABLE "PropertyVisit"
ADD COLUMN "status" "PropertyVisitStatus" NOT NULL DEFAULT 'REALIZADA';

-- CreateIndex
CREATE INDEX "PropertyVisit_status_idx"
ON "PropertyVisit"("status");