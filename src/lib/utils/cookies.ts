/**
 * Cookie Utilities for Campaign Data Management
 *
 * Provides secure cookie management for campaign redemption data including:
 * - Setting campaign data with secure options
 * - Retrieving and validating campaign data
 * - Clearing campaign cookies
 * - Automatic expiration handling
 */

export interface CampaignCookieData {
  campaignId: string;
  uniqueCode: string;
  timestamp: number;
  utmParams?: {
    source?: string;
    medium?: string;
    content?: string;
  };
}

export interface CookieOptions {
  /** Expiration time in hours (default: 24 hours) */
  expirationHours?: number;
  /** Cookie domain (default: current domain) */
  domain?: string;
  /** Cookie path (default: '/') */
  path?: string;
  /** Secure flag (default: true in production) */
  secure?: boolean;
  /** SameSite attribute (default: 'lax') */
  sameSite?: "strict" | "lax" | "none";
}

export interface CookieValidationResult {
  isValid: boolean;
  data?: CampaignCookieData;
  errors: string[];
  isExpired?: boolean;
}

// Cookie name constants
export const CAMPAIGN_COOKIE_NAME = "h2all_campaign_data";
export const DEFAULT_EXPIRATION_HOURS = 24;
export const MAX_EXPIRATION_HOURS = 48;

/**
 * Check if we're running in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Get current timestamp in milliseconds
 */
const getCurrentTimestamp = (): number => {
  return Date.now();
};

/**
 * Calculate expiration date based on hours
 */
const getExpirationDate = (hours: number): Date => {
  const now = new Date();
  now.setTime(now.getTime() + hours * 60 * 60 * 1000);
  return now;
};

/**
 * Validate campaign cookie data structure
 */
const validateCampaignData = (
  data: unknown
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Invalid data format");
    return { isValid: false, errors };
  }

  // Type guard to ensure data is a record
  const record = data as Record<string, unknown>;

  if (!record.campaignId || typeof record.campaignId !== "string") {
    errors.push("Missing or invalid campaignId");
  }

  if (!record.uniqueCode || typeof record.uniqueCode !== "string") {
    errors.push("Missing or invalid uniqueCode");
  }

  if (!record.timestamp || typeof record.timestamp !== "number") {
    errors.push("Missing or invalid timestamp");
  }

  // Validate UTM parameters if present
  if (
    record.utmParams &&
    typeof record.utmParams === "object" &&
    record.utmParams !== null
  ) {
    const utmParams = record.utmParams as Record<string, unknown>;
    const { source, medium, content } = utmParams;

    if (source && typeof source !== "string") {
      errors.push("Invalid UTM source format");
    }

    if (medium && typeof medium !== "string") {
      errors.push("Invalid UTM medium format");
    }

    if (content && typeof content !== "string") {
      errors.push("Invalid UTM content format");
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Check if campaign data is expired
 */
const isDataExpired = (
  timestamp: number,
  expirationHours: number = DEFAULT_EXPIRATION_HOURS
): boolean => {
  const now = getCurrentTimestamp();
  const expirationTime = timestamp + expirationHours * 60 * 60 * 1000;
  return now > expirationTime;
};

/**
 * Set campaign data cookie with secure options
 *
 * @param data Campaign data to store
 * @param options Cookie configuration options
 * @returns Success status and any errors
 */
export const setCampaignCookie = (
  data: Omit<CampaignCookieData, "timestamp">,
  options: CookieOptions = {}
): { success: boolean; errors: string[] } => {
  if (!isBrowser()) {
    return {
      success: false,
      errors: ["Cookie operations not available in server environment"],
    };
  }

  try {
    // Set default options
    const {
      expirationHours = DEFAULT_EXPIRATION_HOURS,
      domain,
      path = "/",
      secure = window.location.protocol === "https:",
      sameSite = "lax",
    } = options;

    // Validate expiration hours
    if (expirationHours <= 0 || expirationHours > MAX_EXPIRATION_HOURS) {
      return {
        success: false,
        errors: [
          `Invalid expiration hours. Must be between 1 and ${MAX_EXPIRATION_HOURS}`,
        ],
      };
    }

    // Create campaign data with timestamp
    const campaignData: CampaignCookieData = {
      ...data,
      timestamp: getCurrentTimestamp(),
    };

    // Validate data structure
    const validation = validateCampaignData(campaignData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Serialize data
    const serializedData = JSON.stringify(campaignData);

    // Check cookie size (browsers typically limit to 4KB)
    if (serializedData.length > 4000) {
      return {
        success: false,
        errors: ["Campaign data too large for cookie storage"],
      };
    }

    // Build cookie string
    const expirationDate = getExpirationDate(expirationHours);
    let cookieString = `${CAMPAIGN_COOKIE_NAME}=${encodeURIComponent(
      serializedData
    )}`;
    cookieString += `; expires=${expirationDate.toUTCString()}`;
    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    // Set the cookie
    document.cookie = cookieString;

    // Verify cookie was set
    const verification = getCampaignCookie();
    if (!verification.isValid) {
      return {
        success: false,
        errors: ["Failed to verify cookie was set correctly"],
      };
    }

    return { success: true, errors: [] };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Failed to set campaign cookie: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }
};

/**
 * Get campaign data from cookie with validation
 *
 * @param validateExpiration Whether to check if data is expired (default: true)
 * @returns Validation result with data if valid
 */
export const getCampaignCookie = (
  validateExpiration: boolean = true
): CookieValidationResult => {
  if (!isBrowser()) {
    return {
      isValid: false,
      errors: ["Cookie operations not available in server environment"],
    };
  }

  try {
    // Find the campaign cookie
    const cookies = document.cookie.split(";");
    let campaignCookie = "";

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === CAMPAIGN_COOKIE_NAME) {
        campaignCookie = value;
        break;
      }
    }

    if (!campaignCookie) {
      return {
        isValid: false,
        errors: ["Campaign cookie not found"],
      };
    }

    // Decode and parse cookie data
    const decodedData = decodeURIComponent(campaignCookie);
    const parsedData = JSON.parse(decodedData);

    // Validate data structure
    const validation = validateCampaignData(parsedData);
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: ["Invalid campaign cookie data", ...validation.errors],
      };
    }

    const campaignData = parsedData as CampaignCookieData;

    // Check expiration if requested
    if (validateExpiration) {
      const expired = isDataExpired(campaignData.timestamp);
      if (expired) {
        // Automatically clear expired cookie
        clearCampaignCookie();
        return {
          isValid: false,
          errors: ["Campaign cookie has expired"],
          isExpired: true,
        };
      }
    }

    return {
      isValid: true,
      data: campaignData,
      errors: [],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Failed to retrieve campaign cookie: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }
};

/**
 * Clear campaign cookie
 *
 * @param options Cookie options for clearing (domain, path)
 * @returns Success status
 */
export const clearCampaignCookie = (
  options: Pick<CookieOptions, "domain" | "path"> = {}
): { success: boolean; errors: string[] } => {
  if (!isBrowser()) {
    return {
      success: false,
      errors: ["Cookie operations not available in server environment"],
    };
  }

  try {
    const { domain, path = "/" } = options;

    // Set cookie with past expiration date
    let cookieString = `${CAMPAIGN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;

    // Verify cookie was cleared
    const verification = getCampaignCookie(false); // Don't validate expiration for verification
    if (verification.isValid) {
      return {
        success: false,
        errors: ["Failed to clear campaign cookie"],
      };
    }

    return { success: true, errors: [] };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Failed to clear campaign cookie: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }
};

/**
 * Check if campaign cookie exists (without parsing)
 *
 * @returns Boolean indicating if cookie exists
 */
export const hasCampaignCookie = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${CAMPAIGN_COOKIE_NAME}=`));
};

/**
 * Get campaign cookie expiration info
 *
 * @returns Expiration information
 */
export const getCampaignCookieExpiration = (): {
  exists: boolean;
  expiresAt?: Date;
  timeRemaining?: number;
  isExpired?: boolean;
} => {
  const result = getCampaignCookie(false); // Don't auto-clear if expired

  if (!result.isValid || !result.data) {
    return { exists: false };
  }

  const expirationTime =
    result.data.timestamp + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000;
  const expiresAt = new Date(expirationTime);
  const timeRemaining = expirationTime - getCurrentTimestamp();
  const isExpired = timeRemaining <= 0;

  return {
    exists: true,
    expiresAt,
    timeRemaining: Math.max(0, timeRemaining),
    isExpired,
  };
};

/**
 * Update UTM parameters in existing campaign cookie
 *
 * @param utmParams UTM parameters to update
 * @returns Success status
 */
export const updateCampaignCookieUTM = (utmParams: {
  source?: string;
  medium?: string;
  content?: string;
}): { success: boolean; errors: string[] } => {
  const result = getCampaignCookie();

  if (!result.isValid || !result.data) {
    return {
      success: false,
      errors: ["No valid campaign cookie found to update"],
    };
  }

  // Update the UTM parameters
  const updatedData = {
    campaignId: result.data.campaignId,
    uniqueCode: result.data.uniqueCode,
    utmParams: {
      ...result.data.utmParams,
      ...utmParams,
    },
  };

  return setCampaignCookie(updatedData);
};

/**
 * Cookie utility debugging helpers
 */
export const cookieDebug = {
  /**
   * Get all cookie information for debugging
   */
  getAllInfo: () => {
    if (!isBrowser()) {
      return { error: "Not in browser environment" };
    }

    const result = getCampaignCookie(false);
    const expiration = getCampaignCookieExpiration();

    return {
      exists: hasCampaignCookie(),
      isValid: result.isValid,
      data: result.data,
      errors: result.errors,
      expiration,
      allCookies: document.cookie,
    };
  },

  /**
   * Force clear all campaign-related cookies
   */
  forceClear: () => {
    if (!isBrowser()) {
      return { success: false, error: "Not in browser environment" };
    }

    // Try multiple variations to ensure complete clearing
    const variations = [
      { path: "/" },
      { path: "/", domain: window.location.hostname },
      { path: "/", domain: `.${window.location.hostname}` },
    ];

    const results = variations.map((options) => clearCampaignCookie(options));
    const success = results.some((result) => result.success);

    return { success, results };
  },
};
