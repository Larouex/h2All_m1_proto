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

    // Generate unique ID for new claims
    const claimId = `claim-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)}`;

    // Production-optimized UPSERT - single atomic operation
    const result = await db.execute(sql`
      INSERT INTO email_claims (id, email, claim_count, created_at, updated_at)
      VALUES (${claimId}, ${normalizedEmail}, 1, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        claim_count = email_claims.claim_count + 1,
        updated_at = NOW()
      RETURNING id, email, claim_count, created_at, updated_at, 
               (xmax = 0) AS is_insert
    `);

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      email: row.email,
      claimCount: Number(row.claim_count),
      isNewClaim: row.is_insert,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Production error logging with context
    console.error("Email claim error:", {
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });

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
