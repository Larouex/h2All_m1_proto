import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";

async function testGet(request: NextRequest) {
  console.log("🧪 TEST API - GET request received");
  return NextResponse.json({
    success: true,
    message: "Test API is working",
    timestamp: new Date().toISOString(),
  });
}

async function testPost(request: NextRequest) {
  try {
    console.log("🧪 TEST API - POST request received");
    const body = await request.json();
    console.log("🧪 TEST API - Body received:", body);

    return NextResponse.json({
      success: true,
      message: "Test POST API is working",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("🧪 TEST API - Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test API error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Secure test endpoints - public access with origin validation
export const GET = withSecurity(testGet, SECURITY_CONFIGS.PUBLIC);
export const POST = withSecurity(testPost, SECURITY_CONFIGS.PUBLIC);
