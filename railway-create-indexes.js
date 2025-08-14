// Simple index creation for Railway production terminal
// Copy and paste this entire code block into Railway terminal

const { Pool } = require("pg");

async function createIndexes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  try {
    const client = await pool.connect();
    console.log("Connected to database");

    // Create email index (most critical)
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_email_claims_email ON email_claims(email)"
    );
    console.log("✅ Email index created");

    // Create date index
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_email_claims_created_at ON email_claims(created_at)"
    );
    console.log("✅ Date index created");

    // Create composite index
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_email_claims_email_updated ON email_claims(email, updated_at)"
    );
    console.log("✅ Composite index created");

    client.release();
    await pool.end();
    console.log("🎉 All indexes created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createIndexes();
