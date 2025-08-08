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

        // Debug: Print what we're processing
        console.log(`Processing: ${fullPath}`);

        // Get relative path from app/api and convert to /api/...
        let apiPath = fullPath.replace("app/api", "").replace("/route.ts", "");

        // Remove leading ./ if present
        if (apiPath.startsWith("./")) {
          apiPath = apiPath.substring(2);
        }

        // Ensure proper /api prefix
        if (apiPath === "") {
          apiPath = "/api";
        } else if (apiPath.startsWith("/")) {
          apiPath = "/api" + apiPath;
        } else {
          apiPath = "/api/" + apiPath;
        }

        // Handle dynamic segments properly
        apiPath = apiPath.replace(/\[(\w+)\]/g, "[$1]");

        console.log(`Final path: ${apiPath}`);

        // Extract HTTP methods
        const methods = [];
        const methodRegex =
          /export async function (GET|POST|PUT|DELETE|PATCH)/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          methods.push(match[1]);
        }

        for (const method of methods) {
          routes.push(`${method} ${apiPath}`);
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

// Just test the path conversion first
console.log("Testing path conversion...");
const actualAPIs = getActualAPIs();
console.log("First 5 actual APIs:");
actualAPIs.slice(0, 5).forEach((api) => console.log(`  ${api}`));
