#!/usr/bin/env node

import { spawn } from "child_process";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, extname, dirname, relative } from "path";
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
 * Recursively walks through directory and returns all .ts files (excluding .d.ts)
 */
async function getAllTsFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (
        entry.isFile() &&
        extname(entry.name) === ".ts" &&
        !entry.name.endsWith(".d.ts") &&
        !entry.name.includes(".test.") &&
        !entry.name.includes(".spec.")
      ) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Copy file structure to build directory and remove .ts extensions from imports
 */
async function copyAndProcessFile(srcPath, srcDir, buildDir) {
  const content = await readFile(srcPath, "utf8");

  // Remove .ts extensions from imports
  const processedContent = content
    .replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1'")
    .replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1'")
    .replace(
      /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
      "export * from '$1'"
    );

  const relativePath = relative(srcDir, srcPath);
  const targetPath = join(buildDir, relativePath);

  // Ensure directory exists
  await mkdir(dirname(targetPath), { recursive: true });

  // Write processed file
  await writeFile(targetPath, processedContent, "utf8");

  return content !== processedContent;
}

/**
 * Main build function
 */
async function build() {
  const projectRoot = join(__dirname, "..");
  const srcDir = join(projectRoot, "src");
  const buildDir = join(projectRoot, ".build-src");
  const distDir = join(projectRoot, "dist");

  try {
    console.log("🏗️  Building TypeScript project...");

    // Step 1: Clean directories
    console.log("🧹 Cleaning build directories...");
    await runCommand("rm", ["-rf", ".build-src", "dist"], { cwd: projectRoot });

    // Step 2: Create build directory
    await mkdir(buildDir, { recursive: true });

    // Step 3: Copy and process TypeScript files
    console.log("🔧 Processing TypeScript files...");
    const tsFiles = await getAllTsFiles(srcDir);
    let processedCount = 0;

    for (const file of tsFiles) {
      const wasProcessed = await copyAndProcessFile(file, srcDir, buildDir);
      if (wasProcessed) {
        processedCount++;
      }
    }

    console.log(
      `📝 Processed ${processedCount}/${tsFiles.length} TypeScript files`
    );

    // Step 4: Create optimized tsconfig for build
    const buildTsConfig = {
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2020",
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        outDir: "../dist",
        allowImportingTsExtensions: false,
        noEmit: false,
        declaration: false,
        declarationMap: false,
        sourceMap: false,
        removeComments: true,
        baseUrl: ".",
        paths: {
          "@bot/*": ["./Bot/*"],
          "@app-types/*": ["./types/*"],
          "@core/*": ["./core/*"],
        },
      },
      include: ["./**/*.ts"],
      exclude: ["node_modules"],
    };

    const buildTsConfigPath = join(buildDir, "tsconfig.json");
    await writeFile(buildTsConfigPath, JSON.stringify(buildTsConfig, null, 2));

    // Step 5: Compile TypeScript
    console.log("🔨 Compiling TypeScript...");
    await runCommand("tsc", ["-p", "tsconfig.json"], { cwd: buildDir });

    // Step 6: Resolve path aliases
    console.log("🔗 Resolving path aliases...");
    await runCommand("tsc-alias", ["-p", "tsconfig.json"], { cwd: buildDir });

    // Step 7: Clean up build directory
    console.log("🧹 Cleaning up...");
    await runCommand("rm", ["-rf", ".build-src"], { cwd: projectRoot });

    console.log(`✅ Build completed successfully!`);
    console.log(`📁 Output directory: ${distDir}`);
    console.log(`📦 Ready for production deployment`);
  } catch (error) {
    console.error("❌ Build failed:", error.message);

    // Clean up on failure
    try {
      await runCommand("rm", ["-rf", ".build-src"], { cwd: projectRoot });
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Run the build
build();
