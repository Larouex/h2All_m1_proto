import { NextRequest, NextResponse } from "next/server";
import { campaignQueries } from "@/app/lib/database-pg";
import { campaigns } from "@/db/schema";
import { verifyToken } from "@/app/lib/auth";
import type { CreateCampaignDto, UpdateCampaignDto } from "@/types/campaign";

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
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter campaigns by active status
 *     responses:
 *       200:
 *         description: Campaign(s) retrieved successfully
 *       404:
 *         description: Campaign not found
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");
    const isActive = searchParams.get("isActive");

    if (campaignId) {
      // Get specific campaign
      const campaign = await campaignQueries.findById(campaignId);

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: campaign.id,
        name: campaign.name,
        redemptionValue: Number(campaign.redemptionValue),
        isActive: campaign.isActive,
        description: campaign.description,
        maxRedemptions: campaign.maxRedemptions,
        currentRedemptions: campaign.currentRedemptions,
        totalRedemptions: campaign.totalRedemptions,
        totalRedemptionValue: Number(campaign.totalRedemptionValue),
        status: campaign.status,
        createdAt: campaign.createdAt,
        expiresAt: campaign.expiresAt,
        updatedAt: campaign.updatedAt,
      });
    } else {
      // List campaigns with optional filtering
      const campaigns = await campaignQueries.list(50, 0);

      // Filter by isActive if specified
      const filteredCampaigns =
        isActive !== null
          ? campaigns.filter((c) =>
              isActive === "true" ? c.isActive : !c.isActive
            )
          : campaigns;

      return NextResponse.json(
        filteredCampaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          redemptionValue: Number(campaign.redemptionValue),
          isActive: campaign.isActive,
          description: campaign.description,
          maxRedemptions: campaign.maxRedemptions,
          currentRedemptions: campaign.currentRedemptions,
          totalRedemptions: campaign.totalRedemptions,
          totalRedemptionValue: Number(campaign.totalRedemptionValue),
          status: campaign.status,
          createdAt: campaign.createdAt,
          expiresAt: campaign.expiresAt,
          updatedAt: campaign.updatedAt,
        }))
      );
    }
  } catch (error) {
    console.error("Error in GET /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to retrieve campaigns" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     description: Create a new campaign (admin only)
 *     tags:
 *       - Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignDto'
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
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

    const body: CreateCampaignDto = await request.json();
    const { name, redemptionValue, description, expiresAt, maxRedemptions } =
      body;

    // Input validation
    if (!name || !redemptionValue || !expiresAt) {
      return NextResponse.json(
        { error: "Name, redemption value, and expiration date are required" },
        { status: 400 }
      );
    }

    if (redemptionValue <= 0) {
      return NextResponse.json(
        { error: "Redemption value must be greater than 0" },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await campaignQueries.create({
      name: name.trim(),
      redemptionValue: redemptionValue.toString(),
      isActive: true,
      description: description || null,
      maxRedemptions: maxRedemptions || null,
      currentRedemptions: 0,
      totalRedemptions: 0,
      totalRedemptionValue: "0.00",
      status: "active",
      expiresAt: new Date(expiresAt),
    });

    return NextResponse.json(
      {
        id: campaign.id,
        name: campaign.name,
        redemptionValue: Number(campaign.redemptionValue),
        isActive: campaign.isActive,
        description: campaign.description,
        maxRedemptions: campaign.maxRedemptions,
        currentRedemptions: campaign.currentRedemptions,
        totalRedemptions: campaign.totalRedemptions,
        totalRedemptionValue: Number(campaign.totalRedemptionValue),
        status: campaign.status,
        createdAt: campaign.createdAt,
        expiresAt: campaign.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/campaigns:
 *   put:
 *     summary: Update a campaign
 *     description: Update an existing campaign (admin only)
 *     tags:
 *       - Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCampaignDto'
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Campaign not found
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
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

    const body: UpdateCampaignDto & { id: string } = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const existingCampaign = await campaignQueries.findById(id);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateFields: Partial<typeof campaigns.$inferInsert> = {};
    if (updateData.name !== undefined)
      updateFields.name = updateData.name.trim();
    if (updateData.redemptionValue !== undefined)
      updateFields.redemptionValue = updateData.redemptionValue.toString();
    if (updateData.isActive !== undefined)
      updateFields.isActive = updateData.isActive;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description;
    if (updateData.maxRedemptions !== undefined)
      updateFields.maxRedemptions = updateData.maxRedemptions;
    if (updateData.expiresAt !== undefined)
      updateFields.expiresAt = new Date(updateData.expiresAt);

    // Update campaign
    const updatedCampaign = await campaignQueries.update(id, updateFields);

    return NextResponse.json({
      id: updatedCampaign.id,
      name: updatedCampaign.name,
      redemptionValue: Number(updatedCampaign.redemptionValue),
      isActive: updatedCampaign.isActive,
      description: updatedCampaign.description,
      maxRedemptions: updatedCampaign.maxRedemptions,
      currentRedemptions: updatedCampaign.currentRedemptions,
      totalRedemptions: updatedCampaign.totalRedemptions,
      totalRedemptionValue: Number(updatedCampaign.totalRedemptionValue),
      status: updatedCampaign.status,
      expiresAt: updatedCampaign.expiresAt,
      updatedAt: updatedCampaign.updatedAt,
    });
  } catch (error) {
    console.error("Error in PUT /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/campaigns:
 *   delete:
 *     summary: Delete a campaign
 *     description: Delete a campaign (admin only)
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID to delete
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       400:
 *         description: Campaign ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Campaign not found
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
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

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const existingCampaign = await campaignQueries.findById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Delete campaign
    await campaignQueries.delete(campaignId);

    return NextResponse.json({
      message: "Campaign deleted successfully",
      id: campaignId,
    });
  } catch (error) {
    console.error("Error in DELETE /api/campaigns:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
