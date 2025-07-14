import { User, UserPreferences } from '../entities/User.ts';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  create(preferences: Omit<UserPreferences, 'id'>): Promise<UserPreferences>;
  update(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  delete(userId: string): Promise<void>;
}
