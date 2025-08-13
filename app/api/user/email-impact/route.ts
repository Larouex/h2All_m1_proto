import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq, sum } from "drizzle-orm";

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get the email claim data
    const emailClaim = await db
      .select()
      .from(emailClaims)
      .where(eq(emailClaims.email, email))
      .limit(1);

    // Also get total redeems count to avoid separate API call
    const totalRedeemsResult = await db
      .select({ totalClaims: sum(emailClaims.claimCount) })
      .from(emailClaims);

    const totalRedeems = parseInt(
      totalRedeemsResult[0]?.totalClaims || "0",
      10
    );

    if (emailClaim.length === 0) {
      // No claims found for this email
      return NextResponse.json({
        claimedBottles: 0,
        totalContribution: 0,
        waterFunded: 0,
        email: email,
        hasData: false,
        totalRedeems: totalRedeems, // Include total redeems even for new users
      });
    }

    const claim = emailClaim[0];
    const claimedBottles = claim.claimCount;
    const totalContribution = claimedBottles * 0.05;
    const waterFunded = claimedBottles * 16.9; // Assuming each bottle = 16.9 oz of water funded

    return NextResponse.json({
      claimedBottles,
      totalContribution: Number(totalContribution.toFixed(2)),
      waterFunded: Number(waterFunded.toFixed(1)),
      email: email,
      lastClaimDate: claim.updatedAt,
      hasData: true,
      totalRedeems: totalRedeems, // Include total redeems to avoid separate API call
    });
  } catch (error) {
    console.error("Error fetching email impact:", error);
    return NextResponse.json(
      { error: "Failed to fetch impact data" },
      { status: 500 }
    );
  }
}

// Export secured handler
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.PUBLIC);
