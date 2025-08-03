import { NextRequest, NextResponse } from "next/server";
import {
  parseRedemptionUrl,
  validateCampaignData,
  testUrlParser,
} from "@/lib/utils/redemptionUrlParser";

/**
 * @swagger
 * /api/test-redemption-parser:
 *   get:
 *     summary: Test redemption URL parser utility
 *     description: Test the URL parser with various formats and edge cases
 *     tags:
 *       - Testing
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: URL to parse and test
 *         example: "/redeem?campaign_id=123&code=ABC123"
 *       - in: query
 *         name: demo
 *         schema:
 *           type: boolean
 *         description: Run demo with predefined test cases
 *         example: true
 *       - in: query
 *         name: runTests
 *         schema:
 *           type: boolean
 *         description: Run comprehensive test suite
 *         example: true
 *     responses:
 *       200:
 *         description: Parser test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUrl = searchParams.get("url");
    const runDemo = searchParams.get("demo") === "true";
    const runTests = searchParams.get("runTests") === "true";

    if (runTests) {
      // Run comprehensive test suite
      const testResults = testUrlParser();

      return NextResponse.json({
        success: true,
        message: "URL Parser Test Suite Results",
        results: {
          summary: {
            totalTests: testResults.totalTests,
            passed: testResults.passed,
            failed: testResults.failed,
            passRate: `${(
              (testResults.passed / testResults.totalTests) *
              100
            ).toFixed(1)}%`,
          },
          details: testResults.results,
          failedTests: testResults.results.filter((r) => !r.passed),
        },
      });
    }

    if (runDemo) {
      // Run demo with predefined examples
      const demoResults = [
        "/redeem?campaign_id=123&code=ABC123DEF456",
        "?campaign_id=1754169423931-stp6rpgli&code=OVXQYE0I",
        "https://example.com/redeem?campaign_id=summer2025&code=SUMMER25&utm_source=email",
        "/redeem?campaign_id=&code=ABC123", // Invalid
        "/redeem?code=ABC123", // Invalid
        "malformed-url", // Invalid
      ].map((url) => {
        const result = parseRedemptionUrl(url);
        const validation = validateCampaignData(result);

        return {
          url,
          parsed: result,
          validation,
        };
      });

      return NextResponse.json({
        success: true,
        message: "URL Parser Demo Results",
        results: demoResults,
      });
    }

    if (testUrl) {
      // Parse specific URL
      const result = parseRedemptionUrl(testUrl);
      const validation = validateCampaignData(result);

      return NextResponse.json({
        success: true,
        message: `Parsed URL: ${testUrl}`,
        results: {
          input: testUrl,
          parsed: result,
          validation,
          summary: {
            isValid: result.isValid,
            campaignId: result.campaignId,
            uniqueCode: result.uniqueCode,
            hasErrors: result.errors.length > 0,
            hasWarnings: validation.warnings.length > 0,
          },
        },
      });
    }

    // Default: Show usage examples
    return NextResponse.json({
      success: true,
      message: "Redemption URL Parser Test Endpoint",
      usage: {
        testSpecificUrl:
          "/api/test-redemption-parser?url=/redeem?campaign_id=123&code=ABC123",
        runDemo: "/api/test-redemption-parser?demo=true",
        runTestSuite: "/api/test-redemption-parser?runTests=true",
      },
      examples: [
        {
          description: "Valid redemption URL",
          url: "/redeem?campaign_id=123&code=ABC123",
          expected: "Should parse successfully",
        },
        {
          description: "URL with additional parameters",
          url: "/redeem?campaign_id=123&code=ABC123&utm_source=email",
          expected: "Should parse and include additional parameters",
        },
        {
          description: "Invalid URL - missing code",
          url: "/redeem?campaign_id=123",
          expected: "Should fail validation",
        },
      ],
    });
  } catch (error) {
    console.error("Error in redemption parser test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test redemption URL parser",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls = [] }: { urls: string[] } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of URLs to test" },
        { status: 400 }
      );
    }

    if (urls.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 URLs allowed per batch" },
        { status: 400 }
      );
    }

    // Parse all provided URLs
    const results = urls.map((url, index) => {
      const result = parseRedemptionUrl(url);
      const validation = validateCampaignData(result);

      return {
        index,
        url,
        parsed: result,
        validation,
        isValid: result.isValid && validation.isValid,
      };
    });

    const summary = {
      totalUrls: urls.length,
      validUrls: results.filter((r) => r.isValid).length,
      invalidUrls: results.filter((r) => !r.isValid).length,
      successRate: `${(
        (results.filter((r) => r.isValid).length / urls.length) *
        100
      ).toFixed(1)}%`,
    };

    return NextResponse.json({
      success: true,
      message: "Batch URL parsing completed",
      summary,
      results,
      invalidUrls: results
        .filter((r) => !r.isValid)
        .map((r) => ({
          url: r.url,
          errors: r.parsed.errors,
          warnings: r.validation.warnings,
        })),
    });
  } catch (error) {
    console.error("Error in batch URL parsing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse URLs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
