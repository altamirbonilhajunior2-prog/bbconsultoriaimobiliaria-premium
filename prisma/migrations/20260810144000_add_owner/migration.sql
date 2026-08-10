CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(180),
    "rg" VARCHAR(30),
    "cpf" VARCHAR(20),
    "address" VARCHAR(250),
    "complement" VARCHAR(120),
    "neighborhood" VARCHAR(150),
    "city" VARCHAR(120),
    "state" VARCHAR(2),
    "zipCode" VARCHAR(12),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Owner_cpf_key" ON "Owner"("cpf");

CREATE INDEX "Owner_name_idx" ON "Owner"("name");
CREATE INDEX "Owner_phone_idx" ON "Owner"("phone");
CREATE INDEX "Owner_email_idx" ON "Owner"("email");