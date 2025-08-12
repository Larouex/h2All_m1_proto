/**
 * Utility functions for email claims operations with proper date handling
 */

/**
 * Creates a new Date object with proper validation
 * @returns A new Date object representing the current timestamp
 */
export function createTimestamp(): Date {
  return new Date();
}

/**
 * Validates and creates a date for database operations
 * @param date - Optional date to validate, defaults to current time
 * @returns A valid Date object
 */
export function validateTimestamp(date?: Date | string | null): Date {
  if (!date) {
    return new Date();
  }

  if (typeof date === "string") {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date string provided, using current time:", date);
      return new Date();
    }
    return parsedDate;
  }

  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      console.warn("Invalid Date object provided, using current time:", date);
      return new Date();
    }
    return date;
  }

  console.warn("Unknown date type provided, using current time:", typeof date);
  return new Date();
}

/**
 * Creates proper insert values for email claims
 * @param email - The email address
 * @param claimCount - Initial claim count (defaults to 1)
 * @returns Object with proper timestamps for insertion
 */
export function createEmailClaimInsertValues(
  email: string,
  claimCount: number = 1
) {
  // Create date string in YYYY-MM-DD format for date columns
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD format

  // Validate the date is valid
  if (isNaN(now.getTime())) {
    throw new Error("Failed to create valid timestamp for email claim insert");
  }

  const insertValues = {
    email: email.toLowerCase().trim(),
    claimCount,
    createdAt: dateString, // DATE STRING for database date column
    updatedAt: dateString, // DATE STRING for database date column
  };

  console.log("📅 CREATE EMAIL CLAIM - Insert values:", {
    email: insertValues.email,
    claimCount: insertValues.claimCount,
    createdAt: insertValues.createdAt,
    updatedAt: insertValues.updatedAt,
  });

  // Final validation - ensure no null/undefined dates
  if (!insertValues.createdAt || !insertValues.updatedAt) {
    throw new Error("CRITICAL: createdAt or updatedAt is null/undefined");
  }

  return insertValues;
}

/**
 * Creates proper update values for email claims
 * @param updates - Partial update data
 * @returns Object with proper updatedAt timestamp
 */
export function createEmailClaimUpdateValues(
  updates: Partial<{
    claimCount: number;
    email: string;
  }>
) {
  // Create date string in YYYY-MM-DD format for date columns
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD format

  // Validate the date is valid
  if (isNaN(now.getTime())) {
    throw new Error("Failed to create valid timestamp for email claim update");
  }

  const updateValues: {
    updatedAt: string;
    claimCount?: number;
    email?: string;
  } = {
    updatedAt: dateString, // DATE STRING for database date column
  };

  if (updates.claimCount !== undefined) {
    updateValues.claimCount = updates.claimCount;
  }

  if (updates.email !== undefined) {
    updateValues.email = updates.email.toLowerCase().trim();
  }

  console.log("📅 UPDATE EMAIL CLAIM - Update values:", {
    updatedAt: updateValues.updatedAt,
    claimCount: updateValues.claimCount,
    email: updateValues.email,
  });

  // Final validation - ensure updatedAt is not null/undefined
  if (!updateValues.updatedAt) {
    throw new Error("CRITICAL: updatedAt is null/undefined");
  }

  return updateValues;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalizes email address (lowercase, trim)
 * @param email - Email address to normalize
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
