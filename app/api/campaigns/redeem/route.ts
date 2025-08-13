import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { verifyToken } from "@/app/lib/auth";
import {
  campaignQueries,
  redemptionCodeQueries,
  userQueries,
} from "@/app/lib/database-pg";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

/**
 * @swagger
 * /api/campaigns/redeem:
 *   post:
 *     summary: Redeem a campaign code
 *     description: Validates and redeems a campaign code for an authenticated user. Updates user balance, marks code as used, and records redemption details.
 *     tags:
 *       - Campaigns
 *       - Redemption
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - unique_code
 *             properties:
 *               campaign_id:
 *                 type: string
 *                 description: The campaign identifier
 *               unique_code:
 *                 type: string
 *                 description: The redemption code to redeem
 *     responses:
 *       200:
 *         description: Code redeemed successfully
 *       400:
 *         description: Invalid parameters or code already used
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Campaign or code not found
 */

async function handlePOST(request: NextRequest) {
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

    const { campaign_id, unique_code } = await request.json();

    // Validate required parameters
    if (!campaign_id || !unique_code) {
      return NextResponse.json(
        { error: "Both campaign_id and unique_code are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await userQueries.findById(tokenPayload.userId);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 404 }
      );
    }

    // Get campaign information
    const campaign = await campaignQueries.findById(campaign_id);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Check if campaign has expired
    if (campaign.expiresAt && new Date() > campaign.expiresAt) {
      return NextResponse.json(
        { error: "Campaign has expired" },
        { status: 400 }
      );
    }

    // Find the redemption code
    const redemptionCode = await redemptionCodeQueries.findByCode(unique_code);
    if (!redemptionCode) {
      return NextResponse.json(
        { error: "Redemption code not found" },
        { status: 404 }
      );
    }

    // Verify the code belongs to this campaign
    if (redemptionCode.campaignId !== campaign_id) {
      return NextResponse.json(
        { error: "Code does not belong to this campaign" },
        { status: 400 }
      );
    }

    // Check if code is already used
    if (redemptionCode.isUsed) {
      return NextResponse.json(
        {
          error: "Code has already been used",
          redeemedAt: redemptionCode.redeemedAt,
          redeemedBy: redemptionCode.userEmail,
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (redemptionCode.expiresAt && new Date() > redemptionCode.expiresAt) {
      return NextResponse.json(
        { error: "Redemption code has expired" },
        { status: 400 }
      );
    }

    // Redeem the code
    const redeemedCode = await redemptionCodeQueries.redeem(
      redemptionCode.id,
      user.id,
      user.email
    );

    // Update user balance
    const newBalance = Number(user.balance) + Number(campaign.redemptionValue);
    const updatedUser = await userQueries.update(user.id, {
      balance: newBalance.toString(),
      totalRedemptions: user.totalRedemptions + 1,
      totalRedemptionValue: (
        Number(user.totalRedemptionValue) + Number(campaign.redemptionValue)
      ).toString(),
    });

    // Update campaign stats
    await campaignQueries.update(campaign_id, {
      currentRedemptions: campaign.currentRedemptions + 1,
      totalRedemptions: campaign.totalRedemptions + 1,
      totalRedemptionValue: (
        Number(campaign.totalRedemptionValue) + Number(campaign.redemptionValue)
      ).toString(),
    });

    return NextResponse.json({
      success: true,
      message: "Code redeemed successfully",
      redemption: {
        codeId: redeemedCode.id,
        uniqueCode: redeemedCode.uniqueCode,
        redemptionValue: Number(campaign.redemptionValue),
        redeemedAt: redeemedCode.redeemedAt,
      },
      user: {
        email: updatedUser.email,
        newBalance: Number(updatedUser.balance),
        totalRedemptions: updatedUser.totalRedemptions,
        totalRedemptionValue: Number(updatedUser.totalRedemptionValue),
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        redemptionValue: Number(campaign.redemptionValue),
      },
    });
  } catch (error) {
    console.error("Error redeeming code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export secured handlers
export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.PROTECTED);

// Prevent other HTTP methods
async function handleGET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handlePUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handlePATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleDELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withSecurity(handleGET, SECURITY_CONFIGS.PROTECTED);
export const PUT = withSecurity(handlePUT, SECURITY_CONFIGS.PROTECTED);
export const PATCH = withSecurity(handlePATCH, SECURITY_CONFIGS.PROTECTED);
export const DELETE = withSecurity(handleDELETE, SECURITY_CONFIGS.PROTECTED);
