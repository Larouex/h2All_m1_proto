import { NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { desc } from "drizzle-orm";

async function handleGET() {
  try {
    // Get all email claims ordered by most recent
    const claims = await db
      .select()
      .from(emailClaims)
      .orderBy(desc(emailClaims.updatedAt));

    return NextResponse.json({
      success: true,
      claims: claims,
      total: claims.length,
    });
  } catch (error) {
    console.error("Error fetching email claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch email claims" },
      { status: 500 }
    );
  }
}

// Export secured handler
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
