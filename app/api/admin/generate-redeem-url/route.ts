import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { redemptionCodeQueries, campaignQueries } from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

/**
 * @swagger
 * /api/admin/generate-redeem-url:
 *   post:
 *     summary: Generate redemption URL with next available unused code
 *     description: Creates a fully qualified redemption URL using the next available unused code from a specific campaign
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *             properties:
 *               campaignId:
 *                 type: string
 *                 description: Campaign ID to get unused code from
 *               baseUrl:
 *                 type: string
 *                 description: Base URL for the redemption site (optional)
 *               utmParams:
 *                 type: object
 *                 description: Optional UTM parameters for tracking
 *     responses:
 *       200:
 *         description: Redemption URL generated successfully
 *       404:
 *         description: No unused codes available or campaign not found
 *       400:
 *         description: Invalid request parameters
 */

interface GenerateUrlRequest {
  campaignId: string;
  baseUrl?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authToken = request.cookies.get("auth-token")?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = await verifyToken(authToken);
    if (!tokenPayload || !tokenPayload.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      campaignId,
      baseUrl = "http://localhost:3000",
      utmParams,
    }: GenerateUrlRequest = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Verify campaign exists and is active
    const campaign = await campaignQueries.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Find unused codes for this campaign, ordered by creation date (oldest first)
    const availableCodes = await redemptionCodeQueries.findByCampaign(
      campaignId
    );
    const unusedCodes = availableCodes.filter((code) => !code.isUsed);

    if (unusedCodes.length === 0) {
      return NextResponse.json(
        { error: "No unused codes available for this campaign" },
        { status: 404 }
      );
    }

    // Get the oldest unused code
    const nextAvailableCode = unusedCodes.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

    // Build the redemption URL
    const url = new URL(`${baseUrl}/redeem`);
    url.searchParams.set("campaign_id", campaignId);
    url.searchParams.set("code", nextAvailableCode.uniqueCode);

    // Add UTM parameters if provided
    if (utmParams) {
      if (utmParams.source)
        url.searchParams.set("utm_source", utmParams.source);
      if (utmParams.medium)
        url.searchParams.set("utm_medium", utmParams.medium);
      if (utmParams.campaign)
        url.searchParams.set("utm_campaign", utmParams.campaign);
      if (utmParams.content)
        url.searchParams.set("utm_content", utmParams.content);
      if (utmParams.term) url.searchParams.set("utm_term", utmParams.term);
    }

    return NextResponse.json({
      success: true,
      redemptionUrl: url.toString(),
      code: {
        id: nextAvailableCode.id,
        uniqueCode: nextAvailableCode.uniqueCode,
        campaignId: nextAvailableCode.campaignId,
      },
      campaign: {
        name: campaign.name,
        description: campaign.description,
      },
      availableCodes: unusedCodes.length,
    });
  } catch (error) {
    console.error("Error generating redemption URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authToken = request.cookies.get("auth-token")?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = await verifyToken(authToken);
    if (!tokenPayload || !tokenPayload.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID parameter is required" },
        { status: 400 }
      );
    }

    // Get campaign info
    const campaign = await campaignQueries.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get available codes count for the campaign
    const availableCodes = await redemptionCodeQueries.findByCampaign(
      campaignId
    );
    const unusedCodes = availableCodes.filter((code) => !code.isUsed);

    return NextResponse.json({
      campaignId,
      campaignName: campaign.name,
      availableCodes: unusedCodes.length,
      canGenerateUrl: unusedCodes.length > 0 && campaign.isActive,
      campaign: {
        isActive: campaign.isActive,
        maxRedemptions: campaign.maxRedemptions || 0,
        currentRedemptions: campaign.currentRedemptions || 0,
        remainingRedemptions:
          (campaign.maxRedemptions || 0) - (campaign.currentRedemptions || 0),
      },
    });
  } catch (error) {
    console.error("Error checking available codes:", error);
    return NextResponse.json(
      { error: "Failed to check available codes" },
      { status: 500 }
    );
  }
}
