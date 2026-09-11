ALTER TABLE "MarketReference"
ADD COLUMN "development" VARCHAR(180);

CREATE INDEX "MarketReference_city_neighborhood_development_idx"
ON "MarketReference"("city", "neighborhood", "development");
