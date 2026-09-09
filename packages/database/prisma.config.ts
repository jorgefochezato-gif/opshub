import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(process.cwd(), "../../.env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
