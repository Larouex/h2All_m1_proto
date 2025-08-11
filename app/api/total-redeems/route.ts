import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClaims } from "@/db/schema";
import { sum } from "drizzle-orm";

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds cache
let cachedCount: number | null = null;
let cacheTimestamp: number = 0;

export async function GET(_request: NextRequest) {
  try {
    // Check cache first for fast response
    const now = Date.now();
    if (cachedCount !== null && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(
        {
          success: true,
          totalRedeems: cachedCount,
          cached: true,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=30",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Sum claim counts from email_claims table using Drizzle ORM
    // Query email_claims table and sum the claim_count column
    const result = await db
      .select({ totalClaims: sum(emailClaims.claimCount) })
      .from(emailClaims);

    const totalRedeems = parseInt(result[0]?.totalClaims || "0", 10);

    // Update cache
    cachedCount = totalRedeems;
    cacheTimestamp = now;

    return NextResponse.json(
      {
        success: true,
        totalRedeems: totalRedeems,
        cached: false,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching total redeems:", error);

    // Return cached data if available, even if stale
    if (cachedCount !== null) {
      return NextResponse.json(
        {
          success: true,
          totalRedeems: cachedCount,
          cached: true,
          stale: true,
          error: "Database unavailable, serving cached data",
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=10",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch total redeems count",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Optional: Add POST method for cache invalidation (admin use)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "invalidate-cache") {
      cachedCount = null;
      cacheTimestamp = 0;

      return NextResponse.json(
        {
          success: true,
          message: "Cache invalidated successfully",
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in POST /api/total-redeems:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
