import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MessageService } from '../MessageService.ts';
import {
  Message,
  Chat,
  Media,
  Location,
  MessageType,
  MessageDirection,
  ChatType,
  MediaType,
} from '../../entities/Message.ts';
import {
  MessageRepository,
  ChatRepository,
  MediaRepository,
  LocationRepository,
} from '../../repositories/MessageRepository.ts';

describe('MessageService', () => {
  let messageService: MessageService;
  let mockMessageRepository: MessageRepository;
  let mockChatRepository: ChatRepository;
  let mockMediaRepository: MediaRepository;
  let mockLocationRepository: LocationRepository;

  beforeEach(() => {
    mockMessageRepository = {
      findById: vi.fn(),
      findByTelegramId: vi.fn(),
      findByUserId: vi.fn(),
      findByChatId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      markAsDeleted: vi.fn(),
    };

    mockChatRepository = {
      findById: vi.fn(),
      findByTelegramId: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockMediaRepository = {
      findById: vi.fn(),
      findByTelegramId: vi.fn(),
      findByMessageId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockLocationRepository = {
      findById: vi.fn(),
      findByMessageId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    messageService = new MessageService(
      mockMessageRepository,
      mockChatRepository,
      mockMediaRepository,
      mockLocationRepository
    );
  });

  describe('getMessageById', () => {
    it('should return message by id', async () => {
      const messageId = 'msg-123';
      const message: Message = {
        id: messageId,
        telegramId: BigInt('123456789'),
        text: 'Hello World',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      (mockMessageRepository.findById as Mock).mockResolvedValue(message);

      const result = await messageService.getMessageById(messageId);

      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(message);
    });

    it('should return null when message does not exist', async () => {
      const messageId = 'msg-inexistente';

      (mockMessageRepository.findById as Mock).mockResolvedValue(null);

      const result = await messageService.getMessageById(messageId);

      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toBeNull();
    });
  });

  describe('getMessagesByUserId', () => {
    it('should return messages for a user', async () => {
      const userId = 'user-123';
      const messages: Message[] = [
        {
          id: 'msg-1',
          telegramId: BigInt('123456789'),
          text: 'Hello',
          direction: MessageDirection.OUTGOING,
          type: MessageType.TEXT,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          userId,
        },
      ];

      (mockMessageRepository.findByUserId as Mock).mockResolvedValue(messages);

      const result = await messageService.getMessagesByUserId(userId);

      expect(mockMessageRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(messages);
    });

    it('should return empty array when user has no messages', async () => {
      const userId = 'user-123';

      (mockMessageRepository.findByUserId as Mock).mockResolvedValue([]);

      const result = await messageService.getMessagesByUserId(userId);

      expect(mockMessageRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getMessagesByChatId', () => {
    it('should return messages for a chat', async () => {
      const chatId = 'chat-123';
      const messages: Message[] = [
        {
          id: 'msg-1',
          telegramId: BigInt('123456789'),
          text: 'Hello chat',
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          chatId,
        },
      ];

      (mockMessageRepository.findByChatId as Mock).mockResolvedValue(messages);

      const result = await messageService.getMessagesByChatId(chatId);

      expect(mockMessageRepository.findByChatId).toHaveBeenCalledWith(chatId);
      expect(result).toEqual(messages);
    });

    it('should return empty array when chat has no messages', async () => {
      const chatId = 'chat-123';

      (mockMessageRepository.findByChatId as Mock).mockResolvedValue([]);

      const result = await messageService.getMessagesByChatId(chatId);

      expect(mockMessageRepository.findByChatId).toHaveBeenCalledWith(chatId);
      expect(result).toEqual([]);
    });
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        telegramId: BigInt('123456789'),
        text: 'New message',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        isDeleted: false,
        userId: 'user-123',
      };

      const createdMessage: Message = {
        id: 'msg-123',
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockMessageRepository.create as Mock).mockResolvedValue(createdMessage);

      const result = await messageService.createMessage(messageData);

      expect(mockMessageRepository.create).toHaveBeenCalledWith(messageData);
      expect(result).toEqual(createdMessage);
    });
  });

  describe('updateMessage', () => {
    it('should update a message', async () => {
      const messageId = 'msg-123';
      const updateData: Partial<Message> = {
        text: 'Updated message',
        editedAt: new Date(),
      };

      const updatedMessage: Message = {
        id: messageId,
        telegramId: BigInt('123456789'),
        text: 'Updated message',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        createdAt: new Date(),
        updatedAt: new Date(),
        editedAt: new Date(),
        isDeleted: false,
      };

      (mockMessageRepository.update as Mock).mockResolvedValue(updatedMessage);

      const result = await messageService.updateMessage(messageId, updateData);

      expect(mockMessageRepository.update).toHaveBeenCalledWith(
        messageId,
        updateData
      );
      expect(result).toEqual(updatedMessage);
    });
  });

  describe('deleteMessage', () => {
    it('should mark message as deleted', async () => {
      const messageId = 'msg-123';

      const deletedMessage: Message = {
        id: messageId,
        telegramId: BigInt('123456789'),
        text: 'Deleted message',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: true,
      };

      (mockMessageRepository.markAsDeleted as Mock).mockResolvedValue(
        deletedMessage
      );

      const result = await messageService.deleteMessage(messageId);

      expect(mockMessageRepository.markAsDeleted).toHaveBeenCalledWith(
        messageId
      );
      expect(result).toEqual(deletedMessage);
      expect(result.isDeleted).toBe(true);
    });
  });

  describe('getChatById', () => {
    it('should return chat by id', async () => {
      const chatId = 'chat-123';
      const chat: Chat = {
        id: chatId,
        telegramId: '123456789',
        type: ChatType.PRIVATE,
        title: 'Private Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockChatRepository.findById as Mock).mockResolvedValue(chat);

      const result = await messageService.getChatById(chatId);

      expect(mockChatRepository.findById).toHaveBeenCalledWith(chatId);
      expect(result).toEqual(chat);
    });

    it('should return null when chat does not exist', async () => {
      const chatId = 'chat-inexistente';

      (mockChatRepository.findById as Mock).mockResolvedValue(null);

      const result = await messageService.getChatById(chatId);

      expect(mockChatRepository.findById).toHaveBeenCalledWith(chatId);
      expect(result).toBeNull();
    });
  });

  describe('getChatByTelegramId', () => {
    it('should return chat by telegram id', async () => {
      const telegramId = '123456789';
      const chat: Chat = {
        id: 'chat-123',
        telegramId,
        type: ChatType.PRIVATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockChatRepository.findByTelegramId as Mock).mockResolvedValue(chat);

      const result = await messageService.getChatByTelegramId(telegramId);

      expect(mockChatRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(result).toEqual(chat);
    });

    it('should return null when chat does not exist', async () => {
      const telegramId = 'inexistente';

      (mockChatRepository.findByTelegramId as Mock).mockResolvedValue(null);

      const result = await messageService.getChatByTelegramId(telegramId);

      expect(mockChatRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(result).toBeNull();
    });
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      const chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'> = {
        telegramId: '123456789',
        type: ChatType.GROUP,
        title: 'New Group Chat',
        memberCount: 5,
      };

      const createdChat: Chat = {
        id: 'chat-123',
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockChatRepository.create as Mock).mockResolvedValue(createdChat);

      const result = await messageService.createChat(chatData);

      expect(mockChatRepository.create).toHaveBeenCalledWith(chatData);
      expect(result).toEqual(createdChat);
    });
  });

  describe('updateChat', () => {
    it('should update a chat', async () => {
      const chatId = 'chat-123';
      const updateData: Partial<Chat> = {
        title: 'Updated Chat Title',
        memberCount: 10,
      };

      const updatedChat: Chat = {
        id: chatId,
        telegramId: '123456789',
        type: ChatType.GROUP,
        title: 'Updated Chat Title',
        memberCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockChatRepository.update as Mock).mockResolvedValue(updatedChat);

      const result = await messageService.updateChat(chatId, updateData);

      expect(mockChatRepository.update).toHaveBeenCalledWith(
        chatId,
        updateData
      );
      expect(result).toEqual(updatedChat);
    });
  });

  describe('getMediaByMessageId', () => {
    it('should return media for a message', async () => {
      const messageId = 'msg-123';
      const media: Media[] = [
        {
          id: 'media-1',
          telegramId: '123456789',
          type: MediaType.PHOTO,
          url: 'https://example.com/photo.jpg',
          messageId,
        },
      ];

      (mockMediaRepository.findByMessageId as Mock).mockResolvedValue(media);

      const result = await messageService.getMediaByMessageId(messageId);

      expect(mockMediaRepository.findByMessageId).toHaveBeenCalledWith(
        messageId
      );
      expect(result).toEqual(media);
    });

    it('should return empty array when message has no media', async () => {
      const messageId = 'msg-123';

      (mockMediaRepository.findByMessageId as Mock).mockResolvedValue([]);

      const result = await messageService.getMediaByMessageId(messageId);

      expect(mockMediaRepository.findByMessageId).toHaveBeenCalledWith(
        messageId
      );
      expect(result).toEqual([]);
    });
  });

  describe('createMedia', () => {
    it('should create media', async () => {
      const mediaData: Omit<Media, 'id'> = {
        telegramId: '123456789',
        type: MediaType.PHOTO,
        url: 'https://example.com/photo.jpg',
        fileSize: 1024,
        width: 800,
        height: 600,
        messageId: 'msg-123',
      };

      const createdMedia: Media = {
        id: 'media-123',
        ...mediaData,
      };

      (mockMediaRepository.create as Mock).mockResolvedValue(createdMedia);

      const result = await messageService.createMedia(mediaData);

      expect(mockMediaRepository.create).toHaveBeenCalledWith(mediaData);
      expect(result).toEqual(createdMedia);
    });
  });

  describe('getLocationByMessageId', () => {
    it('should return location for a message', async () => {
      const messageId = 'msg-123';
      const location: Location = {
        id: 'loc-1',
        latitude: -23.5505,
        longitude: -46.6333,
        messageId,
      };

      (mockLocationRepository.findByMessageId as Mock).mockResolvedValue(
        location
      );

      const result = await messageService.getLocationByMessageId(messageId);

      expect(mockLocationRepository.findByMessageId).toHaveBeenCalledWith(
        messageId
      );
      expect(result).toEqual(location);
    });

    it('should return null when message has no location', async () => {
      const messageId = 'msg-123';

      (mockLocationRepository.findByMessageId as Mock).mockResolvedValue(null);

      const result = await messageService.getLocationByMessageId(messageId);

      expect(mockLocationRepository.findByMessageId).toHaveBeenCalledWith(
        messageId
      );
      expect(result).toBeNull();
    });
  });

  describe('createLocation', () => {
    it('should create location', async () => {
      const locationData: Omit<Location, 'id'> = {
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: 10.5,
        livePeriod: 3600,
        messageId: 'msg-123',
      };

      const createdLocation: Location = {
        id: 'loc-123',
        ...locationData,
      };

      (mockLocationRepository.create as Mock).mockResolvedValue(
        createdLocation
      );

      const result = await messageService.createLocation(locationData);

      expect(mockLocationRepository.create).toHaveBeenCalledWith(locationData);
      expect(result).toEqual(createdLocation);
    });
  });
});
