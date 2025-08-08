#!/usr/bin/env node

// API Validation Script - Compare actual APIs vs documented APIs

const fs = require("fs");
const path = require("path");

// Get all actual API routes
function getActualAPIs() {
  const apiDir = "./app/api";
  const routes = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === "route.ts") {
        const content = fs.readFileSync(fullPath, "utf8");

        // Get relative path from app/api and convert to /api/...
        const relativePath = fullPath
          .replace("./app/api", "")
          .replace("/route.ts", "");
        const apiPath = relativePath === "" ? "/api" : `/api${relativePath}`;

        // Handle dynamic segments properly
        const finalPath = apiPath.replace(/\[(\w+)\]/g, "[$1]");

        // Extract HTTP methods
        const methods = [];
        const methodRegex =
          /export async function (GET|POST|PUT|DELETE|PATCH)/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          methods.push(match[1]);
        }

        for (const method of methods) {
          routes.push(`${method} ${finalPath}`);
        }
      }
    }
  }

  scanDirectory(apiDir);
  return routes.sort();
}

// Get documented APIs from the docs file
function getDocumentedAPIs() {
  const docsFile = "./src/app/admin/api-docs/page.tsx";
  const content = fs.readFileSync(docsFile, "utf8");

  const routes = [];
  const endpointRegex =
    /method:\s*"(GET|POST|PUT|DELETE|PATCH)",[\s\S]*?path:\s*"([^"]+)"/g;
  let match;

  while ((match = endpointRegex.exec(content)) !== null) {
    routes.push(`${match[1]} ${match[2]}`);
  }

  return routes.sort();
}

// Main validation
console.log("🔍 API VALIDATION REPORT");
console.log("=======================\n");

const actualAPIs = getActualAPIs();
const documentedAPIs = getDocumentedAPIs();

console.log(`📊 SUMMARY:`);
console.log(`- Actual APIs found: ${actualAPIs.length}`);
console.log(`- Documented APIs: ${documentedAPIs.length}`);
console.log("");

// Find missing documentation
const missingFromDocs = actualAPIs.filter(
  (api) => !documentedAPIs.includes(api)
);
console.log(`❌ MISSING FROM DOCUMENTATION (${missingFromDocs.length}):`);
if (missingFromDocs.length === 0) {
  console.log("✅ All APIs are documented!");
} else {
  missingFromDocs.forEach((api) => console.log(`   ${api}`));
}
console.log("");

// Find documented but not existing
const documentedButNotExisting = documentedAPIs.filter(
  (api) => !actualAPIs.includes(api)
);
console.log(
  `⚠️  DOCUMENTED BUT NOT FOUND (${documentedButNotExisting.length}):`
);
if (documentedButNotExisting.length === 0) {
  console.log("✅ No phantom documentation!");
} else {
  documentedButNotExisting.forEach((api) => console.log(`   ${api}`));
}
console.log("");

// Coverage percentage
const coverage = (
  ((actualAPIs.length - missingFromDocs.length) / actualAPIs.length) *
  100
).toFixed(1);
console.log(`📈 DOCUMENTATION COVERAGE: ${coverage}%`);

if (missingFromDocs.length > 0) {
  console.log(
    "\n🚨 ACTION REQUIRED: Update API documentation to include missing endpoints!"
  );
  process.exit(1);
} else {
  console.log("\n🎉 SUCCESS: All APIs are properly documented!");
  process.exit(0);
}
