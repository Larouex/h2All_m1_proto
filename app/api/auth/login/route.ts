import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { authenticate, createJWT } from "../../../lib/auth";

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticate(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createJWT({
      userId: user.rowKey,
      email: user.Email,
      isAdmin: user.IsAdmin || false,
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.rowKey,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          country: user.Country,
          balance: user.Balance || 0,
          isActive: user.IsActive,
          isAdmin: user.IsAdmin || false,
          lastLoginAt: user.LastLoginAt,
          totalRedemptions: user.TotalRedemptions || 0,
          totalRedemptionValue: user.TotalRedemptionValue || 0,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export secured handler
export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.PUBLIC);
