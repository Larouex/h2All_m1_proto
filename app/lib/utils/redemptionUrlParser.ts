/**
 * Redemption URL Parser Utility
 * Specifically designed for parsing redemption URLs with campaign_id and unique_code
 */

/**
 * Structured campaign data extracted from URL
 */
export interface CampaignData {
  /** Campaign identifier */
  campaignId: string;
  /** Unique redemption code */
  uniqueCode: string;
  /** Whether the URL was valid and contained required parameters */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Original URL that was parsed */
  originalUrl: string;
  /** Additional query parameters */
  additionalParams?: Record<string, string>;
}

/**
 * Configuration options for URL parsing
 */
export interface ParserConfig {
  /** Whether to validate campaign_id format (default: true) */
  validateCampaignId?: boolean;
  /** Whether to validate code format (default: true) */
  validateCode?: boolean;
  /** Allow additional query parameters (default: true) */
  allowExtraParams?: boolean;
}

/**
 * Default validation patterns
 */
const VALIDATION_PATTERNS = {
  campaignId: /^[a-zA-Z0-9_-]{1,50}$/, // Alphanumeric, underscore, dash, 1-50 chars
  uniqueCode: /^[A-Z0-9]{4,32}$/, // Uppercase alphanumeric, 4-32 chars
};

/**
 * Parse redemption URL and extract campaign data
 * @param url - URL to parse (can be full URL or just query string)
 * @param config - Optional configuration for validation
 * @returns Structured campaign data object
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = parseRedemptionUrl('/redeem?campaign_id=123&code=ABC123');
 * console.log(result.campaignId); // "123"
 * console.log(result.uniqueCode); // "ABC123"
 * console.log(result.isValid);    // true/false
 *
 * // With additional parameters
 * const result2 = parseRedemptionUrl('/redeem?campaign_id=123&code=ABC123&utm_source=email');
 * console.log(result2.additionalParams); // { utm_source: "email" }
 * ```
 */
export function parseRedemptionUrl(
  url: string,
  config: ParserConfig = {}
): CampaignData {
  const {
    validateCampaignId = true,
    validateCode = true,
    allowExtraParams = true,
  } = config;

  const errors: string[] = [];
  const additionalParams: Record<string, string> = {};

  try {
    // Parse URL - handle different formats
    const urlObj = createUrlObject(url);
    const searchParams = urlObj.searchParams;

    // Extract required parameters
    const campaignId = searchParams.get("campaign_id") || "";
    const uniqueCode = searchParams.get("code") || "";

    // Validate required parameters exist
    if (!campaignId) {
      errors.push("Missing required parameter: campaign_id");
    }
    if (!uniqueCode) {
      errors.push("Missing required parameter: code");
    }

    // Format validation
    if (campaignId && validateCampaignId) {
      if (!VALIDATION_PATTERNS.campaignId.test(campaignId)) {
        errors.push(`Invalid campaign_id format: ${campaignId}`);
      }
    }

    if (uniqueCode && validateCode) {
      if (!VALIDATION_PATTERNS.uniqueCode.test(uniqueCode)) {
        errors.push(`Invalid code format: ${uniqueCode}`);
      }
    }

    // Extract additional parameters
    if (allowExtraParams) {
      for (const [key, value] of searchParams.entries()) {
        if (key !== "campaign_id" && key !== "code") {
          additionalParams[key] = value;
        }
      }
    }

    return {
      campaignId: campaignId.trim(),
      uniqueCode: uniqueCode.trim(),
      isValid: errors.length === 0 && campaignId !== "" && uniqueCode !== "",
      errors,
      originalUrl: url,
      additionalParams:
        Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };
  } catch (error) {
    errors.push(
      `URL parsing error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return {
      campaignId: "",
      uniqueCode: "",
      isValid: false,
      errors,
      originalUrl: url,
    };
  }
}

/**
 * Validate campaign data extracted from URL
 * @param data - Campaign data to validate
 * @returns Validation result with detailed errors
 */
export function validateCampaignData(data: CampaignData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [...data.errors];
  const warnings: string[] = [];

  // Additional business logic validation
  if (data.campaignId && data.campaignId.length < 3) {
    warnings.push("Campaign ID is very short, might be invalid");
  }

  if (data.uniqueCode && data.uniqueCode.length < 6) {
    warnings.push("Code is short, ensure it's sufficient for security");
  }

  // Check for common issues
  if (
    data.campaignId &&
    /^\d+$/.test(data.campaignId) &&
    data.campaignId.length > 15
  ) {
    warnings.push("Campaign ID appears to be a timestamp, verify format");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Helper function to create URL object from various input formats
 */
function createUrlObject(url: string): URL {
  // Handle different URL formats
  if (url.startsWith("/")) {
    // Path with query string: /redeem?campaign_id=123&code=ABC
    return new URL(`http://localhost${url}`);
  } else if (url.startsWith("?")) {
    // Query string only: ?campaign_id=123&code=ABC
    return new URL(`http://localhost${url}`);
  } else if (url.includes("://")) {
    // Full URL: https://example.com/redeem?campaign_id=123&code=ABC
    return new URL(url);
  } else {
    // Assume it's a query string without ?
    return new URL(`http://localhost?${url}`);
  }
}

/**
 * Test function to validate the parser with various URL formats
 */
export function testUrlParser(): {
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{
    input: string;
    expected: boolean;
    actual: boolean;
    passed: boolean;
  }>;
} {
  const testCases = [
    // Valid URLs
    { input: "/redeem?campaign_id=123&code=ABC123", expected: true },
    { input: "?campaign_id=456&code=DEF456", expected: true },
    { input: "campaign_id=789&code=GHI789", expected: true },
    {
      input: "https://example.com/redeem?campaign_id=123&code=ABC123",
      expected: true,
    },
    {
      input:
        "/redeem?campaign_id=1754169423931-stp6rpgli&code=OVXQYE0I&utm_source=email",
      expected: true,
    },

    // Invalid URLs - missing parameters
    { input: "/redeem?campaign_id=123", expected: false },
    { input: "/redeem?code=ABC123", expected: false },
    { input: "/redeem", expected: false },
    { input: "", expected: false },

    // Invalid URLs - bad formats
    { input: "/redeem?campaign_id=&code=ABC123", expected: false },
    { input: "/redeem?campaign_id=123&code=", expected: false },
    { input: "/redeem?campaign_id=123&code=abc123", expected: false }, // lowercase
    { input: "/redeem?campaign_id=123!@#&code=ABC123", expected: false }, // special chars
  ];

  const results = testCases.map((testCase) => {
    const result = parseRedemptionUrl(testCase.input);
    const actual = result.isValid;
    const passed = actual === testCase.expected;

    return {
      input: testCase.input,
      expected: testCase.expected,
      actual,
      passed,
    };
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    totalTests: testCases.length,
    passed,
    failed,
    results,
  };
}

/**
 * Demo function showing various usage examples
 */
export function demoUrlParser(): void {
  console.log("🔗 URL Parser Demo\n");

  const testUrls = [
    "/redeem?campaign_id=123&code=abc123def456",
    "?campaign_id=1754169423931-stp6rpgli&code=OVXQYE0I",
    "https://example.com/redeem?campaign_id=summer2025&code=SUMMER25&utm_source=email&utm_campaign=promo",
    "/redeem?campaign_id=&code=ABC123", // Invalid - empty campaign_id
    "/redeem?code=ABC123", // Invalid - missing campaign_id
  ];

  testUrls.forEach((url, index) => {
    console.log(`\n📋 Test ${index + 1}: ${url}`);
    const result = parseRedemptionUrl(url);

    console.log(`  ✅ Valid: ${result.isValid}`);
    console.log(`  🆔 Campaign ID: "${result.campaignId}"`);
    console.log(`  🎫 Code: "${result.uniqueCode}"`);

    if (result.errors.length > 0) {
      console.log(`  ❌ Errors: ${result.errors.join(", ")}`);
    }

    if (result.additionalParams) {
      console.log(
        `  📎 Additional: ${JSON.stringify(result.additionalParams)}`
      );
    }
  });
}
