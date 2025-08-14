import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Database configuration - Production optimized for Railway
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 15, // Optimized for Railway shared resources
      min: 3, // Minimum connections for quick response
      idleTimeoutMillis: 30000, // 30s idle timeout
      connectionTimeoutMillis: 3000, // Fast connection timeout
      acquireTimeoutMillis: 3000, // Fast acquisition timeout
      statement_timeout: 10000, // 10s query timeout
      query_timeout: 10000,
      application_name: "h2all-production",
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || process.env.USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "h2all_m1_proto",
      ssl: false,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
      keepAlive: true,
    };

// Create connection pool with production monitoring
const pool = new Pool(dbConfig);

// Production error handling and monitoring
pool.on("error", (err) => {
  console.error("🚨 Database pool error:", {
    message: err.message,
    code: (err as any).code || "UNKNOWN",
    timestamp: new Date().toISOString(),
  });
});

pool.on("connect", () => {
  if (process.env.NODE_ENV === "production") {
    console.log("🔗 Database connection established");
  }
});

pool.on("remove", () => {
  if (process.env.NODE_ENV === "production") {
    console.log("🔌 Database connection removed from pool");
  }
});

// Production-ready connection validation
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as server_time");
    console.log("✅ Database connection validated", {
      serverTime: result.rows[0].server_time,
      poolSize: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    });
    client.release();
  } catch (err) {
    console.error("❌ Database connection validation failed:", {
      error: err instanceof Error ? err.message : err,
      hasUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    });
  }
};

// Initialize connection based on environment
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
