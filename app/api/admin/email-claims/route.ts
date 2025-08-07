import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailClaims);
    const totalCount = totalCountResult[0].count;

    // Get paginated results
    const claims = await db
      .select()
      .from(emailClaims)
      .orderBy(desc(emailClaims.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get summary statistics
    const statsResult = await db
      .select({
        totalEmails: sql<number>`count(*)`,
        totalClaims: sql<number>`sum(claim_count)`,
        avgClaims: sql<number>`avg(claim_count)`,
        maxClaims: sql<number>`max(claim_count)`,
      })
      .from(emailClaims);

    const stats = statsResult[0];

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalEmails: Number(stats.totalEmails),
        totalClaims: Number(stats.totalClaims),
        avgClaims: Number(stats.avgClaims?.toFixed(2)),
        maxClaims: Number(stats.maxClaims),
      },
    });
  } catch (error) {
    console.error("Error fetching email claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch email claims" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(emailClaims)
      .where(eq(emailClaims.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email claim for ${email} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting email claim:", error);
    return NextResponse.json(
      { error: "Failed to delete email claim" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, claimCount } = body;

    if (!email || claimCount === undefined) {
      return NextResponse.json(
        { error: "Email and claimCount are required" },
        { status: 400 }
      );
    }

    if (claimCount < 0) {
      return NextResponse.json(
        { error: "Claim count cannot be negative" },
        { status: 400 }
      );
    }

    const result = await db
      .update(emailClaims)
      .set({
        claimCount: claimCount,
        updatedAt: new Date(),
      })
      .where(eq(emailClaims.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Email claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      claim: result[0],
      message: `Email claim for ${email} updated successfully`,
    });
  } catch (error) {
    console.error("Error updating email claim:", error);
    return NextResponse.json(
      { error: "Failed to update email claim" },
      { status: 500 }
    );
  }
}
