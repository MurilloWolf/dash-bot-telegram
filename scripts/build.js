#!/usr/bin/env node

import { spawn } from "child_process";
import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs a command with proper error handling
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

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
    console.log(`✅ Fixed imports in: ${filePath.replace(process.cwd(), ".")}`);
    return true;
  }

  return false;
}

/**
 * Main build function
 */
async function build() {
  const projectRoot = join(__dirname, "..");
  const distDir = join(projectRoot, "dist");

  try {
    console.log("🏗️  Building TypeScript project...");

    // Step 1: Clean dist directory
    console.log("🧹 Cleaning dist directory...");
    await runCommand("rm", ["-rf", "dist"], { cwd: projectRoot });

    // Step 2: Compile TypeScript
    console.log("🔨 Compiling TypeScript...");
    await runCommand("tsc", ["-p", "tsconfig.build.json"], {
      cwd: projectRoot,
    });

    // Step 3: Resolve path aliases
    console.log("🔗 Resolving path aliases...");
    await runCommand("tsc-alias", ["-p", "tsconfig.build.json"], {
      cwd: projectRoot,
    });

    // Step 4: Fix .ts imports to .js
    console.log("🔧 Fixing TypeScript imports...");
    const jsFiles = await getAllJsFiles(distDir);
    let fixedCount = 0;

    for (const file of jsFiles) {
      const wasFixed = await fixImportsInFile(file);
      if (wasFixed) {
        fixedCount++;
      }
    }

    console.log(`✅ Build completed successfully!`);
    console.log(`📁 Output directory: ${distDir}`);
    console.log(`🔧 Fixed ${fixedCount} import statements`);
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

// Run the build
build();
