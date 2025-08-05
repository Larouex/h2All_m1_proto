// PostgreSQL database configuration and utilities
import { db, isDatabaseAvailable, checkDatabaseAvailability } from "@/db";
import {
  users,
  campaigns,
  redemptionCodes,
  projects,
  subscriptions,
} from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

// Re-export the database connection and utilities
export { db, isDatabaseAvailable, checkDatabaseAvailability };

// Re-export the schema tables for convenience
export { users, campaigns, redemptionCodes, projects, subscriptions };

// Re-export common query builders
export { eq, and, desc, asc };

// Table names for compatibility with existing code
export const TABLE_NAMES = {
  USERS: "users",
  CAMPAIGNS: "campaigns",
  REDEMPTION_CODES: "redemption_codes",
  PROJECTS: "projects",
  SUBSCRIPTIONS: "subscriptions",
} as const;

// Helper function to get table client (for compatibility with Azure code)
export function getTableClient(tableName: string) {
  // This is a compatibility layer - we'll replace Azure table calls with direct Drizzle queries
  return {
    tableName,
    // We'll implement specific methods as needed during migration
  };
}

// User utility functions
export const userQueries = {
  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  },

  async create(userData: typeof users.$inferInsert) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  async update(id: string, userData: Partial<typeof users.$inferInsert>) {
    const result = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },

  async list(limit = 50, offset = 0) {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
  },
};

// Campaign utility functions
export const campaignQueries = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);
    return result[0] || null;
  },

  async create(campaignData: typeof campaigns.$inferInsert) {
    const result = await db.insert(campaigns).values(campaignData).returning();
    return result[0];
  },

  async update(
    id: string,
    campaignData: Partial<typeof campaigns.$inferInsert>
  ) {
    const result = await db
      .update(campaigns)
      .set({
        ...campaignData,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  },

  async list(limit = 50, offset = 0) {
    return await db
      .select()
      .from(campaigns)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(campaigns.createdAt));
  },

  async listActive() {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.isActive, true))
      .orderBy(desc(campaigns.createdAt));
  },

  async delete(id: string) {
    const result = await db
      .delete(campaigns)
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  },
};

// Redemption code utility functions
export const redemptionCodeQueries = {
  async findByCode(code: string) {
    const result = await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.uniqueCode, code))
      .limit(1);
    return result[0] || null;
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.id, id))
      .limit(1);
    return result[0] || null;
  },

  async findByCampaign(campaignId: string, limit = 50, offset = 0) {
    return await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.campaignId, campaignId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(redemptionCodes.createdAt));
  },

  async create(codeData: typeof redemptionCodes.$inferInsert) {
    const result = await db
      .insert(redemptionCodes)
      .values(codeData)
      .returning();
    return result[0];
  },

  async createBatch(codesData: Array<typeof redemptionCodes.$inferInsert>) {
    return await db.insert(redemptionCodes).values(codesData).returning();
  },

  async update(
    id: string,
    codeData: Partial<typeof redemptionCodes.$inferInsert>
  ) {
    const result = await db
      .update(redemptionCodes)
      .set({
        ...codeData,
        updatedAt: new Date(),
      })
      .where(eq(redemptionCodes.id, id))
      .returning();
    return result[0];
  },

  async markAsUsed(id: string, userId: string, userEmail: string) {
    const result = await db
      .update(redemptionCodes)
      .set({
        isUsed: true,
        userId,
        userEmail,
        redeemedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(redemptionCodes.id, id))
      .returning();
    return result[0];
  },

  async redeem(
    id: string,
    userId: string,
    userEmail: string,
    redemptionUrl?: string
  ) {
    const result = await db
      .update(redemptionCodes)
      .set({
        isUsed: true,
        userId,
        userEmail,
        redeemedAt: new Date(),
        redemptionUrl: redemptionUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(redemptionCodes.id, id))
      .returning();
    return result[0];
  },

  async list(limit = 50, offset = 0) {
    return await db
      .select()
      .from(redemptionCodes)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(redemptionCodes.createdAt));
  },

  async delete(id: string) {
    const result = await db
      .delete(redemptionCodes)
      .where(eq(redemptionCodes.id, id))
      .returning();
    return result[0];
  },
};

// Project utility functions
export const projectQueries = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return result[0] || null;
  },

  async create(projectData: typeof projects.$inferInsert) {
    const result = await db.insert(projects).values(projectData).returning();
    return result[0];
  },

  async update(id: string, projectData: Partial<typeof projects.$inferInsert>) {
    const result = await db
      .update(projects)
      .set({
        ...projectData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  },

  async list(limit = 50, offset = 0) {
    return await db
      .select()
      .from(projects)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(projects.createdAt));
  },

  async listActive() {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.isActive, true))
      .orderBy(desc(projects.createdAt));
  },

  async delete(id: string) {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  },
};

// Subscription utility functions
export const subscriptionQueries = {
  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.email, email))
      .limit(1);
    return result[0] || null;
  },

  async create(subscriptionData: typeof subscriptions.$inferInsert) {
    const result = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return result[0];
  },

  async incrementCounter(email: string) {
    // First try to get existing subscription
    const existing = await this.findByEmail(email);
    if (existing) {
      // Update existing subscription
      const result = await db
        .update(subscriptions)
        .set({
          submittedCounter: existing.submittedCounter + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.email, email))
        .returning();
      return result[0];
    } else {
      // Create new subscription
      return await this.create({
        email,
        submittedCounter: 1,
      });
    }
  },

  async update(
    id: string,
    subscriptionData: Partial<typeof subscriptions.$inferInsert>
  ) {
    const result = await db
      .update(subscriptions)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  },

  async list(limit = 50, offset = 0) {
    return await db
      .select()
      .from(subscriptions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(subscriptions.createdAt));
  },

  async delete(id: string) {
    const result = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  },
};
