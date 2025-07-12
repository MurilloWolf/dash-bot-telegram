import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

// Mock the PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

// Extend global interface to include __prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

describe("Prisma Client", () => {
  let mockPrismaClient: PrismaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaClient = new PrismaClient();
    vi.mocked(PrismaClient).mockReturnValue(mockPrismaClient);
  });

  describe("in production environment", () => {
    it("should create a new PrismaClient instance", async () => {
      vi.stubEnv("NODE_ENV", "production");

      // Clear the module cache and re-import
      vi.resetModules();
      vi.clearAllMocks();

      const { default: client } = await import("../client.ts");

      expect(PrismaClient).toHaveBeenCalled();
      expect(client).toBeDefined();

      vi.unstubAllEnvs();
    });
  });

  describe("in development environment", () => {
    it("should reuse global PrismaClient instance if exists", async () => {
      vi.stubEnv("NODE_ENV", "development");

      // Set up global instance
      const globalPrisma = new PrismaClient();
      global.__prisma = globalPrisma;

      // Clear the module cache and re-import
      vi.resetModules();

      const { default: client } = await import("../client.ts");

      expect(client).toBe(globalPrisma);

      vi.unstubAllEnvs();
      delete global.__prisma;
    });

    it("should create and store global PrismaClient instance if none exists", async () => {
      vi.stubEnv("NODE_ENV", "development");

      // Ensure no global instance exists
      delete global.__prisma;

      // Clear the module cache and re-import
      vi.resetModules();

      const { default: client } = await import("../client.ts");

      expect(PrismaClient).toHaveBeenCalled();
      expect(client).toBeDefined();
      expect(global.__prisma).toBeDefined();

      vi.unstubAllEnvs();
      delete global.__prisma;
    });
  });
});
