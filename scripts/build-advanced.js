#!/usr/bin/env node

import { spawn } from 'child_process';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, extname, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Recursively walks through directory and returns all .ts files
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
        !entry.name.endsWith('.d.ts')
      ) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Removes .ts extensions from import statements
 */
function removeTypeScriptExtensions(content) {
  return content
    .replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1'")
    .replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1'")
    .replace(
      /export\s+\*\s+from\s+['"]([^'"]+)\.ts['"]/g,
      "export * from '$1'"
    );
}

/**
 * Processes TypeScript files to remove .ts extensions
 */
async function processTypeScriptFile(filePath, buildDir) {
  const content = await readFile(filePath, 'utf8');
  const processedContent = removeTypeScriptExtensions(content);

  const relativePath = relative(join(process.cwd(), 'src'), filePath);
  const targetPath = join(buildDir, relativePath);

  // Ensure directory exists
  await mkdir(dirname(targetPath), { recursive: true });

  // Write processed file
  await writeFile(targetPath, processedContent, 'utf8');

  if (content !== processedContent) {
    console.log(`✅ Processed: ${relativePath}`);
    return true;
  }

  return false;
}

/**
 * Main build function
 */
async function build() {
  const projectRoot = join(__dirname, '..');
  const srcDir = join(projectRoot, 'src');
  const buildDir = join(projectRoot, '.build');
  const distDir = join(projectRoot, 'dist');

  try {
    console.log('🏗️  Building TypeScript project...');

    // Step 1: Clean build and dist directories
    console.log('🧹 Cleaning build directories...');
    await runCommand('rm', ['-rf', '.build', 'dist'], { cwd: projectRoot });

    // Step 2: Create build directory
    await mkdir(buildDir, { recursive: true });

    // Step 3: Process TypeScript files
    console.log('🔧 Processing TypeScript files...');
    const tsFiles = await getAllTsFiles(srcDir);
    let processedCount = 0;

    for (const file of tsFiles) {
      const wasProcessed = await processTypeScriptFile(file, buildDir);
      if (wasProcessed) {
        processedCount++;
      }
    }

    console.log(`📝 Processed ${processedCount} TypeScript files`);

    // Step 4: Copy package.json to build directory for compilation
    const packageJsonPath = join(projectRoot, 'package.json');
    const buildPackageJsonPath = join(buildDir, 'package.json');
    await copyFile(packageJsonPath, buildPackageJsonPath);

    // Step 5: Create temporary tsconfig for build
    const tempTsConfig = {
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2020',
        esModuleInterop: true,
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
        },
      },
      include: ['.'],
      exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts'],
    };

    const tempTsConfigPath = join(buildDir, 'tsconfig.json');
    await writeFile(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));

    // Step 6: Compile TypeScript
    console.log('🔨 Compiling TypeScript...');
    await runCommand('tsc', ['-p', 'tsconfig.json'], { cwd: buildDir });

    // Step 7: Resolve path aliases
    console.log('🔗 Resolving path aliases...');
    await runCommand('tsc-alias', ['-p', 'tsconfig.json'], { cwd: buildDir });

    // Step 8: Clean up build directory
    await runCommand('rm', ['-rf', '.build'], { cwd: projectRoot });

    console.log(`✅ Build completed successfully!`);
    console.log(`📁 Output directory: ${distDir}`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();
