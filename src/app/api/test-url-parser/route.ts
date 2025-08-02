import { NextRequest, NextResponse } from "next/server";
import { parseCampaignUrl, validateCampaignUrl } from "@/lib/utils/urlParser";
import {
  UrlParserTester,
  runPerformanceTest,
} from "@/lib/utils/urlParser.test";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("test") || "basic";
  const url = searchParams.get("url");

  try {
    switch (testType) {
      case "parse":
        if (!url) {
          return NextResponse.json(
            { error: "URL parameter is required for parse test" },
            { status: 400 }
          );
        }
        return handleParseTest(url);

      case "validate":
        if (!url) {
          return NextResponse.json(
            { error: "URL parameter is required for validate test" },
            { status: 400 }
          );
        }
        return handleValidateTest(url);

      case "comprehensive":
        return handleComprehensiveTest();

      case "performance":
        return handlePerformanceTest();

      case "examples":
        return handleExamplesTest();

      default:
        return handleBasicTest();
    }
  } catch (error) {
    console.error("URL Parser API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle basic URL parsing test
 */
function handleBasicTest() {
  const testUrl = "/redeem?campaign_id=123&code=ABC123DEF456";
  const result = parseCampaignUrl(testUrl);

  return NextResponse.json({
    success: true,
    test: "basic",
    input: testUrl,
    result,
    message: "Basic URL parsing test completed",
  });
}

/**
 * Handle URL parsing test with user-provided URL
 */
function handleParseTest(url: string) {
  const result = parseCampaignUrl(url);

  return NextResponse.json({
    success: true,
    test: "parse",
    input: url,
    result,
    message: `Parsed URL: ${url}`,
  });
}

/**
 * Handle URL validation test with detailed error reporting
 */
function handleValidateTest(url: string) {
  const result = validateCampaignUrl(url);

  return NextResponse.json({
    success: true,
    test: "validate",
    input: url,
    result,
    message: `Validated URL: ${url}`,
  });
}

/**
 * Handle comprehensive test suite
 */
function handleComprehensiveTest() {
  const tester = new UrlParserTester();
  const results = tester.runAllTests();

  return NextResponse.json({
    success: true,
    test: "comprehensive",
    results,
    message: `Completed ${
      results.totalTests
    } tests with ${results.passRate.toFixed(1)}% pass rate`,
  });
}

/**
 * Handle performance test
 */
function handlePerformanceTest() {
  const results = runPerformanceTest();

  return NextResponse.json({
    success: true,
    test: "performance",
    results,
    message: `Performance test: ${Math.round(
      results.urlsPerSecond
    ).toLocaleString()} URLs/second`,
  });
}

/**
 * Handle examples test showing various URL formats
 */
function handleExamplesTest() {
  const examples = [
    {
      name: "Basic redemption URL",
      url: "/redeem?campaign_id=123&code=ABC123DEF456",
      description: "Standard redemption URL with campaign ID and code",
    },
    {
      name: "Email campaign URL",
      url: "https://h2all.com/redeem?campaign_id=winter-2025&code=SAVE20NOW&utm_source=email&utm_campaign=winter_sale",
      description: "Email campaign URL with UTM tracking parameters",
    },
    {
      name: "QR code URL",
      url: "/activate?campaign_id=qr_promo_001&code=QR2025ABC&device=mobile&location=store_123",
      description: "QR code activation URL with device and location tracking",
    },
    {
      name: "Social sharing URL",
      url: "/claim?campaign_id=social_blast&code=SHARE2WIN&platform=twitter&shared_by=user123",
      description: "Social media sharing URL with platform and user tracking",
    },
    {
      name: "Invalid URL - missing code",
      url: "/redeem?campaign_id=123&ref=email",
      description: "Invalid URL missing required code parameter",
    },
    {
      name: "Invalid URL - bad format",
      url: "/redeem?campaign_id=invalid@#$&code=bad-code-format",
      description: "Invalid URL with incorrectly formatted parameters",
    },
  ];

  const results = examples.map((example) => {
    const parsed = parseCampaignUrl(example.url);
    const validated = validateCampaignUrl(example.url);

    return {
      ...example,
      parsed,
      validated,
    };
  });

  return NextResponse.json({
    success: true,
    test: "examples",
    results,
    message: `Tested ${examples.length} example URLs`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, config } = body;

    if (!Array.isArray(urls)) {
      return NextResponse.json(
        { error: "URLs must be provided as an array" },
        { status: 400 }
      );
    }

    const results = urls.map((url: string) => {
      const parsed = parseCampaignUrl(url, config);
      const validated = validateCampaignUrl(url, config);

      return {
        url,
        parsed,
        validated,
      };
    });

    const summary = {
      total: urls.length,
      valid: results.filter((r) => r.parsed.isValid).length,
      invalid: results.filter((r) => !r.parsed.isValid).length,
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      message: `Processed ${urls.length} URLs`,
    });
  } catch (error) {
    console.error("URL Parser POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to process URLs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
