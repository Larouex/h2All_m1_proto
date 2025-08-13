import { NextResponse } from "next/server";
import { campaignQueries } from "@/app/lib/database-pg";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";

/**
 * Seed endpoint to create sample campaign data for development/testing
 * GET /api/campaigns/seed - Creates sample campaigns if they don't exist
 */
async function handleGET() {
  try {
    // Check if kodema-village campaign already exists
    const existingCampaign = await campaignQueries.findById("kodema-village");

    if (existingCampaign) {
      return NextResponse.json({
        message: "Sample campaigns already exist",
        campaign: {
          id: existingCampaign.id,
          name: existingCampaign.name,
          currentFunding: Number(existingCampaign.totalRedemptionValue),
        },
      });
    }

    // Create sample campaign
    const sampleCampaign = await campaignQueries.create({
      id: "kodema-village",
      name: "Kodema Village Water Project",
      description:
        "Our goal: clean water within 5 minutes of every home in Kodema Village.",
      redemptionValue: "0.05",
      isActive: true,
      maxRedemptions: 100000,
      currentRedemptions: 8241,
      totalRedemptions: 8241,
      totalRedemptionValue: "412.05",
      status: "active",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    });

    return NextResponse.json({
      message: "Sample campaign created successfully",
      campaign: {
        id: sampleCampaign.id,
        name: sampleCampaign.name,
        description: sampleCampaign.description,
        currentFunding: Number(sampleCampaign.totalRedemptionValue),
        fundingGoal: 5000,
        redemptionValue: Number(sampleCampaign.redemptionValue),
        currentRedemptions: sampleCampaign.currentRedemptions,
        totalRedemptions: sampleCampaign.totalRedemptions,
        isActive: sampleCampaign.isActive,
        status: sampleCampaign.status,
      },
    });
  } catch (error) {
    console.error("Error seeding campaigns:", error);
    return NextResponse.json(
      { error: "Failed to seed sample campaigns" },
      { status: 500 }
    );
  }
}

// Only allow GET method for seeding
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);

async function handlePOST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.ADMIN);

async function handlePUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const PUT = withSecurity(handlePUT, SECURITY_CONFIGS.ADMIN);

async function handleDELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const DELETE = withSecurity(handleDELETE, SECURITY_CONFIGS.ADMIN);
