/**
 * Security Test Script (Node.js)
 * Run with: node scripts/test-security.js
 */

// Test configuration
const BASE_URL = "http://localhost:3000";

/**
 * Test helper function
 */
async function testEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    let data;

    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    console.log(`\n🔍 Testing ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`CORS Headers:`);
    console.log(
      `  Access-Control-Allow-Origin: ${response.headers.get(
        "access-control-allow-origin"
      )}`
    );
    console.log(
      `  Access-Control-Allow-Methods: ${response.headers.get(
        "access-control-allow-methods"
      )}`
    );
    console.log(`Security Headers:`);
    console.log(
      `  X-Content-Type-Options: ${response.headers.get(
        "x-content-type-options"
      )}`
    );
    console.log(
      `  X-Frame-Options: ${response.headers.get("x-frame-options")}`
    );
    console.log(`Response:`, data);

    return { response, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Run security tests
 */
async function runSecurityTests() {
  console.log("🛡️  Starting API Security Tests\n");

  // Test 1: Valid origin (localhost)
  console.log("=".repeat(50));
  console.log("TEST 1: Valid Origin (should succeed)");
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
  });

  // Test 2: CORS preflight (OPTIONS)
  console.log("=".repeat(50));
  console.log("TEST 2: CORS Preflight (should succeed)");
  await testEndpoint("/api/health", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:3000",
      "Access-Control-Request-Method": "GET",
    },
  });

  // Test 3: Invalid origin (should be blocked)
  console.log("=".repeat(50));
  console.log("TEST 3: Invalid Origin (should be blocked)");
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      Origin: "https://malicious-site.com",
      "Content-Type": "application/json",
    },
  });

  // Test 4: No origin (should work)
  console.log("=".repeat(50));
  console.log("TEST 4: No Origin (should succeed)");
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("=".repeat(50));
  console.log("✅ Security tests completed");
  console.log("\nExpected Results:");
  console.log("- Test 1: 200 status with security headers");
  console.log("- Test 2: 200 status with CORS headers");
  console.log('- Test 3: 403 status with "Access denied" error');
  console.log("- Test 4: 200 status (server-to-server allowed)");
}

// Run tests
runSecurityTests().catch(console.error);
