import { NextResponse } from "next/server";

/**
 * Root health check endpoint - Alternative location for Railway
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "h2all-api",
    message: "Service operational",
  });
}
