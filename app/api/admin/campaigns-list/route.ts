import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";

export async function GET() {
  try {
    const campaignData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        redemptionValue: campaigns.redemptionValue,
        isActive: campaigns.isActive,
        expiresAt: campaigns.expiresAt,
      })
      .from(campaigns);

    return NextResponse.json({
      campaigns: campaignData,
      total: campaignData.length,
    });
  } catch (error) {
    console.error("Error fetching campaigns list:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
