import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { userQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No authentication token found",
        },
        { status: 401 }
      );
    }

    // Verify token
    const tokenPayload = await verifyToken(authToken);

    if (!tokenPayload) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await userQueries.findById(tokenPayload.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "User not found or inactive",
        },
        { status: 404 }
      );
    }

    // Return user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        balance: Number(user.balance),
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        totalRedemptions: user.totalRedemptions,
        totalRedemptionValue: Number(user.totalRedemptionValue),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication verification failed",
      },
      { status: 500 }
    );
  }
}
