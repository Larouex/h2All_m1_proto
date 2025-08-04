import { NextRequest, NextResponse } from "next/server";
import {
  redemptionCodeTableClient,
  campaignTableClient,
  userTableClient,
  ensureTablesExist,
  ValidationError,
  encodeEmailToRowKey,
} from "@/lib/database";
import { validateCampaignUrl } from "@/lib/utils/urlParser";
import type { RedemptionCodeEntity, RedeemCodeDto } from "@/types/redemption";
import type { CampaignEntity } from "@/types/campaign";
import type { UserEntity } from "@/types/user";

/**
 * @swagger
 * /api/redeem:
 *   post:
 *     summary: Redeem a campaign code
 *     description: Redeem a unique campaign code for a user, marking it as used and applying rewards
 *     tags:
 *       - Code Redemption
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - code
 *               - userEmail
 *             properties:
 *               campaignId:
 *                 type: string
 *                 description: Campaign identifier
 *                 example: "1754169423931-stp6rpgli"
 *               code:
 *                 type: string
 *                 description: Unique redemption code
 *                 example: "OVXQYE0I"
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the user redeeming the code
 *                 example: "user@example.com"
 *               redemptionUrl:
 *                 type: string
 *                 description: Optional - URL where code was redeemed from (for tracking)
 *                 example: "/redeem?campaign_id=123&code=ABC123&utm_source=email"
 *               metadata:
 *                 type: object
 *                 description: Additional metadata about the redemption
 *                 properties:
 *                   source:
 *                     type: string
 *                     example: "email_campaign"
 *                   device:
 *                     type: string
 *                     example: "mobile"
 *                   location:
 *                     type: string
 *                     example: "store_123"
 *     responses:
 *       200:
 *         description: Code successfully redeemed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Code redeemed successfully"
 *                 redemption:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1704067200000-xyz789abc"
 *                     code:
 *                       type: string
 *                       example: "ABC123XY"
 *                     campaignId:
 *                       type: string
 *                       example: "1704067200000-abc123def"
 *                     userEmail:
 *                       type: string
 *                       example: "user@example.com"
 *                     redeemedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T12:00:00.000Z"
 *                     redemptionValue:
 *                       type: number
 *                       example: 25.00
 *                     campaign:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Winter 2025 Promotion"
 *                         description:
 *                           type: string
 *                           example: "Get $25 off your next purchase"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "Missing required field: campaignId"
 *                     - "Invalid code format"
 *                     - "Code has already been redeemed"
 *                     - "Code has expired"
 *                     - "Campaign is not active"
 *       404:
 *         description: Code or campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Redemption code not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * POST /api/redeem - Redeem a campaign code
 */
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();

    const body = await request.json();
    const {
      campaignId,
      code,
      userEmail,
      redemptionUrl,
      metadata,
    }: RedeemCodeDto = body;

    // Validate required fields
    if (!campaignId || !code || !userEmail) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            campaignId: !campaignId ? "Required" : "OK",
            code: !code ? "Required" : "OK",
            userEmail: !userEmail ? "Required" : "OK",
          },
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate redemption URL if provided
    let urlData = null;
    if (redemptionUrl) {
      const urlValidation = validateCampaignUrl(redemptionUrl);
      if (!urlValidation.isValid) {
        console.warn(
          "Invalid redemption URL provided:",
          redemptionUrl,
          urlValidation.errors
        );
      } else {
        urlData = urlValidation.data;
      }
    }

    // Find the redemption code by UniqueCode field
    const codeEntities =
      redemptionCodeTableClient!.listEntities<RedemptionCodeEntity>({
        queryOptions: {
          filter: `UniqueCode eq '${code}' and PartitionKey eq '${campaignId}'`,
        },
      });

    let codeEntity: RedemptionCodeEntity | null = null;
    for await (const entity of codeEntities) {
      codeEntity = entity;
      break;
    }

    if (!codeEntity) {
      console.error(
        "Code lookup failed - code not found:",
        code,
        "in campaign:",
        campaignId
      );
      return NextResponse.json(
        { error: "Redemption code not found" },
        { status: 404 }
      );
    }

    // Check if code is already redeemed
    if (codeEntity.IsUsed) {
      return NextResponse.json(
        {
          error: "Code has already been redeemed",
          details: {
            redeemedAt: codeEntity.RedeemedAt,
            redeemedBy: codeEntity.UserEmail,
          },
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = new Date();
    const expirationDate = codeEntity.ExpiresAt
      ? new Date(codeEntity.ExpiresAt)
      : null;
    if (expirationDate && now > expirationDate) {
      return NextResponse.json(
        {
          error: "Code has expired",
          details: {
            expiredAt: codeEntity.ExpiresAt,
            currentTime: now.toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Get campaign details to check status and get redemption value
    let campaignEntity: CampaignEntity;
    try {
      campaignEntity = await campaignTableClient!.getEntity<CampaignEntity>(
        "campaign",
        campaignId
      );
    } catch (error) {
      console.error("Campaign lookup failed:", error);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (campaignEntity.Status !== "active" && !campaignEntity.IsActive) {
      return NextResponse.json(
        {
          error: "Campaign is not active",
          details: {
            campaignStatus:
              campaignEntity.Status ||
              (campaignEntity.IsActive ? "active" : "inactive"),
            campaignName: campaignEntity.Name,
          },
        },
        { status: 400 }
      );
    }

    // Check campaign expiration
    const campaignEndDate = new Date(campaignEntity.ExpiresAt);
    if (now > campaignEndDate) {
      return NextResponse.json(
        {
          error: "Campaign has ended",
          details: {
            endedAt: campaignEntity.ExpiresAt,
            currentTime: now.toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Get or create user
    const userRowKey = encodeEmailToRowKey(userEmail);
    let userEntity: UserEntity;
    try {
      userEntity = await userTableClient!.getEntity<UserEntity>(
        "user",
        userRowKey
      );
    } catch {
      // User doesn't exist, create them
      userEntity = {
        partitionKey: "user",
        rowKey: userRowKey,
        Email: userEmail,
        FirstName: "",
        LastName: "",
        Country: "",
        Balance: 0,
        TotalRedemptions: 0,
        TotalRedemptionValue: 0,
        IsActive: true,
        IsAdmin: false, // Default to false for new users
        CreatedDateTime: now,
        UpdatedAt: now.toISOString(),
      };
      await userTableClient!.createEntity(userEntity);
    }

    // Mark code as redeemed
    const redemptionValue = parseFloat(
      campaignEntity.RedemptionValue?.toString() || "0"
    );
    const redeemedCodeEntity: RedemptionCodeEntity = {
      ...codeEntity,
      IsUsed: true,
      UserEmail: userEmail,
      RedeemedAt: now,
      UpdatedAt: now.toISOString(),
      RedemptionValue: redemptionValue,
      // Store tracking data if available
      RedemptionSource: urlData?.extraParams?.utm_source || metadata?.source,
      RedemptionDevice: metadata?.device,
      RedemptionLocation: metadata?.location,
      RedemptionUrl: redemptionUrl,
    };

    await redemptionCodeTableClient!.updateEntity(redeemedCodeEntity, "Merge");

    // Update user stats
    const updatedUserEntity: UserEntity = {
      ...userEntity,
      TotalRedemptions: (userEntity.TotalRedemptions || 0) + 1,
      TotalRedemptionValue:
        (userEntity.TotalRedemptionValue || 0) + redemptionValue,
      Balance: (userEntity.Balance || 0) + redemptionValue,
      UpdatedAt: now.toISOString(),
    };

    await userTableClient!.updateEntity(updatedUserEntity, "Merge");

    // Update campaign stats (optional - track total redemptions)
    const updatedCampaignEntity: CampaignEntity = {
      ...campaignEntity,
      TotalRedemptions: (campaignEntity.TotalRedemptions || 0) + 1,
      TotalRedemptionValue:
        (campaignEntity.TotalRedemptionValue || 0) + redemptionValue,
      CurrentRedemptions: (campaignEntity.CurrentRedemptions || 0) + 1,
      UpdatedAt: now.toISOString(),
    };

    await campaignTableClient!.updateEntity(updatedCampaignEntity, "Merge");

    // Return success response with redemption details
    return NextResponse.json({
      success: true,
      message: "Code redeemed successfully",
      redemption: {
        id: codeEntity.rowKey,
        code: codeEntity.UniqueCode,
        campaignId: campaignId,
        userEmail: userEmail,
        redeemedAt: now.toISOString(),
        redemptionValue: redemptionValue,
        campaign: {
          name: campaignEntity.Name,
          description: campaignEntity.Description,
        },
        tracking: {
          source: redeemedCodeEntity.RedemptionSource,
          device: redeemedCodeEntity.RedemptionDevice,
          location: redeemedCodeEntity.RedemptionLocation,
          url: redemptionUrl,
        },
      },
    });
  } catch (error) {
    console.error("Error in POST /api/redeem:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
