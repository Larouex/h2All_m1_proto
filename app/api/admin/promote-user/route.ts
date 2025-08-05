import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { userQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

/**
 * @swagger
 * /api/admin/promote-user:
 *   post:
 *     summary: Promote user to admin (Admin only)
 *     description: Promotes a user to admin status. Only accessible by existing admins.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of user to promote
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: User promoted successfully
 *       403:
 *         description: Access denied - admin required
 *       404:
 *         description: User not found
 */
export async function POST(request: NextRequest) {
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      // Get user by email
      const user = await userQueries.findByEmail(email.toLowerCase());

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update user to admin
      const updatedUser = await userQueries.update(user.id, {
        isAdmin: true,
      });

      return NextResponse.json({
        message: `User ${email} promoted to admin successfully`,
        user: {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isAdmin: updatedUser.isAdmin,
        },
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in promote user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/promote-user:
 *   get:
 *     summary: Get instructions for promoting users
 *     description: Returns instructions for promoting users to admin
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Instructions returned
 */
export async function GET() {
  return NextResponse.json({
    message: "User Promotion API",
    usage: {
      method: "POST",
      body: { email: "user@example.com" },
      note: "Only admins can promote users",
    },
    firstAdminSetup: {
      note: "To create the first admin user, manually update the database:",
      instruction: "Set IsAdmin=true for a user in the PostgreSQL database",
    },
  });
}
