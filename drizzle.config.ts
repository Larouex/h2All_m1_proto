import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://larrywjordanjr@localhost:5432/h2all_m1_proto",
  },
} satisfies Config;