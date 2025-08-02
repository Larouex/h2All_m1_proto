/**
 * Code Generation Utilities
 *
 * This module provides cryptographically secure code generation utilities
 * for redemption codes, campaign IDs, and other unique identifiers.
 */

export {
  // Core generation functions
  generateRedemptionCode,
  generateBulkCodes,
  generateUniqueId,
  generateShortId,

  // Validation and verification
  validateCodeFormat,
  verifyUniqueness,

  // Performance testing
  benchmarkCodeGeneration,

  // Predefined presets
  CodePresets,

  // Type definitions
  type CodeGenerationOptions,
  type BulkGenerationResult,
  type CodeValidationResult,
} from "./codeGenerator";

export {
  // Testing utilities
  CodeGeneratorTester,
  testUtilityIds,
} from "./codeGenerator.test";

// Re-export everything for convenience
export * from "./codeGenerator";
export * from "./codeGenerator.test";

/**
 * URL Parser Utilities
 *
 * This module provides URL parsing utilities for campaign redemption URLs,
 * extracting and validating campaign IDs and redemption codes.
 */
export {
  // Core parsing functions
  parseCampaignUrl,
  validateCampaignUrl,
  parseCampaignFromLocation,
  buildCampaignUrl,

  // Utility functions
  sanitizeUrlParam,
  isRedemptionUrl,

  // Type definitions
  type CampaignUrlData,
  type UrlValidationResult,
  type UrlParserConfig,
} from "./urlParser";

export {
  // Testing utilities
  UrlParserTester,
  runPerformanceTest,
} from "./urlParser.test";
