import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Apply to all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "scripts/**",
      "prisma/migrations/**"
    ]
  },
  
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Language options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      },
      ecmaVersion: 2022,
      sourceType: "module"
    }
  },
  
  // Custom rules
  {
    rules: {
      // TypeScript specific
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      
      // General rules
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      
      // Code style (handled by Prettier, but some logical rules)
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      "no-trailing-spaces": "error"
    }
  },
  
  // Test files specific rules
  {
    files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}", "**/tests/**/*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  }
];
