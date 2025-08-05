import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  campaigns,
  redemptionCodes,
  users,
  projects,
  subscriptions,
} from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    // This is a destructive operation - add extra validation
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Basic security check - ensure request is coming from admin interface
    if (!referer.includes("/admin")) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: This operation can only be performed from the admin interface",
        },
        { status: 403 }
      );
    }

    console.log("🚨 DATABASE CLEAN OPERATION INITIATED");
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🔗 Referer:", referer);
    console.log("🤖 User Agent:", userAgent);

    // Get counts before deletion for reporting
    const beforeStats = {
      campaigns: await db.select().from(campaigns),
      codes: await db.select().from(redemptionCodes),
      users: await db.select().from(users),
      projects: await db.select().from(projects),
      subscriptions: await db.select().from(subscriptions),
    };

    console.log("📊 Before deletion counts:", {
      campaigns: beforeStats.campaigns.length,
      codes: beforeStats.codes.length,
      users: beforeStats.users.length,
      projects: beforeStats.projects.length,
      subscriptions: beforeStats.subscriptions.length,
    });

    // Delete all data from all tables in correct order (foreign key dependencies)
    // Delete child tables first, then parent tables

    console.log("🗑️ Deleting redemption codes...");
    await db.delete(redemptionCodes);

    console.log("🗑️ Deleting campaigns...");
    await db.delete(campaigns);

    console.log("🗑️ Deleting users...");
    await db.delete(users);

    console.log("🗑️ Deleting projects...");
    await db.delete(projects);

    console.log("🗑️ Deleting subscriptions...");
    await db.delete(subscriptions);

    console.log("✅ DATABASE CLEAN OPERATION COMPLETED");

    const deletedCounts = {
      campaigns: beforeStats.campaigns.length,
      codes: beforeStats.codes.length,
      users: beforeStats.users.length,
      projects: beforeStats.projects.length,
      subscriptions: beforeStats.subscriptions.length,
    };

    const totalDeleted = Object.values(deletedCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${totalDeleted} records total`,
      deleted: deletedCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DATABASE CLEAN OPERATION FAILED:", error);
    return NextResponse.json(
      {
        error: "Failed to clean database",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
