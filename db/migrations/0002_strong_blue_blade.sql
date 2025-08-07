CREATE TABLE "email_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"claim_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_claims_email_unique" UNIQUE("email")
);
