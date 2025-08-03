import { NextRequest, NextResponse } from "next/server";
import {
  campaignTableClient,
  generateUniqueId,
  ensureTablesExist,
  ValidationError,
} from "@/lib/database";
import type {
  CampaignEntity,
  CreateCampaignDto,
  UpdateCampaignDto,
  Campaign,
} from "@/types/campaign";

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: List campaigns or get specific campaign
 *     description: Retrieve all campaigns or a specific campaign by ID with optional filtering
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Specific campaign ID to retrieve
 *         example: "1704067200000-abc123def"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter campaigns by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Campaign(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Campaign'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
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
 *     summary: Create new campaign
 *     description: Create a new promotional campaign
 *     tags:
 *       - Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Campaign already exists
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
 *   put:
 *     summary: Update campaign
 *     description: Update an existing campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID to update
 *         example: "1704067200000-abc123def"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Campaign Name"
 *               redemptionValue:
 *                 type: number
 *                 example: 30
 *               isActive:
 *                 type: boolean
 *                 example: false
 *               description:
 *                 type: string
 *                 example: "Updated campaign description"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59.999Z"
 *               maxRedemptions:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign not found
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
 *   delete:
 *     summary: Delete campaign
 *     description: Delete an existing campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID to delete
 *         example: "1704067200000-abc123def"
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Campaign deleted successfully"
 *       400:
 *         description: Campaign ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign not found
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

// Helper function to convert CampaignEntity to Campaign
function entityToCampaign(entity: CampaignEntity): Campaign {
  return {
    id: entity.rowKey,
    name: entity.Name,
    redemptionValue: entity.RedemptionValue,
    isActive: entity.IsActive,
    createdAt: entity.CreatedDateTime,
    expiresAt: entity.ExpiresAt,
    description: entity.Description,
    maxRedemptions: entity.MaxRedemptions,
    currentRedemptions: entity.CurrentRedemptions,
  };
}

// Helper function to convert Campaign to CampaignEntity
function campaignToEntity(campaign: Campaign): CampaignEntity {
  return {
    partitionKey: "campaign",
    rowKey: campaign.id,
    Name: campaign.name,
    RedemptionValue: campaign.redemptionValue,
    IsActive: campaign.isActive,
    CreatedDateTime: campaign.createdAt,
    ExpiresAt: campaign.expiresAt,
    Description: campaign.description,
    MaxRedemptions: campaign.maxRedemptions,
    CurrentRedemptions: campaign.currentRedemptions,
  };
}

// GET - List all campaigns or get specific campaign
export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");
    const isActive = searchParams.get("isActive");

    if (campaignId) {
      // Get specific campaign
      try {
        const entity = await campaignTableClient.getEntity<CampaignEntity>(
          "campaign",
          campaignId
        );
        const campaign = entityToCampaign(entity);
        return NextResponse.json(campaign);
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
    } else {
      // List campaigns with optional filtering
      let filter = "PartitionKey eq 'campaign'";
      if (isActive !== null) {
        const activeFilter =
          isActive === "true" ? "IsActive eq true" : "IsActive eq false";
        filter += ` and ${activeFilter}`;
      }

      const entities = campaignTableClient.listEntities<CampaignEntity>({
        queryOptions: { filter },
      });

      const campaigns: Campaign[] = [];
      for await (const entity of entities) {
        campaigns.push(entityToCampaign(entity));
      }

      return NextResponse.json(campaigns);
    }
  } catch (error) {
    console.error("Error in GET /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to retrieve campaigns" },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();

    const body: CreateCampaignDto = await request.json();
    const { name, redemptionValue, description, expiresAt, maxRedemptions } =
      body;

    // Validate required fields
    if (!name || !redemptionValue || !expiresAt) {
      throw new ValidationError(
        "Name, redemption value, and expiration date are required"
      );
    }

    if (redemptionValue <= 0) {
      throw new ValidationError("Redemption value must be greater than 0");
    }

    if (new Date(expiresAt) <= new Date()) {
      throw new ValidationError("Expiration date must be in the future");
    }

    const campaignId = generateUniqueId();
    const now = new Date();

    const campaign: Campaign = {
      id: campaignId,
      name,
      redemptionValue,
      isActive: true,
      createdAt: now,
      expiresAt: new Date(expiresAt),
      description,
      maxRedemptions,
      currentRedemptions: 0,
    };

    const entity = campaignToEntity(campaign);
    await campaignTableClient.createEntity(entity);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/campaigns:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const azureError = error as { statusCode?: number };
    if (azureError.statusCode === 409) {
      return NextResponse.json(
        { error: "Campaign already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    await ensureTablesExist();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const updates: UpdateCampaignDto = await request.json();

    // Get existing campaign
    let existingEntity: CampaignEntity;
    try {
      existingEntity = await campaignTableClient.getEntity<CampaignEntity>(
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

    // Apply updates
    const updatedEntity: CampaignEntity = {
      ...existingEntity,
      Name: updates.name ?? existingEntity.Name,
      RedemptionValue:
        updates.redemptionValue ?? existingEntity.RedemptionValue,
      IsActive: updates.isActive ?? existingEntity.IsActive,
      Description: updates.description ?? existingEntity.Description,
      ExpiresAt: updates.expiresAt
        ? new Date(updates.expiresAt)
        : existingEntity.ExpiresAt,
      MaxRedemptions: updates.maxRedemptions ?? existingEntity.MaxRedemptions,
    };

    // Validate updates
    if (updatedEntity.RedemptionValue <= 0) {
      throw new ValidationError("Redemption value must be greater than 0");
    }

    if (updatedEntity.ExpiresAt <= new Date()) {
      throw new ValidationError("Expiration date must be in the future");
    }

    await campaignTableClient.updateEntity(updatedEntity, "Replace");

    const updatedCampaign = entityToCampaign(updatedEntity);
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error in PUT /api/campaigns:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    await ensureTablesExist();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    try {
      await campaignTableClient.deleteEntity("campaign", campaignId);
      return NextResponse.json({ message: "Campaign deleted successfully" });
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
  } catch (error) {
    console.error("Error in DELETE /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
