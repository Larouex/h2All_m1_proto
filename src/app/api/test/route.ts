import { NextRequest, NextResponse } from "next/server";
import {
  ensureTablesExist,
  campaignTableClient,
  redemptionCodeTableClient,
  userTableClient,
  generateUniqueId,
  generateUniqueCode,
  encodeEmailToRowKey,
} from "@/lib/database";
import type { CampaignEntity } from "@/types/campaign";
import type { RedemptionCodeEntity } from "@/types/redemption";
import type { UserEntity } from "@/types/user";

// Test API to verify database operations
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation") || "all";

    const results: Record<string, unknown> = {};

    // Test 1: Ensure tables exist
    if (operation === "all" || operation === "tables") {
      try {
        await ensureTablesExist();
        results.tablesCreated = "SUCCESS: All tables created or already exist";
      } catch (error) {
        results.tablesCreated = `ERROR: ${error}`;
      }
    }

    // Test 2: Create a test campaign
    if (operation === "all" || operation === "campaign") {
      try {
        const campaignId = generateUniqueId();
        const testCampaign: CampaignEntity = {
          partitionKey: "campaign",
          rowKey: campaignId,
          Name: "Test Campaign - Holiday Bonus",
          RedemptionValue: 25,
          IsActive: true,
          CreatedDateTime: new Date(),
          ExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          Description: "Test campaign for holiday bonus redemptions",
          MaxRedemptions: 100,
          CurrentRedemptions: 0,
        };

        await campaignTableClient.createEntity(testCampaign);

        // Read back the campaign
        const retrievedCampaign =
          await campaignTableClient.getEntity<CampaignEntity>(
            "campaign",
            campaignId
          );

        results.campaignTest = {
          status: "SUCCESS",
          campaignId,
          created: testCampaign,
          retrieved: retrievedCampaign,
        };
      } catch (error) {
        results.campaignTest = `ERROR: ${error}`;
      }
    }

    // Test 3: Create test redemption codes
    if (operation === "all" || operation === "codes") {
      try {
        // First, get an existing campaign or create one
        let campaignId = "";
        const campaigns = campaignTableClient.listEntities<CampaignEntity>({
          queryOptions: { filter: "PartitionKey eq 'campaign'" },
        });

        for await (const campaign of campaigns) {
          campaignId = campaign.rowKey;
          break;
        }

        if (!campaignId) {
          // Create a campaign first
          campaignId = generateUniqueId();
          const testCampaign: CampaignEntity = {
            partitionKey: "campaign",
            rowKey: campaignId,
            Name: "Code Test Campaign",
            RedemptionValue: 10,
            IsActive: true,
            CreatedDateTime: new Date(),
            ExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            Description: "Campaign for testing redemption codes",
            MaxRedemptions: 50,
            CurrentRedemptions: 0,
          };
          await campaignTableClient.createEntity(testCampaign);
        }

        // Create 3 test redemption codes
        const codes: string[] = [];
        for (let i = 0; i < 3; i++) {
          const codeId = generateUniqueId();
          const uniqueCode = generateUniqueCode();

          const testCode: RedemptionCodeEntity = {
            partitionKey: campaignId,
            rowKey: codeId,
            CampaignId: campaignId,
            UniqueCode: uniqueCode,
            IsUsed: false,
            RedeemedAt: null,
            UserId: null,
            CreatedDateTime: new Date(),
          };

          await redemptionCodeTableClient.createEntity(testCode);
          codes.push(uniqueCode);
        }

        // Retrieve the codes
        const retrievedCodes: RedemptionCodeEntity[] = [];
        const codeEntities =
          redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
            queryOptions: { filter: `PartitionKey eq '${campaignId}'` },
          });

        for await (const code of codeEntities) {
          retrievedCodes.push(code);
        }

        results.codesTest = {
          status: "SUCCESS",
          campaignId,
          codesCreated: codes,
          totalCodesRetrieved: retrievedCodes.length,
          retrievedCodes: retrievedCodes.slice(0, 3), // Show first 3
        };
      } catch (error) {
        results.codesTest = `ERROR: ${error}`;
      }
    }

    // Test 4: Test user balance update
    if (operation === "all" || operation === "user") {
      try {
        const testEmail = "test@example.com";
        const userRowKey = encodeEmailToRowKey(testEmail);

        // Create a test user with balance fields
        const testUser: UserEntity = {
          partitionKey: "user",
          rowKey: userRowKey,
          Email: testEmail,
          FirstName: "Test",
          LastName: "User",
          Country: "USA",
          PasswordHash: "test-hash",
          Balance: 0,
          CreatedDateTime: new Date(),
          IsActive: true,
          TotalRedemptions: 0,
          TotalRedemptionValue: 0,
        };

        try {
          await userTableClient.createEntity(testUser);
        } catch (error) {
          // User might already exist, try to get existing
          const azureError = error as { statusCode?: number };
          if (azureError.statusCode === 409) {
            const existingUser = await userTableClient.getEntity<UserEntity>(
              "user",
              userRowKey
            );
            testUser.Balance = existingUser.Balance || 0;
            testUser.TotalRedemptions = existingUser.TotalRedemptions || 0;
            testUser.TotalRedemptionValue =
              existingUser.TotalRedemptionValue || 0;
          }
        }

        // Update user balance
        const updatedUser: UserEntity = {
          ...testUser,
          Balance: (testUser.Balance || 0) + 50,
          TotalRedemptions: (testUser.TotalRedemptions || 0) + 1,
          TotalRedemptionValue: (testUser.TotalRedemptionValue || 0) + 50,
        };

        await userTableClient.updateEntity(updatedUser, "Replace");

        // Retrieve updated user
        const retrievedUser = await userTableClient.getEntity<UserEntity>(
          "user",
          userRowKey
        );

        results.userTest = {
          status: "SUCCESS",
          email: testEmail,
          originalBalance: testUser.Balance,
          updatedBalance: retrievedUser.Balance,
          totalRedemptions: retrievedUser.TotalRedemptions,
          totalRedemptionValue: retrievedUser.TotalRedemptionValue,
        };
      } catch (error) {
        results.userTest = `ERROR: ${error}`;
      }
    }

    // Test 5: Complete redemption flow
    if (operation === "all" || operation === "redemption") {
      try {
        // Get an unused redemption code
        const codeEntities =
          redemptionCodeTableClient.listEntities<RedemptionCodeEntity>({
            queryOptions: { filter: "IsUsed eq false" },
          });

        let testCode: RedemptionCodeEntity | null = null;
        for await (const code of codeEntities) {
          testCode = code;
          break;
        }

        if (testCode) {
          const testEmail = "redemption-test@example.com";

          // Mark code as used
          const redeemedCode: RedemptionCodeEntity = {
            ...testCode,
            IsUsed: true,
            RedeemedAt: new Date(),
            UserId: "test-user-123",
            UserEmail: testEmail,
          };

          await redemptionCodeTableClient.updateEntity(redeemedCode, "Replace");

          // Verify the update
          const verifiedCode =
            await redemptionCodeTableClient.getEntity<RedemptionCodeEntity>(
              testCode.partitionKey,
              testCode.rowKey
            );

          results.redemptionTest = {
            status: "SUCCESS",
            codeId: testCode.rowKey,
            uniqueCode: testCode.UniqueCode,
            originalIsUsed: testCode.IsUsed,
            updatedIsUsed: verifiedCode.IsUsed,
            redeemedAt: verifiedCode.RedeemedAt,
            userEmail: verifiedCode.UserEmail,
          };
        } else {
          results.redemptionTest = "No unused codes available for testing";
        }
      } catch (error) {
        results.redemptionTest = `ERROR: ${error}`;
      }
    }

    return NextResponse.json({
      message: "Database operations test completed",
      operation,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in test API:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET method for simple table status check
export async function GET() {
  try {
    await ensureTablesExist();

    // Count entities in each table
    const userCount = await countEntities(userTableClient, "user");
    const campaignCount = await countEntities(campaignTableClient, "campaign");
    const codeCount = await countEntities(redemptionCodeTableClient);

    return NextResponse.json({
      message: "Database status check",
      timestamp: new Date().toISOString(),
      tables: {
        users: { count: userCount, status: "OK" },
        campaigns: { count: campaignCount, status: "OK" },
        redemptionCodes: { count: codeCount, status: "OK" },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Database status check failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to count entities
async function countEntities(
  tableClient: {
    listEntities: (options?: {
      queryOptions?: { filter?: string };
    }) => AsyncIterable<unknown>;
  },
  partitionKey?: string
): Promise<number> {
  let count = 0;
  const filter = partitionKey ? `PartitionKey eq '${partitionKey}'` : undefined;

  const entities = tableClient.listEntities({
    queryOptions: filter ? { filter } : undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _entity of entities) {
    count++;
  }

  return count;
}
