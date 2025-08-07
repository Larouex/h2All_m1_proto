import { NextResponse } from "next/server";
import { db } from "@/db";
import { redemptionCodes, campaigns, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Seed endpoint to create sample redemption data for impact testing
 * GET /api/user/impact/seed - Creates sample redemption codes for testing
 */
export async function GET() {
  try {
    // Check if we have campaigns to work with
    const existingCampaigns = await db.select().from(campaigns).limit(1);

    if (existingCampaigns.length === 0) {
      return NextResponse.json(
        {
          error:
            "No campaigns found. Please seed campaigns first using /api/campaigns/seed",
        },
        { status: 400 }
      );
    }

    // Get the first campaign
    const campaign = existingCampaigns[0];

    // Check if we have users to work with
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length === 0) {
      return NextResponse.json(
        {
          error: "No users found. Please register a user first.",
        },
        { status: 400 }
      );
    }

    const user = existingUsers[0];

    // Check if redemption codes already exist for this user
    const existingRedemptions = await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.userId, user.id))
      .limit(1);

    if (existingRedemptions.length > 0) {
      return NextResponse.json({
        message: "Sample redemption data already exists",
        existingRedemptions: existingRedemptions.length,
        userId: user.id,
        campaignId: campaign.id,
      });
    }

    // Create sample redemption codes
    const sampleRedemptions = [
      {
        campaignId: campaign.id,
        uniqueCode: "BOTTLE001",
        isUsed: true,
        userId: user.id,
        userEmail: user.email,
        redemptionValue: "0.05",
        redemptionSource: "qr_code",
        redemptionDevice: "mobile",
        redemptionLocation: "Test Location 1",
        redeemedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        campaignId: campaign.id,
        uniqueCode: "BOTTLE002",
        isUsed: true,
        userId: user.id,
        userEmail: user.email,
        redemptionValue: "0.05",
        redemptionSource: "qr_code",
        redemptionDevice: "mobile",
        redemptionLocation: "Test Location 2",
        redeemedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        campaignId: campaign.id,
        uniqueCode: "BOTTLE003",
        isUsed: true,
        userId: user.id,
        userEmail: user.email,
        redemptionValue: "0.05",
        redemptionSource: "qr_code",
        redemptionDevice: "mobile",
        redemptionLocation: "Test Location 3",
        redeemedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    // Insert sample redemptions
    const createdRedemptions = await db
      .insert(redemptionCodes)
      .values(sampleRedemptions)
      .returning();

    // Update user's total redemptions and value
    await db
      .update(users)
      .set({
        totalRedemptions: sampleRedemptions.length,
        totalRedemptionValue: (sampleRedemptions.length * 0.05).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: "Sample redemption data created successfully",
      createdRedemptions: createdRedemptions.length,
      impactSummary: {
        userId: user.id,
        userEmail: user.email,
        campaignId: campaign.id,
        campaignName: campaign.name,
        claimedBottles: sampleRedemptions.length,
        totalContribution: sampleRedemptions.length * 0.05,
        waterFunded: sampleRedemptions.length * 10, // 10L per bottle
      },
      redemptions: createdRedemptions.map((r) => ({
        id: r.id,
        uniqueCode: r.uniqueCode,
        redemptionValue: Number(r.redemptionValue),
        redeemedAt: r.redeemedAt,
      })),
    });
  } catch (error) {
    console.error("Error seeding redemption data:", error);
    return NextResponse.json(
      { error: "Failed to seed sample redemption data" },
      { status: 500 }
    );
  }
}

// Only allow GET method for seeding
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
