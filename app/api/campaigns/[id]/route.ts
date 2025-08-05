import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get specific campaign from database
    const campaignData = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (campaignData.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaign = campaignData[0];

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      redemptionValue: campaign.redemptionValue,
      isActive: campaign.isActive,
      expiryDate: campaign.expiresAt,
      status: campaign.status,
      maxRedemptions: campaign.maxRedemptions,
      currentRedemptions: campaign.currentRedemptions,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
