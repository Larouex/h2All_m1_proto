import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
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
