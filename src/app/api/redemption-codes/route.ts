import { NextRequest, NextResponse } from "next/server";
import {
  redemptionCodeTableClient,
  campaignTableClient,
  userTableClient,
  generateUniqueId,
  generateUniqueCode,
  ensureTablesExist,
  ValidationError,
  encodeEmailToRowKey,
} from "@/lib/database";
import type {
  RedemptionCodeEntity,
  CreateRedemptionCodeDto,
  RedeemCodeDto,
  RedemptionCode,
  BatchCodeGenerationResult,
} from "@/types/redemption";
import type { CampaignEntity } from "@/types/campaign";
import type { UserEntity } from "@/types/user";

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
 *         description: Specific redemption code ID (requires campaignId)
 *         example: "1704067200000-xyz789abc"
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter codes by campaign ID
 *         example: "1704067200000-abc123def"
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Find code by unique code string
 *         example: "ABC123XY"
 *       - in: query
 *         name: isUsed
 *         schema:
 *           type: boolean
 *         description: Filter codes by usage status
 *         example: false
 *     responses:
 *       200:
 *         description: Redemption code(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/RedemptionCode'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/RedemptionCode'
 *       404:
 *         description: Redemption code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Generate redemption codes or redeem a code
 *     description: Create new redemption codes for a campaign or redeem an existing code
 *     tags:
 *       - Redemption Codes
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [redeem]
 *         description: Set to 'redeem' to redeem a code instead of generating codes
 *         example: "redeem"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateRedemptionCodesRequest'
 *               - $ref: '#/components/schemas/RedeemCodeRequest'
 *           examples:
 *             generateCodes:
 *               summary: Generate new codes
 *               value:
 *                 campaignId: "1704067200000-abc123def"
 *                 quantity: 10
 *             redeemCode:
 *               summary: Redeem a code
 *               value:
 *                 uniqueCode: "ABC123XY"
 *                 userId: "user-123"
 *                 userEmail: "user@example.com"
 *     responses:
 *       201:
 *         description: Redemption codes generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaignId:
 *                   type: string
 *                   example: "1704067200000-abc123def"
 *                 codesGenerated:
 *                   type: integer
 *                   example: 10
 *                 codes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ABC123XY", "DEF456ZA", "GHI789BC"]
 *                 success:
 *                   type: boolean
 *                   example: true
 *       200:
 *         description: Code redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   $ref: '#/components/schemas/RedemptionCode'
 *                 redemptionValue:
 *                   type: number
 *                   example: 25
 *                 message:
 *                   type: string
 *                   example: "Code redeemed successfully"
 *       207:
 *         description: Partial success in code generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaignId:
 *                   type: string
 *                 codesGenerated:
 *                   type: integer
 *                 codes:
 *                   type: array
 *                   items:
 *                     type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Validation error or code already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign or code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

// Helper function to convert RedemptionCode to RedemptionCodeEntity
function redemptionCodeToEntity(code: RedemptionCode): RedemptionCodeEntity {
  return {
    partitionKey: code.campaignId, // Partition by campaign for efficient querying
    rowKey: code.id,
    CampaignId: code.campaignId,
    UniqueCode: code.uniqueCode,
    IsUsed: code.isUsed,
    RedeemedAt: code.redeemedAt,
    UserId: code.userId,
    CreatedDateTime: code.createdAt,
    UserEmail: code.userEmail,
  };
}

// GET - List redemption codes or get specific code
export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("id");
    const campaignId = searchParams.get("campaignId");
    const uniqueCode = searchParams.get("code");
    const isUsed = searchParams.get("isUsed");

    if (codeId && campaignId) {
      // Get specific redemption code
      try {
        const entity =
          await redemptionCodeTableClient.getEntity<RedemptionCodeEntity>(
            campaignId,
            codeId
          );
        const code = entityToRedemptionCode(entity);
        return NextResponse.json(code);
      } catch (error) {
        const azureError = error as { statusCode?: number };
        if (azureError.statusCode === 404) {
          return NextResponse.json(
            { error: "Redemption code not found" },
            { status: 404 }
          );
        }
        throw error;
      }
    } else if (uniqueCode) {
      // Find code by unique code (requires scanning all campaigns)
      const entities =
        redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
          queryOptions: { filter: `UniqueCode eq '${uniqueCode}'` },
        });

      for await (const entity of entities) {
        const code = entityToRedemptionCode(entity);
        return NextResponse.json(code);
      }

      return NextResponse.json(
        { error: "Redemption code not found" },
        { status: 404 }
      );
    } else {
      // List codes with optional filtering
      let filter = "";
      const filters: string[] = [];

      if (campaignId) {
        filters.push(`PartitionKey eq '${campaignId}'`);
      }

      if (isUsed !== null) {
        const usedFilter =
          isUsed === "true" ? "IsUsed eq true" : "IsUsed eq false";
        filters.push(usedFilter);
      }

      if (filters.length > 0) {
        filter = filters.join(" and ");
      }

      const entities =
        redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
          queryOptions: filter ? { filter } : undefined,
        });

      const codes: RedemptionCode[] = [];
      for await (const entity of entities) {
        codes.push(entityToRedemptionCode(entity));
      }

      return NextResponse.json(codes);
    }
  } catch (error) {
    console.error("Error in GET /api/redemption-codes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve redemption codes" },
      { status: 500 }
    );
  }
}

// POST - Create redemption codes or redeem a code
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "redeem") {
      // Redeem a code
      const { uniqueCode, userId, userEmail }: RedeemCodeDto = body;

      if (!uniqueCode || !userId || !userEmail) {
        throw new ValidationError(
          "Unique code, user ID, and user email are required"
        );
      }

      // Find the redemption code
      const codeEntities =
        redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
          queryOptions: { filter: `UniqueCode eq '${uniqueCode}'` },
        });

      let codeEntity: RedemptionCodeEntity | null = null;
      for await (const entity of codeEntities) {
        codeEntity = entity;
        break;
      }

      if (!codeEntity) {
        return NextResponse.json(
          { error: "Invalid redemption code" },
          { status: 404 }
        );
      }

      if (codeEntity.IsUsed) {
        return NextResponse.json(
          { error: "Redemption code has already been used" },
          { status: 400 }
        );
      }

      // Get campaign details to check expiration and get redemption value
      let campaignEntity: CampaignEntity;
      try {
        campaignEntity = await campaignTableClient.getEntity<CampaignEntity>(
          "campaign",
          codeEntity.CampaignId
        );
      } catch (campaignError) {
        const azureError = campaignError as { statusCode?: number };
        if (azureError.statusCode === 404) {
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 }
          );
        }
        throw campaignError;
      }

      if (!campaignEntity.IsActive) {
        return NextResponse.json(
          { error: "Campaign is not active" },
          { status: 400 }
        );
      }

      if (new Date() > new Date(campaignEntity.ExpiresAt)) {
        return NextResponse.json(
          { error: "Campaign has expired" },
          { status: 400 }
        );
      }

      // Update the redemption code
      const updatedCodeEntity: RedemptionCodeEntity = {
        ...codeEntity,
        IsUsed: true,
        RedeemedAt: new Date(),
        UserId: userId,
        UserEmail: userEmail,
      };

      await redemptionCodeTableClient.updateEntity(
        updatedCodeEntity,
        "Replace"
      );

      // Update campaign redemption count
      const updatedCampaignEntity: CampaignEntity = {
        ...campaignEntity,
        CurrentRedemptions: campaignEntity.CurrentRedemptions + 1,
      };

      await campaignTableClient.updateEntity(updatedCampaignEntity, "Replace");

      // Update user balance
      const userRowKey = encodeEmailToRowKey(userEmail);
      try {
        const userEntity = await userTableClient.getEntity<UserEntity>(
          "user",
          userRowKey
        );
        const updatedUserEntity: UserEntity = {
          ...userEntity,
          Balance: (userEntity.Balance || 0) + campaignEntity.RedemptionValue,
          TotalRedemptions: (userEntity.TotalRedemptions || 0) + 1,
          TotalRedemptionValue:
            (userEntity.TotalRedemptionValue || 0) +
            campaignEntity.RedemptionValue,
        };

        await userTableClient.updateEntity(updatedUserEntity, "Replace");
      } catch (error) {
        console.error("Error updating user balance:", error);
        // Continue with redemption even if user update fails
      }

      const redeemedCode = entityToRedemptionCode(updatedCodeEntity);
      return NextResponse.json({
        code: redeemedCode,
        redemptionValue: campaignEntity.RedemptionValue,
        message: "Code redeemed successfully",
      });
    } else {
      // Create new redemption codes
      const { campaignId, quantity }: CreateRedemptionCodeDto = body;

      if (!campaignId || !quantity || quantity <= 0) {
        throw new ValidationError(
          "Campaign ID and positive quantity are required"
        );
      }

      if (quantity > 100) {
        throw new ValidationError(
          "Cannot generate more than 100 codes at once"
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
        throw new ValidationError("Cannot create codes for inactive campaign");
      }

      // Generate unique codes
      const codes: string[] = [];
      const errors: string[] = [];
      const now = new Date();

      for (let i = 0; i < quantity; i++) {
        try {
          let uniqueCode: string;
          let isUnique = false;
          let attempts = 0;

          // Ensure uniqueness
          while (!isUnique && attempts < 10) {
            uniqueCode = generateUniqueCode();

            // Check if code already exists
            const existingCodes =
              redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
                queryOptions: { filter: `UniqueCode eq '${uniqueCode}'` },
              });

            let exists = false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _entity of existingCodes) {
              exists = true;
              break;
            }

            if (!exists) {
              isUnique = true;
              codes.push(uniqueCode);

              const codeId = generateUniqueId();
              const redemptionCode: RedemptionCode = {
                id: codeId,
                campaignId,
                uniqueCode: uniqueCode!,
                isUsed: false,
                redeemedAt: null,
                userId: null,
                createdAt: now,
              };

              const entity = redemptionCodeToEntity(redemptionCode);
              await redemptionCodeTableClient.createEntity(entity);
            }

            attempts++;
          }

          if (!isUnique) {
            errors.push(
              `Failed to generate unique code after 10 attempts (attempt ${
                i + 1
              })`
            );
          }
        } catch (error) {
          errors.push(`Error creating code ${i + 1}: ${error}`);
        }
      }

      const result: BatchCodeGenerationResult = {
        campaignId,
        codesGenerated: codes.length,
        codes,
        success: codes.length === quantity,
        errors: errors.length > 0 ? errors : undefined,
      };

      const status = result.success ? 201 : 207; // 207 = Multi-Status (partial success)
      return NextResponse.json(result, { status });
    }
  } catch (error) {
    console.error("Error in POST /api/redemption-codes:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to process redemption code request" },
      { status: 500 }
    );
  }
}
