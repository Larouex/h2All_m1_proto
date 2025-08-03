import {
  generateRedemptionCode,
  generateBulkCodes,
  validateCodeFormat,
  generateUniqueId,
  generateShortId,
  CodePresets,
  verifyUniqueness,
  benchmarkCodeGeneration,
} from "./codeGenerator";

/**
 * Test suite for code generation utilities
 */
export class CodeGeneratorTester {
  private results: Array<{
    test: string;
    passed: boolean;
    message: string;
    duration?: number;
  }> = [];

  /**
   * Runs all tests and returns results
   */
  async runAllTests(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: Array<{
      test: string;
      passed: boolean;
      message: string;
      duration?: number;
    }>;
  }> {
    console.log("🧪 Starting Code Generator Tests...\n");

    // Basic functionality tests
    await this.testSingleCodeGeneration();
    await this.testBulkCodeGeneration();
    await this.testCodeValidation();
    await this.testUniquenessVerification();

    // Performance tests
    await this.testPerformance();

    // Edge cases
    await this.testEdgeCases();

    // Preset tests
    await this.testPresets();

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    console.log("\n📊 Test Summary:");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${this.results.length}`);

    return {
      passed,
      failed,
      total: this.results.length,
      results: this.results,
    };
  }

  private async testSingleCodeGeneration(): Promise<void> {
    console.log("Testing single code generation...");

    // Test default generation
    try {
      const code = generateRedemptionCode();
      this.addResult(
        "Default code generation",
        code.length === 8 && typeof code === "string",
        `Generated: ${code}`
      );
    } catch (error) {
      this.addResult("Default code generation", false, `Error: ${error}`);
    }

    // Test custom length
    try {
      const code = generateRedemptionCode({ length: 12 });
      this.addResult(
        "Custom length (12)",
        code.length === 12,
        `Generated: ${code}`
      );
    } catch (error) {
      this.addResult("Custom length (12)", false, `Error: ${error}`);
    }

    // Test with prefix and suffix
    try {
      const code = generateRedemptionCode({
        length: 6,
        prefix: "H2-",
        suffix: "-2025",
      });
      this.addResult(
        "Prefix and suffix",
        code.startsWith("H2-") && code.endsWith("-2025") && code.length === 12,
        `Generated: ${code}`
      );
    } catch (error) {
      this.addResult("Prefix and suffix", false, `Error: ${error}`);
    }

    // Test letters only
    try {
      const code = generateRedemptionCode({
        length: 8,
        includeNumbers: false,
      });
      const hasOnlyLetters = /^[A-Z]+$/.test(code);
      this.addResult(
        "Letters only generation",
        hasOnlyLetters,
        `Generated: ${code}`
      );
    } catch (error) {
      this.addResult("Letters only generation", false, `Error: ${error}`);
    }
  }

  private async testBulkCodeGeneration(): Promise<void> {
    console.log("Testing bulk code generation...");

    // Test generating 1000 codes
    try {
      const startTime = performance.now();
      const result = generateBulkCodes(1000);
      const endTime = performance.now();

      const uniquenessCheck = verifyUniqueness(result.codes);

      this.addResult(
        "Generate 1000 codes",
        result.generated === 1000 && uniquenessCheck.isUnique,
        `Generated ${result.generated}/1000 codes, ${uniquenessCheck.uniqueCount} unique`,
        endTime - startTime
      );

      // Verify all codes have correct format
      const validCodes = result.codes.every(
        (code) =>
          code.length === 8 && /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/.test(code)
      );
      this.addResult(
        "All 1000 codes properly formatted",
        validCodes,
        `All codes match expected format`
      );
    } catch (error) {
      this.addResult("Generate 1000 codes", false, `Error: ${error}`);
    }

    // Test bulk generation with custom options
    try {
      const result = generateBulkCodes(100, {
        length: 10,
        prefix: "CAMP-",
        excludeAmbiguous: true,
      });

      const allValid = result.codes.every(
        (code) => code.startsWith("CAMP-") && code.length === 15
      );

      this.addResult(
        "Bulk with custom options",
        result.generated === 100 && allValid,
        `Generated ${result.generated} codes with prefix`
      );
    } catch (error) {
      this.addResult("Bulk with custom options", false, `Error: ${error}`);
    }
  }

  private async testCodeValidation(): Promise<void> {
    console.log("Testing code validation...");

    // Test valid code
    const validCode = generateRedemptionCode({ length: 8 });
    const validResult = validateCodeFormat(validCode, { length: 8 });
    this.addResult(
      "Valid code validation",
      validResult.isValid && validResult.errors.length === 0,
      `Code: ${validCode}, Valid: ${validResult.isValid}`
    );

    // Test invalid length
    const invalidLengthResult = validateCodeFormat("ABC123", { length: 8 });
    this.addResult(
      "Invalid length detection",
      !invalidLengthResult.isValid &&
        invalidLengthResult.errors.some((e) => e.includes("length")),
      `Correctly detected length error`
    );

    // Test invalid characters
    const invalidCharsResult = validateCodeFormat("ABC12@#$", { length: 8 });
    this.addResult(
      "Invalid character detection",
      !invalidCharsResult.isValid,
      `Correctly detected invalid characters`
    );

    // Test prefix validation
    const prefixCode = generateRedemptionCode({ length: 6, prefix: "H2-" });
    const prefixResult = validateCodeFormat(prefixCode, {
      length: 6,
      prefix: "H2-",
    });
    this.addResult(
      "Prefix validation",
      prefixResult.isValid,
      `Code: ${prefixCode}, Valid: ${prefixResult.isValid}`
    );

    // Test missing prefix
    const noPrefixResult = validateCodeFormat("ABCD123", {
      length: 6,
      prefix: "H2-",
    });
    this.addResult(
      "Missing prefix detection",
      !noPrefixResult.isValid &&
        noPrefixResult.errors.some((e) => e.includes("prefix")),
      `Correctly detected missing prefix`
    );
  }

  private async testUniquenessVerification(): Promise<void> {
    console.log("Testing uniqueness verification...");

    // Test unique codes
    const uniqueCodes = generateBulkCodes(50).codes;
    const uniqueResult = verifyUniqueness(uniqueCodes);
    this.addResult(
      "Uniqueness of generated codes",
      uniqueResult.isUnique && uniqueResult.duplicates.length === 0,
      `${uniqueResult.uniqueCount} unique codes, ${uniqueResult.duplicates.length} duplicates`
    );

    // Test with duplicates
    const codesWithDuplicates = ["ABC123", "DEF456", "ABC123", "GHI789"];
    const duplicateResult = verifyUniqueness(codesWithDuplicates);
    this.addResult(
      "Duplicate detection",
      !duplicateResult.isUnique &&
        duplicateResult.duplicates.includes("ABC123"),
      `Detected duplicates: ${duplicateResult.duplicates.join(", ")}`
    );
  }

  private async testPerformance(): Promise<void> {
    console.log("Testing performance...");

    // Benchmark 1000 codes
    try {
      const benchmark = benchmarkCodeGeneration(1000);
      this.addResult(
        "Performance test (1000 codes)",
        benchmark.codesPerSecond > 1000 && benchmark.uniquenessCheck.isUnique,
        `${Math.round(
          benchmark.codesPerSecond
        )} codes/sec, ${benchmark.duration.toFixed(2)}ms`,
        benchmark.duration
      );
    } catch (error) {
      this.addResult("Performance test (1000 codes)", false, `Error: ${error}`);
    }

    // Benchmark 10000 codes
    try {
      const largeBenchmark = benchmarkCodeGeneration(10000);
      this.addResult(
        "Large performance test (10000 codes)",
        largeBenchmark.uniquenessCheck.isUnique,
        `${Math.round(
          largeBenchmark.codesPerSecond
        )} codes/sec, ${largeBenchmark.duration.toFixed(2)}ms`,
        largeBenchmark.duration
      );
    } catch (error) {
      this.addResult(
        "Large performance test (10000 codes)",
        false,
        `Error: ${error}`
      );
    }
  }

  private async testEdgeCases(): Promise<void> {
    console.log("Testing edge cases...");

    // Test zero count
    try {
      generateBulkCodes(0);
      this.addResult("Zero count handling", false, "Should have thrown error");
    } catch {
      this.addResult(
        "Zero count handling",
        true,
        "Correctly threw error for zero count"
      );
    }

    // Test negative count
    try {
      generateBulkCodes(-5);
      this.addResult(
        "Negative count handling",
        false,
        "Should have thrown error"
      );
    } catch {
      this.addResult(
        "Negative count handling",
        true,
        "Correctly threw error for negative count"
      );
    }

    // Test very large count (should warn but not fail)
    try {
      generateBulkCodes(150000);
      this.addResult(
        "Large count handling",
        false,
        "Should have thrown error for excessive count"
      );
    } catch {
      this.addResult(
        "Large count handling",
        true,
        "Correctly threw error for excessive count"
      );
    }

    // Test empty string validation
    const emptyResult = validateCodeFormat("");
    this.addResult(
      "Empty string validation",
      !emptyResult.isValid,
      "Correctly invalidated empty string"
    );

    // Test null validation
    const nullResult = validateCodeFormat(null as unknown as string);
    this.addResult(
      "Null value validation",
      !nullResult.isValid,
      "Correctly invalidated null value"
    );
  }

  private async testPresets(): Promise<void> {
    console.log("Testing code presets...");

    // Test standard preset
    try {
      const standardCode = generateRedemptionCode(CodePresets.STANDARD);
      const standardResult = validateCodeFormat(
        standardCode,
        CodePresets.STANDARD
      );
      this.addResult(
        "Standard preset",
        standardResult.isValid && standardCode.length === 8,
        `Generated: ${standardCode}`
      );
    } catch (error) {
      this.addResult("Standard preset", false, `Error: ${error}`);
    }

    // Test short preset
    try {
      const shortCode = generateRedemptionCode(CodePresets.SHORT);
      this.addResult(
        "Short preset",
        shortCode.length === 6,
        `Generated: ${shortCode}`
      );
    } catch (error) {
      this.addResult("Short preset", false, `Error: ${error}`);
    }

    // Test secure preset
    try {
      const secureCode = generateRedemptionCode(CodePresets.SECURE);
      this.addResult(
        "Secure preset",
        secureCode.length === 12,
        `Generated: ${secureCode}`
      );
    } catch (error) {
      this.addResult("Secure preset", false, `Error: ${error}`);
    }

    // Test letters only preset
    try {
      const lettersCode = generateRedemptionCode(CodePresets.LETTERS_ONLY);
      const hasOnlyLetters = /^[A-Z]+$/.test(lettersCode);
      this.addResult(
        "Letters only preset",
        hasOnlyLetters && lettersCode.length === 8,
        `Generated: ${lettersCode}`
      );
    } catch (error) {
      this.addResult("Letters only preset", false, `Error: ${error}`);
    }

    // Test campaign preset
    try {
      const campaignCode = generateRedemptionCode(CodePresets.CAMPAIGN);
      this.addResult(
        "Campaign preset",
        campaignCode.startsWith("H2-") && campaignCode.length === 9,
        `Generated: ${campaignCode}`
      );
    } catch (error) {
      this.addResult("Campaign preset", false, `Error: ${error}`);
    }
  }

  private addResult(
    test: string,
    passed: boolean,
    message: string,
    duration?: number
  ): void {
    this.results.push({ test, passed, message, duration });
    const status = passed ? "✅" : "❌";
    const durationStr = duration ? ` (${duration.toFixed(2)}ms)` : "";
    console.log(`${status} ${test}: ${message}${durationStr}`);
  }

  /**
   * Tests the specific requirement: Generate 1000 codes and verify uniqueness
   */
  static async testRequirement(): Promise<void> {
    console.log("🎯 Testing Main Requirement: Generate 1000 unique codes\n");

    const startTime = performance.now();

    // Generate 1000 codes
    const result = generateBulkCodes(1000, CodePresets.STANDARD);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify uniqueness
    const uniquenessCheck = verifyUniqueness(result.codes);

    // Validate all codes
    let validCodes = 0;
    const invalidCodes: string[] = [];

    for (const code of result.codes) {
      const validation = validateCodeFormat(code, CodePresets.STANDARD);
      if (validation.isValid) {
        validCodes++;
      } else {
        invalidCodes.push(code);
      }
    }

    // Results
    console.log("📊 Results:");
    console.log(`📝 Requested: 1000 codes`);
    console.log(`✨ Generated: ${result.generated} codes`);
    console.log(`🔑 Unique codes: ${uniquenessCheck.uniqueCount}`);
    console.log(`✅ Valid format: ${validCodes}`);
    console.log(`⚡ Generation time: ${duration.toFixed(2)}ms`);
    console.log(
      `🚀 Performance: ${Math.round(1000 / (duration / 1000))} codes/second`
    );

    if (uniquenessCheck.duplicates.length > 0) {
      console.log(`⚠️ Duplicates found: ${uniquenessCheck.duplicates.length}`);
      console.log(`Duplicate codes: ${uniquenessCheck.duplicates.join(", ")}`);
    }

    if (invalidCodes.length > 0) {
      console.log(`❌ Invalid codes: ${invalidCodes.length}`);
      console.log(
        `Invalid codes: ${invalidCodes.slice(0, 5).join(", ")}${
          invalidCodes.length > 5 ? "..." : ""
        }`
      );
    }

    // Sample codes
    console.log("\n📋 Sample generated codes:");
    result.codes.slice(0, 10).forEach((code, index) => {
      console.log(`${index + 1}. ${code}`);
    });

    // Final verdict
    const success =
      result.generated === 1000 &&
      uniquenessCheck.isUnique &&
      validCodes === 1000;

    console.log(
      `\n🎯 Requirement Test: ${success ? "✅ PASSED" : "❌ FAILED"}`
    );

    if (success) {
      console.log("All 1000 codes are unique and properly formatted! 🎉");
    }
  }
}

/**
 * Utility IDs testing
 */
export function testUtilityIds(): void {
  console.log("\n🆔 Testing Utility ID Generation:");

  // Test UUID generation
  const uuid = generateUniqueId();
  console.log(`UUID: ${uuid}`);
  console.log(
    `Valid UUID format: ${
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuid
      )
        ? "✅"
        : "❌"
    }`
  );

  // Test nanoid generation
  const shortId = generateShortId();
  console.log(`Short ID: ${shortId}`);
  console.log(`Length: ${shortId.length} (expected: 12)`);

  const customShortId = generateShortId(8);
  console.log(`Custom Short ID: ${customShortId}`);
  console.log(`Length: ${customShortId.length} (expected: 8)`);
}
