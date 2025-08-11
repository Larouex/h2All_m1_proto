import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Users table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  passwordHash: text("password_hash"),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  isAdmin: boolean("is_admin").notNull().default(false),
  totalRedemptions: integer("total_redemptions").notNull().default(0),
  totalRedemptionValue: decimal("total_redemption_value", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  redemptionValue: decimal("redemption_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").notNull().default(0),
  totalRedemptions: integer("total_redemptions").notNull().default(0),
  totalRedemptionValue: decimal("total_redemption_value", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  status: text("status").notNull().default("active"), // active, inactive, expired
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Redemption codes table
export const redemptionCodes = pgTable("redemption_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  uniqueCode: text("unique_code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  userId: text("user_id").references(() => users.id),
  userEmail: text("user_email"),
  redemptionValue: decimal("redemption_value", { precision: 10, scale: 2 }),
  redemptionSource: text("redemption_source"), // email, social, etc.
  redemptionDevice: text("redemption_device"),
  redemptionLocation: text("redemption_location"),
  redemptionUrl: text("redemption_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  fundingGoal: decimal("funding_goal", { precision: 12, scale: 2 }).notNull(),
  currentFunding: decimal("current_funding", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  category: text("category"),
  location: text("location"),
  status: text("status").notNull().default("active"), // active, inactive, completed, cancelled
  isActive: boolean("is_active").notNull().default(true),
  beneficiaries: integer("beneficiaries"),
  estimatedCompletion: text("estimated_completion"),
  projectManager: text("project_manager"),
  organization: text("organization"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions table (for newsletter/email subscriptions)
export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  submittedCounter: integer("submitted_counter").notNull().default(1),
  campaignTrackingId: text("campaign_tracking_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email claims table (for tracking email claim submissions)
export const emailClaims = pgTable("email_claims", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(), // indexed for lookup
  claimCount: integer("claim_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type RedemptionCode = typeof redemptionCodes.$inferSelect;
export type NewRedemptionCode = typeof redemptionCodes.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type EmailClaim = typeof emailClaims.$inferSelect;
export type NewEmailClaim = typeof emailClaims.$inferInsert;
