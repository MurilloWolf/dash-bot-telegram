import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { UserService } from '../UserService.ts';
import { User, UserPreferences } from '../../entities/User.ts';
import {
  UserRepository,
  UserPreferencesRepository,
} from '../../repositories/UserRepository.ts';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: UserRepository;
  let mockUserPreferencesRepository: UserPreferencesRepository;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByTelegramId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockUserPreferencesRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    userService = new UserService(
      mockUserRepository,
      mockUserPreferencesRepository
    );
  });

  describe('registerUser', () => {
    it('should create a new user when user does not exist', async () => {
      const telegramId = '123456789';
      const name = 'João Silva';
      const username = 'joao_silva';

      const newUser: User = {
        id: 'user-123',
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(null);
      (mockUserRepository.create as Mock).mockResolvedValue(newUser);

      const result = await userService.registerUser(telegramId, name, username);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
      });
      expect(result).toEqual(newUser);
    });

    it('should return existing user when user already exists and data matches', async () => {
      const telegramId = '123456789';
      const name = 'João Silva';
      const username = 'joao_silva';

      const existingUser: User = {
        id: 'user-123',
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(
        existingUser
      );

      const result = await userService.registerUser(telegramId, name, username);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should update existing user when data differs', async () => {
      const telegramId = '123456789';
      const name = 'João Silva Updated';
      const username = 'joao_silva_new';

      const existingUser: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        username: 'joao_silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser: User = {
        ...existingUser,
        name,
        username,
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(
        existingUser
      );
      (mockUserRepository.update as Mock).mockResolvedValue(updatedUser);

      const result = await userService.registerUser(telegramId, name, username);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser.id, {
        name,
        username,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should register user without username', async () => {
      const telegramId = '123456789';
      const name = 'João Silva';

      const newUser: User = {
        id: 'user-123',
        telegramId,
        name,
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(null);
      (mockUserRepository.create as Mock).mockResolvedValue(newUser);

      const result = await userService.registerUser(telegramId, name);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        telegramId,
        name,
        username: undefined,
        isPremium: false,
        isActive: true,
      });
      expect(result).toEqual(newUser);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user when user exists', async () => {
      const telegramId = '123456789';
      const existingUser: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser: User = {
        ...existingUser,
        isActive: false,
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(
        existingUser
      );
      (mockUserRepository.update as Mock).mockResolvedValue(updatedUser);

      await userService.deactivateUser(telegramId);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser.id, {
        isActive: false,
      });
    });

    it('should not fail when user does not exist', async () => {
      const telegramId = '123456789';

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(null);

      await userService.deactivateUser(telegramId);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when user and preferences exist', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const preferences: UserPreferences = {
        id: 'pref-123',
        userId: user.id,
        preferredDistances: [5, 10, 21],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        preferences
      );

      const result = await userService.getUserPreferences(telegramId);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(result).toEqual(preferences);
    });

    it('should return null when user does not exist', async () => {
      const telegramId = '123456789';

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(null);

      const result = await userService.getUserPreferences(telegramId);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user exists but preferences do not', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        null
      );

      const result = await userService.getUserPreferences(telegramId);

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(result).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing preferences', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingPreferences: UserPreferences = {
        id: 'pref-123',
        userId: user.id,
        preferredDistances: [5, 10],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      const updatedPreferences: UserPreferences = {
        ...existingPreferences,
        preferredDistances: [5, 10, 21],
        reminderDays: 7,
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        existingPreferences
      );
      (mockUserPreferencesRepository.update as Mock).mockResolvedValue(
        updatedPreferences
      );

      const result = await userService.updateUserPreferences(telegramId, {
        preferredDistances: [5, 10, 21],
        reminderDays: 7,
      });

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(mockUserPreferencesRepository.update).toHaveBeenCalledWith(
        user.id,
        {
          preferredDistances: [5, 10, 21],
          reminderDays: 7,
        }
      );
      expect(result).toEqual(updatedPreferences);
    });

    it('should create new preferences when they do not exist', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPreferences: UserPreferences = {
        id: 'pref-123',
        userId: user.id,
        preferredDistances: [5, 10],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        null
      );
      (mockUserPreferencesRepository.create as Mock).mockResolvedValue(
        newPreferences
      );

      const result = await userService.updateUserPreferences(telegramId, {
        preferredDistances: [5, 10],
        reminderDays: 3,
      });

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        preferredDistances: [5, 10],
        reminderDays: 3,
        notificationsEnabled: true,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
      expect(result).toEqual(newPreferences);
    });

    it('should throw error when user does not exist', async () => {
      const telegramId = '123456789';

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(null);

      await expect(
        userService.updateUserPreferences(telegramId, {
          preferredDistances: [5, 10],
        })
      ).rejects.toThrow('Usuário não encontrado');

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should create new preferences with default values when minimal data is provided', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPreferences: UserPreferences = {
        id: 'pref-123',
        userId: user.id,
        preferredDistances: [],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        null
      );
      (mockUserPreferencesRepository.create as Mock).mockResolvedValue(
        newPreferences
      );

      const result = await userService.updateUserPreferences(telegramId, {});

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        preferredDistances: [],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
      expect(result).toEqual(newPreferences);
    });

    it('should create new preferences with custom values when provided', async () => {
      const telegramId = '123456789';
      const user: User = {
        id: 'user-123',
        telegramId,
        name: 'João Silva',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPreferences: UserPreferences = {
        id: 'pref-123',
        userId: user.id,
        preferredDistances: [21, 42],
        notificationsEnabled: false,
        reminderDays: 7,
        timezone: 'America/New_York',
        language: 'en-US',
      };

      (mockUserRepository.findByTelegramId as Mock).mockResolvedValue(user);
      (mockUserPreferencesRepository.findByUserId as Mock).mockResolvedValue(
        null
      );
      (mockUserPreferencesRepository.create as Mock).mockResolvedValue(
        newPreferences
      );

      const result = await userService.updateUserPreferences(telegramId, {
        preferredDistances: [21, 42],
        notificationsEnabled: false,
        reminderDays: 7,
        timezone: 'America/New_York',
        language: 'en-US',
      });

      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        user.id
      );
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        preferredDistances: [21, 42],
        notificationsEnabled: false,
        reminderDays: 7,
        timezone: 'America/New_York',
        language: 'en-US',
      });
      expect(result).toEqual(newPreferences);
    });
  });
});
