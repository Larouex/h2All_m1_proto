import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { isAdminUser } from "@/lib/auth";
import type { UserEntity } from "@/types/user";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

// Configuration constants - will be validated at runtime
const tableName = "users";

// Helper function to check if database configuration is available
function isDatabaseAvailable(): boolean {
  return !!(
    process.env.AZURE_STORAGE_ACCOUNT_NAME &&
    process.env.AZURE_STORAGE_ACCOUNT_KEY
  );
}

// Helper function to create table client
function createTableClient(): TableClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
  const tableEndpoint = `https://${accountName}.table.core.windows.net`;
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  return new TableClient(tableEndpoint, tableName, credential);
}

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
    // Check if database is available (environment variables present)
    if (!isDatabaseAvailable()) {
      console.log("Database configuration not available");
      return NextResponse.json(
        { error: "Database service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Create table client with validated environment variables
    const tableClient = createTableClient();

    // Check if current user is admin
    if (!isAdminUser(request)) {
      return NextResponse.json(
        { error: "Access denied - admin privileges required" },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Encode email for row key
    const rowKey = Buffer.from(email.toLowerCase()).toString("base64");

    try {
      // Get user entity
      const userEntity = await tableClient!.getEntity<UserEntity>(
        "user",
        rowKey
      );

      // Update user to admin
      const updatedUser = {
        partitionKey: userEntity.partitionKey,
        rowKey: userEntity.rowKey,
        IsAdmin: true,
        UpdatedAt: new Date().toISOString(),
      };

      await tableClient!.updateEntity(updatedUser, "Merge");

      return NextResponse.json({
        message: `User ${email} promoted to admin successfully`,
        user: {
          email: userEntity.Email,
          firstName: userEntity.FirstName,
          lastName: userEntity.LastName,
          isAdmin: true,
        },
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      const azureError = error as { statusCode?: number };

      if (azureError.statusCode === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

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
      instruction: "Set IsAdmin=true for a user in the Azure Storage table",
    },
  });
}
