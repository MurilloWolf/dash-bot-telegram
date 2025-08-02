#!/usr/bin/env node

/**
 * Production Build Script for DashBot
 *
 * This script handles the complete production build process:
 * 1. Cleans previous builds
 * 2. Processes TypeScript files to fix import paths
 * 3. Compiles TypeScript to JavaScript
 * 4. Resolves path aliases
 * 5. Prepares for production deployment
 *
 * Features:
 * - Removes .ts extensions from imports
 * - Adds .js extensions where needed for ES modules
 * - Handles dynamic imports
 * - Optimizes for production
 */

import { spawn } from 'child_process';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Runs a command with proper error handling
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', error => {
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
        extname(entry.name) === '.ts' &&
        !entry.name.endsWith('.d.ts') &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.spec.')
      ) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Fixes import paths to be compatible with Node.js ES modules
 */
function fixImportPaths(content) {
  // Replace .ts extensions with .js
  content = content.replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1.js'");
  content = content.replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1.js'");
  content = content.replace(
    /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
    "export * from '$1.js'"
  );

  // Fix dynamic imports with .ts extensions
  content = content.replace(
    /import\s*\(\s*['"]([^'"]+)\.ts['"]\s*\)/g,
    "import('$1.js')"
  );

  // Add .js extension to relative imports that don't have any extension
  content = content.replace(
    /from\s+['"](\.\/?[^'"]*?)(?<!\.js)['"](?=\s*;)/g,
    "from '$1.js'"
  );
  content = content.replace(
    /import\s+['"](\.\/?[^'"]*?)(?<!\.js)['"](?=\s*;)/g,
    "import '$1.js'"
  );
  content = content.replace(
    /export\s+\*\s+from\s+['"](\.\/?[^'"]*?)(?<!\.js)['"](?=\s*;)/g,
    "export * from '$1.js'"
  );

  // Fix dynamic imports without extensions
  content = content.replace(
    /import\s*\(\s*['"](\.\/?[^'"]*?)(?<!\.js)['"]\s*\)/g,
    "import('$1.js')"
  );

  return content;
}

/**
 * Copy file structure to build directory and fix import paths
 */
async function copyAndProcessFile(srcPath, srcDir, buildDir) {
  const content = await readFile(srcPath, 'utf8');
  const processedContent = fixImportPaths(content);

  const relativePath = relative(srcDir, srcPath);
  const targetPath = join(buildDir, relativePath);

  // Ensure directory exists
  await mkdir(dirname(targetPath), { recursive: true });

  // Write processed file
  await writeFile(targetPath, processedContent, 'utf8');

  return content !== processedContent;
}

/**
 * Main build function
 */
async function build() {
  const projectRoot = join(__dirname, '..');
  const srcDir = join(projectRoot, 'src');
  const buildDir = join(projectRoot, '.build-src');
  const distDir = join(projectRoot, 'dist');

  try {
    log('\n🏗️  DashBot Production Build', colors.cyan);
    log('==============================', colors.cyan);

    // Step 1: Clean directories
    log('\n🧹 Cleaning build directories...', colors.yellow);
    await runCommand('rm', ['-rf', '.build-src', 'dist'], { cwd: projectRoot });

    // Step 2: Create build directory
    await mkdir(buildDir, { recursive: true });

    // Step 2: Copy and process TypeScript files
    log('\n🔧 Processing TypeScript files...', colors.blue);
    const tsFiles = await getAllTsFiles(srcDir);
    let processedCount = 0;

    for (const file of tsFiles) {
      const wasProcessed = await copyAndProcessFile(file, srcDir, buildDir);
      if (wasProcessed) {
        processedCount++;
      }
    }

    log(
      `   📝 Processed ${processedCount}/${tsFiles.length} TypeScript files`,
      colors.green
    );

    // Step 3: Create optimized tsconfig for build
    const buildTsConfig = {
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        target: 'ES2020',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        strict: true,
        outDir: '../dist',
        allowImportingTsExtensions: false,
        noEmit: false,
        declaration: false,
        declarationMap: false,
        sourceMap: false,
        removeComments: true,
        baseUrl: '.',
        paths: {
          '@bot/*': ['./Bot/*'],
          '@app-types/*': ['./types/*'],
          '@core/*': ['./core/*'],
          '@services/*': ['./services/*'],
        },
      },
      include: ['./**/*.ts'],
      exclude: ['node_modules'],
    };

    const buildTsConfigPath = join(buildDir, 'tsconfig.json');
    await writeFile(buildTsConfigPath, JSON.stringify(buildTsConfig, null, 2));

    // Step 4: Compile TypeScript
    log('\n🔨 Compiling TypeScript...', colors.magenta);
    await runCommand('tsc', ['-p', 'tsconfig.json'], { cwd: buildDir });

    // Step 5: Resolve path aliases
    log('\n🔗 Resolving path aliases...', colors.blue);
    await runCommand('tsc-alias', ['-p', 'tsconfig.json'], { cwd: buildDir });

    // Step 6: Clean up build directory
    log('\n🧹 Cleaning up...', colors.yellow);
    await runCommand('rm', ['-rf', '.build-src'], { cwd: projectRoot });

    log('\n✅ Build completed successfully!', colors.green);
    log(
      `📁 Output directory: ${relative(process.cwd(), distDir)}`,
      colors.green
    );
    log('📦 Ready for production deployment', colors.green);
    log('\n🚀 Next steps:', colors.cyan);
    log('   • npm run start:prod  - Start in production mode', colors.white);
    log('   • npm run prod:deploy - Deploy to production', colors.white);
    log('');
  } catch (error) {
    log(`\n❌ Build failed: ${error.message}`, colors.red);

    // Clean up on failure
    try {
      await runCommand('rm', ['-rf', '.build-src'], { cwd: projectRoot });
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Run the build
build();
