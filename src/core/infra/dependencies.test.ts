import { describe, it, expect } from "vitest";
import { raceService, userService } from "./dependencies.ts";

describe("Dependencies", () => {
  describe("RaceService", () => {
    it("should be defined", () => {
      expect(raceService).toBeDefined();
      expect(typeof raceService).toBe("object");
    });

    it("should have required methods", () => {
      expect(typeof raceService.getAllRaces).toBe("function");
      expect(typeof raceService.getRacesByDistances).toBe("function");
      expect(typeof raceService.getAvailableRaces).toBe("function");
      expect(typeof raceService.getNextRace).toBe("function");
    });
  });

  describe("UserService", () => {
    it("should be defined", () => {
      expect(userService).toBeDefined();
      expect(typeof userService).toBe("object");
    });

    it("should have required methods", () => {
      expect(typeof userService.registerUser).toBe("function");
      expect(typeof userService.updateUserPreferences).toBe("function");
    });
  });
});
