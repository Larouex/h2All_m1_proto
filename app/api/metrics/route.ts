import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Create PostgreSQL connection pool for metrics (separate from dev database)
const pool = new Pool({
  connectionString: process.env.METRIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: NextRequest) {
  try {
    // Simple API key check for local access only
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.METRICS_API_KEY && apiKey !== "SkyBlueSkyWilco2433") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, let's check the table structure
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'email_claims'
    `;
    const columnsResult = await pool.query(columnsQuery);
    console.log('Table columns:', columnsResult.rows);

    // Fetch all email claims - sorted by updated_at
    const claimsQuery = `
      SELECT * FROM email_claims 
      ORDER BY updated_at DESC 
      LIMIT 100
    `;
    
    const claimsResult = await pool.query(claimsQuery);
    const claims = claimsResult.rows;

    // Calculate total metrics
    const totalClaims = claims?.length || 0;
    const totalClaimCount = claims?.reduce((sum, claim) => sum + (claim.claim_count || 1), 0) || 0;

    // Calculate daily claims for the last 7 days
    const dailyClaims: { [key: string]: number } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    // Initialize last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyClaims[dateStr] = 0;
    }

    // Count claims per day using created_at
    claims?.forEach((claim) => {
      if (claim.created_at) {
        // Handle date string that might just be YYYY-MM-DD
        const claimDateStr = typeof claim.created_at === 'string' && claim.created_at.length === 10 
          ? claim.created_at 
          : new Date(claim.created_at).toISOString().split("T")[0];
        
        if (dailyClaims.hasOwnProperty(claimDateStr)) {
          dailyClaims[claimDateStr]++;
        }
      }
    });
    
    console.log('Daily claims data:', dailyClaims);

    // Convert to array format
    const dailyClaimsArray = Object.entries(dailyClaims).map(([date, count]) => ({
      date,
      count,
    }));

    // Get total count from database
    const countQuery = `SELECT COUNT(*) as total FROM email_claims`;
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0]?.total || "0");

    // Format recent claims with the actual columns
    const recentClaims = claims?.slice(0, 50).map((claim) => ({
      id: claim.id,
      email: claim.email,
      created_at: claim.created_at,
      claim_count: claim.claim_count || 1,
      updated_at: claim.updated_at,
      status: claim.status,
    })) || [];

    return NextResponse.json({
      totalClaims: totalCount || totalClaims,
      totalClaimCount,
      recentClaims,
      dailyClaims: dailyClaimsArray,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}