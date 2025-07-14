import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PrismaUserRepository,
  PrismaUserPreferencesRepository,
} from '../PrismaUserRepository.ts';
import { User, UserPreferences } from '../../../domain/entities/User.ts';
import prisma from '../client.ts';

// Mock do cliente Prisma
vi.mock('../client.ts', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userPreferences: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    repository = new PrismaUserRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva',
        username: 'joao_silva',
        isActive: true,
        isPremium: false,
        premiumSince: null,
        premiumEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeenAt: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await repository.findById('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual({
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva',
        username: 'joao_silva',
        isActive: true,
        isPremium: false,
        premiumSince: undefined,
        premiumEndsAt: undefined,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastSeenAt: undefined,
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const result = await repository.findById('user-inexistente');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-inexistente' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByTelegramId', () => {
    it('should find user by telegram id', async () => {
      const mockUser = {
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva',
        username: null,
        isActive: true,
        isPremium: true,
        premiumSince: new Date('2024-01-01'),
        premiumEndsAt: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeenAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await repository.findByTelegramId('123456789');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { telegramId: '123456789' },
      });
      expect(result).toEqual({
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva',
        username: undefined,
        isActive: true,
        isPremium: true,
        premiumSince: mockUser.premiumSince,
        premiumEndsAt: mockUser.premiumEndsAt,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastSeenAt: mockUser.lastSeenAt,
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        telegramId: '123456789',
        name: 'João Silva',
        username: 'joao_silva',
        isActive: true,
        isPremium: false,
      };

      const mockCreatedUser = {
        id: 'user-123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as any).mockResolvedValue(mockCreatedUser);

      const result = await repository.create(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual({
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva',
        username: 'joao_silva',
        isActive: true,
        isPremium: false,
        premiumSince: undefined,
        premiumEndsAt: undefined,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
        lastSeenAt: undefined,
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData: Partial<User> = {
        name: 'João Silva Updated',
        isPremium: true,
        premiumSince: new Date('2024-01-01'),
      };

      const mockUpdatedUser = {
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva Updated',
        username: 'joao_silva',
        isActive: true,
        isPremium: true,
        premiumSince: new Date('2024-01-01'),
        premiumEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeenAt: null,
      };

      (prisma.user.update as any).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update('user-123', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
      });
      expect(result).toEqual({
        id: 'user-123',
        telegramId: '123456789',
        name: 'João Silva Updated',
        username: 'joao_silva',
        isActive: true,
        isPremium: true,
        premiumSince: mockUpdatedUser.premiumSince,
        premiumEndsAt: undefined,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
        lastSeenAt: undefined,
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      (prisma.user.delete as any).mockResolvedValue({});

      await repository.delete('user-123');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });
});

describe('PrismaUserPreferencesRepository', () => {
  let repository: PrismaUserPreferencesRepository;

  beforeEach(() => {
    repository = new PrismaUserPreferencesRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('findByUserId', () => {
    it('should find preferences by user id', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: '[5, 10, 21]',
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (prisma.userPreferences.findUnique as any).mockResolvedValue(
        mockPreferences
      );

      const result = await repository.findByUserId('user-123');

      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual({
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: [5, 10, 21],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
    });

    it('should return null when preferences not found', async () => {
      (prisma.userPreferences.findUnique as any).mockResolvedValue(null);

      const result = await repository.findByUserId('user-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new preferences', async () => {
      const preferencesData: Omit<UserPreferences, 'id'> = {
        userId: 'user-123',
        preferredDistances: [5, 10, 21],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      const mockCreatedPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: '[5,10,21]',
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (prisma.userPreferences.create as any).mockResolvedValue(
        mockCreatedPreferences
      );

      const result = await repository.create(preferencesData);

      expect(prisma.userPreferences.create).toHaveBeenCalledWith({
        data: {
          ...preferencesData,
          preferredDistances: '[5,10,21]',
        },
      });
      expect(result).toEqual({
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: [5, 10, 21],
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
    });
  });

  describe('update', () => {
    it('should update preferences', async () => {
      const updateData: Partial<UserPreferences> = {
        preferredDistances: [5, 10, 21, 42],
        reminderDays: 7,
      };

      const mockUpdatedPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: '[5,10,21,42]',
        notificationsEnabled: true,
        reminderDays: 7,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (prisma.userPreferences.update as any).mockResolvedValue(
        mockUpdatedPreferences
      );

      const result = await repository.update('user-123', updateData);

      expect(prisma.userPreferences.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          preferredDistances: '[5,10,21,42]',
          reminderDays: 7,
        },
      });
      expect(result).toEqual({
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: [5, 10, 21, 42],
        notificationsEnabled: true,
        reminderDays: 7,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
    });

    it('should update preferences without changing preferred distances', async () => {
      const updateData: Partial<UserPreferences> = {
        notificationsEnabled: false,
        reminderDays: 1,
      };

      const mockUpdatedPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: '[5,10]',
        notificationsEnabled: false,
        reminderDays: 1,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      };

      (prisma.userPreferences.update as any).mockResolvedValue(
        mockUpdatedPreferences
      );

      const result = await repository.update('user-123', updateData);

      expect(prisma.userPreferences.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: updateData,
      });
      expect(result).toEqual({
        id: 'pref-123',
        userId: 'user-123',
        preferredDistances: [5, 10],
        notificationsEnabled: false,
        reminderDays: 1,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      });
    });
  });

  describe('delete', () => {
    it('should delete preferences', async () => {
      (prisma.userPreferences.delete as any).mockResolvedValue({});

      await repository.delete('user-123');

      expect(prisma.userPreferences.delete).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });
});
