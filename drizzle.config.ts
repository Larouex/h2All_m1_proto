import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || process.env.USER,
        database: process.env.DB_NAME || "h2all_m1_proto",
        ssl: process.env.NODE_ENV === "production",
        // Only include password if it's set
        ...(process.env.DB_PASSWORD && { password: process.env.DB_PASSWORD }),
      },
});
