#!/usr/bin/env node

import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname } from "path";

/**
 * Recursively walks through directory and returns all .js files
 */
async function getAllJsFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && extname(entry.name) === ".js") {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Fixes TypeScript imports in compiled JavaScript files
 */
async function fixImportsInFile(filePath) {
  const content = await readFile(filePath, "utf8");

  // Replace imports with .ts extension to .js
  const fixedContent = content
    .replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1.js'")
    .replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1.js'")
    .replace(
      /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
      "export * from '$1.js'"
    );

  if (content !== fixedContent) {
    await writeFile(filePath, fixedContent, "utf8");
    console.log(`✅ Fixed imports in: ${filePath}`);
    return true;
  }

  return false;
}

/**
 * Main function to fix all imports in dist directory
 */
async function fixAllImports() {
  const distDir = join(process.cwd(), "dist");

  try {
    console.log("🔧 Fixing TypeScript imports in compiled files...");

    const jsFiles = await getAllJsFiles(distDir);
    let fixedCount = 0;

    for (const file of jsFiles) {
      const wasFixed = await fixImportsInFile(file);
      if (wasFixed) {
        fixedCount++;
      }
    }

    console.log(`✅ Successfully fixed ${fixedCount} files`);
  } catch (error) {
    console.error("❌ Error fixing imports:", error);
    process.exit(1);
  }
}

// Run the script
fixAllImports();
