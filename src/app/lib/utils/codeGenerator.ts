import { nanoid, customAlphabet } from "nanoid";
import { v4 as uuidv4 } from "uuid";

/**
 * Configuration options for code generation
 */
export interface CodeGenerationOptions {
  /** Length of the generated code (default: 8) */
  length?: number;
  /** Custom alphabet to use for generation */
  alphabet?: string;
  /** Prefix to add to each code */
  prefix?: string;
  /** Suffix to add to each code */
  suffix?: string;
  /** Whether to use uppercase letters (default: true) */
  uppercase?: boolean;
  /** Whether to include numbers (default: true) */
  includeNumbers?: boolean;
  /** Whether to exclude ambiguous characters like 0, O, I, l (default: true) */
  excludeAmbiguous?: boolean;
}

/**
 * Result of bulk code generation
 */
export interface BulkGenerationResult {
  /** Array of generated codes */
  codes: string[];
  /** Number of codes requested */
  requested: number;
  /** Number of codes successfully generated */
  generated: number;
  /** Generation metadata */
  metadata: {
    alphabet: string;
    length: number;
    prefix?: string;
    suffix?: string;
    generatedAt: Date;
    uniquenessVerified: boolean;
  };
}

/**
 * Validation result for redemption codes
 */
export interface CodeValidationResult {
  /** Whether the code is valid */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Code format information */
  format: {
    length: number;
    hasPrefix: boolean;
    hasSuffix: boolean;
    alphabet: string;
  };
}

/**
 * Default alphabet excluding ambiguous characters (0, O, I, l, 1)
 */
const DEFAULT_SAFE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Full alphanumeric alphabet
 */
const FULL_ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Alphabet with only uppercase letters
 */
const LETTERS_ONLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Creates a custom alphabet based on options
 */
function createAlphabet(options: CodeGenerationOptions): string {
  if (options.alphabet) {
    return options.alphabet;
  }

  let alphabet = "";

  if (options.excludeAmbiguous !== false) {
    // Use safe alphabet by default
    if (options.includeNumbers !== false) {
      alphabet = DEFAULT_SAFE_ALPHABET;
    } else {
      alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ"; // Letters only, no ambiguous
    }
  } else {
    // Use full alphabet
    if (options.includeNumbers !== false) {
      alphabet = FULL_ALPHANUMERIC;
    } else {
      alphabet = LETTERS_ONLY;
    }
  }

  if (!options.uppercase) {
    alphabet = alphabet.toLowerCase();
  }

  return alphabet;
}

/**
 * Generates a single cryptographically secure redemption code
 */
export function generateRedemptionCode(
  options: CodeGenerationOptions = {}
): string {
  const { length = 8, prefix = "", suffix = "" } = options;

  const alphabet = createAlphabet(options);
  const generateCode = customAlphabet(alphabet, length);

  const code = generateCode();
  return `${prefix}${code}${suffix}`;
}

/**
 * Generates multiple unique redemption codes in bulk
 */
export function generateBulkCodes(
  count: number,
  options: CodeGenerationOptions = {}
): BulkGenerationResult {
  if (count <= 0) {
    throw new Error("Count must be a positive number");
  }

  if (count > 100000) {
    throw new Error("Maximum bulk generation limit is 100,000 codes");
  }

  const alphabet = createAlphabet(options);
  const length = options.length || 8;
  const generateCode = customAlphabet(alphabet, length);

  const codes = new Set<string>();
  const maxAttempts = count * 10; // Prevent infinite loops
  let attempts = 0;

  while (codes.size < count && attempts < maxAttempts) {
    const code = generateCode();
    const fullCode = `${options.prefix || ""}${code}${options.suffix || ""}`;
    codes.add(fullCode);
    attempts++;
  }

  if (codes.size < count) {
    console.warn(
      `Could only generate ${codes.size} unique codes out of ${count} requested`
    );
  }

  return {
    codes: Array.from(codes),
    requested: count,
    generated: codes.size,
    metadata: {
      alphabet,
      length,
      prefix: options.prefix,
      suffix: options.suffix,
      generatedAt: new Date(),
      uniquenessVerified: true,
    },
  };
}

/**
 * Validates a redemption code format
 */
export function validateCodeFormat(
  code: string,
  options: CodeGenerationOptions = {}
): CodeValidationResult {
  const errors: string[] = [];
  const alphabet = createAlphabet(options);
  const expectedLength =
    (options.length || 8) +
    (options.prefix?.length || 0) +
    (options.suffix?.length || 0);

  // Check if code exists
  if (!code || typeof code !== "string") {
    errors.push("Code must be a non-empty string");
    return {
      isValid: false,
      errors,
      format: {
        length: 0,
        hasPrefix: false,
        hasSuffix: false,
        alphabet: "",
      },
    };
  }

  // Check length
  if (code.length !== expectedLength) {
    errors.push(
      `Code length must be ${expectedLength} characters, got ${code.length}`
    );
  }

  // Check prefix
  let codeWithoutPrefixSuffix = code;
  if (options.prefix) {
    if (!code.startsWith(options.prefix)) {
      errors.push(`Code must start with prefix "${options.prefix}"`);
    } else {
      codeWithoutPrefixSuffix = codeWithoutPrefixSuffix.substring(
        options.prefix.length
      );
    }
  }

  // Check suffix
  if (options.suffix) {
    if (!code.endsWith(options.suffix)) {
      errors.push(`Code must end with suffix "${options.suffix}"`);
    } else {
      codeWithoutPrefixSuffix = codeWithoutPrefixSuffix.substring(
        0,
        codeWithoutPrefixSuffix.length - options.suffix.length
      );
    }
  }

  // Check alphabet
  const alphabetSet = new Set(alphabet.split(""));
  for (const char of codeWithoutPrefixSuffix) {
    if (!alphabetSet.has(char)) {
      errors.push(`Invalid character "${char}" found in code`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    format: {
      length: code.length,
      hasPrefix: Boolean(options.prefix),
      hasSuffix: Boolean(options.suffix),
      alphabet,
    },
  };
}

/**
 * Generates a UUID-based unique identifier for campaigns or other entities
 */
export function generateUniqueId(): string {
  return uuidv4();
}

/**
 * Generates a shorter nanoid for general use
 */
export function generateShortId(length: number = 12): string {
  return nanoid(length);
}

/**
 * Predefined code generation presets for common use cases
 */
export const CodePresets = {
  /** Standard 8-character codes with safe alphabet */
  STANDARD: {
    length: 8,
    excludeAmbiguous: true,
    uppercase: true,
    includeNumbers: true,
  } as CodeGenerationOptions,

  /** Short 6-character codes for high-volume campaigns */
  SHORT: {
    length: 6,
    excludeAmbiguous: true,
    uppercase: true,
    includeNumbers: true,
  } as CodeGenerationOptions,

  /** Long 12-character codes for high-security campaigns */
  SECURE: {
    length: 12,
    excludeAmbiguous: true,
    uppercase: true,
    includeNumbers: true,
  } as CodeGenerationOptions,

  /** Letters-only codes for easy verbal communication */
  LETTERS_ONLY: {
    length: 8,
    excludeAmbiguous: true,
    uppercase: true,
    includeNumbers: false,
  } as CodeGenerationOptions,

  /** Campaign-specific codes with prefix */
  CAMPAIGN: {
    length: 6,
    prefix: "H2-",
    excludeAmbiguous: true,
    uppercase: true,
    includeNumbers: true,
  } as CodeGenerationOptions,
} as const;

/**
 * Utility to check uniqueness of a set of codes
 */
export function verifyUniqueness(codes: string[]): {
  isUnique: boolean;
  duplicates: string[];
  uniqueCount: number;
} {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const code of codes) {
    if (seen.has(code)) {
      duplicates.add(code);
    } else {
      seen.add(code);
    }
  }

  return {
    isUnique: duplicates.size === 0,
    duplicates: Array.from(duplicates),
    uniqueCount: seen.size,
  };
}

/**
 * Performance test utility for code generation
 */
export function benchmarkCodeGeneration(
  count: number,
  options: CodeGenerationOptions = {}
): {
  duration: number;
  codesPerSecond: number;
  uniquenessCheck: ReturnType<typeof verifyUniqueness>;
} {
  const startTime = performance.now();

  const result = generateBulkCodes(count, options);

  const endTime = performance.now();
  const duration = endTime - startTime;

  const uniquenessCheck = verifyUniqueness(result.codes);

  return {
    duration,
    codesPerSecond: count / (duration / 1000),
    uniquenessCheck,
  };
}
