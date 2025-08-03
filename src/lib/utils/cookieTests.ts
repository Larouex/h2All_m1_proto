/**
 * Cookie Utilities Test Suite
 *
 * Comprehensive tests for campaign cookie management including:
 * - Setting and retrieving campaign data
 * - Cookie expiration handling
 * - Validation and error handling
 * - UTM parameter management
 */

import {
  setCampaignCookie,
  getCampaignCookie,
  clearCampaignCookie,
  hasCampaignCookie,
  getCampaignCookieExpiration,
  updateCampaignCookieUTM,
  cookieDebug,
  type CookieOptions,
  CAMPAIGN_COOKIE_NAME,
} from "./cookies";

/**
 * Test Suite Class for Cookie Utilities
 */
export class CookieTestSuite {
  private testResults: Array<{
    test: string;
    passed: boolean;
    error?: string;
  }> = [];

  /**
   * Log test result
   */
  private logTest(testName: string, passed: boolean, error?: string): void {
    this.testResults.push({ test: testName, passed, error });
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const errorMsg = error ? ` - ${error}` : "";
    console.log(`${status}: ${testName}${errorMsg}`);
  }

  /**
   * Test basic cookie setting and retrieval
   */
  async testBasicCookieOperations(): Promise<void> {
    console.log("\n=== Testing Basic Cookie Operations ===");

    try {
      // Clear any existing cookies first
      clearCampaignCookie();

      // Test setting a basic campaign cookie
      const testData = {
        campaignId: "test-campaign-123",
        uniqueCode: "TEST123",
        utmParams: {
          source: "email",
          medium: "newsletter",
          content: "header-cta",
        },
      };

      const setResult = setCampaignCookie(testData);
      this.logTest(
        "Set campaign cookie",
        setResult.success,
        setResult.errors.join(", ")
      );

      if (setResult.success) {
        // Test cookie exists
        const exists = hasCampaignCookie();
        this.logTest("Cookie exists check", exists);

        // Test retrieving cookie
        const getResult = getCampaignCookie();
        this.logTest(
          "Get campaign cookie",
          getResult.isValid,
          getResult.errors.join(", ")
        );

        if (getResult.isValid && getResult.data) {
          // Verify data integrity
          const dataMatches =
            getResult.data.campaignId === testData.campaignId &&
            getResult.data.uniqueCode === testData.uniqueCode &&
            getResult.data.utmParams?.source === testData.utmParams.source;

          this.logTest("Cookie data integrity", dataMatches);

          // Test timestamp is recent (within last minute)
          const timeDiff = Date.now() - getResult.data.timestamp;
          const timestampValid = timeDiff < 60000; // Less than 1 minute
          this.logTest("Timestamp validity", timestampValid);
        }
      }

      // Test clearing cookie
      const clearResult = clearCampaignCookie();
      this.logTest(
        "Clear campaign cookie",
        clearResult.success,
        clearResult.errors.join(", ")
      );

      if (clearResult.success) {
        const existsAfterClear = hasCampaignCookie();
        this.logTest("Cookie cleared verification", !existsAfterClear);
      }
    } catch (error) {
      this.logTest(
        "Basic operations exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Test cookie expiration functionality
   */
  async testCookieExpiration(): Promise<void> {
    console.log("\n=== Testing Cookie Expiration ===");

    try {
      // Clear any existing cookies
      clearCampaignCookie();

      // Test setting cookie with custom expiration
      const testData = {
        campaignId: "expiration-test",
        uniqueCode: "EXP123",
      };

      const options: CookieOptions = {
        expirationHours: 1, // 1 hour expiration
      };

      const setResult = setCampaignCookie(testData, options);
      this.logTest("Set cookie with custom expiration", setResult.success);

      if (setResult.success) {
        // Test expiration info
        const expInfo = getCampaignCookieExpiration();
        this.logTest("Expiration info available", expInfo.exists);

        if (expInfo.exists) {
          const hasValidExpiration =
            expInfo.expiresAt && expInfo.timeRemaining !== undefined;
          this.logTest("Expiration data complete", !!hasValidExpiration);

          const notExpiredYet =
            !expInfo.isExpired && expInfo.timeRemaining! > 0;
          this.logTest("Cookie not expired yet", notExpiredYet);
        }

        // Test invalid expiration hours
        const invalidResult = setCampaignCookie(testData, {
          expirationHours: 100,
        });
        this.logTest("Reject invalid expiration hours", !invalidResult.success);

        const zeroExpirationResult = setCampaignCookie(testData, {
          expirationHours: 0,
        });
        this.logTest(
          "Reject zero expiration hours",
          !zeroExpirationResult.success
        );
      }

      // Test simulated expiration by manually setting old timestamp
      if (typeof document !== "undefined") {
        const expiredData = {
          campaignId: "expired-test",
          uniqueCode: "OLD123",
          timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        };

        // Manually set expired cookie
        const serializedData = JSON.stringify(expiredData);
        document.cookie = `${CAMPAIGN_COOKIE_NAME}=${encodeURIComponent(
          serializedData
        )}; path=/`;

        // Try to retrieve expired cookie
        const expiredResult = getCampaignCookie();
        this.logTest(
          "Expired cookie auto-cleared",
          !expiredResult.isValid && expiredResult.isExpired === true
        );
      }
    } catch (error) {
      this.logTest(
        "Expiration test exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Test UTM parameter functionality
   */
  async testUTMParameters(): Promise<void> {
    console.log("\n=== Testing UTM Parameters ===");

    try {
      // Clear any existing cookies
      clearCampaignCookie();

      // Test setting cookie with UTM parameters
      const testData = {
        campaignId: "utm-test",
        uniqueCode: "UTM123",
        utmParams: {
          source: "facebook",
          medium: "social",
          content: "post-1",
        },
      };

      const setResult = setCampaignCookie(testData);
      this.logTest("Set cookie with UTM params", setResult.success);

      if (setResult.success) {
        const getResult = getCampaignCookie();
        if (getResult.isValid && getResult.data) {
          const utmMatches =
            getResult.data.utmParams?.source === "facebook" &&
            getResult.data.utmParams?.medium === "social" &&
            getResult.data.utmParams?.content === "post-1";

          this.logTest("UTM parameters preserved", utmMatches);

          // Test updating UTM parameters
          const updateResult = updateCampaignCookieUTM({
            source: "twitter",
            content: "updated-post",
          });
          this.logTest("Update UTM parameters", updateResult.success);

          if (updateResult.success) {
            const updatedResult = getCampaignCookie();
            if (updatedResult.isValid && updatedResult.data) {
              const updatedMatches =
                updatedResult.data.utmParams?.source === "twitter" &&
                updatedResult.data.utmParams?.medium === "social" && // Should preserve
                updatedResult.data.utmParams?.content === "updated-post";

              this.logTest(
                "UTM update preserves existing values",
                updatedMatches
              );
            }
          }
        }
      }

      // Test cookie without UTM parameters
      const simpleData = {
        campaignId: "simple-test",
        uniqueCode: "SIMPLE123",
      };

      const simpleResult = setCampaignCookie(simpleData);
      this.logTest("Set cookie without UTM params", simpleResult.success);
    } catch (error) {
      this.logTest(
        "UTM test exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Test error handling and edge cases
   */
  async testErrorHandling(): Promise<void> {
    console.log("\n=== Testing Error Handling ===");

    try {
      // Test invalid data
      const invalidResults = [
        // @ts-expect-error - Testing invalid input
        setCampaignCookie(null),
        // @ts-expect-error - Testing invalid input
        setCampaignCookie({}),
        setCampaignCookie({ campaignId: "", uniqueCode: "TEST" }),
        setCampaignCookie({ campaignId: "TEST", uniqueCode: "" }),
      ];

      invalidResults.forEach((result, index) => {
        this.logTest(`Reject invalid data ${index + 1}`, !result.success);
      });

      // Test very large data (should exceed cookie size limit)
      const largeData = {
        campaignId: "large-test",
        uniqueCode: "LARGE123",
        utmParams: {
          source: "x".repeat(2000),
          medium: "y".repeat(2000),
          content: "z".repeat(2000),
        },
      };

      const largeResult = setCampaignCookie(largeData);
      this.logTest("Reject oversized cookie data", !largeResult.success);

      // Test getting cookie when none exists
      clearCampaignCookie();
      const noCookieResult = getCampaignCookie();
      this.logTest("Handle missing cookie gracefully", !noCookieResult.isValid);

      // Test updating UTM when no cookie exists
      const updateNoExistResult = updateCampaignCookieUTM({ source: "test" });
      this.logTest(
        "Handle UTM update with no cookie",
        !updateNoExistResult.success
      );
    } catch (error) {
      this.logTest(
        "Error handling exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Test debugging utilities
   */
  async testDebuggingUtilities(): Promise<void> {
    console.log("\n=== Testing Debugging Utilities ===");

    try {
      // Set up test data
      const testData = {
        campaignId: "debug-test",
        uniqueCode: "DEBUG123",
        utmParams: { source: "debug" },
      };

      setCampaignCookie(testData);

      // Test debug info
      const debugInfo = cookieDebug.getAllInfo();
      const hasDebugData =
        debugInfo && typeof debugInfo === "object" && !("error" in debugInfo);
      this.logTest("Debug info available", hasDebugData);

      if (hasDebugData) {
        const infoComplete =
          "exists" in debugInfo &&
          "isValid" in debugInfo &&
          "expiration" in debugInfo;

        this.logTest("Debug info complete", infoComplete);
      }

      // Test force clear
      const forceClearResult = cookieDebug.forceClear();
      this.logTest(
        "Force clear available",
        typeof forceClearResult === "object"
      );
    } catch (error) {
      this.logTest(
        "Debug utilities exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Test concurrent operations
   */
  async testConcurrentOperations(): Promise<void> {
    console.log("\n=== Testing Concurrent Operations ===");

    try {
      // Clear existing cookies
      clearCampaignCookie();

      // Test rapid set/get operations
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          new Promise<boolean>((resolve) => {
            const data = {
              campaignId: `concurrent-${i}`,
              uniqueCode: `CONC${i}`,
            };

            const setResult = setCampaignCookie(data);
            if (setResult.success) {
              const getResult = getCampaignCookie();
              resolve(getResult.isValid);
            } else {
              resolve(false);
            }
          })
        );
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every((result) => result);
      this.logTest("Concurrent operations handled", allSuccessful);
    } catch (error) {
      this.logTest(
        "Concurrent operations exception",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log("🧪 Starting Cookie Utilities Test Suite...\n");

    await this.testBasicCookieOperations();
    await this.testCookieExpiration();
    await this.testUTMParameters();
    await this.testErrorHandling();
    await this.testDebuggingUtilities();
    await this.testConcurrentOperations();

    // Clean up after tests
    clearCampaignCookie();

    // Print summary
    this.printSummary();
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log("\n=== Test Summary ===");

    const passed = this.testResults.filter((r) => r.passed).length;
    const total = this.testResults.length;
    const failed = total - passed;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log("\nFailed Tests:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((r) =>
          console.log(`  - ${r.test}: ${r.error || "Unknown error"}`)
        );
    }

    console.log("\n🏁 Test Suite Complete!");
  }

  /**
   * Get test results
   */
  getResults() {
    return {
      total: this.testResults.length,
      passed: this.testResults.filter((r) => r.passed).length,
      failed: this.testResults.filter((r) => !r.passed).length,
      results: this.testResults,
    };
  }
}

/**
 * Quick test function for browser console
 */
export const runCookieTests = async () => {
  const testSuite = new CookieTestSuite();
  await testSuite.runAllTests();
  return testSuite.getResults();
};

/**
 * Manual test functions for specific scenarios
 */
export const manualTests = {
  /**
   * Test setting a campaign cookie with current timestamp
   */
  testSetCookie: (
    campaignId: string = "manual-test",
    uniqueCode: string = "MANUAL123"
  ) => {
    console.log("Setting campaign cookie...");
    const result = setCampaignCookie({
      campaignId,
      uniqueCode,
      utmParams: {
        source: "manual",
        medium: "console",
        content: "test",
      },
    });
    console.log("Result:", result);
    return result;
  },

  /**
   * Test getting the current campaign cookie
   */
  testGetCookie: () => {
    console.log("Getting campaign cookie...");
    const result = getCampaignCookie();
    console.log("Result:", result);
    return result;
  },

  /**
   * Test clearing the campaign cookie
   */
  testClearCookie: () => {
    console.log("Clearing campaign cookie...");
    const result = clearCampaignCookie();
    console.log("Result:", result);
    return result;
  },

  /**
   * Test cookie expiration information
   */
  testExpiration: () => {
    console.log("Getting expiration info...");
    const result = getCampaignCookieExpiration();
    console.log("Result:", result);
    return result;
  },

  /**
   * Show all debug information
   */
  showDebugInfo: () => {
    console.log("Debug information:");
    const info = cookieDebug.getAllInfo();
    console.log(info);
    return info;
  },
};
