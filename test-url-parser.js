#!/usr/bin/env node

/**
 * Simple test runner for URL Parser utility
 * Run this to test the URL parser functionality
 */

const {
  parseCampaignUrl,
  validateCampaignUrl,
  UrlParserTester,
  runPerformanceTest,
} = require("./dist/lib/utils/urlParser");

console.log("🧪 URL Parser Test Runner\n");

// Test basic parsing
console.log("1. Basic URL Parsing:");
const basicResult = parseCampaignUrl(
  "/redeem?campaign_id=123&code=ABC123DEF456"
);
console.log("   Input: /redeem?campaign_id=123&code=ABC123DEF456");
console.log("   Valid:", basicResult.isValid);
console.log("   Campaign ID:", basicResult.campaignId);
console.log("   Code:", basicResult.uniqueCode);
console.log();

// Test validation
console.log("2. URL Validation:");
const validationResult = validateCampaignUrl(
  "/redeem?campaign_id=invalid@#$&code=ABC123"
);
console.log("   Input: /redeem?campaign_id=invalid@#$&code=ABC123");
console.log("   Valid:", validationResult.isValid);
console.log("   Errors:", validationResult.errors);
console.log();

// Test various formats
console.log("3. Various URL Formats:");
const testUrls = [
  "?campaign_id=123&code=ABC123",
  "https://h2all.com/redeem?campaign_id=winter-2025&code=SAVE20NOW&utm_source=email",
  "/activate?campaign_id=qr_001&code=QR2025ABC&device=mobile",
  "/redeem?campaign_id=&code=ABC123", // Invalid
];

testUrls.forEach((url, index) => {
  const result = parseCampaignUrl(url);
  console.log(`   ${index + 1}. ${url}`);
  console.log(
    `      Valid: ${result.isValid}, Campaign: ${result.campaignId}, Code: ${result.uniqueCode}`
  );
});

console.log("\n✅ URL Parser test completed!");
