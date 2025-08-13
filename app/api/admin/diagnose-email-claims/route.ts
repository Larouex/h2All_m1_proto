import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Diagnostic endpoint to check raw database structure and data
 */
async function handleGET(request: NextRequest) {
  try {
    console.log("🔍 DIAGNOSTIC - Starting email claims table investigation");

    // Check the actual table structure
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'email_claims'
      ORDER BY ordinal_position;
    `);

    console.log("📋 Table structure:", tableInfo.rows);

    // Get raw data using SQL to see what's actually in the database
    const rawData = await db.execute(sql`
      SELECT id, email, claim_count, created_at, updated_at
      FROM email_claims 
      ORDER BY updated_at DESC 
      LIMIT 3;
    `);

    console.log("📊 Raw SQL query results:", rawData.rows);

    // Try to use the schema-based query to see what Drizzle returns
    const { emailClaims } = await import("@/db/schema");
    const schemaResults = await db.select().from(emailClaims).limit(3);

    console.log("🔧 Drizzle schema results:", schemaResults);

    return NextResponse.json({
      success: true,
      tableStructure: tableInfo.rows,
      rawSqlData: rawData.rows,
      drizzleSchemaData: schemaResults,
      analysis: {
        rawDataCount: rawData.rows?.length || 0,
        drizzleDataCount: schemaResults?.length || 0,
        hasCreatedAt: rawData.rows?.some((row) => row.created_at !== null),
        hasUpdatedAt: rawData.rows?.some((row) => row.updated_at !== null),
      },
    });
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run diagnostics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export secured handler
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
