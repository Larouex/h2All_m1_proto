/**
 * Security Test Script
 * Test the API security implementation with different scenarios
 */

// Test configuration
const BASE_URL = "http://localhost:3000";
const API_KEY = "dev_api_key_change_in_production"; // From .env.local

/**
 * Test helper function
 */
async function testEndpoint(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`\n🔍 Testing ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`Response:`, data);

    return { response, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
    return null;
  }
}

/**
 * Run security tests
 */
export async function runSecurityTests() {
  console.log("🛡️  Starting API Security Tests\n");

  // Test 1: Basic health check (should work with origin validation)
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
  });

  // Test 2: CORS preflight (OPTIONS request)
  await testEndpoint("/api/health", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:3000",
      "Access-Control-Request-Method": "GET",
    },
  });

  // Test 3: Invalid origin (should be blocked)
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      Origin: "https://malicious-site.com",
      "Content-Type": "application/json",
    },
  });

  // Test 4: No origin (should work - server-to-server)
  await testEndpoint("/api/health", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("\n✅ Security tests completed");
}

// Run tests if this file is executed directly
if (typeof window === "undefined" && require.main === module) {
  runSecurityTests();
}
