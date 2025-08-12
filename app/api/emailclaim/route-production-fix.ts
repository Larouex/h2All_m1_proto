import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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

    // Check if email already exists - using only guaranteed columns
    console.log("📧 EMAIL CLAIM API - Checking for existing email claim...");

    // Use raw SQL to avoid schema issues with new columns
    const existingClaim = await db.execute(sql`
      SELECT id, email, claim_count, created_at, updated_at
      FROM email_claims 
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `);

    console.log(
      "📧 EMAIL CLAIM API - Database query completed, existing claims:",
      existingClaim.rows.length
    );

    let result;

    if (existingClaim.rows.length > 0) {
      // Update existing claim
      console.log("📧 EMAIL CLAIM API - Updating existing email claim");

      const existingRecord = existingClaim.rows[0];
      const newClaimCount = (existingRecord.claim_count || 0) + 1;

      // Update using raw SQL to avoid new column issues
      await db.execute(sql`
        UPDATE email_claims 
        SET 
          claim_count = ${newClaimCount},
          updated_at = CURRENT_DATE
        WHERE email = ${normalizedEmail}
      `);

      result = {
        id: existingRecord.id,
        email: normalizedEmail,
        claimCount: newClaimCount,
        isNewClaim: false,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      console.log("📧 EMAIL CLAIM API - Successfully updated existing claim");
    } else {
      // Create new claim
      console.log("📧 EMAIL CLAIM API - Creating new email claim");

      // Insert using raw SQL with only guaranteed columns
      const insertResult = await db.execute(sql`
        INSERT INTO email_claims (id, email, claim_count, created_at, updated_at)
        VALUES (${`email-claim-${Date.now()}`}, ${normalizedEmail}, 1, CURRENT_DATE, CURRENT_DATE)
        RETURNING id, email, claim_count, created_at, updated_at
      `);

      const newRecord = insertResult.rows[0];

      result = {
        id: newRecord.id,
        email: normalizedEmail,
        claimCount: 1,
        isNewClaim: true,
        createdAt: newRecord.created_at,
        updatedAt: newRecord.updated_at,
      };

      console.log("📧 EMAIL CLAIM API - Successfully created new claim");
    }

    console.log("📧 EMAIL CLAIM API - Operation completed successfully");

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isNewClaim
        ? "Email claim registered successfully"
        : "Email claim count updated",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("📧 EMAIL CLAIM API - Error processing email claim:", error);

    // Enhanced error details
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack:
        error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      timestamp: new Date().toISOString(),
    };

    console.error("📧 EMAIL CLAIM API - Error details:", errorDetails);

    // Check for specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("connect") ||
        error.message.includes("connection")
      ) {
        return NextResponse.json(
          {
            error: "Database connection failed",
            code: "DATABASE_CONNECTION_ERROR",
            details: error.message,
          },
          { status: 503 }
        );
      }

      if (error.message.includes('relation "email_claims" does not exist')) {
        return NextResponse.json(
          {
            error: "Email claims system not initialized",
            code: "TABLE_NOT_EXISTS",
          },
          { status: 503 }
        );
      }

      if (
        error.message.includes("column") &&
        error.message.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            error: "Database schema mismatch - migration needed",
            code: "SCHEMA_MISMATCH",
            details: error.message,
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to process email claim",
        details: errorDetails.message,
      },
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

    // Use raw SQL to avoid new column issues
    const claim = await db.execute(sql`
      SELECT id, email, claim_count, created_at, updated_at
      FROM email_claims 
      WHERE email = ${email}
      LIMIT 1
    `);

    if (claim.rows.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    const record = claim.rows[0];

    return NextResponse.json({
      email: record.email,
      claimCount: record.claim_count,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  } catch (error) {
    console.error("Error fetching email claim:", error);
    return NextResponse.json(
      { error: "Failed to fetch email claim" },
      { status: 500 }
    );
  }
}
