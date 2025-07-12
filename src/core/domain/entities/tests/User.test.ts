import { describe, it, expect } from "vitest";
import { User, UserPreferences } from "../User.ts";

describe("User Entity", () => {
  describe("User interface", () => {
    it("should create a valid User object", () => {
      const user: User = {
        id: "user-123",
        telegramId: "123456789",
        name: "João Silva",
        username: "joao_silva",
        isActive: true,
        isPremium: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      expect(user).toBeDefined();
      expect(user.id).toBe("user-123");
      expect(user.telegramId).toBe("123456789");
      expect(user.name).toBe("João Silva");
      expect(user.username).toBe("joao_silva");
      expect(user.isActive).toBe(true);
      expect(user.isPremium).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a User with optional fields", () => {
      const user: User = {
        id: "user-123",
        telegramId: "123456789",
        name: "João Silva",
        isActive: true,
        isPremium: true,
        premiumSince: new Date("2024-01-01"),
        premiumEndsAt: new Date("2024-12-31"),
        lastSeenAt: new Date("2024-06-15"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      expect(user.premiumSince).toBeInstanceOf(Date);
      expect(user.premiumEndsAt).toBeInstanceOf(Date);
      expect(user.lastSeenAt).toBeInstanceOf(Date);
      expect(user.username).toBeUndefined();
    });

    it("should allow undefined optional fields", () => {
      const user: User = {
        id: "user-123",
        telegramId: "123456789",
        name: "João Silva",
        isActive: true,
        isPremium: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      expect(user.username).toBeUndefined();
      expect(user.premiumSince).toBeUndefined();
      expect(user.premiumEndsAt).toBeUndefined();
      expect(user.lastSeenAt).toBeUndefined();
    });
  });

  describe("UserPreferences interface", () => {
    it("should create a valid UserPreferences object", () => {
      const preferences: UserPreferences = {
        id: "pref-123",
        userId: "user-123",
        preferredDistances: [5, 10, 21],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
      };

      expect(preferences).toBeDefined();
      expect(preferences.id).toBe("pref-123");
      expect(preferences.userId).toBe("user-123");
      expect(preferences.preferredDistances).toEqual([5, 10, 21]);
      expect(preferences.notificationsEnabled).toBe(true);
      expect(preferences.reminderDays).toBe(3);
      expect(preferences.timezone).toBe("America/Sao_Paulo");
      expect(preferences.language).toBe("pt-BR");
    });

    it("should handle empty preferred distances", () => {
      const preferences: UserPreferences = {
        id: "pref-123",
        userId: "user-123",
        preferredDistances: [],
        notificationsEnabled: false,
        reminderDays: 1,
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
      };

      expect(preferences.preferredDistances).toEqual([]);
      expect(preferences.notificationsEnabled).toBe(false);
      expect(preferences.reminderDays).toBe(1);
    });

    it("should handle multiple preferred distances", () => {
      const preferences: UserPreferences = {
        id: "pref-123",
        userId: "user-123",
        preferredDistances: [5, 10, 15, 21, 42],
        notificationsEnabled: true,
        reminderDays: 7,
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
      };

      expect(preferences.preferredDistances).toHaveLength(5);
      expect(preferences.preferredDistances).toContain(5);
      expect(preferences.preferredDistances).toContain(42);
    });
  });
});
