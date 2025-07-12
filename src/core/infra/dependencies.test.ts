import { describe, it, expect } from "vitest";
import {
  raceService,
  userService,
  paymentService,
  messageService,
} from "./dependencies.ts";

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
      expect(typeof raceService.createRace).toBe("function");
      expect(typeof raceService.updateRaceStatus).toBe("function");
      expect(typeof raceService.deleteRace).toBe("function");
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
      expect(typeof userService.getUserPreferences).toBe("function");
      expect(typeof userService.deactivateUser).toBe("function");
    });
  });

  describe("PaymentService", () => {
    it("should be defined", () => {
      expect(paymentService).toBeDefined();
      expect(typeof paymentService).toBe("object");
    });

    it("should have required methods", () => {
      expect(typeof paymentService.getPaymentsByUserId).toBe("function");
      expect(typeof paymentService.createPayment).toBe("function");
      expect(typeof paymentService.updatePaymentStatus).toBe("function");
      expect(typeof paymentService.getActiveProducts).toBe("function");
      expect(typeof paymentService.getUserSubscriptions).toBe("function");
      expect(typeof paymentService.getActiveSubscriptions).toBe("function");
      expect(typeof paymentService.createSubscription).toBe("function");
      expect(typeof paymentService.cancelSubscription).toBe("function");
    });
  });

  describe("MessageService", () => {
    it("should be defined", () => {
      expect(messageService).toBeDefined();
      expect(typeof messageService).toBe("object");
    });

    it("should have required methods", () => {
      expect(typeof messageService.getMessageById).toBe("function");
      expect(typeof messageService.getMessagesByUserId).toBe("function");
      expect(typeof messageService.createMessage).toBe("function");
      expect(typeof messageService.updateMessage).toBe("function");
      expect(typeof messageService.deleteMessage).toBe("function");
      expect(typeof messageService.getChatById).toBe("function");
      expect(typeof messageService.createChat).toBe("function");
      expect(typeof messageService.createMedia).toBe("function");
      expect(typeof messageService.createLocation).toBe("function");
    });
  });
});
