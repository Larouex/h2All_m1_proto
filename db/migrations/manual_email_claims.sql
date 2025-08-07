-- Migration: Create email_claims table
-- This can be run safely in production

CREATE TABLE IF NOT EXISTS "email_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"claim_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_claims_email_unique" UNIQUE("email")
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "idx_email_claims_email" ON "email_claims" ("email");
