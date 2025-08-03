/**
 * URL Parser Utility for H2All Campaign Redemption
 * Handles extraction and validation of campaign_id and unique_code from query parameters
 */

/**
 * Configuration for URL parsing validation
 */
export interface UrlParserConfig {
  /** Required parameters that must be present */
  requiredParams?: string[];
  /** Campaign ID validation pattern */
  campaignIdPattern?: RegExp;
  /** Code validation pattern */
  codePattern?: RegExp;
  /** Whether to allow additional query parameters */
  allowExtraParams?: boolean;
}

/**
 * Parsed campaign data structure
 */
export interface CampaignUrlData {
  /** Campaign identifier */
  campaignId: string;
  /** Unique redemption code */
  uniqueCode: string;
  /** Additional query parameters found */
  extraParams?: Record<string, string>;
  /** Original URL that was parsed */
  originalUrl?: string;
  /** Whether all required parameters were found */
  isValid: boolean;
}

/**
 * Validation result for URL parsing
 */
export interface UrlValidationResult {
  /** Whether the URL is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Parsed data if successful */
  data?: CampaignUrlData;
}

/**
 * Default configuration for URL parsing
 */
const DEFAULT_CONFIG: Required<UrlParserConfig> = {
  requiredParams: ["campaign_id", "code"],
  campaignIdPattern: /^[a-zA-Z0-9_-]{1,50}$/,
  codePattern: /^[A-Z0-9]{4,32}$/,
  allowExtraParams: true,
};

/**
 * Parse campaign redemption URL and extract structured data
 * @param url - The URL to parse (can be full URL or just query string)
 * @param config - Optional configuration for validation rules
 * @returns Structured campaign data object
 */
export function parseCampaignUrl(
  url: string,
  config: UrlParserConfig = {}
): CampaignUrlData {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Handle different URL formats
    const urlObj = parseUrlString(url);
    const searchParams = urlObj.searchParams;

    // Extract required parameters
    const campaignId = searchParams.get("campaign_id") || "";
    const uniqueCode = searchParams.get("code") || "";

    // Extract additional parameters
    const extraParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!finalConfig.requiredParams.includes(key)) {
        extraParams[key] = value;
      }
    }

    // Validate required parameters
    const isValid = validateRequiredParams(campaignId, uniqueCode, finalConfig);

    return {
      campaignId: campaignId.trim(),
      uniqueCode: uniqueCode.trim(),
      extraParams:
        Object.keys(extraParams).length > 0 ? extraParams : undefined,
      originalUrl: url,
      isValid,
    };
  } catch (error) {
    console.error("Error parsing campaign URL:", error);
    return {
      campaignId: "",
      uniqueCode: "",
      originalUrl: url,
      isValid: false,
    };
  }
}

/**
 * Validate URL with detailed error reporting
 * @param url - The URL to validate
 * @param config - Optional configuration for validation rules
 * @returns Detailed validation result
 */
export function validateCampaignUrl(
  url: string,
  config: UrlParserConfig = {}
): UrlValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse the URL
    const urlObj = parseUrlString(url);
    const searchParams = urlObj.searchParams;

    // Check for required parameters
    const campaignId = searchParams.get("campaign_id");
    const uniqueCode = searchParams.get("code");

    // Validate campaign_id
    if (!campaignId) {
      errors.push("Missing required parameter: campaign_id");
    } else {
      if (!finalConfig.campaignIdPattern.test(campaignId)) {
        errors.push(`Invalid campaign_id format: ${campaignId}`);
      }
      if (campaignId.length === 0) {
        errors.push("campaign_id cannot be empty");
      }
    }

    // Validate unique_code
    if (!uniqueCode) {
      errors.push("Missing required parameter: code");
    } else {
      if (!finalConfig.codePattern.test(uniqueCode)) {
        errors.push(`Invalid code format: ${uniqueCode}`);
      }
      if (uniqueCode.length < 4) {
        errors.push("Code must be at least 4 characters long");
      }
      if (uniqueCode.length > 32) {
        errors.push("Code must be at most 32 characters long");
      }
    }

    // Check for extra parameters
    const extraParamCount = Array.from(searchParams.keys()).filter(
      (key) => !finalConfig.requiredParams.includes(key)
    ).length;

    if (extraParamCount > 0 && !finalConfig.allowExtraParams) {
      warnings.push(`Found ${extraParamCount} additional parameters`);
    }

    // Check for common issues
    if (searchParams.has("campaign") && !searchParams.has("campaign_id")) {
      warnings.push('Found "campaign" parameter, did you mean "campaign_id"?');
    }

    if (searchParams.has("unique_code") && !searchParams.has("code")) {
      warnings.push('Found "unique_code" parameter, did you mean "code"?');
    }

    const isValid = errors.length === 0;
    const data = isValid ? parseCampaignUrl(url, config) : undefined;

    return {
      isValid,
      errors,
      warnings,
      data,
    };
  } catch (error) {
    errors.push(
      `URL parsing error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return {
      isValid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Extract campaign data from current browser location
 * @param config - Optional configuration for validation rules
 * @returns Parsed campaign data from current URL
 */
export function parseCampaignFromLocation(
  config: UrlParserConfig = {}
): CampaignUrlData {
  if (typeof window === "undefined") {
    console.warn("parseCampaignFromLocation called on server side");
    return {
      campaignId: "",
      uniqueCode: "",
      originalUrl: "",
      isValid: false,
    };
  }

  return parseCampaignUrl(window.location.href, config);
}

/**
 * Build a campaign redemption URL from data
 * @param data - Campaign data to encode in URL
 * @param basePath - Base path for the URL (default: '/redeem')
 * @returns Complete redemption URL
 */
export function buildCampaignUrl(
  data: Partial<CampaignUrlData>,
  basePath: string = "/redeem"
): string {
  const params = new URLSearchParams();

  if (data.campaignId) {
    params.set("campaign_id", data.campaignId);
  }

  if (data.uniqueCode) {
    params.set("code", data.uniqueCode);
  }

  if (data.extraParams) {
    Object.entries(data.extraParams).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Helper function to parse URL string handling various formats
 */
function parseUrlString(url: string): URL {
  // Handle query string only (starts with ?)
  if (url.startsWith("?")) {
    return new URL(`https://example.com${url}`);
  }

  // Handle path with query string (starts with /)
  if (url.startsWith("/")) {
    return new URL(`https://example.com${url}`);
  }

  // Handle relative URL without protocol
  if (!url.includes("://")) {
    return new URL(`https://${url}`);
  }

  // Handle complete URL
  return new URL(url);
}

/**
 * Helper function to validate required parameters
 */
function validateRequiredParams(
  campaignId: string,
  uniqueCode: string,
  config: Required<UrlParserConfig>
): boolean {
  if (!campaignId || !uniqueCode) {
    return false;
  }

  if (!config.campaignIdPattern.test(campaignId)) {
    return false;
  }

  if (!config.codePattern.test(uniqueCode)) {
    return false;
  }

  return true;
}

/**
 * Utility function to sanitize URL parameters
 * @param value - Parameter value to sanitize
 * @returns Sanitized parameter value
 */
export function sanitizeUrlParam(value: string): string {
  return value
    .trim()
    .replace(/[<>'"]/g, "") // Remove potential XSS characters
    .substring(0, 100); // Limit length
}

/**
 * Check if a URL appears to be a valid redemption URL
 * @param url - URL to check
 * @returns Boolean indicating if URL looks like a redemption URL
 */
export function isRedemptionUrl(url: string): boolean {
  try {
    const urlObj = parseUrlString(url);
    const pathname = urlObj.pathname.toLowerCase();

    // Check if path contains redemption-related terms
    const redemptionPaths = ["/redeem", "/claim", "/activate", "/use"];
    const hasRedemptionPath = redemptionPaths.some((path) =>
      pathname.includes(path)
    );

    // Check if URL has campaign-related parameters
    const hasRedemptionParams =
      urlObj.searchParams.has("campaign_id") ||
      urlObj.searchParams.has("code") ||
      urlObj.searchParams.has("campaign");

    return hasRedemptionPath || hasRedemptionParams;
  } catch {
    return false;
  }
}
