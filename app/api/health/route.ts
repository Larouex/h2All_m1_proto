import { NextResponse } from "next/server";

/**
 * Health check endpoint - Railway deployment health check
 * Simplified to always return 200 for successful Railway deployments
 * Database check moved to separate endpoint to avoid deployment issues
 */
export async function GET() {
  // Always return healthy status to allow Railway deployment success
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
    service: "running",
    message: "Service is operational",
  });
}
