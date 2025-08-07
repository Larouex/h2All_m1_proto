import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { db } from "@/db";
import { redemptionCodes, campaigns } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * @swagger
 * /api/user/impact:
 *   get:
 *     summary: Get user impact data
 *     description: Retrieve user's redemption impact data for campaigns
 *     tags:
 *       - User Impact
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get impact data for
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Optional specific campaign ID to filter by
 *     responses:
 *       200:
 *         description: User impact data retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: No impact data found
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = await verifyToken(authToken);

    if (!tokenPayload) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const campaignId = searchParams.get("campaignId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user can access this data (user can only access their own data, or admin can access any)
    if (tokenPayload.userId !== userId && !tokenPayload.isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build query conditions
    let whereConditions = eq(redemptionCodes.userId, userId);

    if (campaignId) {
      whereConditions = and(
        eq(redemptionCodes.userId, userId),
        eq(redemptionCodes.campaignId, campaignId)
      )!; // Non-null assertion since we know both conditions exist
    }

    // Get user's redemption data
    const redemptions = await db
      .select({
        id: redemptionCodes.id,
        campaignId: redemptionCodes.campaignId,
        redemptionValue: redemptionCodes.redemptionValue,
        redeemedAt: redemptionCodes.redeemedAt,
        campaignName: campaigns.name,
      })
      .from(redemptionCodes)
      .leftJoin(campaigns, eq(redemptionCodes.campaignId, campaigns.id))
      .where(
        and(
          whereConditions,
          eq(redemptionCodes.isUsed, true) // Only count used/redeemed codes
        )
      )
      .orderBy(redemptionCodes.redeemedAt);

    // Calculate impact metrics
    const claimedBottles = redemptions.length;
    const totalContribution = redemptions.reduce(
      (sum, redemption) => sum + Number(redemption.redemptionValue || 0),
      0
    );

    // Get campaign name if filtering by specific campaign
    let campaignName: string | undefined;
    if (campaignId && redemptions.length > 0) {
      campaignName = redemptions[0].campaignName || undefined;
    }

    // Get last redemption date
    const lastRedemptionDate =
      redemptions.length > 0
        ? redemptions[redemptions.length - 1].redeemedAt
        : undefined;

    // If no redemptions found, return default data
    if (claimedBottles === 0) {
      return NextResponse.json({
        claimedBottles: 0,
        totalContribution: 0,
        waterFunded: 0,
        campaignName,
        lastRedemptionDate: null,
        message:
          "No impact data found - start redeeming bottles to track your impact!",
      });
    }

    return NextResponse.json({
      claimedBottles,
      totalContribution,
      waterFunded: claimedBottles * 10, // 10 liters per bottle
      campaignName,
      lastRedemptionDate,
      redemptions: redemptions.map((r) => ({
        id: r.id,
        campaignId: r.campaignId,
        campaignName: r.campaignName,
        value: Number(r.redemptionValue || 0),
        redeemedAt: r.redeemedAt,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/user/impact:", error);
    return NextResponse.json(
      { error: "Failed to retrieve impact data" },
      { status: 500 }
    );
  }
}

// Only allow GET method
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
