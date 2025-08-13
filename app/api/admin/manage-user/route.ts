import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { userQueries } from "@/app/lib/database-pg";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

async function handlePOST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authToken = request.cookies.get("auth-token")?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = await verifyToken(authToken);
    if (!tokenPayload || !tokenPayload.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { email, isAdmin } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the user by email
    try {
      const user = await userQueries.findByEmail(email.toLowerCase());

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update the user's admin status
      const updatedUser = await userQueries.update(user.id, {
        isAdmin: isAdmin === true,
      });

      return NextResponse.json({
        message: `User ${email} admin status updated successfully`,
        user: {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isAdmin: updatedUser.isAdmin,
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating user admin status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.ADMIN);

async function handleGET() {
  return NextResponse.json({
    message: "Admin User Management API",
    usage: {
      POST: {
        description: "Update user admin status",
        body: {
          email: "user@example.com",
          isAdmin: true, // or false
        },
      },
    },
  });
}

export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
