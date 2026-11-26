ALTER TABLE "Client"
  ADD COLUMN "cpf" VARCHAR(14),
  ADD COLUMN "rg" VARCHAR(40),
  ADD COLUMN "maritalStatus" VARCHAR(40),
  ADD COLUMN "profession" VARCHAR(180),
  ADD COLUMN "monthlyIncome" DECIMAL(15,2);
