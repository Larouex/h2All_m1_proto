/**
 * Simple JavaScript version of the Redemption URL Parser for testing
 */

/**
 * Parse redemption URL and extract campaign data
 * @param {string} url - URL to parse
 * @returns {Object} Parsed campaign data
 */
function parseRedemptionUrl(url) {
  const errors = [];
  let additionalParams = {};

  try {
    // Create URL object from various input formats
    let urlObj;

    if (url.startsWith("/")) {
      urlObj = new URL(`http://localhost${url}`);
    } else if (url.startsWith("?")) {
      urlObj = new URL(`http://localhost${url}`);
    } else if (url.includes("://")) {
      urlObj = new URL(url);
    } else {
      urlObj = new URL(`http://localhost?${url}`);
    }

    const searchParams = urlObj.searchParams;

    // Extract required parameters
    const campaignId = searchParams.get("campaign_id") || "";
    const uniqueCode = searchParams.get("code") || "";

    // Validate required parameters
    if (!campaignId) {
      errors.push("Missing required parameter: campaign_id");
    }
    if (!uniqueCode) {
      errors.push("Missing required parameter: code");
    }

    // Format validation
    const campaignIdPattern = /^[a-zA-Z0-9_-]{1,50}$/;
    const codePattern = /^[A-Z0-9]{4,32}$/;

    if (campaignId && !campaignIdPattern.test(campaignId)) {
      errors.push(`Invalid campaign_id format: ${campaignId}`);
    }

    if (uniqueCode && !codePattern.test(uniqueCode)) {
      errors.push(`Invalid code format: ${uniqueCode}`);
    }

    // Extract additional parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== "campaign_id" && key !== "code") {
        additionalParams[key] = value;
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
    errors.push(`URL parsing error: ${error.message}`);

    return {
      campaignId: "",
      uniqueCode: "",
      isValid: false,
      errors,
      originalUrl: url,
    };
  }
}

// Demo the parser
console.log("🔗 Redemption URL Parser Demo\n");

const testUrls = [
  "/redeem?campaign_id=123&code=ABC123DEF456",
  "?campaign_id=1754169423931-stp6rpgli&code=OVXQYE0I",
  "https://example.com/redeem?campaign_id=summer2025&code=SUMMER25&utm_source=email",
  "/redeem?campaign_id=&code=ABC123", // Invalid - empty campaign_id
  "/redeem?code=ABC123", // Invalid - missing campaign_id
  "/redeem?campaign_id=123&code=lowercase", // Invalid - lowercase code
  "/redeem?campaign_id=test!@#&code=ABC123", // Invalid - special chars
];

testUrls.forEach((url, i) => {
  console.log(`📋 Test ${i + 1}: ${url}`);
  const result = parseRedemptionUrl(url);

  console.log(`  ✅ Valid: ${result.isValid}`);
  console.log(`  🆔 Campaign ID: "${result.campaignId}"`);
  console.log(`  🎫 Code: "${result.uniqueCode}"`);

  if (result.errors.length > 0) {
    console.log(`  ❌ Errors: ${result.errors.join(", ")}`);
  }

  if (result.additionalParams) {
    console.log(`  📎 Additional: ${JSON.stringify(result.additionalParams)}`);
  }
  console.log("");
});

console.log("✅ Demo Complete!");

module.exports = { parseRedemptionUrl };
