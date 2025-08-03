import { NextRequest, NextResponse } from "next/server";
import {
  redemptionCodeTableClient,
  campaignTableClient,
  generateUniqueId,
  generateUniqueCode,
  ensureTablesExist,
  ValidationError,
} from "@/lib/database";
import type {
  RedemptionCodeEntity,
  CreateRedemptionCodeDto,
  RedemptionCode,
  BatchCodeGenerationResult,
} from "@/types/redemption";
import type { CampaignEntity } from "@/types/campaign";

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
 *         example: "1754169423931-stp6rpgli"
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
 *     summary: Generate redemption codes
 *     description: Create new redemption codes for a campaign
 *     tags:
 *       - Redemption Codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRedemptionCodesRequest'
 *           examples:
 *             generateCodes:
 *               summary: Generate new codes
 *               value:
 *                 campaignId: "1754169423931-stp6rpgli"
 *                 quantity: 10
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
 *                   example: "1754169423931-stp6rpgli"
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

// POST - Create redemption codes
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();

    const body = await request.json();
    const { campaignId, quantity }: CreateRedemptionCodeDto = body;

    if (!campaignId || !quantity || quantity <= 0) {
      throw new ValidationError(
        "Campaign ID and positive quantity are required"
      );
    }

    if (quantity > 100) {
      throw new ValidationError("Cannot generate more than 100 codes at once");
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
