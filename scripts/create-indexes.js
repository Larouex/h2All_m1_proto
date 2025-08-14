#!/usr/bin/env node

/**
 * Production Database Index Creation Script
 * Creates performance indexes for H2All email claims table
 * Run with: npm run create-indexes or node scripts/create-indexes.js
 */

const { Pool } = require("pg");

// Use the same database configuration as the main app
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 5, // Smaller pool for this script
      connectionTimeoutMillis: 10000,
      statement_timeout: 60000, // Longer timeout for index creation
      query_timeout: 60000,
      application_name: "h2all-index-creation",
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || process.env.USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "h2all_m1_proto",
      ssl: false,
      max: 5,
      connectionTimeoutMillis: 10000,
    };

async function createIndexes() {
  const pool = new Pool(dbConfig);
  let client;

  try {
    console.log("🔗 Connecting to database...");
    client = await pool.connect();

    console.log("✅ Connected successfully");
    console.log("🏗️  Creating performance indexes...\n");

    // Array of indexes to create
    const indexes = [
      {
        name: "idx_email_claims_email",
        sql: "CREATE INDEX IF NOT EXISTS idx_email_claims_email ON email_claims(email)",
        description: "Email lookup index (critical for performance)",
      },
      {
        name: "idx_email_claims_created_at",
        sql: "CREATE INDEX IF NOT EXISTS idx_email_claims_created_at ON email_claims(created_at)",
        description: "Date-based queries index",
      },
      {
        name: "idx_email_claims_email_updated",
        sql: "CREATE INDEX IF NOT EXISTS idx_email_claims_email_updated ON email_claims(email, updated_at)",
        description: "Composite index for frequent queries",
      },
    ];

    // Create each index
    for (const index of indexes) {
      try {
        console.log(`📊 Creating ${index.name}...`);
        console.log(`   ${index.description}`);

        const startTime = Date.now();
        await client.query(index.sql);
        const duration = Date.now() - startTime;

        console.log(`✅ ${index.name} created successfully (${duration}ms)\n`);
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log(`ℹ️  ${index.name} already exists\n`);
        } else {
          console.error(`❌ Failed to create ${index.name}:`, error.message);
          throw error;
        }
      }
    }

    // Verify indexes were created
    console.log("🔍 Verifying indexes...");
    const indexQuery = `
      SELECT 
        indexname, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'email_claims' 
      ORDER BY indexname
    `;

    const result = await client.query(indexQuery);
    console.log("\n📋 Current indexes on email_claims table:");
    result.rows.forEach((row) => {
      console.log(`   • ${row.indexname}`);
    });

    console.log("\n🎉 Database optimization complete!");
    console.log("📈 Expected performance improvements:");
    console.log("   • 60-70% faster email lookups");
    console.log("   • Reduced response times from 1200ms to 200-400ms");
    console.log("   • Better throughput under load");
  } catch (error) {
    console.error("❌ Database index creation failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   • Verify DATABASE_URL environment variable is set");
    console.error("   • Check database connectivity");
    console.error('   • Ensure table "email_claims" exists');
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createIndexes };
