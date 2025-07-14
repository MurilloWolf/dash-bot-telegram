/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageInterceptor } from "../MessageInterceptor.ts";
import { CommandInput, CommandOutput } from "@app-types/Command.ts";

// Mock for messageService and userService
vi.mock("@core/infra/dependencies", () => ({
  messageService: {
    getChatByTelegramId: vi.fn(),
    createChat: vi.fn(),
    createMessage: vi.fn(),
  },
  userService: {
    registerUser: vi.fn(),
  },
}));

describe("MessageInterceptor", () => {
  let interceptor: MessageInterceptor;
  let mockMessageService: any;
  let mockUserService: any;

  beforeEach(async () => {
    interceptor = new MessageInterceptor();
    const dependencies = await import("@core/infra/dependencies.ts");
    mockMessageService = dependencies.messageService;
    mockUserService = dependencies.userService;
    vi.clearAllMocks();
  });

  describe("interceptIncomingMessage", () => {
    it("should handle telegram message correctly", async () => {
      const mockChat = { id: "chat-123" };
      const mockMessage = { id: "msg-123" };
      const mockUser = {
        id: "user-123",
        telegramId: "12345",
        name: "Test User",
      };

      mockMessageService.getChatByTelegramId.mockResolvedValue(mockChat);
      mockMessageService.createMessage.mockResolvedValue(mockMessage);
      mockUserService.registerUser.mockResolvedValue(mockUser);

      const input: CommandInput = {
        user: { id: 12345, name: "Test User" },
        args: ["test"],
        platform: "telegram",
        raw: {
          message_id: 123,
          chat: {
            id: 456,
            type: "private",
            title: "Test Chat",
            username: "testuser",
          },
          from: {
            id: 12345,
            first_name: "Test",
            username: "testuser",
          },
          text: "/test command",
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageService.getChatByTelegramId).toHaveBeenCalledWith(
        "456"
      );
      expect(mockMessageService.createMessage).toHaveBeenCalledWith({
        telegramId: BigInt(123),
        text: "/test command",
        direction: "INCOMING",
        type: "TEXT",
        userId: "user-123",
        chatId: "chat-123",
        replyToId: undefined,
        editedAt: undefined,
        isDeleted: false,
      });
    });

    it("should create chat if not exists", async () => {
      const mockChat = { id: "new-chat-123" };
      const mockUser = {
        id: "user-123",
        telegramId: "12345",
        name: "Test User",
      };

      mockMessageService.getChatByTelegramId.mockResolvedValue(null);
      mockMessageService.createChat.mockResolvedValue(mockChat);
      mockMessageService.createMessage.mockResolvedValue({ id: "msg-123" });
      mockUserService.registerUser.mockResolvedValue(mockUser);

      const input: CommandInput = {
        user: { id: 12345, name: "Test User" },
        args: ["test"],
        platform: "telegram",
        raw: {
          message_id: 123,
          chat: {
            id: 456,
            type: "private",
            first_name: "Test", // For private chats, the title comes from these fields
            last_name: "Chat", // The title will be "Test Chat"
            username: "testuser",
          },
          from: {
            id: 12345,
            first_name: "Test",
            username: "testuser",
          },
          text: "/test command",
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(mockMessageService.createChat).toHaveBeenCalledWith({
        telegramId: "456",
        type: "PRIVATE",
        title: "Test Chat", // Now will be built from first_name + last_name
        username: "testuser",
        memberCount: undefined,
      });
    });

    it("should handle error gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockMessageService.getChatByTelegramId.mockRejectedValue(
        new Error("Database error")
      );

      const input: CommandInput = {
        user: { id: 12345, name: "Test User" },
        args: ["test"],
        platform: "telegram",
        raw: {
          message_id: 123,
          chat: {
            id: 456,
            type: "private",
          },
          text: "/test command",
        },
      };

      await interceptor.interceptIncomingMessage(input);

      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Erro ao interceptar mensagem recebida:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("interceptOutgoingMessage", () => {
    it("should handle outgoing message correctly", async () => {
      const mockChat = { id: "chat-123" };
      const mockMessage = { id: "msg-123" };
      const mockUser = {
        id: "user-123",
        telegramId: "12345",
        name: "Test User",
      };

      mockMessageService.getChatByTelegramId.mockResolvedValue(mockChat);
      mockMessageService.createMessage.mockResolvedValue(mockMessage);
      mockUserService.registerUser.mockResolvedValue(mockUser);

      const input: CommandInput = {
        user: { id: 12345, name: "Test User" },
        args: ["test"],
        platform: "telegram",
        raw: {
          message_id: 123,
          from: {
            id: 12345,
            first_name: "Test",
            last_name: "User", // Added so the full name will be "Test User"
            username: "testuser",
          },
          chat: {
            id: 456,
            type: "private",
            title: "Test Chat",
            username: "testchat",
          },
          text: "/test command",
        },
      };

      const output: CommandOutput = {
        text: "Response message",
        format: "HTML",
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        "12345",
        "Test User", // Now expects the full name
        "testuser"
      );

      expect(mockMessageService.createMessage).toHaveBeenCalledWith({
        telegramId: expect.any(BigInt),
        text: "Response message",
        direction: "OUTGOING",
        type: "TEXT",
        userId: "user-123", // Now expects the userId
        chatId: "chat-123",
        isDeleted: false,
      });
    });

    it("should create chat with correct information when it doesn't exist", async () => {
      const mockChat = { id: "new-chat-123" };
      const mockMessage = { id: "msg-123" };
      const mockUser = {
        id: "user-123",
        telegramId: "12345",
        name: "Test User",
      };

      mockMessageService.getChatByTelegramId.mockResolvedValue(null); // Chat doesn't exist
      mockMessageService.createChat.mockResolvedValue(mockChat);
      mockMessageService.createMessage.mockResolvedValue(mockMessage);
      mockUserService.registerUser.mockResolvedValue(mockUser);

      const input: CommandInput = {
        user: { id: 12345, name: "Test User" },
        args: ["test"],
        platform: "telegram",
        raw: {
          message_id: 123,
          from: {
            id: 12345,
            first_name: "Test",
            username: "testuser",
          },
          chat: {
            id: 789,
            type: "group",
            title: "Test Group Chat",
            username: "testgroup",
          },
          text: "/test command",
        },
      };

      const output: CommandOutput = {
        text: "Response message",
        format: "HTML",
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageService.createChat).toHaveBeenCalledWith({
        telegramId: "789",
        type: "GROUP",
        title: "Test Group Chat",
        username: "testgroup",
        memberCount: undefined,
      });
    });

    it("should skip if no output text", async () => {
      const input: CommandInput = {
        platform: "telegram",
        raw: {},
      };

      const output: CommandOutput = {
        text: "",
        format: "HTML",
      };

      await interceptor.interceptOutgoingMessage(input, output);

      expect(mockMessageService.getChatByTelegramId).not.toHaveBeenCalled();
      expect(mockMessageService.createMessage).not.toHaveBeenCalled();
    });
  });
});
