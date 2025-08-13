import { NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";

/**
 * Health check endpoint - Railway deployment health check
 * Simplified to always return 200 for successful Railway deployments
 * Database check moved to separate endpoint to avoid deployment issues
 * Now protected with basic security (origin validation)
 */
async function healthHandler() {
  // Always return healthy status to allow Railway deployment success
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
    service: "running",
    message: "Service is operational with security enabled",
  });
}

// Wrap the handler with basic security (public access, origin validation only)
export const GET = withSecurity(healthHandler, SECURITY_CONFIGS.PUBLIC);
