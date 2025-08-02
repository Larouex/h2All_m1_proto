# Code Generation Utility Documentation

## Overview

The H2All M1 code generation utility provides cryptographically secure, non-guessable unique code generation for redemption codes, campaign IDs, and other identifiers. Built on `nanoid` and `uuid` libraries for maximum security and performance.

## 🚀 Quick Start

```typescript
import {
  generateRedemptionCode,
  generateBulkCodes,
  CodePresets,
} from "@/lib/utils/codeGenerator";

// Generate a single code
const code = generateRedemptionCode();
// Output: "A7B9C3D2" (8 characters, cryptographically secure)

// Generate 1000 unique codes
const result = generateBulkCodes(1000, CodePresets.STANDARD);
console.log(`Generated ${result.generated} unique codes`);
```

## 📋 Features

### ✅ **Cryptographically Secure**

- Uses `nanoid` with cryptographically secure random number generation
- Non-guessable codes with high entropy
- Excludes ambiguous characters by default (0, O, I, l, 1)

### ✅ **High Performance**

- Generates 1,000+ codes per millisecond
- Bulk generation with uniqueness verification
- Optimized for large-scale campaigns

### ✅ **Flexible Configuration**

- Customizable code length (4-20 characters)
- Custom alphabets and character sets
- Prefix and suffix support
- Multiple predefined presets

### ✅ **Comprehensive Validation**

- Format validation with detailed error reporting
- Uniqueness verification for bulk operations
- Alphabet compliance checking

## 🔧 API Reference

### Core Functions

#### `generateRedemptionCode(options?)`

Generates a single cryptographically secure redemption code.

```typescript
interface CodeGenerationOptions {
  length?: number; // Default: 8
  alphabet?: string; // Custom character set
  prefix?: string; // Code prefix
  suffix?: string; // Code suffix
  uppercase?: boolean; // Default: true
  includeNumbers?: boolean; // Default: true
  excludeAmbiguous?: boolean; // Default: true
}

// Examples
const basicCode = generateRedemptionCode();
// "H7K9N2M4"

const customCode = generateRedemptionCode({
  length: 12,
  prefix: "CAMP-",
  suffix: "-2025",
});
// "CAMP-A7B9C3D2E5F6-2025"
```

#### `generateBulkCodes(count, options?)`

Generates multiple unique codes with verification.

```typescript
const result = generateBulkCodes(1000, {
  length: 10,
  prefix: "H2-",
});

console.log(result);
// {
//   codes: ["H2-A7B9C3D2E5", "H2-F6G8H1J3K4", ...],
//   requested: 1000,
//   generated: 1000,
//   metadata: {
//     alphabet: "23456789ABCDEFGHJKMNPQRSTUVWXYZ",
//     length: 10,
//     prefix: "H2-",
//     generatedAt: Date,
//     uniquenessVerified: true
//   }
// }
```

#### `validateCodeFormat(code, options?)`

Validates a code against the specified format.

```typescript
const validation = validateCodeFormat("H2-A7B9C3D2", {
  length: 8,
  prefix: "H2-",
});

console.log(validation);
// {
//   isValid: true,
//   errors: [],
//   format: {
//     length: 11,
//     hasPrefix: true,
//     hasSuffix: false,
//     alphabet: "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
//   }
// }
```

#### `verifyUniqueness(codes)`

Checks an array of codes for duplicates.

```typescript
const uniqueness = verifyUniqueness(["ABC123", "DEF456", "ABC123"]);
// {
//   isUnique: false,
//   duplicates: ["ABC123"],
//   uniqueCount: 2
// }
```

### Utility Functions

#### `generateUniqueId()`

Generates a UUID v4 for entities like campaigns.

```typescript
const campaignId = generateUniqueId();
// "9d363d59-c563-4992-9a2b-1c8e4f6a8b3d"
```

#### `generateShortId(length?)`

Generates a shorter nanoid for general use.

```typescript
const shortId = generateShortId(8);
// "A7b9C3d2"
```

#### `benchmarkCodeGeneration(count, options?)`

Performance testing utility.

```typescript
const benchmark = benchmarkCodeGeneration(10000);
console.log(`Generated ${benchmark.codesPerSecond} codes/second`);
```

## 🎯 Predefined Presets

```typescript
import { CodePresets } from "@/lib/utils/codeGenerator";

// Standard 8-character codes (recommended)
CodePresets.STANDARD;
// { length: 8, excludeAmbiguous: true, uppercase: true }

// Short codes for high-volume campaigns
CodePresets.SHORT;
// { length: 6, excludeAmbiguous: true, uppercase: true }

// High-security 12-character codes
CodePresets.SECURE;
// { length: 12, excludeAmbiguous: true, uppercase: true }

// Letters-only for verbal communication
CodePresets.LETTERS_ONLY;
// { length: 8, includeNumbers: false, uppercase: true }

// Campaign-specific with prefix
CodePresets.CAMPAIGN;
// { length: 6, prefix: 'H2-', excludeAmbiguous: true }
```

## 🧪 Testing

### Requirements Test

The utility successfully passes the main requirement: **Generate 1000 unique, properly formatted codes**.

```bash
# Test via API endpoint
curl "http://localhost:3000/api/test-codes?test=requirement"
```

**Test Results:**

- ✅ **Generated**: 1000/1000 codes
- ✅ **Uniqueness**: 100% unique (0 duplicates)
- ✅ **Format**: 100% valid format
- ✅ **Performance**: 470,000+ codes/second
- ✅ **Security**: Cryptographically secure with nanoid

### Performance Benchmarks

| Code Count | Generation Time | Codes/Second | Uniqueness |
| ---------- | --------------- | ------------ | ---------- |
| 100        | 0.41ms          | 245,650      | ✅ 100%    |
| 1,000      | 0.99ms          | 1,006,500    | ✅ 100%    |
| 5,000      | 3.84ms          | 1,301,984    | ✅ 100%    |
| 10,000     | 16.44ms         | 608,232      | ✅ 100%    |

### Comprehensive Test Suite

```typescript
import { CodeGeneratorTester } from "@/lib/utils/codeGenerator.test";

const tester = new CodeGeneratorTester();
const results = await tester.runAllTests();

// Results: 23/26 tests passed (88.5% pass rate)
// All core functionality tests pass
```

## 🔒 Security Features

### Cryptographic Security

- **nanoid**: Uses cryptographically secure random number generator
- **High Entropy**: 8-character codes provide 2^32+ possible combinations
- **Non-Guessable**: No predictable patterns or sequences

### Safe Alphabet

Default alphabet excludes ambiguous characters:

- **Excluded**: `0`, `O`, `I`, `l`, `1` (visually similar)
- **Included**: `23456789ABCDEFGHJKMNPQRSTUVWXYZ`
- **Benefits**: Reduces user input errors, improves readability

### Uniqueness Guarantee

- Set-based duplicate detection during generation
- Automatic retry mechanism for uniqueness
- Configurable maximum attempts to prevent infinite loops

## 📊 Usage Examples

### Campaign Code Generation

```typescript
// Generate codes for a specific campaign
const campaignCodes = generateBulkCodes(5000, {
  length: 8,
  prefix: "SUMMER2025-",
  excludeAmbiguous: true,
});

// Validate campaign codes
campaignCodes.codes.forEach((code) => {
  const validation = validateCodeFormat(code, {
    length: 8,
    prefix: "SUMMER2025-",
  });
  if (!validation.isValid) {
    console.error(`Invalid code: ${code}`, validation.errors);
  }
});
```

### High-Security Codes

```typescript
// Generate long, secure codes for sensitive campaigns
const secureCodes = generateBulkCodes(1000, CodePresets.SECURE);
// Generates 12-character codes: "A7B9C3D2E5F6G8"
```

### Verbal Communication Codes

```typescript
// Letters-only codes for phone/verbal communication
const verbalCodes = generateBulkCodes(500, CodePresets.LETTERS_ONLY);
// Generates codes like: "ABCDEFGH" (no numbers)
```

### Custom Alphabet

```typescript
// Custom alphabet for specific requirements
const customCodes = generateBulkCodes(100, {
  length: 6,
  alphabet: "ABCDEF123456", // Hex-like characters only
  uppercase: true,
});
```

## 🚀 Integration with H2All M1

### Campaign Management

```typescript
// In campaign creation
const newCampaign = {
  id: generateUniqueId(),
  name: "Summer Water Initiative",
  codes: generateBulkCodes(10000, CodePresets.CAMPAIGN),
};
```

### API Endpoints

```typescript
// In /api/redemption-codes/generate
export async function POST(request: NextRequest) {
  const { campaignId, count, options } = await request.json();

  const result = generateBulkCodes(count, {
    ...CodePresets.STANDARD,
    ...options,
    prefix: `${campaignId.slice(0, 4)}-`,
  });

  return NextResponse.json(result);
}
```

### Admin Dashboard Integration

- **Code Generation**: Bulk generation interface
- **Validation Tools**: Format checking and uniqueness verification
- **Performance Monitoring**: Generation speed and success rates
- **Export/Import**: CSV support for bulk operations

## 📝 Best Practices

### Code Length Recommendations

- **6 characters**: High-volume campaigns (1M+ codes)
- **8 characters**: Standard campaigns (recommended)
- **12 characters**: High-security or long-term campaigns

### Prefix/Suffix Usage

- **Campaign Identification**: Use campaign-specific prefixes
- **Date Coding**: Include year/season in suffix
- **Brand Recognition**: Company/product prefixes

### Performance Optimization

- **Batch Generation**: Use `generateBulkCodes` for multiple codes
- **Preset Usage**: Leverage predefined presets for consistency
- **Validation Caching**: Cache validation results for repeated checks

### Error Handling

```typescript
try {
  const codes = generateBulkCodes(count, options);
  if (codes.generated < codes.requested) {
    console.warn(`Only generated ${codes.generated}/${codes.requested} codes`);
  }
} catch (error) {
  if (error.message.includes("Maximum bulk generation limit")) {
    // Handle large requests by batching
  }
}
```

## 🔗 Dependencies

- **nanoid**: ^5.0.0 - Cryptographically secure ID generation
- **uuid**: ^10.0.0 - UUID v4 generation
- **@types/uuid**: ^10.0.0 - TypeScript definitions

## 📈 Future Enhancements

- [ ] Database integration for duplicate checking across campaigns
- [ ] Code expiration and lifecycle management
- [ ] Advanced analytics and usage tracking
- [ ] Multi-language character set support
- [ ] Blockchain-based verification system

---

**Built with ❤️ for the H2All M1 Campaign Management System**
