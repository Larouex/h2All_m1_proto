import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    if (emailClaim.length === 0) {
      // No claims found for this email
      return NextResponse.json({
        claimedBottles: 0,
        totalContribution: 0,
        waterFunded: 0,
        email: email,
        hasData: false,
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
    });
  } catch (error) {
    console.error("Error fetching email impact:", error);
    return NextResponse.json(
      { error: "Failed to fetch impact data" },
      { status: 500 }
    );
  }
}
