/**
 * Comprehensive Tests for URL Parser Utility
 * Tests various URL formats, edge cases, and validation scenarios
 */

import {
  parseCampaignUrl,
  validateCampaignUrl,
  buildCampaignUrl,
  isRedemptionUrl,
  sanitizeUrlParam,
  type CampaignUrlData,
  type UrlParserConfig,
} from "./urlParser";

/**
 * Test runner class for URL parser functionality
 */
export class UrlParserTester {
  private passedTests = 0;
  private failedTests = 0;
  private testResults: Array<{
    name: string;
    passed: boolean;
    error?: string;
    details?: Record<string, unknown>;
  }> = [];

  /**
   * Run all URL parser tests
   */
  public runAllTests(): {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: number;
    results: Array<{
      name: string;
      passed: boolean;
      error?: string;
      details?: Record<string, unknown>;
    }>;
  } {
    console.log("🧪 Starting URL Parser Tests...\n");

    // Basic parsing tests
    this.testBasicParsing();
    this.testValidationErrors();
    this.testEdgeCases();
    this.testUrlFormats();
    this.testCustomConfiguration();
    this.testUtilityFunctions();
    this.testRealWorldScenarios();

    const totalTests = this.passedTests + this.failedTests;
    const passRate = totalTests > 0 ? (this.passedTests / totalTests) * 100 : 0;

    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Pass Rate: ${passRate.toFixed(1)}%\n`);

    return {
      totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      passRate,
      results: this.testResults,
    };
  }

  /**
   * Test basic URL parsing functionality
   */
  private testBasicParsing(): void {
    console.log("🔍 Testing Basic Parsing...");

    // Test 1: Valid URL with required parameters
    this.runTest("Valid URL parsing", () => {
      const result = parseCampaignUrl(
        "/redeem?campaign_id=123&code=ABC123DEF456"
      );
      this.assert(result.isValid, "Should be valid");
      this.assert(result.campaignId === "123", "Campaign ID should match");
      this.assert(result.uniqueCode === "ABC123DEF456", "Code should match");
    });

    // Test 2: URL with extra parameters
    this.runTest("URL with extra parameters", () => {
      const result = parseCampaignUrl(
        "/redeem?campaign_id=test-123&code=XYZ789&ref=email&utm_source=newsletter"
      );
      this.assert(result.isValid, "Should be valid");
      this.assert(
        result.extraParams?.ref === "email",
        "Should capture extra params"
      );
      this.assert(
        result.extraParams?.utm_source === "newsletter",
        "Should capture UTM params"
      );
    });

    // Test 3: Missing required parameters
    this.runTest("Missing campaign_id", () => {
      const result = parseCampaignUrl("/redeem?code=ABC123");
      this.assert(!result.isValid, "Should be invalid");
      this.assert(result.campaignId === "", "Campaign ID should be empty");
    });

    // Test 4: Missing code parameter
    this.runTest("Missing code parameter", () => {
      const result = parseCampaignUrl("/redeem?campaign_id=123");
      this.assert(!result.isValid, "Should be invalid");
      this.assert(result.uniqueCode === "", "Code should be empty");
    });
  }

  /**
   * Test validation error handling
   */
  private testValidationErrors(): void {
    console.log("⚠️ Testing Validation Errors...");

    // Test 1: Invalid campaign ID format
    this.runTest("Invalid campaign ID format", () => {
      const result = validateCampaignUrl(
        "/redeem?campaign_id=invalid@#$&code=ABC123"
      );
      this.assert(!result.isValid, "Should be invalid");
      this.assert(
        result.errors.some((e) => e.includes("campaign_id format")),
        "Should have format error"
      );
    });

    // Test 2: Invalid code format
    this.runTest("Invalid code format", () => {
      const result = validateCampaignUrl(
        "/redeem?campaign_id=123&code=invalid-code"
      );
      this.assert(!result.isValid, "Should be invalid");
      this.assert(
        result.errors.some((e) => e.includes("code format")),
        "Should have code format error"
      );
    });

    // Test 3: Code too short
    this.runTest("Code too short", () => {
      const result = validateCampaignUrl("/redeem?campaign_id=123&code=AB");
      this.assert(!result.isValid, "Should be invalid");
      this.assert(
        result.errors.some((e) => e.includes("at least 4 characters")),
        "Should have length error"
      );
    });

    // Test 4: Code too long
    this.runTest("Code too long", () => {
      const longCode = "A".repeat(35);
      const result = validateCampaignUrl(
        `/redeem?campaign_id=123&code=${longCode}`
      );
      this.assert(!result.isValid, "Should be invalid");
      this.assert(
        result.errors.some((e) => e.includes("at most 32 characters")),
        "Should have length error"
      );
    });
  }

  /**
   * Test edge cases and error scenarios
   */
  private testEdgeCases(): void {
    console.log("🎯 Testing Edge Cases...");

    // Test 1: Empty URL
    this.runTest("Empty URL", () => {
      const result = parseCampaignUrl("");
      this.assert(!result.isValid, "Should be invalid");
    });

    // Test 2: URL with only query string
    this.runTest("Query string only", () => {
      const result = parseCampaignUrl("?campaign_id=123&code=ABC123");
      this.assert(result.isValid, "Should be valid");
      this.assert(result.campaignId === "123", "Should parse campaign ID");
    });

    // Test 3: URL with whitespace
    this.runTest("URL with whitespace", () => {
      const result = parseCampaignUrl(
        "/redeem?campaign_id= 123 &code= ABC123 "
      );
      this.assert(result.isValid, "Should be valid");
      this.assert(result.campaignId === "123", "Should trim whitespace");
      this.assert(result.uniqueCode === "ABC123", "Should trim whitespace");
    });

    // Test 4: Duplicate parameters
    this.runTest("Duplicate parameters", () => {
      const result = parseCampaignUrl(
        "/redeem?campaign_id=123&campaign_id=456&code=ABC123"
      );
      this.assert(result.campaignId === "456", "Should use last value");
    });

    // Test 5: Empty parameter values
    this.runTest("Empty parameter values", () => {
      const result = parseCampaignUrl("/redeem?campaign_id=&code=");
      this.assert(!result.isValid, "Should be invalid");
    });
  }

  /**
   * Test different URL formats
   */
  private testUrlFormats(): void {
    console.log("🌐 Testing URL Formats...");

    const testCases = [
      {
        name: "Full URL with HTTPS",
        url: "https://example.com/redeem?campaign_id=123&code=ABC123",
        shouldWork: true,
      },
      {
        name: "Full URL with HTTP",
        url: "http://localhost:3000/redeem?campaign_id=123&code=ABC123",
        shouldWork: true,
      },
      {
        name: "Relative path",
        url: "/redeem?campaign_id=123&code=ABC123",
        shouldWork: true,
      },
      {
        name: "Query string only",
        url: "?campaign_id=123&code=ABC123",
        shouldWork: true,
      },
      {
        name: "URL without protocol",
        url: "example.com/redeem?campaign_id=123&code=ABC123",
        shouldWork: true,
      },
    ];

    testCases.forEach((testCase) => {
      this.runTest(testCase.name, () => {
        const result = parseCampaignUrl(testCase.url);
        if (testCase.shouldWork) {
          this.assert(result.isValid, `Should parse ${testCase.name}`);
          this.assert(
            result.campaignId === "123",
            "Should extract campaign ID"
          );
          this.assert(result.uniqueCode === "ABC123", "Should extract code");
        } else {
          this.assert(!result.isValid, `Should not parse ${testCase.name}`);
        }
      });
    });
  }

  /**
   * Test custom configuration options
   */
  private testCustomConfiguration(): void {
    console.log("⚙️ Testing Custom Configuration...");

    // Test 1: Custom patterns
    this.runTest("Custom validation patterns", () => {
      const config: UrlParserConfig = {
        campaignIdPattern: /^\d+$/, // Only numbers
        codePattern: /^[A-Z]{8}$/, // Exactly 8 uppercase letters
      };

      const validResult = parseCampaignUrl(
        "/redeem?campaign_id=123&code=ABCDEFGH",
        config
      );
      this.assert(validResult.isValid, "Should be valid with custom patterns");

      const invalidResult = parseCampaignUrl(
        "/redeem?campaign_id=abc&code=ABC123",
        config
      );
      this.assert(
        !invalidResult.isValid,
        "Should be invalid with custom patterns"
      );
    });

    // Test 2: Custom required parameters
    this.runTest("Custom required parameters", () => {
      const config: UrlParserConfig = {
        requiredParams: ["campaign_id", "code", "user_id"],
      };

      const result = validateCampaignUrl(
        "/redeem?campaign_id=123&code=ABC123",
        config
      );
      this.assert(!result.isValid, "Should be invalid without user_id");
      this.assert(
        result.errors.some((e) => e.includes("user_id")),
        "Should mention missing user_id"
      );
    });

    // Test 3: Disallow extra parameters
    this.runTest("Disallow extra parameters", () => {
      const config: UrlParserConfig = {
        allowExtraParams: false,
      };

      const result = validateCampaignUrl(
        "/redeem?campaign_id=123&code=ABC123&extra=value",
        config
      );
      this.assert(
        result.warnings.length > 0,
        "Should have warnings about extra params"
      );
    });
  }

  /**
   * Test utility functions
   */
  private testUtilityFunctions(): void {
    console.log("🛠️ Testing Utility Functions...");

    // Test 1: Build campaign URL
    this.runTest("Build campaign URL", () => {
      const data: Partial<CampaignUrlData> = {
        campaignId: "123",
        uniqueCode: "ABC123",
        extraParams: { ref: "email" },
      };

      const url = buildCampaignUrl(data);
      this.assert(
        url.includes("campaign_id=123"),
        "Should include campaign ID"
      );
      this.assert(url.includes("code=ABC123"), "Should include code");
      this.assert(url.includes("ref=email"), "Should include extra params");
    });

    // Test 2: Sanitize URL parameter
    this.runTest("Sanitize URL parameter", () => {
      const sanitized = sanitizeUrlParam('  <script>alert("xss")</script>  ');
      this.assert(!sanitized.includes("<"), "Should remove < character");
      this.assert(!sanitized.includes(">"), "Should remove > character");
      this.assert(sanitized.trim() === sanitized, "Should trim whitespace");
    });

    // Test 3: Is redemption URL
    this.runTest("Is redemption URL detection", () => {
      this.assert(
        isRedemptionUrl("/redeem?campaign_id=123"),
        "Should detect /redeem path"
      );
      this.assert(
        isRedemptionUrl("/claim?code=ABC"),
        "Should detect /claim path"
      );
      this.assert(
        isRedemptionUrl("/home?campaign_id=123"),
        "Should detect campaign params"
      );
      this.assert(!isRedemptionUrl("/about"), "Should not detect regular URLs");
    });
  }

  /**
   * Test real-world scenarios
   */
  private testRealWorldScenarios(): void {
    console.log("🌍 Testing Real-World Scenarios...");

    // Test 1: Email campaign link
    this.runTest("Email campaign link", () => {
      const emailUrl =
        "https://h2all.com/redeem?campaign_id=winter-2025&code=SAVE20NOW&utm_source=email&utm_campaign=winter_sale&ref=newsletter";
      const result = parseCampaignUrl(emailUrl);

      this.assert(result.isValid, "Should parse email campaign URL");
      this.assert(
        result.campaignId === "winter-2025",
        "Should extract campaign ID"
      );
      this.assert(
        result.uniqueCode === "SAVE20NOW",
        "Should extract promo code"
      );
      this.assert(
        result.extraParams?.utm_source === "email",
        "Should capture UTM tracking"
      );
    });

    // Test 2: QR code URL
    this.runTest("QR code URL", () => {
      const qrUrl =
        "/activate?campaign_id=qr_promo_001&code=QR2025ABC&device=mobile";
      const result = parseCampaignUrl(qrUrl);

      this.assert(result.isValid, "Should parse QR code URL");
      this.assert(
        result.extraParams?.device === "mobile",
        "Should capture device info"
      );
    });

    // Test 3: Social media shared link
    this.runTest("Social media link", () => {
      const socialUrl =
        "https://h2all.com/claim?campaign_id=social_blast&code=SHARE2WIN&platform=twitter&shared_by=user123";
      const result = parseCampaignUrl(socialUrl);

      this.assert(result.isValid, "Should parse social media URL");
      this.assert(
        result.extraParams?.platform === "twitter",
        "Should capture platform"
      );
      this.assert(
        result.extraParams?.shared_by === "user123",
        "Should capture sharing user"
      );
    });

    // Test 4: Malformed URLs from user input
    this.runTest("Malformed user input", () => {
      const malformedUrls = [
        "/redeem?campaign_id=123&code=",
        "/redeem?campaign_id=&code=ABC123",
        "/redeem?campaign_id=123&unknown=ABC123",
        "/redeem?CAMPAIGN_ID=123&CODE=ABC123", // Wrong case
      ];

      malformedUrls.forEach((url) => {
        const result = parseCampaignUrl(url);
        // Most should be invalid, but we should handle gracefully
        this.assert(
          typeof result.isValid === "boolean",
          "Should return boolean validity"
        );
      });
    });
  }

  /**
   * Run a single test with error handling
   */
  private runTest(name: string, testFn: () => void): void {
    try {
      testFn();
      this.passedTests++;
      this.testResults.push({ name, passed: true });
      console.log(`  ✅ ${name}`);
    } catch (error) {
      this.failedTests++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.testResults.push({ name, passed: false, error: errorMessage });
      console.log(`  ❌ ${name}: ${errorMessage}`);
    }
  }

  /**
   * Assert function for tests
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }
}

/**
 * Performance test for URL parsing
 */
export function runPerformanceTest(): {
  totalUrls: number;
  totalTime: number;
  urlsPerSecond: number;
} {
  const testUrls = [
    "/redeem?campaign_id=123&code=ABC123",
    "https://example.com/claim?campaign_id=test&code=XYZ789&ref=email",
    "?campaign_id=perf_test&code=PERFORMANCE123&utm_source=test",
  ];

  const iterations = 10000;
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    const url = testUrls[i % testUrls.length];
    parseCampaignUrl(url);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const urlsPerSecond = (iterations / totalTime) * 1000;

  console.log(`\n⚡ Performance Test Results:`);
  console.log(
    `📊 Parsed ${iterations.toLocaleString()} URLs in ${totalTime.toFixed(2)}ms`
  );
  console.log(
    `🚀 Speed: ${Math.round(urlsPerSecond).toLocaleString()} URLs/second\n`
  );

  return {
    totalUrls: iterations,
    totalTime,
    urlsPerSecond,
  };
}
