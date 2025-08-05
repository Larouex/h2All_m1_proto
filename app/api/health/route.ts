import { NextResponse } from "next/server";
import { userQueries } from "@/app/lib/database-pg";

/**
 * Health check endpoint - tests database connectivity for Railway
 */
export async function GET() {
  try {
    // Simple database connectivity test
    const users = await userQueries.list(1);

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      userCount: users.length,
      environment: process.env.NODE_ENV || "development",
      railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      { status: 503 }
    );
  }
}
