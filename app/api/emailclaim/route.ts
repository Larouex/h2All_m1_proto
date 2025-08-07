import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingClaim = await db
      .select()
      .from(emailClaims)
      .where(eq(emailClaims.email, email))
      .limit(1);

    let result;

    if (existingClaim.length > 0) {
      // Update existing claim - increment count and update timestamp
      result = await db
        .update(emailClaims)
        .set({
          claimCount: existingClaim[0].claimCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(emailClaims.email, email))
        .returning();

      console.log(
        `Updated email claim for ${email}, new count: ${
          existingClaim[0].claimCount + 1
        }`
      );
    } else {
      // Create new email claim
      result = await db
        .insert(emailClaims)
        .values({
          email: email,
          claimCount: 1,
        })
        .returning();

      console.log(`Created new email claim for ${email}`);
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
    if (error instanceof Error && error.message.includes('relation "email_claims" does not exist')) {
      return NextResponse.json(
        { 
          error: "Email claims system is not yet initialized. Please contact support.",
          code: "TABLE_NOT_EXISTS"
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
