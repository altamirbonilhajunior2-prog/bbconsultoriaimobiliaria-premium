import "dotenv/config";

import locations from "../app/data/neighborhood-map-reviewed.json";
import { prisma } from "../lib/prisma";

async function main() {
  for (const location of locations) {
    await prisma.neighborhoodMapLocation.upsert({
      where: {
        state_city_normalizedName: {
          state: location.state,
          city: location.city,
          normalizedName: location.normalizedName,
        },
      },
      update: {
        displayName: location.displayName,
        aliases: location.aliases,
        latitude: location.latitude,
        longitude: location.longitude,
        radiusMeters: location.radiusMeters,
        source: location.source,
        sourceUrl: location.sourceUrl,
        verifiedAt: new Date(),
        active: true,
      },
      create: {
        ...location,
        verifiedAt: new Date(),
        active: true,
      },
    });
  }

  console.log(`${locations.length} localizações de bairro importadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
