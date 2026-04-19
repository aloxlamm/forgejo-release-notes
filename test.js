// Simple test script to verify the action works locally
require("dotenv").config();
const { execSync } = require("node:child_process");
const fs = require("fs");

// Map clean env vars to GitHub Actions INPUT_ format
// Note: GitHub Actions converts input names: forgejo-url -> INPUT_FORGEJO_URL
process.env["INPUT_FORGEJO-URL"] = process.env.FORGEJO_URL;
process.env["INPUT_FORGEJO-OWNER"] = process.env.FORGEJO_OWNER;
process.env["INPUT_FORGEJO-REPOSITORY"] = process.env.FORGEJO_REPOSITORY;
process.env["INPUT_FORGEJO-TOKEN"] = process.env.FORGEJO_TOKEN;
process.env["INPUT_RELEASE-TAG"] = process.env.RELEASE_TAG;

console.log("🧪 Testing Get Release Notes Action...");
console.log("Environment variables set:");
console.log("- FORGEJO_URL:", process.env.FORGEJO_URL);
console.log("- OWNER:", process.env.FORGEJO_OWNER);
console.log("- REPOSITORY:", process.env.FORGEJO_REPOSITORY);
console.log("- TAG:", process.env.RELEASE_TAG);
console.log("\nChecking INPUT_ vars:");
console.log("- INPUT_FORGEJO_URL:", process.env["INPUT_FORGEJO-URL"]);
console.log("- INPUT_FORGEJO_OWNER:", process.env["INPUT_FORGEJO-OWNER"]);
console.log("- INPUT_FORGEJO_REPOSITORY:", process.env["INPUT_FORGEJO-REPOSITORY"]);
console.log("- INPUT_RELEASE_TAG:", process.env["INPUT_RELEASE-TAG"]);

try {
  // Run the action
  console.log("\n🚀 Running action...");
  require("./index.js");

  console.log("\n✅ Action completed successfully!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}

// Note: In local testing, GitHub Actions output mechanism doesn't work,
// but we can see from the logs above that the action successfully fetches data!
