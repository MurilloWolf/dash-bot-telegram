import { User, UserPreferences } from "../entities/User.ts";
import {
  UserRepository,
  UserPreferencesRepository,
} from "../repositories/UserRepository.ts";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userPreferencesRepository: UserPreferencesRepository
  ) {}

  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findByTelegramId(telegramId);

    if (existingUser) {
      if (existingUser.name !== name || existingUser.username !== username) {
        return this.userRepository.update(existingUser.id, { name, username });
      }
      return existingUser;
    }

    return this.userRepository.create({
      telegramId,
      name,
      username,
      isActive: true,
      isPremium: false,
    });
  }

  async deactivateUser(telegramId: string): Promise<void> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    if (user) {
      await this.userRepository.update(user.id, { isActive: false });
    }
  }

  async getUserPreferences(
    telegramId: string
  ): Promise<UserPreferences | null> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    if (!user) return null;

    return this.userPreferencesRepository.findByUserId(user.id);
  }

  async updateUserPreferences(
    telegramId: string,
    preferences: Partial<Omit<UserPreferences, "id" | "userId">>
  ): Promise<UserPreferences> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const existingPreferences =
      await this.userPreferencesRepository.findByUserId(user.id);

    if (existingPreferences) {
      return this.userPreferencesRepository.update(user.id, preferences);
    } else {
      return this.userPreferencesRepository.create({
        userId: user.id,
        preferredDistances: preferences.preferredDistances || [],
        notificationsEnabled: preferences.notificationsEnabled ?? true,
        reminderDays: preferences.reminderDays ?? 3,
        timezone: preferences.timezone ?? "America/Sao_Paulo",
        language: preferences.language ?? "pt-BR",
      });
    }
  }
}
