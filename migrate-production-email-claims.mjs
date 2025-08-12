/**
 * Production Database Migration Script
 * Adds missing monitoring columns to email_claims table
 *
 * Usage:
 * 1. Set DATABASE_URL environment variable to production database
 * 2. Run: node migrate-production-email-claims.mjs
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function migrateProduction() {
  console.log("🚀 Starting production database migration...");

  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is required");
    console.log("Set it to your production database connection string");
    process.exit(1);
  }

  console.log("📍 Connecting to production database...");
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    // Step 1: Add missing columns
    console.log("🔧 Adding missing columns to email_claims table...");

    await db.execute(sql`
      ALTER TABLE email_claims 
      ADD COLUMN IF NOT EXISTS campaign_id TEXT DEFAULT 'production-campaign'
    `);

    await db.execute(sql`
      ALTER TABLE email_claims 
      ADD COLUMN IF NOT EXISTS redemption_value DECIMAL(10,2) DEFAULT 5.00
    `);

    console.log("✅ Columns added successfully");

    // Step 2: Update existing records
    console.log("🔄 Updating existing records with default values...");

    const updateResult = await db.execute(sql`
      UPDATE email_claims 
      SET 
        campaign_id = COALESCE(campaign_id, 'legacy-campaign'),
        redemption_value = COALESCE(redemption_value, 5.00)
      WHERE campaign_id IS NULL OR redemption_value IS NULL
    `);

    console.log(`✅ Updated existing records: ${updateResult.rowCount} rows`);

    // Step 3: Create performance indexes
    console.log("🗂️ Creating performance indexes...");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_claims_campaign_performance 
      ON email_claims(campaign_id, created_at DESC)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_claims_value_tracking 
      ON email_claims(redemption_value, created_at DESC) 
      WHERE redemption_value > 0
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_claims_email_lookup 
      ON email_claims(email, created_at DESC)
    `);

    console.log("✅ Indexes created successfully");

    // Step 4: Verify migration
    console.log("🔍 Verifying migration...");

    const verifyColumns = await db.execute(sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'email_claims' 
        AND column_name IN ('campaign_id', 'redemption_value')
      ORDER BY ordinal_position
    `);

    console.log("📊 New columns verified:");
    verifyColumns.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`
      );
    });

    // Step 5: Show sample data
    const sampleData = await db.execute(sql`
      SELECT 
        id, 
        email, 
        claim_count, 
        campaign_id, 
        redemption_value, 
        created_at 
      FROM email_claims 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log("📋 Sample data after migration:");
    sampleData.rows.forEach((row) => {
      console.log(
        `  - ${row.email}: campaign=${row.campaign_id}, value=${row.redemption_value}`
      );
    });

    console.log("🎉 Production migration completed successfully!");
    console.log("🔄 Restart your production application to use the new schema");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("💡 Check your database connection and permissions");
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the migration
migrateProduction().catch(console.error);
