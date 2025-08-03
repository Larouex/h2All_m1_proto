import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { verifyToken } from "@/lib/auth";
import type { UserEntity } from "@/types/user";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const tableName = "users";

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials and table client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableClient = new TableClient(tableEndpoint, tableName, credential);

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

    // Verify JWT token
    const payload = verifyToken(authToken);

    if (!payload) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // Get updated user data from database
    try {
      const userEntity = await tableClient.getEntity<UserEntity>(
        "users",
        payload.userId
      );

      // Check if user account is still active
      if (!userEntity.IsActive) {
        return NextResponse.json(
          {
            authenticated: false,
            error: "Account is inactive",
          },
          { status: 403 }
        );
      }

      // Return user data (without sensitive information)
      return NextResponse.json({
        authenticated: true,
        user: {
          id: userEntity.rowKey,
          email: userEntity.Email,
          firstName: userEntity.FirstName,
          lastName: userEntity.LastName,
          country: userEntity.Country,
          balance: userEntity.Balance || 0,
          isActive: userEntity.IsActive,
          isAdmin: userEntity.IsAdmin || false, // Include admin flag
          lastLoginAt: userEntity.LastLoginAt,
          totalRedemptions: userEntity.TotalRedemptions || 0,
          totalRedemptionValue: userEntity.TotalRedemptionValue || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      const azureError = error as { statusCode?: number };

      if (azureError.statusCode === 404) {
        return NextResponse.json(
          {
            authenticated: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Error in auth status API:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
