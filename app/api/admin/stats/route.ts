import { NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { users, campaigns, redemptionCodes } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

async function getAdminStats() {
  try {
    // Get total campaigns
    const totalCampaignsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns);
    const totalCampaigns = totalCampaignsResult[0]?.count || 0;

    // Get active campaigns
    const activeCampaignsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(eq(campaigns.isActive, true));
    const activeCampaigns = activeCampaignsResult[0]?.count || 0;

    // Get total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total redemption codes
    const totalCodesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(redemptionCodes);
    const totalCodes = totalCodesResult[0]?.count || 0;

    // Get redeemed codes (using isUsed field)
    const redeemedCodesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(redemptionCodes)
      .where(eq(redemptionCodes.isUsed, true));
    const redeemedCodes = redeemedCodesResult[0]?.count || 0;

    // Get recent activity (last 10 events)
    // For now, we'll get recent user registrations and code redemptions
    const recentUsers = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    const recentRedemptions = await db
      .select({
        id: redemptionCodes.id,
        uniqueCode: redemptionCodes.uniqueCode,
        userEmail: redemptionCodes.userEmail,
        redeemedAt: redemptionCodes.redeemedAt,
      })
      .from(redemptionCodes)
      .where(eq(redemptionCodes.isUsed, true))
      .orderBy(desc(redemptionCodes.redeemedAt))
      .limit(5);

    // Combine and format recent activity
    const recentActivity = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: "user" as const,
        description: `New user registration: ${user.email}`,
        timestamp: user.createdAt.toISOString(),
      })),
      ...recentRedemptions.map((redemption) => ({
        id: `redemption-${redemption.id}`,
        type: "redemption" as const,
        description: `Code ${redemption.uniqueCode} redeemed by ${redemption.userEmail}`,
        timestamp:
          redemption.redeemedAt?.toISOString() || new Date().toISOString(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const stats = {
      totalCampaigns,
      activeCampaigns,
      totalCodes,
      redeemedCodes,
      totalUsers,
      recentActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
}

// Secure admin stats endpoint - requires API key and origin validation
export const GET = withSecurity(getAdminStats, SECURITY_CONFIGS.ADMIN);
