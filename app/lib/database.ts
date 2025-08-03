// Azure Data Tables configuration and utilities

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

// Table names
export const TABLE_NAMES = {
  USERS: "users",
  CAMPAIGNS: "campaigns",
  REDEMPTION_CODES: "redemptionCodes",
} as const;

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials
const credential = new AzureNamedKeyCredential(accountName, accountKey);

// Table client factory
export function createTableClient(tableName: string): TableClient {
  return new TableClient(tableEndpoint, tableName, credential);
}

// Pre-configured table clients
export const userTableClient = createTableClient(TABLE_NAMES.USERS);
export const campaignTableClient = createTableClient(TABLE_NAMES.CAMPAIGNS);
export const redemptionCodeTableClient = createTableClient(
  TABLE_NAMES.REDEMPTION_CODES
);

// Utility function to ensure tables exist
export async function ensureTablesExist(): Promise<void> {
  try {
    // Create tables if they don't exist
    await userTableClient.createTable();
    console.log("Users table created or already exists");
  } catch (error) {
    const azureError = error as { statusCode?: number };
    if (azureError.statusCode !== 409) {
      // 409 = Conflict (table already exists)
      console.error("Error creating users table:", error);
    }
  }

  try {
    await campaignTableClient.createTable();
    console.log("Campaigns table created or already exists");
  } catch (error) {
    const azureError = error as { statusCode?: number };
    if (azureError.statusCode !== 409) {
      console.error("Error creating campaigns table:", error);
    }
  }

  try {
    await redemptionCodeTableClient.createTable();
    console.log("RedemptionCodes table created or already exists");
  } catch (error) {
    const azureError = error as { statusCode?: number };
    if (azureError.statusCode !== 409) {
      console.error("Error creating redemption codes table:", error);
    }
  }
}

// Helper function to generate unique IDs
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate unique redemption codes
export function generateUniqueCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to encode email to row key (consistent with existing code)
export function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

// Helper function to decode row key back to email
export function decodeRowKeyToEmail(rowKey: string): string {
  return Buffer.from(rowKey, "base64").toString("utf-8");
}

// Simple password hashing (consistent with existing code)
export function hashPassword(password: string): string {
  // In production, use bcrypt or another proper hashing library
  return Buffer.from(password + "salt").toString("base64");
}

// Date utility functions
export function isExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

// Error handling utilities
export class DatabaseError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
