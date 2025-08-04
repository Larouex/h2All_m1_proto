import { NextRequest, NextResponse } from "next/server";
import {
  redemptionCodeTableClient,
  campaignTableClient,
  ensureTablesExist,
  ValidationError,
} from "@/lib/database";
import type { RedemptionCodeEntity, RedemptionCode } from "@/types/redemption";
import type { CampaignEntity } from "@/types/campaign";

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
 *                 example: "1754169423931-stp6rpgli"
 *               baseUrl:
 *                 type: string
 *                 description: Base URL for the redemption site (optional)
 *                 example: "https://mysite.com"
 *               utmParams:
 *                 type: object
 *                 description: Optional UTM parameters for tracking
 *                 properties:
 *                   source:
 *                     type: string
 *                     example: "email"
 *                   medium:
 *                     type: string
 *                     example: "newsletter"
 *                   campaign:
 *                     type: string
 *                     example: "summer2025"
 *     responses:
 *       200:
 *         description: Redemption URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 redemptionUrl:
 *                   type: string
 *                   example: "https://mysite.com/redeem?campaign_id=1754169423931-stp6rpgli&code=ABC123XY&utm_source=email"
 *                 code:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     uniqueCode:
 *                       type: string
 *                     campaignId:
 *                       type: string
 *                 campaign:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                 availableCodes:
 *                   type: integer
 *                   description: Number of remaining unused codes
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

// Helper function to convert RedemptionCodeEntity to RedemptionCode
function entityToRedemptionCode(entity: RedemptionCodeEntity): RedemptionCode {
  return {
    id: entity.rowKey,
    campaignId: entity.CampaignId,
    uniqueCode: entity.UniqueCode,
    isUsed: entity.IsUsed,
    redeemedAt: entity.RedeemedAt,
    userId: entity.UserId,
    createdAt: entity.CreatedDateTime,
    userEmail: entity.UserEmail,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if we're in build mode (no environment variables available)
    if (
      !process.env.AZURE_STORAGE_ACCOUNT_NAME ||
      !process.env.AZURE_STORAGE_ACCOUNT_KEY
    ) {
      return NextResponse.json(
        { error: "Service temporarily unavailable - configuration missing" },
        { status: 503 }
      );
    }

    await ensureTablesExist();

    // Ensure table clients are available
    if (!campaignTableClient || !redemptionCodeTableClient) {
      return NextResponse.json(
        { error: "Database service not available" },
        { status: 503 }
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
    let campaignEntity: CampaignEntity;
    try {
      campaignEntity = await campaignTableClient.getEntity<CampaignEntity>(
        "campaign",
        campaignId
      );
    } catch (error) {
      const azureError = error as { statusCode?: number };
      if (azureError.statusCode === 404) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!campaignEntity.IsActive) {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Find unused codes for this campaign, ordered by creation date
    const entities =
      redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
        queryOptions: {
          filter: `PartitionKey eq '${campaignId}' and IsUsed eq false`,
          select: [
            "rowKey",
            "CampaignId",
            "UniqueCode",
            "IsUsed",
            "CreatedDateTime",
          ],
        },
      });

    let nextAvailableCode: RedemptionCodeEntity | null = null;
    let totalAvailableCodes = 0;

    // Get the first available code (oldest first)
    for await (const entity of entities) {
      totalAvailableCodes++;
      if (!nextAvailableCode) {
        nextAvailableCode = entity;
      }
    }

    if (!nextAvailableCode) {
      return NextResponse.json(
        {
          error: "No unused redemption codes available for this campaign",
          details: {
            campaignId,
            campaignName: campaignEntity.Name,
            availableCodes: 0,
          },
        },
        { status: 404 }
      );
    }

    // Build the redemption URL
    const url = new URL(`${baseUrl}/redeem`);
    url.searchParams.set("campaign_id", campaignId);
    url.searchParams.set("code", nextAvailableCode.UniqueCode);

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

    const redemptionUrl = url.toString();

    // Convert entity to our interface
    const codeData = entityToRedemptionCode(nextAvailableCode);

    return NextResponse.json({
      success: true,
      redemptionUrl,
      code: {
        id: codeData.id,
        uniqueCode: codeData.uniqueCode,
        campaignId: codeData.campaignId,
        createdAt: codeData.createdAt,
      },
      campaign: {
        id: campaignEntity.rowKey,
        name: campaignEntity.Name,
        description: campaignEntity.Description,
        redemptionValue: campaignEntity.RedemptionValue,
        maxRedemptions: campaignEntity.MaxRedemptions,
        currentRedemptions: campaignEntity.CurrentRedemptions,
      },
      availableCodes: totalAvailableCodes,
      urlComponents: {
        baseUrl,
        path: "/redeem",
        queryParams: Object.fromEntries(url.searchParams.entries()),
      },
    });
  } catch (error) {
    console.error("Error generating redemption URL:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to generate redemption URL" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if we're in build mode (no environment variables available)
    if (
      !process.env.AZURE_STORAGE_ACCOUNT_NAME ||
      !process.env.AZURE_STORAGE_ACCOUNT_KEY
    ) {
      return NextResponse.json(
        { error: "Service temporarily unavailable - configuration missing" },
        { status: 503 }
      );
    }

    await ensureTablesExist();

    // Ensure table clients are available
    if (!campaignTableClient || !redemptionCodeTableClient) {
      return NextResponse.json(
        { error: "Database service not available" },
        { status: 503 }
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

    // Get available codes count for the campaign
    const entities =
      redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
        queryOptions: {
          filter: `PartitionKey eq '${campaignId}' and IsUsed eq false`,
          select: ["rowKey"],
        },
      });

    let availableCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _entity of entities) {
      availableCount++;
    }

    // Get campaign info
    let campaignEntity: CampaignEntity;
    try {
      campaignEntity = await campaignTableClient.getEntity<CampaignEntity>(
        "campaign",
        campaignId
      );
    } catch (error) {
      const azureError = error as { statusCode?: number };
      if (azureError.statusCode === 404) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      campaignId,
      campaignName: campaignEntity.Name,
      availableCodes: availableCount,
      canGenerateUrl: availableCount > 0 && campaignEntity.IsActive,
      campaign: {
        isActive: campaignEntity.IsActive,
        maxRedemptions: campaignEntity.MaxRedemptions || 0,
        currentRedemptions: campaignEntity.CurrentRedemptions || 0,
        remainingRedemptions:
          (campaignEntity.MaxRedemptions || 0) -
          (campaignEntity.CurrentRedemptions || 0),
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
