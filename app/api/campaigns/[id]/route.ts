import { NextRequest, NextResponse } from "next/server";
import { campaignQueries } from "@/app/lib/database-pg";
import { verifyToken } from "@/app/lib/auth";

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get specific campaign by ID
 *     description: Retrieve a specific campaign's details
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign retrieved successfully
 *       404:
 *         description: Campaign not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await campaignQueries.findById(id);

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
      fundingGoal: 5000, // Default funding goal - you can add this to schema later
      currentFunding: Number(campaign.totalRedemptionValue), // Use total redemption value as current funding
      status: campaign.status,
      createdAt: campaign.createdAt,
      expiresAt: campaign.expiresAt,
      updatedAt: campaign.updatedAt,
    });
  } catch (error) {
    console.error("Error in GET /api/campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve campaign" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Update campaign
 *     description: Update campaign details (admin only)
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               redemptionValue:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               maxRedemptions:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Campaign not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get request body
    const body = await request.json();
    const { name, description, redemptionValue, isActive, maxRedemptions } =
      body;

    // Check if campaign exists
    const existingCampaign = await campaignQueries.findById(id);

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Update campaign
    const updateData: Partial<{
      name: string;
      description: string;
      redemptionValue: string;
      isActive: boolean;
      maxRedemptions: number;
    }> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (redemptionValue !== undefined)
      updateData.redemptionValue = redemptionValue.toString();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (maxRedemptions !== undefined)
      updateData.maxRedemptions = maxRedemptions;

    const updatedCampaign = await campaignQueries.update(id, updateData);

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
      fundingGoal: 5000, // Default funding goal
      currentFunding: Number(updatedCampaign.totalRedemptionValue),
      status: updatedCampaign.status,
      createdAt: updatedCampaign.createdAt,
      expiresAt: updatedCampaign.expiresAt,
      updatedAt: updatedCampaign.updatedAt,
    });
  } catch (error) {
    console.error("Error in PUT /api/campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
 *     description: Delete a campaign (admin only)
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Campaign not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if campaign exists
    const existingCampaign = await campaignQueries.findById(id);

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Delete campaign
    await campaignQueries.delete(id);

    return NextResponse.json({
      message: "Campaign deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error in DELETE /api/campaigns/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
