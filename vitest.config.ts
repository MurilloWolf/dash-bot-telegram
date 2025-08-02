import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
      "src/**/__tests__/**/*.ts",
    ],
    exclude: ["node_modules/**", "dist/**", "build/**"],
  },
  resolve: {
    alias: {
      "@bot": path.resolve(__dirname, "./src/Bot"),
      "@app-types": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
    },
  },
});
