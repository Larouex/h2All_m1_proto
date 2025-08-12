import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("🧪 TEST API - GET request received");
  return NextResponse.json({
    success: true,
    message: "Test API is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
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
