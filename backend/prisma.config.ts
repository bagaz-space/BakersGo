import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    // directUrl is required by Neon for prisma migrate (non-pooled connection)
    // @ts-ignore - directUrl supported in Neon/Prisma v7
    directUrl: process.env["DIRECT_URL"],
  },
});
