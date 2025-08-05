import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Database configuration - Railway compatible with improved settings
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 10, // Reduced pool size for Railway
      min: 2, // Minimum connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for Railway
      acquireTimeoutMillis: 10000, // Time to wait for connection from pool
      statement_timeout: 30000, // 30s query timeout
      query_timeout: 30000,
      application_name: "h2all-railway",
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || process.env.USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "h2all_m1_proto",
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

// Create connection pool
const pool = new Pool(dbConfig);

// Add error handling for pool
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Test connection on startup (non-blocking)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    console.log("📊 Connection check passed");
    client.release();
  } catch (err) {
    console.error(
      "❌ Database connection failed during startup:",
      err instanceof Error ? err.message : err
    );
    console.error("🔧 Connection config check:", {
      hasUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      urlPrefix: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + "..."
        : "none",
    });
    // Don't throw - let the app start even if DB is unavailable initially
  }
};

// Run connection test but don't block startup
if (process.env.NODE_ENV === "production") {
  // In production, test connection after a short delay to allow Railway to fully initialize
  setTimeout(testConnection, 2000);
} else {
  // In development, test immediately
  testConnection();
}

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
