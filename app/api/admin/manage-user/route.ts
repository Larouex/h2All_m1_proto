import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
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

// Helper function to encode email for rowKey (MUST match registration exactly)
function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

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

    const { email, isAdmin } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const partitionKey = "users";
    const rowKey = encodeEmailToRowKey(email);

    // Get the user
    try {
      const userEntity = await tableClient!.getEntity<UserEntity>(
        partitionKey,
        rowKey
      );

      // Update the user's admin status
      const updatedUser = {
        ...userEntity,
        IsAdmin: isAdmin === true,
        UpdatedAt: new Date().toISOString(),
      };

      await tableClient!.updateEntity(updatedUser, "Replace");

      return NextResponse.json({
        message: `User ${email} admin status updated successfully`,
        user: {
          email: userEntity.Email,
          firstName: userEntity.FirstName,
          lastName: userEntity.LastName,
          isAdmin: isAdmin === true,
        },
      });
    } catch (error) {
      const azureError = error as { statusCode?: number };
      if (azureError.statusCode === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
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

export async function GET() {
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
