import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageInterceptor } from '../MessageInterceptor.ts';
import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { messageApiService } from '@services/index.ts';
import {
  MessageDirection,
  MessageType,
} from '../../../types/MessageInterceptor.ts';

// Mock the messageApiService
vi.mock('@services/index.ts', () => ({
  messageApiService: {
    createMessage: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../../../utils/Logger.ts', () => ({
  logger: {
    messageIntercept: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock MessageSanitizer
vi.mock('../../../utils/MessageSanitizer.ts', () => ({
  MessageSanitizer: {
    createCommandSummary: vi.fn().mockImplementation((command: string) => {
      if (command.startsWith('/')) {
        const cmd = command.split(' ')[0];
        return `Respondeu ao comando: ${cmd}`;
      }
      return `Respondeu ao comando: ${command}`;
    }),
  },
}));

describe('MessageInterceptor', () => {
  let interceptor: MessageInterceptor;
  let mockMessageApiService: any;

  beforeEach(() => {
    interceptor = new MessageInterceptor();
    mockMessageApiService = messageApiService;
    vi.clearAllMocks();
  });

  describe('interceptIncomingMessage', () => {
    it('should handle telegram message correctly with new structure', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        args: ['test'],
        platform: 'telegram',
        raw: {
          message_id: 123,
          chat: {
            id: 456,
            type: 'private',
            first_name: 'Test',
            last_name: 'Chat',
            username: 'testuser',
          },
          from: {
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
          },
          text: '/test command',
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith({
        telegramId: BigInt(123),
        text: '/test command',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        editedAt: undefined,
        userTelegramId: '12345',
        chatTelegramId: '456',
        replyToTelegramId: undefined,
        chat: {
          telegramId: '456',
          type: 'PRIVATE',
          title: 'Test Chat',
          username: 'testuser',
          memberCount: undefined,
        },
        media: undefined,
        location: undefined,
      });
    });

    it('should handle group chat correctly', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        args: ['test'],
        platform: 'telegram',
        raw: {
          message_id: 456,
          chat: {
            id: 789,
            type: 'group',
            title: 'Test Group',
            username: 'testgroup',
          },
          from: {
            id: 12345,
            first_name: 'Test',
            username: 'testuser',
          },
          text: '/start',
          reply_to_message: {
            message_id: 123,
          },
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith({
        telegramId: BigInt(456),
        text: '/start',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        editedAt: undefined,
        userTelegramId: '12345',
        chatTelegramId: '789',
        replyToTelegramId: '123',
        chat: {
          telegramId: '789',
          type: 'GROUP',
          title: 'Test Group',
          username: 'testgroup',
          memberCount: undefined,
        },
        media: undefined,
        location: undefined,
      });
    });

    it('should handle message with edited date', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const editDate = Math.floor(Date.now() / 1000);
      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        platform: 'telegram',
        raw: {
          message_id: 789,
          chat: {
            id: 456,
            type: 'private',
            first_name: 'Test',
            last_name: 'User',
          },
          from: {
            id: 12345,
            first_name: 'Test',
            username: 'testuser',
          },
          text: 'Edited message',
          edit_date: editDate,
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith({
        telegramId: BigInt(789),
        text: 'Edited message',
        direction: MessageDirection.INCOMING,
        type: MessageType.TEXT,
        editedAt: new Date(editDate * 1000),
        userTelegramId: '12345',
        chatTelegramId: '456',
        replyToTelegramId: undefined,
        chat: {
          telegramId: '456',
          type: 'PRIVATE',
          title: 'Test User',
          username: undefined,
          memberCount: undefined,
        },
        media: undefined,
        location: undefined,
      });
    });

    it('should handle different message types', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        platform: 'telegram',
        raw: {
          message_id: 999,
          chat: {
            id: 456,
            type: 'private',
            first_name: 'Test',
          },
          from: {
            id: 12345,
            first_name: 'Test',
          },
          photo: [{ file_id: 'photo123' }],
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.PHOTO,
        })
      );
    });

    it('should handle error gracefully', async () => {
      const mockError = new Error('Database error');
      mockMessageApiService.createMessage.mockRejectedValue(mockError);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        platform: 'telegram',
        raw: {
          message_id: 123,
          chat: {
            id: 456,
            type: 'private',
          },
          from: {
            id: 12345,
            first_name: 'Test',
          },
          text: '/test command',
        },
      };

      // Should not throw
      await expect(
        interceptor.interceptIncomingMessage(input)
      ).resolves.toBeUndefined();
    });

    it('should skip if no platform or raw data', async () => {
      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        platform: undefined as any,
        raw: undefined,
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageApiService.createMessage).not.toHaveBeenCalled();
    });
  });

  describe('interceptOutgoingMessage', () => {
    it('should handle outgoing message correctly with new structure', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        args: ['test'],
        platform: 'telegram',
        raw: {
          message_id: 123,
          from: {
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
          },
          chat: {
            id: 456,
            type: 'private',
            first_name: 'Test',
            last_name: 'Chat',
            username: 'testchat',
          },
          text: '/test command',
        },
      };

      const output: CommandOutput = {
        text: 'Response message',
        format: 'HTML',
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith({
        telegramId: expect.any(BigInt),
        text: 'Respondeu ao comando: /test',
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        editedAt: undefined,
        userTelegramId: '12345',
        chatTelegramId: '456',
        replyToTelegramId: '123',
        chat: {
          telegramId: '456',
          type: 'PRIVATE',
          title: 'Test Chat',
          username: 'testchat',
          memberCount: undefined,
        },
        media: undefined,
        location: undefined,
      });
    });

    it('should handle group chat outgoing message', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        user: { id: 12345, name: 'Test User' },
        platform: 'telegram',
        raw: {
          message_id: 789,
          from: {
            id: 12345,
            first_name: 'Test',
            username: 'testuser',
          },
          chat: {
            id: 456,
            type: 'group',
            title: 'Test Group Chat',
            username: 'testgroup',
          },
          text: '/help',
        },
      };

      const output: CommandOutput = {
        text: 'Help message',
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith({
        telegramId: expect.any(BigInt),
        text: 'Respondeu ao comando: /help',
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        editedAt: undefined,
        userTelegramId: '12345',
        chatTelegramId: '456',
        replyToTelegramId: '789',
        chat: {
          telegramId: '456',
          type: 'GROUP',
          title: 'Test Group Chat',
          username: 'testgroup',
          memberCount: undefined,
        },
        media: undefined,
        location: undefined,
      });
    });

    it('should skip if no output text', async () => {
      const input: CommandInput = {
        platform: 'telegram',
        raw: {
          message_id: 123,
          chat: { id: 456, type: 'private' },
          from: { id: 12345, first_name: 'Test' },
          text: '/test',
        },
      };

      const output: CommandOutput = {
        text: '',
        format: 'HTML',
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageApiService.createMessage).not.toHaveBeenCalled();
    });

    it('should skip if no platform or raw data', async () => {
      const input: CommandInput = {
        platform: undefined as any,
        raw: undefined,
      };

      const output: CommandOutput = {
        text: 'Some response',
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageApiService.createMessage).not.toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      const mockError = new Error('Database error');
      mockMessageApiService.createMessage.mockRejectedValue(mockError);

      const input: CommandInput = {
        platform: 'telegram',
        raw: {
          message_id: 123,
          chat: { id: 456, type: 'private', first_name: 'Test' },
          from: { id: 12345, first_name: 'Test' },
          text: '/test',
        },
      };

      const output: CommandOutput = {
        text: 'Response message',
      };

      // Should not throw
      await expect(
        interceptor.interceptOutgoingMessage(input, output)
      ).resolves.toBeUndefined();
    });

    it('should handle message without user ID', async () => {
      const mockMessage = { id: 'msg-123' };
      mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

      const input: CommandInput = {
        platform: 'telegram',
        raw: {
          message_id: 123,
          chat: { id: 456, type: 'private', first_name: 'Test' },
          // No from field
          text: '/test',
        },
      };

      const output: CommandOutput = {
        text: 'Response message',
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageApiService.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userTelegramId: undefined,
        })
      );
    });
  });

  describe('extractTelegramMessageData', () => {
    it('should handle various chat types correctly', async () => {
      const testCases = [
        {
          chatType: 'private',
          expectedType: 'PRIVATE',
          title: 'John Doe',
        },
        {
          chatType: 'group',
          expectedType: 'GROUP',
          title: 'Test Group',
        },
        {
          chatType: 'supergroup',
          expectedType: 'SUPERGROUP',
          title: 'Test Supergroup',
        },
        {
          chatType: 'channel',
          expectedType: 'CHANNEL',
          title: 'Test Channel',
        },
      ];

      for (const testCase of testCases) {
        const mockMessage = { id: 'msg-123' };
        mockMessageApiService.createMessage.mockResolvedValue(mockMessage);

        const input: CommandInput = {
          platform: 'telegram',
          raw: {
            message_id: 123,
            chat: {
              id: 456,
              type: testCase.chatType,
              title:
                testCase.chatType === 'private' ? undefined : testCase.title,
              first_name: testCase.chatType === 'private' ? 'John' : undefined,
              last_name: testCase.chatType === 'private' ? 'Doe' : undefined,
            },
            from: { id: 12345, first_name: 'Test' },
            text: 'test message',
          },
        };

        await interceptor.interceptIncomingMessage(input);

        expect(mockMessageApiService.createMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            chat: expect.objectContaining({
              type: testCase.expectedType,
              title: testCase.title,
            }),
          })
        );

        vi.clearAllMocks();
      }
    });
  });
});
