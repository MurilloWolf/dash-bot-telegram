import { describe, it, expect } from 'vitest';
import {
  Message,
  Chat,
  Media,
  Location,
  ChatType,
  MessageDirection,
  MessageType,
  MediaType,
} from '../Message.ts';

describe('Message Entity', () => {
  describe('Message interface', () => {
    it('should create a valid Message object', () => {
      const message: Message = {
        id: 'msg-123',
        telegramId: BigInt('123456789'),
        text: 'Hello World!',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isDeleted: false,
        userId: 'user-123',
        chatId: 'chat-123',
      };

      expect(message).toBeDefined();
      expect(message.id).toBe('msg-123');
      expect(message.telegramId).toBe(BigInt('123456789'));
      expect(message.text).toBe('Hello World!');
      expect(message.direction).toBe(MessageDirection.INCOMING);
      expect(message.type).toBe(MessageType.TEXT);
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeInstanceOf(Date);
      expect(message.isDeleted).toBe(false);
      expect(message.userId).toBe('user-123');
      expect(message.chatId).toBe('chat-123');
    });

    it('should handle optional fields', () => {
      const message: Message = {
        id: 'msg-123',
        telegramId: BigInt('123456789'),
        direction: MessageDirection.OUTGOING,
        type: MessageType.PHOTO,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        editedAt: new Date('2024-01-02'),
        isDeleted: true,
        replyToId: 'msg-456',
      };

      expect(message.text).toBeUndefined();
      expect(message.userId).toBeUndefined();
      expect(message.chatId).toBeUndefined();
      expect(message.editedAt).toBeInstanceOf(Date);
      expect(message.replyToId).toBe('msg-456');
    });

    it('should handle different message types', () => {
      const textMessage: Message = {
        id: 'msg-1',
        telegramId: BigInt('1'),
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const photoMessage: Message = {
        ...textMessage,
        id: 'msg-2',
        type: MessageType.PHOTO,
      };

      const videoMessage: Message = {
        ...textMessage,
        id: 'msg-3',
        type: MessageType.VIDEO,
      };

      expect(textMessage.type).toBe('TEXT');
      expect(photoMessage.type).toBe('PHOTO');
      expect(videoMessage.type).toBe('VIDEO');
    });
  });

  describe('Chat interface', () => {
    it('should create a valid Chat object', () => {
      const chat: Chat = {
        id: 'chat-123',
        telegramId: '123456789',
        type: ChatType.PRIVATE,
        title: 'Chat with John',
        username: 'john_doe',
        memberCount: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      expect(chat).toBeDefined();
      expect(chat.id).toBe('chat-123');
      expect(chat.telegramId).toBe('123456789');
      expect(chat.type).toBe(ChatType.PRIVATE);
      expect(chat.title).toBe('Chat with John');
      expect(chat.username).toBe('john_doe');
      expect(chat.memberCount).toBe(2);
      expect(chat.createdAt).toBeInstanceOf(Date);
      expect(chat.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle different chat types', () => {
      const privateChat: Chat = {
        id: 'chat-1',
        telegramId: '1',
        type: ChatType.PRIVATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const groupChat: Chat = {
        ...privateChat,
        id: 'chat-2',
        type: ChatType.GROUP,
      };

      const channelChat: Chat = {
        ...privateChat,
        id: 'chat-3',
        type: ChatType.CHANNEL,
      };

      expect(privateChat.type).toBe('PRIVATE');
      expect(groupChat.type).toBe('GROUP');
      expect(channelChat.type).toBe('CHANNEL');
    });

    it('should handle optional fields', () => {
      const chat: Chat = {
        id: 'chat-123',
        telegramId: '123456789',
        type: ChatType.PRIVATE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      expect(chat.title).toBeUndefined();
      expect(chat.username).toBeUndefined();
      expect(chat.memberCount).toBeUndefined();
    });
  });

  describe('Media interface', () => {
    it('should create a valid Media object', () => {
      const media: Media = {
        id: 'media-123',
        telegramId: '123456789',
        type: MediaType.PHOTO,
        url: 'https://example.com/photo.jpg',
        fileSize: 1024,
        width: 800,
        height: 600,
        duration: 0,
        mimeType: 'image/jpeg',
        messageId: 'msg-123',
      };

      expect(media).toBeDefined();
      expect(media.id).toBe('media-123');
      expect(media.telegramId).toBe('123456789');
      expect(media.type).toBe(MediaType.PHOTO);
      expect(media.url).toBe('https://example.com/photo.jpg');
      expect(media.fileSize).toBe(1024);
      expect(media.width).toBe(800);
      expect(media.height).toBe(600);
      expect(media.duration).toBe(0);
      expect(media.mimeType).toBe('image/jpeg');
      expect(media.messageId).toBe('msg-123');
    });

    it('should handle different media types', () => {
      const photo: Media = {
        id: 'media-1',
        telegramId: '1',
        type: MediaType.PHOTO,
        messageId: 'msg-1',
      };

      const video: Media = {
        ...photo,
        id: 'media-2',
        type: MediaType.VIDEO,
        duration: 30,
      };

      const audio: Media = {
        ...photo,
        id: 'media-3',
        type: MediaType.AUDIO,
        duration: 180,
      };

      expect(photo.type).toBe('PHOTO');
      expect(video.type).toBe('VIDEO');
      expect(audio.type).toBe('AUDIO');
      expect(video.duration).toBe(30);
      expect(audio.duration).toBe(180);
    });

    it('should handle optional fields', () => {
      const media: Media = {
        id: 'media-123',
        telegramId: '123456789',
        type: MediaType.DOCUMENT,
        messageId: 'msg-123',
      };

      expect(media.url).toBeUndefined();
      expect(media.fileSize).toBeUndefined();
      expect(media.width).toBeUndefined();
      expect(media.height).toBeUndefined();
      expect(media.duration).toBeUndefined();
      expect(media.mimeType).toBeUndefined();
    });
  });

  describe('Location interface', () => {
    it('should create a valid Location object', () => {
      const location: Location = {
        id: 'loc-123',
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: 10.5,
        livePeriod: 3600,
        messageId: 'msg-123',
      };

      expect(location).toBeDefined();
      expect(location.id).toBe('loc-123');
      expect(location.latitude).toBe(-23.5505);
      expect(location.longitude).toBe(-46.6333);
      expect(location.accuracy).toBe(10.5);
      expect(location.livePeriod).toBe(3600);
      expect(location.messageId).toBe('msg-123');
    });

    it('should handle optional fields', () => {
      const location: Location = {
        id: 'loc-123',
        latitude: -23.5505,
        longitude: -46.6333,
        messageId: 'msg-123',
      };

      expect(location.accuracy).toBeUndefined();
      expect(location.livePeriod).toBeUndefined();
    });
  });

  describe('Type constants', () => {
    it('should have all ChatType values', () => {
      expect(ChatType.PRIVATE).toBe('PRIVATE');
      expect(ChatType.GROUP).toBe('GROUP');
      expect(ChatType.SUPERGROUP).toBe('SUPERGROUP');
      expect(ChatType.CHANNEL).toBe('CHANNEL');
      expect(ChatType.BOT).toBe('BOT');
    });

    it('should have all MessageDirection values', () => {
      expect(MessageDirection.INCOMING).toBe('INCOMING');
      expect(MessageDirection.OUTGOING).toBe('OUTGOING');
    });

    it('should have all MessageType values', () => {
      expect(MessageType.TEXT).toBe('TEXT');
      expect(MessageType.PHOTO).toBe('PHOTO');
      expect(MessageType.VIDEO).toBe('VIDEO');
      expect(MessageType.DOCUMENT).toBe('DOCUMENT');
      expect(MessageType.AUDIO).toBe('AUDIO');
      expect(MessageType.VOICE).toBe('VOICE');
      expect(MessageType.LOCATION).toBe('LOCATION');
      expect(MessageType.CONTACT).toBe('CONTACT');
      expect(MessageType.POLL).toBe('POLL');
      expect(MessageType.OTHER).toBe('OTHER');
    });

    it('should have all MediaType values', () => {
      expect(MediaType.PHOTO).toBe('PHOTO');
      expect(MediaType.VIDEO).toBe('VIDEO');
      expect(MediaType.DOCUMENT).toBe('DOCUMENT');
      expect(MediaType.AUDIO).toBe('AUDIO');
      expect(MediaType.VOICE).toBe('VOICE');
      expect(MediaType.STICKER).toBe('STICKER');
    });
  });
});
