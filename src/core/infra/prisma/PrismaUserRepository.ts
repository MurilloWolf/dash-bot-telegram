import { User, UserPreferences } from "../../domain/entities/User.ts";
import {
  UserRepository,
  UserPreferencesRepository,
} from "../../domain/repositories/UserRepository.ts";
import prisma from "./client.ts";
import type {
  User as PrismaUser,
  UserPreferences as PrismaUserPreferences,
} from "@prisma/client";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const user = await prisma.user.create({
      data: userData,
    });

    return this.mapToEntity(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    });

    return this.mapToEntity(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  private mapToEntity(user: PrismaUser): User {
    return {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
      username: user.username || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class PrismaUserPreferencesRepository
  implements UserPreferencesRepository
{
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    return preferences ? this.mapToEntity(preferences) : null;
  }

  async create(
    preferencesData: Omit<UserPreferences, "id">
  ): Promise<UserPreferences> {
    const preferences = await prisma.userPreferences.create({
      data: {
        ...preferencesData,
        preferredDistances: JSON.stringify(preferencesData.preferredDistances),
      },
    });

    return this.mapToEntity(preferences);
  }

  async update(
    userId: string,
    preferencesData: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const updateData: Record<string, unknown> = { ...preferencesData };

    if (preferencesData.preferredDistances) {
      updateData.preferredDistances = JSON.stringify(
        preferencesData.preferredDistances
      );
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId },
      data: updateData,
    });

    return this.mapToEntity(preferences);
  }

  async delete(userId: string): Promise<void> {
    await prisma.userPreferences.delete({
      where: { userId },
    });
  }

  private mapToEntity(preferences: PrismaUserPreferences): UserPreferences {
    return {
      id: preferences.id,
      userId: preferences.userId,
      preferredDistances: JSON.parse(preferences.preferredDistances || "[]"),
      notificationsEnabled: preferences.notificationsEnabled,
      reminderDays: preferences.reminderDays,
    };
  }
}
