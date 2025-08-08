#!/usr/bin/env node

const fs = require("fs");

// Read the API docs file and check for syntax issues
try {
  console.log("🔍 CHECKING API CATEGORIES OBJECT STRUCTURE");
  console.log("============================================\n");

  const content = fs.readFileSync("./src/app/admin/api-docs/page.tsx", "utf8");

  // Find the apiCategories object
  const startMatch = content.match(/const apiCategories = {/);
  if (!startMatch) {
    console.log("❌ ERROR: apiCategories object not found!");
    process.exit(1);
  }

  console.log("✅ Found apiCategories object declaration");

  // Extract the object content roughly
  const startIndex = content.indexOf("const apiCategories = {");
  let braceCount = 0;
  let endIndex = startIndex;
  let insideString = false;
  let stringChar = null;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : "";

    // Handle string boundaries
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!insideString) {
        insideString = true;
        stringChar = char;
      } else if (char === stringChar) {
        insideString = false;
        stringChar = null;
      }
    }

    // Count braces only outside strings
    if (!insideString) {
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;

      if (braceCount === 0 && i > startIndex) {
        endIndex = i;
        break;
      }
    }
  }

  if (braceCount !== 0) {
    console.log("❌ ERROR: Unmatched braces in apiCategories object!");
    console.log(`Brace count: ${braceCount}`);
    process.exit(1);
  }

  console.log("✅ Braces are properly matched");

  // Extract and validate the object
  const objectContent = content.substring(startIndex, endIndex + 1);

  // Count categories
  const categoryMatches = objectContent.match(/\w+:\s*{/g);
  const categoryCount = categoryMatches ? categoryMatches.length : 0;

  console.log(`✅ Found ${categoryCount} categories`);

  // Check for common syntax issues
  const issues = [];

  // Check for trailing commas before closing braces
  if (objectContent.match(/,\s*}/)) {
    issues.push("Trailing commas before closing braces");
  }

  // Check for missing commas between objects
  const methodBlocks = objectContent.match(/}\s*{/g);
  if (methodBlocks && methodBlocks.length > 0) {
    issues.push("Possible missing commas between objects");
  }

  if (issues.length > 0) {
    console.log("⚠️  POTENTIAL ISSUES:");
    issues.forEach((issue) => console.log(`   - ${issue}`));
  } else {
    console.log("✅ No obvious syntax issues detected");
  }

  console.log("\n🎯 RECOMMENDATIONS:");
  console.log("1. Check browser console for JavaScript errors");
  console.log("2. Verify all category objects have proper structure");
  console.log("3. Ensure all strings are properly quoted");
} catch (error) {
  console.log("❌ ERROR reading file:", error.message);
  process.exit(1);
}
