import { describe, it, expect } from "vitest";
import { routeCommand } from "./CommandRouter.ts";

describe("CommandRouter", () => {
  describe("routeCommand", () => {
    it("should be defined", () => {
      expect(routeCommand).toBeDefined();
      expect(typeof routeCommand).toBe("function");
    });

    it("should be a function with correct arity", () => {
      expect(routeCommand.length).toBeGreaterThan(0);
    });
  });
});
