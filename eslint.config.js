import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      },
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {
      // TypeScript specific
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
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
    files: ["src/**/*.test.{js,ts}", "src/**/*.spec.{js,ts}", "src/**/tests/**/*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  },

  // Scripts specific rules
  {
    files: ["src/core/scripts/**/*.{js,ts}"],
    rules: {
      "no-console": "off"
    }
  },

  // Utils specific rules  
  {
    files: ["src/utils/**/*.{js,ts}"],
    rules: {
      "no-console": "off" // Logger.ts precisa usar console
    }
  },

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "scripts/**",
      "prisma/migrations/**",
      "**/*.d.ts",
      "src/index.js" // Legacy file
    ]
  }
];
