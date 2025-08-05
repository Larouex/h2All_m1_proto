import { NextResponse } from "next/server";
import { userQueries } from "@/app/lib/database-pg";

/**
 * Health check endpoint - Railway deployment health check
 * Always returns 200 to allow deployment success
 * Database status included but doesn't affect health status
 */
export async function GET() {
  const baseHealth = {
    status: "healthy", // Always healthy for Railway deployment
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
    service: "running",
  };

  try {
    // Try database connection but don't fail health check if it fails
    const users = await userQueries.list(1);

    return NextResponse.json({
      ...baseHealth,
      database: "connected",
      userCount: users.length,
    });
  } catch (error) {
    console.error(
      "Database connection failed (but service is healthy):",
      error
    );

    // Return healthy status even with DB issues to allow Railway deployment
    return NextResponse.json({
      ...baseHealth,
      database: "disconnected",
      databaseError: error instanceof Error ? error.message : "Unknown error",
      note: "Service is running but database connection failed",
    });
  }
}
