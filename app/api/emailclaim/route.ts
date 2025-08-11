import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createEmailClaimInsertValues,
  createEmailClaimUpdateValues,
  isValidEmail,
  normalizeEmail,
} from "../../lib/utils/emailClaimUtils";

async function handleEmailClaim(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format using utility function
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Normalize email address
    const normalizedEmail = normalizeEmail(email);

    // Check if email already exists
    const existingClaim = await db
      .select()
      .from(emailClaims)
      .where(eq(emailClaims.email, normalizedEmail))
      .limit(1);

    let result;

    if (existingClaim.length > 0) {
      // Update existing claim - increment count and update timestamp
      const updateValues = createEmailClaimUpdateValues({
        claimCount: existingClaim[0].claimCount + 1,
      });

      console.log(
        "📅 DATABASE UPDATE - Sending values to database:",
        updateValues
      );

      result = await db
        .update(emailClaims)
        .set(updateValues)
        .where(eq(emailClaims.email, normalizedEmail))
        .returning();

      console.log("📅 DATABASE UPDATE - Result from database:", {
        id: result[0].id,
        email: result[0].email,
        claimCount: result[0].claimCount,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt,
      });

      console.log(
        `Updated email claim for ${normalizedEmail}, new count: ${
          existingClaim[0].claimCount + 1
        }`
      );
    } else {
      // Create new email claim with proper timestamps
      const insertValues = createEmailClaimInsertValues(normalizedEmail, 1);

      console.log(
        "📅 DATABASE INSERT - Sending values to database:",
        insertValues
      );

      result = await db.insert(emailClaims).values(insertValues).returning();

      console.log("📅 DATABASE INSERT - Result from database:", {
        id: result[0].id,
        email: result[0].email,
        claimCount: result[0].claimCount,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt,
      });

      console.log(`Created new email claim for ${normalizedEmail}`);
    }

    return NextResponse.json({
      success: true,
      email: result[0].email,
      claimCount: result[0].claimCount,
      isNewClaim: existingClaim.length === 0,
    });
  } catch (error) {
    console.error("Error processing email claim:", error);

    // Check if it's a table doesn't exist error
    if (
      error instanceof Error &&
      error.message.includes('relation "email_claims" does not exist')
    ) {
      return NextResponse.json(
        {
          error:
            "Email claims system is not yet initialized. Please contact support.",
          code: "TABLE_NOT_EXISTS",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process email claim" },
      { status: 500 }
    );
  }
}

// Export POST handler
export const POST = handleEmailClaim;

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

    // Get email claim data
    const claim = await db
      .select()
      .from(emailClaims)
      .where(eq(emailClaims.email, email))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: claim[0].email,
      claimCount: claim[0].claimCount,
      createdAt: claim[0].createdAt,
      updatedAt: claim[0].updatedAt,
    });
  } catch (error) {
    console.error("Error fetching email claim:", error);
    return NextResponse.json(
      { error: "Failed to fetch email claim" },
      { status: 500 }
    );
  }
}
