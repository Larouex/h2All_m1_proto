import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
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

    let existingClaim = [];
    let result;
    let isNewClaim = false;

    try {
      // Try to use the full schema (works on local with new columns)
      existingClaim = await db
        .select()
        .from(emailClaims)
        .where(eq(emailClaims.email, normalizedEmail))
        .limit(1);

      if (existingClaim.length > 0) {
        // Update existing claim
        const updateValues = createEmailClaimUpdateValues({
          claimCount: existingClaim[0].claimCount + 1,
        });

        result = await db
          .update(emailClaims)
          .set(updateValues)
          .where(eq(emailClaims.email, normalizedEmail))
          .returning();

        isNewClaim = false;
      } else {
        // Create new email claim
        const insertValues = createEmailClaimInsertValues(normalizedEmail, 1);
        result = await db.insert(emailClaims).values(insertValues).returning();
        isNewClaim = true;
      }
    } catch (schemaError) {
      // Fallback for production - use raw SQL for compatibility
      console.error("Schema error, using SQL fallback:", schemaError);

      // Check if existing using only guaranteed columns
      const existingCheck = await db.execute(sql`
        SELECT id, email, claim_count, created_at, updated_at
        FROM email_claims 
        WHERE email = ${normalizedEmail}
        LIMIT 1
      `);

      if (existingCheck.rows.length > 0) {
        // Update existing claim
        const existingRecord = existingCheck.rows[0];
        const newClaimCount = (Number(existingRecord.claim_count) || 0) + 1;

        await db.execute(sql`
          UPDATE email_claims 
          SET 
            claim_count = ${newClaimCount},
            updated_at = CURRENT_DATE
          WHERE email = ${normalizedEmail}
        `);

        result = [
          {
            id: existingRecord.id,
            email: normalizedEmail,
            claimCount: newClaimCount,
            updatedAt: new Date().toISOString().split("T")[0],
          },
        ];

        isNewClaim = false;
      } else {
        // Create new claim
        const newId = `email-claim-${Date.now()}`;

        await db.execute(sql`
          INSERT INTO email_claims (id, email, claim_count, created_at, updated_at)
          VALUES (${newId}, ${normalizedEmail}, 1, CURRENT_DATE, CURRENT_DATE)
        `);

        result = [
          {
            id: newId,
            email: normalizedEmail,
            claimCount: 1,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
          },
        ];

        isNewClaim = true;
      }
    }

    return NextResponse.json({
      success: true,
      email: result[0].email,
      claimCount: result[0].claimCount,
      isNewClaim: isNewClaim,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email claim error:", error);

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
    }

    return NextResponse.json(
      {
        error: "Failed to process email claim",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export secured handlers - Email claims are public for easy access
export const POST = withSecurity(handleEmailClaim, SECURITY_CONFIGS.PUBLIC);

async function getEmailClaimStatus() {
  return NextResponse.json({
    message: "Email claim API is running",
    timestamp: new Date().toISOString(),
  });
}

export const GET = withSecurity(getEmailClaimStatus, SECURITY_CONFIGS.PUBLIC);
