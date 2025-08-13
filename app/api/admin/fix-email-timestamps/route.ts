import { NextRequest, NextResponse } from "next/server";
import { withSecurity, SECURITY_CONFIGS } from "@/app/lib/api-security";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Admin endpoint to fix email claims with invalid timestamps
 * This will update any records that have null or invalid dates
 */
async function handlePOST(request: NextRequest) {
  try {
    console.log("🔧 FIXING EMAIL CLAIMS TIMESTAMPS - Starting repair process");

    // First, let's see what data we have
    const allClaims = await db.select().from(emailClaims);

    console.log("📊 Current email claims data:", {
      totalRecords: allClaims.length,
      sample: allClaims.slice(0, 3).map((claim) => ({
        id: claim.id,
        email: claim.email,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        createdAtType: typeof claim.createdAt,
        updatedAtType: typeof claim.updatedAt,
      })),
    });

    // Count records with invalid timestamps
    const invalidRecords = allClaims.filter(
      (claim) =>
        !claim.createdAt ||
        !claim.updatedAt ||
        isNaN(new Date(claim.createdAt).getTime()) ||
        isNaN(new Date(claim.updatedAt).getTime())
    );

    console.log("❌ Invalid timestamp records found:", invalidRecords.length);

    if (invalidRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "No invalid timestamps found - all records are properly formatted",
        totalRecords: allClaims.length,
        fixedRecords: 0,
      });
    }

    // Fix each invalid record
    let fixedCount = 0;
    const now = new Date();
    const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD format

    for (const record of invalidRecords) {
      console.log(`🔧 Fixing record ${record.id} with email ${record.email}`);

      const updateValues = {
        updatedAt: dateString,
        // If createdAt is also invalid, set it to now (we can't recover the original)
        ...((!record.createdAt ||
          isNaN(new Date(record.createdAt).getTime())) && {
          createdAt: dateString,
        }),
      };

      await db
        .update(emailClaims)
        .set(updateValues)
        .where(sql`${emailClaims.id} = ${record.id}`);

      fixedCount++;
    }

    console.log("✅ TIMESTAMP REPAIR COMPLETE:", {
      totalRecords: allClaims.length,
      invalidFound: invalidRecords.length,
      fixedRecords: fixedCount,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully fixed ${fixedCount} email claim records with invalid timestamps`,
      totalRecords: allClaims.length,
      fixedRecords: fixedCount,
      invalidRecordsFound: invalidRecords.length,
    });
  } catch (error) {
    console.error("❌ Error fixing email claim timestamps:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix email claim timestamps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGET(request: NextRequest) {
  // Just show current status without fixing
  try {
    const allClaims = await db.select().from(emailClaims);

    const invalidRecords = allClaims.filter(
      (claim) =>
        !claim.createdAt ||
        !claim.updatedAt ||
        isNaN(new Date(claim.createdAt).getTime()) ||
        isNaN(new Date(claim.updatedAt).getTime())
    );

    const sample = allClaims.slice(0, 5).map((claim) => ({
      id: claim.id,
      email: claim.email,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      createdAtValid:
        claim.createdAt && !isNaN(new Date(claim.createdAt).getTime()),
      updatedAtValid:
        claim.updatedAt && !isNaN(new Date(claim.updatedAt).getTime()),
    }));

    return NextResponse.json({
      totalRecords: allClaims.length,
      invalidRecords: invalidRecords.length,
      validRecords: allClaims.length - invalidRecords.length,
      sampleData: sample,
    });
  } catch (error) {
    console.error("Error checking email claim timestamps:", error);
    return NextResponse.json(
      { error: "Failed to check email claim timestamps" },
      { status: 500 }
    );
  }
}

// Export secured handlers
export const POST = withSecurity(handlePOST, SECURITY_CONFIGS.ADMIN);
export const GET = withSecurity(handleGET, SECURITY_CONFIGS.ADMIN);
