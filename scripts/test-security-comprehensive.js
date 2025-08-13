/**
 * Comprehensive Security Test Script
 * Tests all secured API endpoints with different security levels
 * Run with: node scripts/test-security-comprehensive.js
 */

const BASE_URL = "http://localhost:3000";
const VALID_API_KEY = "dev_api_key_change_in_production";

async function testEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    let data;

    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    const result = {
      endpoint,
      status: response.status,
      success: response.status < 400,
      data: typeof data === "string" ? data.substring(0, 200) : data,
    };

    return result;
  } catch (error) {
    return {
      endpoint,
      status: "ERROR",
      success: false,
      data: error.message,
    };
  }
}

async function runComprehensiveTests() {
  console.log("🛡️  COMPREHENSIVE API SECURITY TEST SUITE\n");
  console.log(
    "Testing all secured endpoints with different access levels...\n"
  );

  const results = [];

  // Test PUBLIC endpoints (origin validation only)
  console.log("📋 TESTING PUBLIC ENDPOINTS (Origin validation only)");
  console.log("━".repeat(80));

  const publicTests = [
    // Valid origin tests
    {
      name: "Health - Valid Origin",
      endpoint: "/api/health",
      headers: { Origin: "http://localhost:3000" },
    },
    {
      name: "Test GET - Valid Origin",
      endpoint: "/api/test",
      headers: { Origin: "http://localhost:3000" },
    },
    {
      name: "Campaigns - Valid Origin",
      endpoint: "/api/campaigns",
      headers: { Origin: "http://localhost:3000" },
    },

    // Invalid origin tests
    {
      name: "Health - Invalid Origin",
      endpoint: "/api/health",
      headers: { Origin: "https://malicious.com" },
      expectFail: true,
    },
    {
      name: "Test - Invalid Origin",
      endpoint: "/api/test",
      headers: { Origin: "https://malicious.com" },
      expectFail: true,
    },
  ];

  for (const test of publicTests) {
    const result = await testEndpoint(test.endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...test.headers },
    });

    const status = test.expectFail
      ? result.success
        ? "❌ FAIL"
        : "✅ PASS"
      : result.success
      ? "✅ PASS"
      : "❌ FAIL";
    console.log(`${status} ${test.name}: ${result.status}`);
    results.push({ ...test, ...result });
  }

  // Test PROTECTED endpoints (API key required)
  console.log("\n📋 TESTING PROTECTED ENDPOINTS (API key required)");
  console.log("━".repeat(80));

  const protectedTests = [
    // Without API key (should fail)
    {
      name: "Email Claim - No API Key",
      endpoint: "/api/emailclaim",
      method: "GET",
      expectFail: true,
    },

    // With valid API key (should work)
    {
      name: "Email Claim - Valid API Key",
      endpoint: "/api/emailclaim",
      method: "GET",
      headers: { "x-api-key": VALID_API_KEY },
    },
  ];

  for (const test of protectedTests) {
    const result = await testEndpoint(test.endpoint, {
      method: test.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...test.headers,
      },
    });

    const status = test.expectFail
      ? result.success
        ? "❌ FAIL"
        : "✅ PASS"
      : result.success
      ? "✅ PASS"
      : "❌ FAIL";
    console.log(`${status} ${test.name}: ${result.status}`);
    results.push({ ...test, ...result });
  }

  // Test ADMIN endpoints (API key required)
  console.log("\n📋 TESTING ADMIN ENDPOINTS (API key required)");
  console.log("━".repeat(80));

  const adminTests = [
    // Without API key (should fail)
    {
      name: "Admin Stats - No API Key",
      endpoint: "/api/admin/stats",
      expectFail: true,
    },
    {
      name: "Admin Users - No API Key",
      endpoint: "/api/admin/users",
      expectFail: true,
    },

    // With invalid API key (should fail)
    {
      name: "Admin Stats - Invalid API Key",
      endpoint: "/api/admin/stats",
      headers: { "x-api-key": "invalid_key" },
      expectFail: true,
    },

    // With valid API key (should work)
    {
      name: "Admin Stats - Valid API Key",
      endpoint: "/api/admin/stats",
      headers: { "x-api-key": VALID_API_KEY },
    },
    {
      name: "Admin Users - Valid API Key",
      endpoint: "/api/admin/users",
      headers: { "x-api-key": VALID_API_KEY },
    },
  ];

  for (const test of adminTests) {
    const result = await testEndpoint(test.endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...test.headers,
      },
    });

    const status = test.expectFail
      ? result.success
        ? "❌ FAIL"
        : "✅ PASS"
      : result.success
      ? "✅ PASS"
      : "❌ FAIL";
    console.log(`${status} ${test.name}: ${result.status}`);
    results.push({ ...test, ...result });
  }

  // Summary
  console.log("\n📊 TEST SUMMARY");
  console.log("━".repeat(80));
  const passed = results.filter((r) =>
    r.expectFail ? !r.success : r.success
  ).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log("\n🎉 ALL SECURITY TESTS PASSED! 🎉");
    console.log("Your API endpoints are properly secured!");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please review the security implementation."
    );
  }

  // Detailed failures
  const failures = results.filter((r) =>
    r.expectFail ? r.success : !r.success
  );

  if (failures.length > 0) {
    console.log("\n❌ FAILED TESTS:");
    failures.forEach((f) => {
      console.log(
        `   - ${f.name}: Expected ${
          f.expectFail ? "failure" : "success"
        }, got ${f.success ? "success" : "failure"}`
      );
    });
  }
}

// Run the comprehensive test suite
runComprehensiveTests().catch(console.error);
