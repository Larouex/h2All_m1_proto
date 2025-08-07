import { NextResponse } from "next/server";
import { db } from "@/db";

export async function POST() {
  try {
    console.log("Creating email_claims table...");

    // The table creation SQL - safe to run multiple times
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "email_claims" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "claim_count" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "email_claims_email_unique" UNIQUE("email")
      );
    `;

    // Create index for faster email lookups
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS "idx_email_claims_email" ON "email_claims" ("email");
    `;

    // Execute the SQL directly
    await db.execute(createTableSQL);
    console.log("✅ email_claims table created");

    await db.execute(createIndexSQL);
    console.log("✅ Email index created");

    // Test the table
    const testResult = await db.execute(
      'SELECT count(*) as count FROM "email_claims"'
    );
    console.log("✅ Table verification successful");

    return NextResponse.json({
      success: true,
      message: "email_claims table created successfully",
      recordCount: testResult.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error("❌ Error creating email_claims table:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create email_claims table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
