import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  createEmailClaimUpdateValues,
  isValidEmail,
  normalizeEmail,
} from "../../../lib/utils/emailClaimUtils";

async function handleGetEmailClaims(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get all claims for counting and stats
    const allClaims = await db.select().from(emailClaims);

    // Get paginated results
    const claims = await db
      .select()
      .from(emailClaims)
      .orderBy(desc(emailClaims.updatedAt))
      .limit(limit)
      .offset(offset);

    // Debug: Log what we're getting from the database
    console.log("🔍 EMAIL CLAIMS DEBUG - Database raw data:", {
      totalClaims: claims.length,
      firstClaimSample: claims[0]
        ? {
            id: claims[0].id,
            email: claims[0].email,
            createdAt: claims[0].createdAt,
            updatedAt: claims[0].updatedAt,
            createdAtType: typeof claims[0].createdAt,
            updatedAtType: typeof claims[0].updatedAt,
            createdAtString: String(claims[0].createdAt),
            updatedAtString: String(claims[0].updatedAt),
          }
        : "No claims found",
    });

    // Calculate stats from all claims
    const totalEmails = allClaims.length;
    const totalClaims = allClaims.reduce(
      (sum, claim) => sum + claim.claimCount,
      0
    );
    const avgClaims = totalEmails > 0 ? totalClaims / totalEmails : 0;
    const maxClaims =
      totalEmails > 0 ? Math.max(...allClaims.map((c) => c.claimCount)) : 0;

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        totalCount: totalEmails,
        totalPages: Math.ceil(totalEmails / limit),
      },
      stats: {
        totalEmails,
        totalClaims,
        avgClaims: Number(avgClaims.toFixed(2)),
        maxClaims,
      },
    });
  } catch (error) {
    console.error("Error fetching email claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch email claims" },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = handleGetEmailClaims;

async function handleDeleteEmailClaim(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(emailClaims)
      .where(eq(emailClaims.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email claim for ${email} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting email claim:", error);
    return NextResponse.json(
      { error: "Failed to delete email claim" },
      { status: 500 }
    );
  }
}

export const DELETE = handleDeleteEmailClaim;

async function handleUpdateEmailClaim(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, claimCount } = body;

    if (!email || claimCount === undefined) {
      return NextResponse.json(
        { error: "Email and claimCount are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (claimCount < 0) {
      return NextResponse.json(
        { error: "Claim count cannot be negative" },
        { status: 400 }
      );
    }

    // Normalize email and create proper update values
    const normalizedEmail = normalizeEmail(email);
    const updateValues = createEmailClaimUpdateValues({ claimCount });

    const result = await db
      .update(emailClaims)
      .set(updateValues)
      .where(eq(emailClaims.email, normalizedEmail))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      claim: result[0],
      message: `Email claim for ${normalizedEmail} updated successfully`,
    });
  } catch (error) {
    console.error("Error updating email claim:", error);
    return NextResponse.json(
      { error: "Failed to update email claim" },
      { status: 500 }
    );
  }
}

export const PUT = handleUpdateEmailClaim;
