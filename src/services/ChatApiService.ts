import { httpClient, ApiError } from './http/HttpClient.ts';
import { logger } from '../utils/Logger.ts';
import { Chat, CreateChatRequest } from '../types/Service.ts';

export class ChatApiService {
  private readonly baseUrl = '/chats';

  async getChatByTelegramId(telegramId: string): Promise<Chat | null> {
    try {
      const response = await httpClient.get<Chat>(
        `${this.baseUrl}/telegram/${telegramId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting chat by telegram ID',
        {
          module: 'ChatApiService',
          action: 'get_chat_by_telegram_id',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  async createChat(chatData: CreateChatRequest): Promise<Chat> {
    try {
      const response = await httpClient.post<Chat>(this.baseUrl, chatData);
      return response.data;
    } catch (error) {
      logger.error(
        'Error creating chat',
        {
          module: 'ChatApiService',
          action: 'create_chat',
          telegramId: chatData.telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  async getChatById(id: string): Promise<Chat | null> {
    try {
      const response = await httpClient.get<Chat>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting chat by ID',
        {
          module: 'ChatApiService',
          action: 'get_chat_by_id',
          chatId: id,
        },
        error as Error
      );
      throw error;
    }
  }
}

// Singleton instance
export const chatApiService = new ChatApiService();
