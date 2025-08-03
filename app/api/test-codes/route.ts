import { NextRequest, NextResponse } from "next/server";
import { CodeGeneratorTester } from "@/lib/utils/codeGenerator.test";
import {
  generateBulkCodes,
  CodePresets,
  verifyUniqueness,
  validateCodeFormat,
  generateUniqueId,
  generateShortId,
} from "@/lib/utils/codeGenerator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("test") || "all";

  try {
    switch (testType) {
      case "requirement":
        return await testMainRequirement();
      case "full":
        return await runFullTestSuite();
      case "performance":
        return await testPerformance();
      case "bulk":
        return await testBulkGeneration(request);
      default:
        return await runQuickTests();
    }
  } catch (error) {
    console.error("Code generation test error:", error);
    return NextResponse.json(
      {
        error: "Failed to run code generation tests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function testMainRequirement() {
  console.log("🎯 Running Main Requirement Test: Generate 1000 unique codes");

  const startTime = performance.now();

  // Generate 1000 codes using standard preset
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

  const success =
    result.generated === 1000 &&
    uniquenessCheck.isUnique &&
    validCodes === 1000;

  const response = {
    test: "Main Requirement: Generate 1000 unique codes",
    success,
    results: {
      requested: 1000,
      generated: result.generated,
      uniqueCount: uniquenessCheck.uniqueCount,
      validCodes,
      duplicates: uniquenessCheck.duplicates.length,
      invalidCodes: invalidCodes.length,
      generationTime: `${duration.toFixed(2)}ms`,
      performance: `${Math.round(1000 / (duration / 1000))} codes/second`,
    },
    metadata: result.metadata,
    sampleCodes: result.codes.slice(0, 10),
    issues: {
      duplicates: uniquenessCheck.duplicates,
      invalidCodes: invalidCodes.slice(0, 5),
    },
  };

  return NextResponse.json(response);
}

async function runFullTestSuite() {
  const tester = new CodeGeneratorTester();
  const results = await tester.runAllTests();

  // Also test utility IDs
  const utilityResults = {
    uuid: testUtilityId("uuid"),
    shortId: testUtilityId("shortId"),
    customShortId: testUtilityId("customShortId"),
  };

  return NextResponse.json({
    test: "Full Test Suite",
    testResults: results,
    utilityIdTests: utilityResults,
    summary: {
      allTestsPassed: results.failed === 0,
      totalTests: results.total,
      passRate: `${((results.passed / results.total) * 100).toFixed(1)}%`,
    },
  });
}

async function testPerformance() {
  const tests = [
    { count: 100, name: "100 codes" },
    { count: 1000, name: "1000 codes" },
    { count: 5000, name: "5000 codes" },
    { count: 10000, name: "10000 codes" },
  ];

  const results = [];

  for (const test of tests) {
    const startTime = performance.now();
    const result = generateBulkCodes(test.count, CodePresets.STANDARD);
    const endTime = performance.now();

    const duration = endTime - startTime;
    const uniquenessCheck = verifyUniqueness(result.codes);

    results.push({
      name: test.name,
      count: test.count,
      generated: result.generated,
      unique: uniquenessCheck.isUnique,
      duration: `${duration.toFixed(2)}ms`,
      codesPerSecond: Math.round(test.count / (duration / 1000)),
      duplicates: uniquenessCheck.duplicates.length,
    });
  }

  return NextResponse.json({
    test: "Performance Testing",
    results,
    summary: {
      allUnique: results.every((r) => r.unique),
      averageSpeed: Math.round(
        results.reduce((sum, r) => sum + r.codesPerSecond, 0) / results.length
      ),
    },
  });
}

async function testBulkGeneration(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get("count") || "1000");
  const preset = searchParams.get("preset") || "STANDARD";

  if (count <= 0 || count > 50000) {
    return NextResponse.json(
      { error: "Count must be between 1 and 50000" },
      { status: 400 }
    );
  }

  const presetConfig =
    CodePresets[preset as keyof typeof CodePresets] || CodePresets.STANDARD;

  const startTime = performance.now();
  const result = generateBulkCodes(count, presetConfig);
  const endTime = performance.now();

  const duration = endTime - startTime;
  const uniquenessCheck = verifyUniqueness(result.codes);

  return NextResponse.json({
    test: `Bulk Generation: ${count} codes with ${preset} preset`,
    success: result.generated === count && uniquenessCheck.isUnique,
    results: {
      requested: count,
      generated: result.generated,
      preset,
      uniqueCount: uniquenessCheck.uniqueCount,
      duplicates: uniquenessCheck.duplicates.length,
      generationTime: `${duration.toFixed(2)}ms`,
      performance: `${Math.round(count / (duration / 1000))} codes/second`,
    },
    codes: result.codes,
    metadata: result.metadata,
  });
}

async function runQuickTests() {
  const tests = [
    {
      name: "Basic code generation",
      test: () => {
        const result = generateBulkCodes(10);
        return (
          result.generated === 10 && verifyUniqueness(result.codes).isUnique
        );
      },
    },
    {
      name: "Standard preset",
      test: () => {
        const result = generateBulkCodes(50, CodePresets.STANDARD);
        return result.codes.every((code) => code.length === 8);
      },
    },
    {
      name: "Campaign preset",
      test: () => {
        const result = generateBulkCodes(20, CodePresets.CAMPAIGN);
        return result.codes.every(
          (code) => code.startsWith("H2-") && code.length === 9
        );
      },
    },
    {
      name: "Uniqueness at scale",
      test: () => {
        const result = generateBulkCodes(1000);
        return verifyUniqueness(result.codes).isUnique;
      },
    },
  ];

  const results = tests.map((testCase) => {
    try {
      const startTime = performance.now();
      const passed = testCase.test();
      const endTime = performance.now();

      return {
        name: testCase.name,
        passed,
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        status: passed ? "✅ PASSED" : "❌ FAILED",
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        duration: "N/A",
        status: "❌ ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  const allPassed = results.every((r) => r.passed);

  return NextResponse.json({
    test: "Quick Tests",
    success: allPassed,
    results,
    summary: {
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      total: results.length,
    },
  });
}

function testUtilityId(type: "uuid" | "shortId" | "customShortId") {
  try {
    switch (type) {
      case "uuid":
        const uuid = generateUniqueId();
        return {
          value: uuid,
          valid:
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              uuid
            ),
          length: uuid.length,
        };
      case "shortId":
        const shortId = generateShortId();
        return {
          value: shortId,
          valid: shortId.length === 12,
          length: shortId.length,
        };
      case "customShortId":
        const customId = generateShortId(8);
        return {
          value: customId,
          valid: customId.length === 8,
          length: customId.length,
        };
      default:
        return { error: "Unknown ID type" };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      valid: false,
    };
  }
}
