#!/usr/bin/env node

const fs = require("fs");

// Read the API docs file and count endpoints per category
const content = fs.readFileSync("./src/app/admin/api-docs/page.tsx", "utf8");

// Extract categories and count endpoints
const categoryRegex =
  /(\w+):\s*{\s*title:\s*"([^"]+)",[\s\S]*?endpoints:\s*\[([\s\S]*?)\],\s*},/g;
let match;

console.log("📊 ENDPOINT COUNT PER CATEGORY:");
console.log("================================\n");

let totalEndpoints = 0;

while ((match = categoryRegex.exec(content)) !== null) {
  const [, key, title, endpointsContent] = match;

  // Count method declarations in this category
  const methodMatches = endpointsContent.match(/method:\s*"/g);
  const count = methodMatches ? methodMatches.length : 0;

  console.log(`${title}: ${count} endpoints`);
  totalEndpoints += count;
}

console.log(`\n📈 TOTAL ENDPOINTS: ${totalEndpoints}`);
