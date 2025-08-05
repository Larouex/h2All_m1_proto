import { NextRequest, NextResponse } from "next/server";
import { redemptionCodeQueries, campaignQueries } from "@/app/lib/database-pg";
import { verifyToken } from "@/app/lib/auth";
import type {
  CreateRedemptionCodeDto,
  RedeemCodeDto,
} from "@/types/redemption";

/**
 * @swagger
 * /api/redemption-codes:
 *   get:
 *     summary: List redemption codes or get specific code
 *     description: Retrieve redemption codes with optional filtering
 *     tags:
 *       - Redemption Codes
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Specific redemption code ID
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter codes by campaign ID
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Find code by unique code string
 *       - in: query
 *         name: isUsed
 *         schema:
 *           type: boolean
 *         description: Filter codes by usage status
 *     responses:
 *       200:
 *         description: Redemption code(s) retrieved successfully
 *       404:
 *         description: Redemption code not found
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const campaignId = searchParams.get("campaignId");
    const code = searchParams.get("code");
    const isUsed = searchParams.get("isUsed");

    if (id) {
      // Get specific redemption code
      const redemptionCode = await redemptionCodeQueries.findById(id);

      if (!redemptionCode) {
        return NextResponse.json(
          { error: "Redemption code not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: redemptionCode.id,
        campaignId: redemptionCode.campaignId,
        uniqueCode: redemptionCode.uniqueCode,
        isUsed: redemptionCode.isUsed,
        redeemedAt: redemptionCode.redeemedAt,
        userId: redemptionCode.userId,
        userEmail: redemptionCode.userEmail,
        expiresAt: redemptionCode.expiresAt,
        redemptionValue: Number(redemptionCode.redemptionValue || 0),
        createdAt: redemptionCode.createdAt,
      });
    } else if (code) {
      // Find by unique code
      const redemptionCode = await redemptionCodeQueries.findByCode(code);

      if (!redemptionCode) {
        return NextResponse.json(
          { error: "Redemption code not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: redemptionCode.id,
        campaignId: redemptionCode.campaignId,
        uniqueCode: redemptionCode.uniqueCode,
        isUsed: redemptionCode.isUsed,
        redeemedAt: redemptionCode.redeemedAt,
        userId: redemptionCode.userId,
        userEmail: redemptionCode.userEmail,
        expiresAt: redemptionCode.expiresAt,
        redemptionValue: Number(redemptionCode.redemptionValue || 0),
        createdAt: redemptionCode.createdAt,
      });
    } else if (campaignId) {
      // List codes for specific campaign
      const codes = await redemptionCodeQueries.findByCampaign(
        campaignId,
        100,
        0
      );

      // Filter by isUsed if specified
      const filteredCodes =
        isUsed !== null
          ? codes.filter((c) => (isUsed === "true" ? c.isUsed : !c.isUsed))
          : codes;

      return NextResponse.json(
        filteredCodes.map((code) => ({
          id: code.id,
          campaignId: code.campaignId,
          uniqueCode: code.uniqueCode,
          isUsed: code.isUsed,
          redeemedAt: code.redeemedAt,
          userId: code.userId,
          userEmail: code.userEmail,
          expiresAt: code.expiresAt,
          redemptionValue: Number(code.redemptionValue || 0),
          createdAt: code.createdAt,
        }))
      );
    } else {
      // List all codes (admin only)
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

      const allCodes = await redemptionCodeQueries.list(100, 0);

      return NextResponse.json(
        allCodes.map((code) => ({
          id: code.id,
          campaignId: code.campaignId,
          uniqueCode: code.uniqueCode,
          isUsed: code.isUsed,
          redeemedAt: code.redeemedAt,
          userId: code.userId,
          userEmail: code.userEmail,
          expiresAt: code.expiresAt,
          redemptionValue: Number(code.redemptionValue || 0),
          createdAt: code.createdAt,
        }))
      );
    }
  } catch (error) {
    console.error("Error in GET /api/redemption-codes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve redemption codes" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/redemption-codes:
 *   post:
 *     summary: Create redemption codes or redeem a code
 *     description: Create new redemption codes for a campaign (admin only) or redeem a code (authenticated user)
 *     tags:
 *       - Redemption Codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateRedemptionCodeDto'
 *               - $ref: '#/components/schemas/RedeemCodeDto'
 *     responses:
 *       201:
 *         description: Redemption codes created successfully
 *       200:
 *         description: Code redeemed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign or code not found
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Check if this is a code creation request (admin only) or redemption request
    if ("quantity" in body) {
      // Code creation - admin only
      if (!tokenPayload.isAdmin) {
        return NextResponse.json(
          { error: "Admin access required to create codes" },
          { status: 403 }
        );
      }

      const { campaignId, quantity }: CreateRedemptionCodeDto = body;

      if (!campaignId || !quantity || quantity <= 0 || quantity > 1000) {
        return NextResponse.json(
          { error: "Valid campaign ID and quantity (1-1000) are required" },
          { status: 400 }
        );
      }

      // Verify campaign exists
      const campaign = await campaignQueries.findById(campaignId);
      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      // Generate codes
      const codes = [];
      for (let i = 0; i < quantity; i++) {
        const uniqueCode = generateUniqueCode();
        const newCode = await redemptionCodeQueries.create({
          campaignId,
          uniqueCode,
          isUsed: false,
          redeemedAt: null,
          userId: null,
          userEmail: null,
          expiresAt: campaign.expiresAt,
          redemptionValue: campaign.redemptionValue,
        });
        codes.push(newCode);
      }

      return NextResponse.json(
        {
          message: `${quantity} redemption codes created successfully`,
          campaignId,
          codesCreated: quantity,
          codes: codes.map((code) => ({
            id: code.id,
            uniqueCode: code.uniqueCode,
          })),
        },
        { status: 201 }
      );
    } else if ("code" in body) {
      // Code redemption
      const { campaignId, code, userEmail, redemptionUrl }: RedeemCodeDto =
        body;

      if (!campaignId || !code || !userEmail) {
        return NextResponse.json(
          { error: "Campaign ID, code, and user email are required" },
          { status: 400 }
        );
      }

      // Find the redemption code
      const redemptionCode = await redemptionCodeQueries.findByCode(code);
      if (!redemptionCode || redemptionCode.campaignId !== campaignId) {
        return NextResponse.json(
          { error: "Invalid redemption code for this campaign" },
          { status: 404 }
        );
      }

      if (redemptionCode.isUsed) {
        return NextResponse.json(
          { error: "Redemption code has already been used" },
          { status: 400 }
        );
      }

      // Check if code is expired
      if (redemptionCode.expiresAt && redemptionCode.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Redemption code has expired" },
          { status: 400 }
        );
      }

      // Redeem the code
      const updatedCode = await redemptionCodeQueries.redeem(
        redemptionCode.id,
        tokenPayload.userId,
        userEmail,
        redemptionUrl
      );

      return NextResponse.json({
        message: "Code redeemed successfully",
        redemptionCode: {
          id: updatedCode.id,
          uniqueCode: updatedCode.uniqueCode,
          redemptionValue: Number(updatedCode.redemptionValue || 0),
          redeemedAt: updatedCode.redeemedAt,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/redemption-codes:", error);
    return NextResponse.json(
      { error: "Failed to process redemption code request" },
      { status: 500 }
    );
  }
}

// Helper function to generate unique codes
function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
