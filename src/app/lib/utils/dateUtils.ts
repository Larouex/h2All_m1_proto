/**
 * Utility functions for safe date formatting
 */

/**
 * Safely formats a date value, handling null, undefined, and invalid dates
 * @param dateValue - Date object, string, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or "Not set" for invalid/null dates
 */
export function formatDate(
  dateValue: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  // Handle null, undefined, or empty string
  if (!dateValue || dateValue === null || dateValue === undefined) {
    return "Not set";
  }

  // Convert to Date object if it's a string
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Check if the date is Unix epoch (often from null/undefined conversion)
  if (date.getTime() === 0) {
    return "Not set";
  }

  // Default formatting options
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options || defaultOptions);
}

/**
 * Safely formats a date for simple display (MM/DD/YYYY format)
 * @param dateValue - Date object, string, or null/undefined
 * @returns Formatted date string or "Not set" for invalid/null dates
 */
export function formatDateSimple(
  dateValue: Date | string | null | undefined
): string {
  if (!dateValue || dateValue === null || dateValue === undefined) {
    return "Not set";
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (isNaN(date.getTime()) || date.getTime() === 0) {
    return "Not set";
  }

  return date.toLocaleDateString();
}

/**
 * Safely formats a date for detailed display (Month Day, Year format)
 * @param dateValue - Date object, string, or null/undefined
 * @returns Formatted date string or "Not set" for invalid/null dates
 */
export function formatDateLong(
  dateValue: Date | string | null | undefined
): string {
  return formatDate(dateValue, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Checks if a date value is valid and not the Unix epoch
 * @param dateValue - Date object, string, or null/undefined
 * @returns True if the date is valid and meaningful
 */
export function isValidDate(
  dateValue: Date | string | null | undefined
): boolean {
  if (!dateValue || dateValue === null || dateValue === undefined) {
    return false;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return !isNaN(date.getTime()) && date.getTime() !== 0;
}
