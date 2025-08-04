// Azure Data Tables configuration and utilities

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { NextResponse } from "next/server";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

// Check if environment variables are available
const isConfigured = accountName && accountKey;

// Helper function to check if database is available during build
export function isDatabaseAvailable(): boolean {
  return !!(
    process.env.AZURE_STORAGE_ACCOUNT_NAME &&
    process.env.AZURE_STORAGE_ACCOUNT_KEY
  );
}

// Helper function for API routes to check environment and return early response if not available
export function checkDatabaseAvailability() {
  if (!isDatabaseAvailable()) {
    return {
      available: false,
      response: NextResponse.json(
        { error: "Service temporarily unavailable - configuration missing" },
        { status: 503 }
      ),
    };
  }
  return { available: true };
}

// Table names
export const TABLE_NAMES = {
  USERS: "users",
  CAMPAIGNS: "campaigns",
  REDEMPTION_CODES: "redemptionCodes",
} as const;

// Create credentials and table endpoint only if configured
let credential: AzureNamedKeyCredential | null = null;
let tableEndpoint: string | null = null;

if (isConfigured) {
  tableEndpoint = `https://${accountName}.table.core.windows.net`;
  credential = new AzureNamedKeyCredential(accountName!, accountKey!);
}

// Table client factory
export function createTableClient(tableName: string): TableClient {
  if (!credential || !tableEndpoint) {
    throw new Error(
      "Azure Storage not configured. Please set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables."
    );
  }
  return new TableClient(tableEndpoint, tableName, credential);
}

// Pre-configured table clients (only create if environment is configured)
export const userTableClient = isConfigured
  ? createTableClient(TABLE_NAMES.USERS)
  : null;
export const campaignTableClient = isConfigured
  ? createTableClient(TABLE_NAMES.CAMPAIGNS)
  : null;
export const redemptionCodeTableClient = isConfigured
  ? createTableClient(TABLE_NAMES.REDEMPTION_CODES)
  : null;

// Utility function to ensure tables exist
export async function ensureTablesExist(): Promise<void> {
  if (!isConfigured) {
    console.warn(
      "Azure Storage not configured - skipping table initialization"
    );
    return;
  }

  if (!userTableClient || !campaignTableClient || !redemptionCodeTableClient) {
    console.warn(
      "Table clients not properly initialized - skipping table creation"
    );
    return;
  }

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
    console.log("Redemption codes table created or already exists");
  } catch (error) {
    const azureError = error as { statusCode?: number };
    if (azureError.statusCode !== 409) {
      console.error("Error creating redemption codes table:", error);
    }
  }
}

// Generate a unique ID for entities
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate a unique code for redemption codes
export function generateUniqueCode(): string {
  // Generate an 8-character alphanumeric code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Encode email to a valid Azure Table row key
export function encodeEmailToRowKey(email: string): string {
  // Replace characters that are not allowed in row keys
  return email.replace(/[\\\/\#\?]/g, "_").replace(/@/g, "_AT_");
}

// Decode row key back to email
export function decodeRowKeyToEmail(rowKey: string): string {
  return rowKey.replace(/_AT_/g, "@").replace(/_/g, ".");
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
