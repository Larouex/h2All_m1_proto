import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const userData = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        country: users.country,
        balance: users.balance,
        isActive: users.isActive,
        isAdmin: users.isAdmin,
        totalRedemptions: users.totalRedemptions,
        totalRedemptionValue: users.totalRedemptionValue,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    // Convert to CSV format (excluding password hash for security)
    const headers = [
      "id",
      "email",
      "firstName",
      "lastName",
      "country",
      "balance",
      "isActive",
      "isAdmin",
      "totalRedemptions",
      "totalRedemptionValue",
      "createdAt",
      "lastLoginAt",
      "updatedAt",
    ];
    const csvRows = [
      headers.join(","),
      ...userData.map((user) =>
        headers
          .map((header) => {
            const value = user[header as keyof typeof user];
            // Handle special cases for CSV formatting
            if (value === null || value === undefined) return "";
            if (typeof value === "string" && value.includes(",")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_export_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
}

// Note: User import is intentionally restricted for security and privacy reasons
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "User data import is restricted for security and privacy compliance",
      message:
        "Please use the user management interface for individual user operations",
    },
    { status: 403 }
  );
}
