import { NextRequest, NextResponse } from "next/server";
import {
  campaignTableClient,
  redemptionCodeTableClient,
  userTableClient,
  encodeEmailToRowKey,
} from "@/lib/database";
import type { CampaignEntity } from "@/types/campaign";
import type { RedemptionCodeEntity } from "@/types/redemption";
import type { UserEntity } from "@/types/user";

/**
 * @swagger
 * /api/campaigns/redeem:
 *   post:
 *     summary: Redeem a campaign code
 *     description: Validates and redeems a campaign code for an authenticated user. Updates user balance, marks code as used, and records redemption details.
 *     tags:
 *       - Campaigns
 *       - Redemption
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - unique_code
 *               - user_email
 *               - user_password
 *             properties:
 *               campaign_id:
 *                 type: string
 *                 description: The campaign identifier
 *                 example: "summer2025"
 *               unique_code:
 *                 type: string
 *                 description: The redemption code to redeem
 *                 example: "A7B9C3D2"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 description: User email for authentication
 *                 example: "user@example.com"
 *               user_password:
 *                 type: string
 *                 description: User password for authentication
 *                 example: "securepassword"
 *               metadata:
 *                 type: object
 *                 description: Optional redemption metadata
 *                 properties:
 *                   source:
 *                     type: string
 *                     example: "email"
 *                   device:
 *                     type: string
 *                     example: "mobile"
 *                   location:
 *                     type: string
 *                     example: "US"
 *     responses:
 *       200:
 *         description: Successfully redeemed code
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
 *                     campaignName:
 *                       type: string
 *                       example: "Summer 2025 Promotion"
 *                     redemptionValue:
 *                       type: number
 *                       example: 25
 *                     newBalance:
 *                       type: number
 *                       example: 100
 *                     redeemedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-03T17:30:00Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     missing_params:
 *                       value: "Missing required parameters"
 *                     invalid_campaign:
 *                       value: "Campaign not found or inactive"
 *                     invalid_code:
 *                       value: "Invalid or already used code"
 *                     expired:
 *                       value: "Code or campaign has expired"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       409:
 *         description: Concurrency conflict - code already redeemed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Code has already been redeemed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Redemption failed due to system error"
 */

// Simple password hashing (same as login/register)
function hashPassword(password: string): string {
  return Buffer.from(password + "salt").toString("base64");
}

// Simple password verification
function verifyPassword(
  inputPassword: string,
  storedPasswordHash: string
): boolean {
  const inputPasswordHash = hashPassword(inputPassword);
  return inputPasswordHash === storedPasswordHash;
}

// Authenticate user credentials
async function authenticateUser(
  email: string,
  password: string
): Promise<UserEntity | null> {
  try {
    const userRowKey = encodeEmailToRowKey(email);
    const userEntity = await userTableClient.getEntity<UserEntity>(
      "users",
      userRowKey
    );

    if (!userEntity.IsActive) {
      return null; // User account is inactive
    }

    if (verifyPassword(password, userEntity.PasswordHash as string)) {
      return userEntity;
    }

    return null; // Invalid password
  } catch {
    // User not found or other error
    return null;
  }
}

// Validate campaign and code (reusing validation logic)
async function validateCampaignAndCode(campaignId: string, uniqueCode: string) {
  const now = new Date();

  // Get campaign
  let campaignEntity: CampaignEntity;
  try {
    campaignEntity = await campaignTableClient.getEntity<CampaignEntity>(
      "campaign",
      campaignId
    );
  } catch {
    return {
      valid: false,
      error: "Campaign not found",
      statusCode: 404,
    };
  }

  // Check if campaign is active
  if (!campaignEntity.IsActive) {
    return {
      valid: false,
      error: "Campaign is not active",
      statusCode: 410,
    };
  }

  // Check campaign expiration
  const campaignEndDate = new Date(campaignEntity.ExpiresAt);
  if (now > campaignEndDate) {
    return {
      valid: false,
      error: "Campaign has expired",
      statusCode: 410,
    };
  }

  // Get redemption code
  let codeEntity: RedemptionCodeEntity;
  try {
    // Query for the code by campaign and unique code
    const entities = redemptionCodeTableClient.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${campaignId}' and UniqueCode eq '${uniqueCode}'`,
      },
    });

    let foundCode = null;
    for await (const entity of entities) {
      foundCode = entity;
      break; // Get first (should be only) match
    }

    if (!foundCode) {
      return {
        valid: false,
        error: "Redemption code not found",
        statusCode: 404,
      };
    }

    codeEntity = foundCode as unknown as RedemptionCodeEntity;
  } catch {
    return {
      valid: false,
      error: "Error accessing redemption codes",
      statusCode: 500,
    };
  }

  // Check if code is already used
  if (codeEntity.IsUsed) {
    return {
      valid: false,
      error: "Code has already been redeemed",
      statusCode: 409,
    };
  }

  // Check code expiration if set
  if (codeEntity.ExpiresAt) {
    const codeEndDate = new Date(codeEntity.ExpiresAt);
    if (now > codeEndDate) {
      return {
        valid: false,
        error: "Redemption code has expired",
        statusCode: 410,
      };
    }
  }

  return {
    valid: true,
    campaign: campaignEntity,
    code: codeEntity,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaign_id,
      unique_code,
      user_email,
      user_password,
      metadata = {},
    } = body;

    // Validate required parameters
    if (!campaign_id || !unique_code || !user_email || !user_password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: campaign_id, unique_code, user_email, user_password",
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const userEntity = await authenticateUser(user_email, user_password);
    if (!userEntity) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials or inactive account",
        },
        { status: 401 }
      );
    }

    // Validate campaign and code
    const validation = await validateCampaignAndCode(campaign_id, unique_code);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: validation.statusCode }
      );
    }

    const { campaign, code } = validation;
    const now = new Date();
    const redemptionValue = parseFloat(
      campaign!.RedemptionValue?.toString() || "0"
    );

    // Start atomic transaction-like operations
    // Note: Azure Table Storage doesn't support true transactions across entities,
    // so we'll implement optimistic concurrency control

    try {
      // Step 1: Re-check and mark code as used (with optimistic concurrency)
      const updatedCode: RedemptionCodeEntity = {
        ...code!,
        IsUsed: true,
        UserEmail: user_email,
        RedeemedAt: now,
        UpdatedAt: now.toISOString(),
        RedemptionValue: redemptionValue,
        RedemptionSource: metadata.source || "api",
        RedemptionDevice: metadata.device || "unknown",
        RedemptionLocation: metadata.location || "unknown",
      };

      // Use ETag for optimistic concurrency control
      await redemptionCodeTableClient.updateEntity(updatedCode, "Replace", {
        etag: (code as { etag?: string }).etag,
      });

      // Step 2: Update user balance and stats
      const updatedUser: UserEntity = {
        ...userEntity,
        Balance: (userEntity.Balance || 0) + redemptionValue,
        TotalRedemptions: (userEntity.TotalRedemptions || 0) + 1,
        TotalRedemptionValue:
          (userEntity.TotalRedemptionValue || 0) + redemptionValue,
        UpdatedAt: now.toISOString(),
      };

      await userTableClient.updateEntity(updatedUser, "Replace");

      // Success response
      return NextResponse.json({
        success: true,
        message: "Code redeemed successfully",
        redemption: {
          campaignName: campaign!.Name,
          redemptionValue: redemptionValue,
          newBalance: updatedUser.Balance,
          redeemedAt: now.toISOString(),
        },
      });
    } catch (updateError: unknown) {
      // Handle concurrency conflicts
      const azureError = updateError as { statusCode?: number };
      if (azureError?.statusCode === 412) {
        // Precondition Failed (ETag mismatch)
        // Re-check if code was used by another request
        try {
          // Query for the code by campaign and unique code
          const entities = redemptionCodeTableClient.listEntities({
            queryOptions: {
              filter: `PartitionKey eq '${campaign_id}' and UniqueCode eq '${unique_code}'`,
            },
          });

          let reCheckedCode = null;
          for await (const entity of entities) {
            reCheckedCode = entity;
            break; // Get first (should be only) match
          }

          if (
            reCheckedCode &&
            (reCheckedCode as unknown as RedemptionCodeEntity).IsUsed
          ) {
            return NextResponse.json(
              {
                success: false,
                error: "Code has already been redeemed by another request",
              },
              { status: 409 }
            );
          }
        } catch (recheckError) {
          // Code might have been deleted or other error
          console.error(
            "Error rechecking code after concurrency conflict:",
            recheckError
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: "Concurrency conflict - please try again",
          },
          { status: 409 }
        );
      }

      // Other update errors
      console.error("Error updating entities during redemption:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error in redemption API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Redemption failed due to system error",
      },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed - use POST to redeem codes",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed - use POST to redeem codes",
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed - use POST to redeem codes",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed - use POST to redeem codes",
    },
    { status: 405 }
  );
}
