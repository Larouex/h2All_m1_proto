#!/usr/bin/env node

/**
 * Redemption URL Parser Test Script
 * Demonstrates parsing of various URL formats and edge cases
 */

import {
  parseRedemptionUrl,
  testUrlParser,
  validateCampaignData,
} from "./src/lib/utils/redemptionUrlParser.js";

console.log("🔗 Redemption URL Parser Test\n");

// Test cases that match your requirements
const testCases = [
  {
    name: "Basic redemption URL",
    url: "/redeem?campaign_id=123&code=abc123def456",
    description: "Standard format with numeric campaign ID",
  },
  {
    name: "Real campaign URL",
    url: "/redeem?campaign_id=1754169423931-stp6rpgli&code=OVXQYE0I",
    description: "Actual campaign with timestamp-based ID",
  },
  {
    name: "URL with UTM parameters",
    url: "/redeem?campaign_id=summer2025&code=PROMO25&utm_source=email&utm_campaign=newsletter",
    description: "Including marketing tracking parameters",
  },
  {
    name: "Query string only",
    url: "?campaign_id=456&code=DEF789",
    description: "Just the query parameters",
  },
  {
    name: "Full URL",
    url: "https://example.com/redeem?campaign_id=789&code=GHI123&ref=social",
    description: "Complete URL with domain",
  },
  {
    name: "Missing campaign_id",
    url: "/redeem?code=ABC123",
    description: "Invalid - missing required parameter",
  },
  {
    name: "Missing code",
    url: "/redeem?campaign_id=123",
    description: "Invalid - missing redemption code",
  },
  {
    name: "Empty parameters",
    url: "/redeem?campaign_id=&code=",
    description: "Invalid - empty values",
  },
  {
    name: "Invalid code format",
    url: "/redeem?campaign_id=123&code=lowercase",
    description: "Invalid - code must be uppercase alphanumeric",
  },
  {
    name: "Special characters in campaign_id",
    url: "/redeem?campaign_id=test!@#&code=ABC123",
    description: "Invalid - special characters not allowed",
  },
];

console.log("📋 Testing Individual URLs:\n");

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   URL: ${testCase.url}`);
  console.log(`   Description: ${testCase.description}`);

  const result = parseRedemptionUrl(testCase.url);
  const validation = validateCampaignData(result);

  console.log(`   ✅ Valid: ${result.isValid}`);
  console.log(`   🆔 Campaign ID: "${result.campaignId}"`);
  console.log(`   🎫 Code: "${result.uniqueCode}"`);

  if (result.errors.length > 0) {
    console.log(`   ❌ Errors: ${result.errors.join(", ")}`);
  }

  if (validation.warnings.length > 0) {
    console.log(`   ⚠️  Warnings: ${validation.warnings.join(", ")}`);
  }

  if (result.additionalParams) {
    console.log(`   📎 Additional: ${JSON.stringify(result.additionalParams)}`);
  }

  console.log("");
});

console.log("🧪 Running Comprehensive Test Suite:\n");

const testSuiteResults = testUrlParser();

console.log(`📊 Test Results:`);
console.log(`   Total Tests: ${testSuiteResults.totalTests}`);
console.log(`   Passed: ${testSuiteResults.passed}`);
console.log(`   Failed: ${testSuiteResults.failed}`);
console.log(
  `   Success Rate: ${(
    (testSuiteResults.passed / testSuiteResults.totalTests) *
    100
  ).toFixed(1)}%`
);

if (testSuiteResults.failed > 0) {
  console.log("\n❌ Failed Tests:");
  testSuiteResults.results
    .filter((r) => !r.passed)
    .forEach((result) => {
      console.log(`   Input: "${result.input}"`);
      console.log(`   Expected: ${result.expected}, Got: ${result.actual}`);
    });
}

console.log("\n✅ URL Parser Test Complete!");

// Export for use in other files
export { parseRedemptionUrl, validateCampaignData, testUrlParser };
