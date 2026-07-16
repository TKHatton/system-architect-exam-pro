// Utility to generate access codes for System Architect Exam Pro
// Run this to create new codes for distribution

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

function generateCode(prefix = "SAEP", suffix = "") {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}${suffix}`;
}

function main() {
  const count = parseInt(process.argv[2]) || 10;
  const prefix = process.argv[3] || "SAEP";

  console.log(`\nGenerating ${count} access codes with prefix "${prefix}":\n`);

  for (let i = 0; i < count; i++) {
    const code = generateCode(prefix, i > 0 ? `-${i}` : "");
    const hash = simpleHash(code);
    console.log(`${code}\n  Hash: ${hash}\n`);
  }

  console.log("\nTo activate a code, the user enters it in the upgrade modal.");
  console.log("The hash is checked against VALID_HASHES in engine.js.\n");
  console.log("To add these to the valid hashes, update VALID_HASHES in src/lib/engine.js:");
  console.log("\nconst VALID_HASHES = new Set([");
  console.log("  // ... existing hashes ...");

  for (let i = 0; i < Math.min(count, 5); i++) {
    const code = generateCode(prefix, i > 0 ? `-${i}` : "");
    const hash = simpleHash(code);
    console.log(`  ${hash}, // ${code}`);
  }

  console.log("]);\n");
}

main();
