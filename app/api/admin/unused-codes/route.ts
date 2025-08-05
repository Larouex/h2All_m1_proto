import { NextResponse } from "next/server";
import { db } from "@/db";
import { redemptionCodes, campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const unusedCodes = await db
      .select({
        id: redemptionCodes.id,
        uniqueCode: redemptionCodes.uniqueCode,
        campaignId: redemptionCodes.campaignId,
        isUsed: redemptionCodes.isUsed,
        redemptionValue: redemptionCodes.redemptionValue,
        campaignName: campaigns.name,
      })
      .from(redemptionCodes)
      .leftJoin(campaigns, eq(redemptionCodes.campaignId, campaigns.id))
      .where(eq(redemptionCodes.isUsed, false))
      .limit(500); // Limit to prevent too many results

    return NextResponse.json({
      codes: unusedCodes,
      total: unusedCodes.length,
    });
  } catch (error) {
    console.error("Error fetching unused codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch unused codes" },
      { status: 500 }
    );
  }
}
