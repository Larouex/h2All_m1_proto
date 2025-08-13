import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { campaignQueries, redemptionCodeQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id");
    const uniqueCode = searchParams.get("unique_code");

    // Validate required parameters
    if (!campaignId || !uniqueCode) {
      return NextResponse.json(
        {
          valid: false,
          error: "Both campaign_id and unique_code are required",
        },
        { status: 400 }
      );
    }

    // Get campaign information
    const campaign = await campaignQueries.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        {
          valid: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (!campaign.isActive) {
      return NextResponse.json(
        {
          valid: false,
          error: "Campaign is not active",
        },
        { status: 400 }
      );
    }

    // Find the redemption code
    const redemptionCode = await redemptionCodeQueries.findByCode(uniqueCode);
    if (!redemptionCode) {
      return NextResponse.json(
        {
          valid: false,
          error: "Redemption code not found",
        },
        { status: 404 }
      );
    }

    // Verify the code belongs to this campaign
    if (redemptionCode.campaignId !== campaignId) {
      return NextResponse.json(
        {
          valid: false,
          error: "Code does not belong to this campaign",
        },
        { status: 400 }
      );
    }

    // Check if code is already used
    if (redemptionCode.isUsed) {
      return NextResponse.json(
        {
          valid: false,
          error: "Code has already been used",
        },
        { status: 400 }
      );
    }

    // All validations passed
    return NextResponse.json({
      valid: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        redemptionValue: Number(campaign.redemptionValue),
      },
      code: {
        id: redemptionCode.id,
        uniqueCode: redemptionCode.uniqueCode,
        campaignId: redemptionCode.campaignId,
      },
    });
  } catch (error) {
    console.error("Error validating campaign and code:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export secured handler
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.PUBLIC);
