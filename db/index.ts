import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Database configuration - Railway compatible
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || process.env.USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "h2all_m1_proto",
      ssl: false,
    };

// Create connection pool
const pool = new Pool(dbConfig);

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  // For local development, assume it's always available
  // In production, you might want to add actual connectivity checks
  return true;
}

// Helper function for API routes to check environment and return early response if not available
export function checkDatabaseAvailability() {
  if (!isDatabaseAvailable()) {
    return {
      available: false,
      response: new Response(
        JSON.stringify({
          error:
            "Service temporarily unavailable - database connection missing",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }
  return { available: true };
}

// Export schema for use in other files
export * from "./schema";
