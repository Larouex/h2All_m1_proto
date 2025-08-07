import { db } from "./db/index.js";
import { emailClaims } from "./db/schema.js";

async function createEmailClaimsTable() {
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
    console.log("✅ email_claims table created successfully");

    await db.execute(createIndexSQL);
    console.log("✅ Email index created successfully");

    // Test the table by checking if it exists
    const testQuery = `SELECT count(*) FROM "email_claims"`;
    const result = await db.execute(testQuery);
    console.log(
      "✅ Table verification successful, current record count:",
      result.rows[0]?.count || 0
    );
  } catch (error) {
    console.error("❌ Error creating email_claims table:", error);
    throw error;
  }
}

// Run the migration
createEmailClaimsTable()
  .then(() => {
    console.log("🎉 Email claims table migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
