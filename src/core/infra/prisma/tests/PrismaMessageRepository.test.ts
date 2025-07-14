import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PrismaMessageRepository,
  PrismaChatRepository,
  PrismaMediaRepository,
  PrismaLocationRepository,
} from '../PrismaMessageRepository.ts';
import {
  MessageDirection,
  MessageType,
  ChatType,
  MediaType,
} from '../../../domain/entities/Message.ts';
import prisma from '../client.ts';
import type {
  Message as PrismaMessage,
  Chat as PrismaChat,
  Media as PrismaMedia,
  MessageDirection as PrismaMessageDirection,
  MessageType as PrismaMessageType,
  ChatType as PrismaChatType,
  MediaType as PrismaMediaType,
} from '@prisma/client';

// Mock Prisma client
vi.mock('../client.ts', () => ({
  default: {
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    chat: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    media: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    location: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('PrismaMessageRepository', () => {
  let repository: PrismaMessageRepository;
  let mockMessage: PrismaMessage;

  beforeEach(() => {
    repository = new PrismaMessageRepository();
    vi.clearAllMocks();

    mockMessage = {
      id: 'message-id',
      telegramId: BigInt(123456789),
      direction: 'INCOMING' as PrismaMessageDirection,
      type: 'TEXT' as PrismaMessageType,
      text: 'Test message',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      editedAt: null,
      isDeleted: false,
      userId: 'user-id',
      chatId: 'chat-id',
      replyToId: null,
    } as PrismaMessage;
  });

  describe('findById', () => {
    it('should find message by id', async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(mockMessage);

      const result = await repository.findById('message-id');

      expect(prisma.message.findUnique).toHaveBeenCalledWith({
        where: { id: 'message-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe('message-id');
      expect(result!.telegramId).toBe(BigInt(123456789));
    });

    it('should return null if message not found', async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByTelegramId', () => {
    it('should find message by telegram id', async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(mockMessage);

      const result = await repository.findByTelegramId(BigInt(123456789));

      expect(prisma.message.findUnique).toHaveBeenCalledWith({
        where: { telegramId: BigInt(123456789) },
      });

      expect(result).not.toBeNull();
      expect(result!.telegramId).toBe(BigInt(123456789));
    });

    it('should return null if message not found', async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

      const result = await repository.findByTelegramId(BigInt(987654321));

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find messages by user id', async () => {
      const mockMessages = [mockMessage];
      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      const result = await repository.findByUserId('user-id');

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-id');
    });
  });

  describe('create', () => {
    it('should create a message', async () => {
      const messageData = {
        telegramId: BigInt(987654321),
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        text: 'New message',
        metadata: { key: 'value' },
        editedAt: undefined,
        isDeleted: false,
        userId: 'new-user-id',
        chatId: 'new-chat-id',
        replyToId: undefined,
      };

      vi.mocked(prisma.message.create).mockResolvedValue({
        ...mockMessage,
        telegramId: messageData.telegramId,
        direction: messageData.direction,
        type: messageData.type,
        text: messageData.text,
        userId: messageData.userId,
        chatId: messageData.chatId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      const result = await repository.create(messageData);

      expect(result.telegramId).toBe(messageData.telegramId);
      expect(result.text).toBe(messageData.text);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const updateData = {
        text: 'Updated message',
        editedAt: new Date('2024-01-02'),
      };

      vi.mocked(prisma.message.update).mockResolvedValue({
        ...mockMessage,
        text: updateData.text,
        editedAt: updateData.editedAt,
      });

      const result = await repository.update('message-id', updateData);

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: 'message-id' },
        data: updateData,
      });

      expect(result.text).toBe(updateData.text);
    });
  });

  describe('delete', () => {
    it('should delete a message', async () => {
      vi.mocked(prisma.message.delete).mockResolvedValue(mockMessage);

      await repository.delete('message-id');

      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: 'message-id' },
      });
    });
  });

  describe('mapToEntity', () => {
    it('should map prisma message to entity', () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockMessage);

      expect(result).toEqual({
        id: mockMessage.id,
        telegramId: mockMessage.telegramId,
        direction: mockMessage.direction,
        type: mockMessage.type,
        text: mockMessage.text,
        createdAt: mockMessage.createdAt,
        updatedAt: mockMessage.updatedAt,
        editedAt: undefined,
        isDeleted: mockMessage.isDeleted,
        userId: mockMessage.userId,
        chatId: mockMessage.chatId,
        replyToId: undefined,
      });
    });

    it('should handle null optional fields', () => {
      const prismaMessage = {
        ...mockMessage,
        text: null,
        editedAt: null,
        userId: null,
        chatId: null,
        replyToId: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaMessage);

      expect(result.text).toBeUndefined();
      expect(result.editedAt).toBeUndefined();
      expect(result.userId).toBeUndefined();
      expect(result.chatId).toBeUndefined();
      expect(result.replyToId).toBeUndefined();
    });
  });
});

describe('PrismaChatRepository', () => {
  let repository: PrismaChatRepository;
  let mockChat: PrismaChat;

  beforeEach(() => {
    repository = new PrismaChatRepository();
    vi.clearAllMocks();

    mockChat = {
      id: 'chat-id',
      telegramId: 'telegram-chat-id',
      type: 'PRIVATE' as PrismaChatType,
      title: 'Test Chat',
      username: 'test_chat',
      memberCount: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    } as PrismaChat;
  });

  describe('findById', () => {
    it('should find chat by id', async () => {
      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);

      const result = await repository.findById('chat-id');

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: 'chat-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe('chat-id');
    });

    it('should return null if chat not found', async () => {
      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByTelegramId', () => {
    it('should find chat by telegram id', async () => {
      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);

      const result = await repository.findByTelegramId('telegram-chat-id');

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { telegramId: 'telegram-chat-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.telegramId).toBe('telegram-chat-id');
    });

    it('should return null if chat not found', async () => {
      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      const result = await repository.findByTelegramId('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all chats', async () => {
      const mockChats = [mockChat];
      vi.mocked(prisma.chat.findMany).mockResolvedValue(mockChats);

      const result = await repository.findAll();

      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chat-id');
    });
  });

  describe('create', () => {
    it('should create a chat', async () => {
      const chatData = {
        telegramId: 'new-telegram-chat-id',
        type: ChatType.GROUP,
        title: 'New Chat',
        username: 'new_chat',
        memberCount: 10,
      };

      vi.mocked(prisma.chat.create).mockResolvedValue({
        ...mockChat,
        telegramId: chatData.telegramId,
        type: chatData.type,
        title: chatData.title,
        username: chatData.username,
        memberCount: chatData.memberCount,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      const result = await repository.create(chatData);

      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: chatData,
      });

      expect(result.telegramId).toBe(chatData.telegramId);
    });
  });

  describe('update', () => {
    it('should update a chat', async () => {
      const updateData = {
        title: 'Updated Chat',
        memberCount: 15,
      };

      vi.mocked(prisma.chat.update).mockResolvedValue({
        ...mockChat,
        title: updateData.title,
        memberCount: updateData.memberCount,
      });

      const result = await repository.update('chat-id', updateData);

      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: 'chat-id' },
        data: updateData,
      });

      expect(result.title).toBe(updateData.title);
      expect(result.memberCount).toBe(updateData.memberCount);
    });
  });

  describe('delete', () => {
    it('should delete a chat', async () => {
      vi.mocked(prisma.chat.delete).mockResolvedValue(mockChat);

      await repository.delete('chat-id');

      expect(prisma.chat.delete).toHaveBeenCalledWith({
        where: { id: 'chat-id' },
      });
    });
  });

  describe('mapToEntity', () => {
    it('should map prisma chat to entity', () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockChat);

      expect(result).toEqual({
        id: mockChat.id,
        telegramId: mockChat.telegramId,
        type: mockChat.type,
        title: mockChat.title,
        username: mockChat.username,
        memberCount: mockChat.memberCount,
        createdAt: mockChat.createdAt,
        updatedAt: mockChat.updatedAt,
      });
    });

    it('should handle null optional fields', () => {
      const prismaChat = {
        ...mockChat,
        title: null,
        username: null,
        memberCount: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaChat);

      expect(result.title).toBeUndefined();
      expect(result.username).toBeUndefined();
      expect(result.memberCount).toBeUndefined();
    });
  });
});

describe('PrismaMediaRepository', () => {
  let repository: PrismaMediaRepository;
  let mockMedia: PrismaMedia;

  beforeEach(() => {
    repository = new PrismaMediaRepository();
    vi.clearAllMocks();

    mockMedia = {
      id: 'media-id',
      telegramId: 'telegram-media-id',
      type: 'PHOTO' as PrismaMediaType,
      url: 'https://example.com/photo.jpg',
      fileSize: 1024,
      width: 800,
      height: 600,
      duration: null,
      mimeType: 'image/jpeg',
      messageId: 'message-id',
    } as PrismaMedia;
  });

  describe('findById', () => {
    it('should find media by id', async () => {
      vi.mocked(prisma.media.findUnique).mockResolvedValue(mockMedia);

      const result = await repository.findById('media-id');

      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: 'media-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe('media-id');
    });

    it('should return null if media not found', async () => {
      vi.mocked(prisma.media.findUnique).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByMessageId', () => {
    it('should find media by message id', async () => {
      const mockMediaArray = [mockMedia];
      vi.mocked(prisma.media.findMany).mockResolvedValue(mockMediaArray);

      const result = await repository.findByMessageId('message-id');

      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { messageId: 'message-id' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].messageId).toBe('message-id');
    });
  });

  describe('create', () => {
    it('should create a media', async () => {
      const mediaData = {
        telegramId: 'new-telegram-media-id',
        type: MediaType.VIDEO,
        url: 'https://example.com/video.mp4',
        fileSize: 2048,
        width: 1920,
        height: 1080,
        duration: 120,
        mimeType: 'video/mp4',
        messageId: 'new-message-id',
      };

      vi.mocked(prisma.media.create).mockResolvedValue({
        ...mockMedia,
        telegramId: mediaData.telegramId,
        type: mediaData.type,
        url: mediaData.url,
        fileSize: mediaData.fileSize,
        width: mediaData.width,
        height: mediaData.height,
        duration: mediaData.duration,
        mimeType: mediaData.mimeType,
        messageId: mediaData.messageId,
      });

      const result = await repository.create(mediaData);

      expect(result.type).toBe(mediaData.type);
      expect(result.telegramId).toBe(mediaData.telegramId);
    });
  });

  describe('update', () => {
    it('should update a media', async () => {
      const updateData = {
        url: 'https://example.com/updated-photo.jpg',
        fileSize: 2048,
      };

      vi.mocked(prisma.media.update).mockResolvedValue({
        ...mockMedia,
        url: updateData.url,
        fileSize: updateData.fileSize,
      });

      const result = await repository.update('media-id', updateData);

      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: 'media-id' },
        data: updateData,
      });

      expect(result.url).toBe(updateData.url);
    });
  });

  describe('delete', () => {
    it('should delete a media', async () => {
      vi.mocked(prisma.media.delete).mockResolvedValue(mockMedia);

      await repository.delete('media-id');

      expect(prisma.media.delete).toHaveBeenCalledWith({
        where: { id: 'media-id' },
      });
    });
  });

  describe('mapToEntity', () => {
    it('should map prisma media to entity', () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockMedia);

      expect(result).toEqual({
        id: mockMedia.id,
        telegramId: mockMedia.telegramId,
        type: mockMedia.type,
        url: mockMedia.url,
        fileSize: mockMedia.fileSize,
        width: mockMedia.width,
        height: mockMedia.height,
        duration: undefined,
        mimeType: mockMedia.mimeType,
        messageId: mockMedia.messageId,
      });
    });

    it('should handle null optional fields', () => {
      const prismaMedia = {
        ...mockMedia,
        url: null,
        fileSize: null,
        width: null,
        height: null,
        duration: null,
        mimeType: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaMedia);

      expect(result.url).toBeUndefined();
      expect(result.fileSize).toBeUndefined();
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(result.duration).toBeUndefined();
      expect(result.mimeType).toBeUndefined();
    });
  });
});

describe('PrismaLocationRepository', () => {
  let repository: PrismaLocationRepository;
  let mockLocation: {
    id: string;
    messageId: string;
    latitude: number;
    longitude: number;
    accuracy: number | null;
    livePeriod: number | null;
  };

  beforeEach(() => {
    repository = new PrismaLocationRepository();
    vi.clearAllMocks();

    mockLocation = {
      id: 'location-id',
      messageId: 'message-id',
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      livePeriod: 3600,
    };
  });

  describe('findById', () => {
    it('should find location by id', async () => {
      vi.mocked(prisma.location.findUnique).mockResolvedValue(mockLocation);

      const result = await repository.findById('location-id');

      expect(prisma.location.findUnique).toHaveBeenCalledWith({
        where: { id: 'location-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe('location-id');
    });

    it('should return null if location not found', async () => {
      vi.mocked(prisma.location.findUnique).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByMessageId', () => {
    it('should find location by message id', async () => {
      vi.mocked(prisma.location.findUnique).mockResolvedValue(mockLocation);

      const result = await repository.findByMessageId('message-id');

      expect(prisma.location.findUnique).toHaveBeenCalledWith({
        where: { messageId: 'message-id' },
      });

      expect(result).not.toBeNull();
      expect(result!.messageId).toBe('message-id');
    });

    it('should return null if location not found', async () => {
      vi.mocked(prisma.location.findUnique).mockResolvedValue(null);

      const result = await repository.findByMessageId('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a location', async () => {
      const locationData = {
        messageId: 'new-message-id',
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5,
        livePeriod: 1800,
      };

      vi.mocked(prisma.location.create).mockResolvedValue({
        ...mockLocation,
        messageId: locationData.messageId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        livePeriod: locationData.livePeriod,
      });

      const result = await repository.create(locationData);

      expect(prisma.location.create).toHaveBeenCalledWith({
        data: locationData,
      });

      expect(result.latitude).toBe(locationData.latitude);
      expect(result.longitude).toBe(locationData.longitude);
    });
  });

  describe('update', () => {
    it('should update a location', async () => {
      const updateData = {
        accuracy: 15,
        livePeriod: 7200,
      };

      vi.mocked(prisma.location.update).mockResolvedValue({
        ...mockLocation,
        accuracy: updateData.accuracy,
        livePeriod: updateData.livePeriod,
      });

      const result = await repository.update('location-id', updateData);

      expect(prisma.location.update).toHaveBeenCalledWith({
        where: { id: 'location-id' },
        data: updateData,
      });

      expect(result.accuracy).toBe(updateData.accuracy);
      expect(result.livePeriod).toBe(updateData.livePeriod);
    });
  });

  describe('delete', () => {
    it('should delete a location', async () => {
      vi.mocked(prisma.location.delete).mockResolvedValue(mockLocation);

      await repository.delete('location-id');

      expect(prisma.location.delete).toHaveBeenCalledWith({
        where: { id: 'location-id' },
      });
    });
  });

  describe('mapToEntity', () => {
    it('should map prisma location to entity', () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockLocation);

      expect(result).toEqual({
        id: mockLocation.id,
        messageId: mockLocation.messageId,
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        accuracy: mockLocation.accuracy,
        livePeriod: mockLocation.livePeriod,
      });
    });

    it('should handle null optional fields', () => {
      const prismaLocation = {
        ...mockLocation,
        accuracy: null,
        livePeriod: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaLocation);

      expect(result.accuracy).toBeUndefined();
      expect(result.livePeriod).toBeUndefined();
    });
  });
});
