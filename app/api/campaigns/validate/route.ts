import { NextRequest, NextResponse } from "next/server";
import { campaignTableClient, redemptionCodeTableClient } from "@/lib/database";

/**
 * @swagger
 * /api/campaigns/validate:
 *   get:
 *     summary: Validate campaign and redemption code
 *     description: Validates that a redemption code exists, is not used, and the campaign is active. Returns campaign details without marking the code as redeemed.
 *     tags:
 *       - Campaigns
 *       - Validation
 *     parameters:
 *       - in: query
 *         name: campaign_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The campaign identifier
 *         example: "summer2025"
 *       - in: query
 *         name: unique_code
 *         required: true
 *         schema:
 *           type: string
 *         description: The redemption code to validate
 *         example: "A7B9C3D2"
 *     responses:
 *       200:
 *         description: Valid campaign and code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 campaign:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "summer2025"
 *                     name:
 *                       type: string
 *                       example: "Summer 2025 Promotion"
 *                     redemptionValue:
 *                       type: number
 *                       example: 25
 *                     description:
 *                       type: string
 *                       example: "Get $25 off your next purchase"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-31T23:59:59.999Z"
 *                 code:
 *                   type: object
 *                   properties:
 *                     uniqueCode:
 *                       type: string
 *                       example: "A7B9C3D2"
 *                     campaignId:
 *                       type: string
 *                       example: "summer2025"
 *                     isUsed:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing required parameters: campaign_id and unique_code"
 *       404:
 *         description: Campaign or code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Campaign not found"
 *       410:
 *         description: Campaign expired or code already used
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Campaign has expired"
 *                 details:
 *                   type: object
 *                   properties:
 *                     campaignExpired:
 *                       type: boolean
 *                       example: true
 *                     codeUsed:
 *                       type: boolean
 *                       example: false
 *                     campaignInactive:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id");
    const uniqueCode = searchParams.get("unique_code");

    // Validate required parameters
    if (!campaignId || !uniqueCode) {
      return NextResponse.json(
        {
          valid: false,
          error: "Missing required parameters: campaign_id and unique_code",
        },
        { status: 400 }
      );
    }

    // Step 1: Get campaign details
    let campaign;
    try {
      const campaignEntity = await campaignTableClient
        .getEntity("campaign", campaignId)
        .catch(() => null);

      if (!campaignEntity) {
        return NextResponse.json(
          {
            valid: false,
            error: "Campaign not found",
          },
          { status: 404 }
        );
      }

      campaign = {
        id: campaignEntity.rowKey as string,
        name: campaignEntity.Name as string,
        description: campaignEntity.Description as string,
        redemptionValue: campaignEntity.RedemptionValue as number,
        isActive: campaignEntity.IsActive as boolean,
        expiresAt: campaignEntity.ExpiresAt as string,
        maxRedemptions: campaignEntity.MaxRedemptions as number,
        currentRedemptions: campaignEntity.CurrentRedemptions as number,
      };
    } catch (error) {
      console.error("Error fetching campaign:", error);
      return NextResponse.json(
        {
          valid: false,
          error: "Error fetching campaign details",
        },
        { status: 500 }
      );
    }

    // Step 2: Validate campaign status
    const now = new Date();
    const expirationDate = new Date(campaign.expiresAt);

    const validationDetails = {
      campaignExpired: expirationDate < now,
      campaignInactive: !campaign.isActive,
      codeUsed: false, // Will be set after code lookup
    };

    if (validationDetails.campaignInactive) {
      return NextResponse.json(
        {
          valid: false,
          error: "Campaign is not active",
          details: validationDetails,
        },
        { status: 410 }
      );
    }

    if (validationDetails.campaignExpired) {
      return NextResponse.json(
        {
          valid: false,
          error: "Campaign has expired",
          details: validationDetails,
        },
        { status: 410 }
      );
    }

    // Step 3: Get and validate redemption code
    let code;
    try {
      // Query for the code by campaign and unique code
      const entities = redemptionCodeTableClient.listEntities({
        queryOptions: {
          filter: `PartitionKey eq '${campaignId}' and UniqueCode eq '${uniqueCode}'`,
        },
      });

      let codeEntity = null;
      for await (const entity of entities) {
        codeEntity = entity;
        break; // Get first (should be only) match
      }

      if (!codeEntity) {
        return NextResponse.json(
          {
            valid: false,
            error: "Redemption code not found",
          },
          { status: 404 }
        );
      }

      code = {
        id: codeEntity.rowKey as string,
        uniqueCode: codeEntity.UniqueCode as string,
        campaignId: codeEntity.CampaignId as string,
        isUsed: codeEntity.IsUsed as boolean,
        redeemedAt: codeEntity.RedeemedAt as string,
        userId: codeEntity.UserId as string,
        userEmail: codeEntity.UserEmail as string,
        createdAt: codeEntity.CreatedDateTime as string,
      };
    } catch (error) {
      console.error("Error fetching redemption code:", error);
      return NextResponse.json(
        {
          valid: false,
          error: "Error fetching redemption code",
        },
        { status: 500 }
      );
    }

    // Step 4: Validate code status
    validationDetails.codeUsed = code.isUsed;

    if (code.isUsed) {
      return NextResponse.json(
        {
          valid: false,
          error: "Redemption code has already been used",
          details: {
            ...validationDetails,
            redeemedAt: code.redeemedAt,
            redeemedBy: code.userEmail || code.userId,
          },
        },
        { status: 410 }
      );
    }

    // Step 5: Check redemption limits
    if (
      campaign.maxRedemptions &&
      campaign.currentRedemptions >= campaign.maxRedemptions
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Campaign has reached maximum redemption limit",
          details: {
            ...validationDetails,
            maxRedemptions: campaign.maxRedemptions,
            currentRedemptions: campaign.currentRedemptions,
          },
        },
        { status: 410 }
      );
    }

    // Step 6: Return successful validation
    return NextResponse.json({
      valid: true,
      message: "Campaign and code are valid for redemption",
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        redemptionValue: campaign.redemptionValue,
        isActive: campaign.isActive,
        expiresAt: campaign.expiresAt,
        maxRedemptions: campaign.maxRedemptions,
        currentRedemptions: campaign.currentRedemptions,
      },
      code: {
        uniqueCode: code.uniqueCode,
        campaignId: code.campaignId,
        isUsed: code.isUsed,
        createdAt: code.createdAt,
      },
      validationTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaign validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
