import "dotenv/config";
import { defineConfig } from "prisma/config";

const productionDatabaseUrl =
  process.env["DATABASE_URL_UNPOOLED"];

const databaseUrl =
  productionDatabaseUrl ??
  process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL não está configurada.",
  );
}

const shadowDatabaseUrl =
  productionDatabaseUrl
    ? undefined
    : process.env[
        "SHADOW_DATABASE_URL"
      ];

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl,

    ...(shadowDatabaseUrl
      ? {
          shadowDatabaseUrl,
        }
      : {}),
  },
});