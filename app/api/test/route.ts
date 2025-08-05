import { NextResponse } from "next/server";

/**
 * Simple test endpoint to verify API routing works on Railway
 */
export async function GET() {
  return NextResponse.json({
    message: "API routing is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    railway: process.env.RAILWAY_ENVIRONMENT_NAME || "unknown",
  });
}
