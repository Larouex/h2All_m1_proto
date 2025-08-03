#!/usr/bin/env node

/**
 * Simple test runner for the code generation requirement
 * Run with: node test-requirement.js
 */

// Import the functions (this would work in a Node.js environment)
const {
  generateBulkCodes,
  CodePresets,
  verifyUniqueness,
  validateCodeFormat,
} = require("./src/lib/utils/codeGenerator.ts");

async function testRequirement() {
  console.log(
    "🎯 Testing Main Requirement: Generate 1000 unique, properly formatted codes\n"
  );

  const startTime = Date.now();

  try {
    // Generate 1000 codes using the standard preset
    console.log("📝 Generating 1000 codes...");
    const result = generateBulkCodes(1000, CodePresets.STANDARD);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify uniqueness
    console.log("🔍 Verifying uniqueness...");
    const uniquenessCheck = verifyUniqueness(result.codes);

    // Validate all codes
    console.log("✅ Validating code formats...");
    let validCodes = 0;
    const invalidCodes = [];

    for (const code of result.codes) {
      const validation = validateCodeFormat(code, CodePresets.STANDARD);
      if (validation.isValid) {
        validCodes++;
      } else {
        invalidCodes.push({
          code,
          errors: validation.errors,
        });
      }
    }

    // Display results
    console.log("\n📊 Test Results:");
    console.log("================");
    console.log(`📝 Requested codes: 1000`);
    console.log(`✨ Generated codes: ${result.generated}`);
    console.log(`🔑 Unique codes: ${uniquenessCheck.uniqueCount}`);
    console.log(`✅ Valid format: ${validCodes}`);
    console.log(`⚡ Generation time: ${duration}ms`);
    console.log(
      `🚀 Performance: ${Math.round(1000 / (duration / 1000))} codes/second`
    );

    if (uniquenessCheck.duplicates.length > 0) {
      console.log(
        `\n⚠️  Duplicates found: ${uniquenessCheck.duplicates.length}`
      );
      console.log(
        `   Duplicate codes: ${uniquenessCheck.duplicates
          .slice(0, 5)
          .join(", ")}${uniquenessCheck.duplicates.length > 5 ? "..." : ""}`
      );
    }

    if (invalidCodes.length > 0) {
      console.log(`\n❌ Invalid codes: ${invalidCodes.length}`);
      invalidCodes.slice(0, 3).forEach(({ code, errors }) => {
        console.log(`   ${code}: ${errors.join(", ")}`);
      });
    }

    // Show sample codes
    console.log("\n📋 Sample Generated Codes:");
    console.log("===========================");
    result.codes.slice(0, 20).forEach((code, index) => {
      console.log(`${(index + 1).toString().padStart(2)}: ${code}`);
    });

    // Final assessment
    const success =
      result.generated === 1000 &&
      uniquenessCheck.isUnique &&
      validCodes === 1000;

    console.log("\n🎯 Final Result:");
    console.log("================");
    if (success) {
      console.log("✅ REQUIREMENT PASSED!");
      console.log("   All 1000 codes are unique and properly formatted! 🎉");
    } else {
      console.log("❌ REQUIREMENT FAILED!");
      if (result.generated !== 1000) {
        console.log(`   - Only generated ${result.generated}/1000 codes`);
      }
      if (!uniquenessCheck.isUnique) {
        console.log(
          `   - Found ${uniquenessCheck.duplicates.length} duplicate codes`
        );
      }
      if (validCodes !== 1000) {
        console.log(`   - Only ${validCodes}/1000 codes have valid format`);
      }
    }

    return success;
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRequirement()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { testRequirement };
