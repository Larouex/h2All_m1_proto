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
  console.log("📧 EMAIL CLAIM API - Starting request processing");

  try {
    const body = await request.json();
    console.log("📧 EMAIL CLAIM API - Body parsed successfully");

    const { email } = body;
    console.log("📧 EMAIL CLAIM API - Received email:", email);

    // Validate email format using utility function
    if (!email || !isValidEmail(email)) {
      console.log("📧 EMAIL CLAIM API - Invalid email format");
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Normalize email address
    const normalizedEmail = normalizeEmail(email);
    console.log("📧 EMAIL CLAIM API - Normalized email:", normalizedEmail);

    // Check if email already exists
    console.log("📧 EMAIL CLAIM API - Checking for existing email claim...");
    const existingClaim = await db
      .select()
      .from(emailClaims)
      .where(eq(emailClaims.email, normalizedEmail))
      .limit(1);

    console.log(
      "📧 EMAIL CLAIM API - Database query completed, existing claims:",
      existingClaim.length
    );

    let result;

    if (existingClaim.length > 0) {
      // Update existing claim - increment count and update timestamp
      console.log(
        "📧 EMAIL CLAIM API - Updating existing claim, current count:",
        existingClaim[0].claimCount
      );

      const updateValues = createEmailClaimUpdateValues({
        claimCount: existingClaim[0].claimCount + 1,
      });

      console.log("📧 EMAIL CLAIM API - Update values:", updateValues);

      result = await db
        .update(emailClaims)
        .set(updateValues)
        .where(eq(emailClaims.email, normalizedEmail))
        .returning();

      console.log(
        "📧 EMAIL CLAIM API - Update successful, new count:",
        result[0].claimCount
      );
    } else {
      // Create new email claim
      console.log("📧 EMAIL CLAIM API - Creating new email claim");

      const insertValues = createEmailClaimInsertValues(normalizedEmail, 1);
      console.log("📧 EMAIL CLAIM API - Insert values:", insertValues);

      result = await db.insert(emailClaims).values(insertValues).returning();
      console.log(
        "📧 EMAIL CLAIM API - Insert successful, claim count:",
        result[0].claimCount
      );
    }

    return NextResponse.json({
      success: true,
      email: result[0].email,
      claimCount: result[0].claimCount,
      isNewClaim: existingClaim.length === 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("📧 EMAIL CLAIM API - Error processing email claim:", error);

    return NextResponse.json(
      {
        error: "Failed to process email claim",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export POST handler
export const POST = handleEmailClaim;

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Email claim API is running",
    timestamp: new Date().toISOString(),
  });
}
