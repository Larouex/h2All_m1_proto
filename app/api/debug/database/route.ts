import { NextResponse } from "next/server";
import { userQueries } from "@/app/lib/database-pg";

/**
 * Database diagnostics endpoint - detailed database connection testing
 * This endpoint provides detailed database connection information
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
    connectionConfig: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      urlPrefix: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + "..."
        : "none",
      nodeEnv: process.env.NODE_ENV,
    },
  };

  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    const users = await userQueries.list(1);

    console.log("✅ Database connection successful");

    return NextResponse.json({
      ...diagnostics,
      status: "success",
      database: {
        connected: true,
        userCount: users.length,
        testPassed: true,
      },
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    return NextResponse.json(
      {
        ...diagnostics,
        status: "error",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
          testPassed: false,
        },
      },
      { status: 200 }
    ); // Still return 200 for debugging purposes
  }
}
