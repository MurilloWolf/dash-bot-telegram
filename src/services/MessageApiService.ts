import { httpClient, ApiError } from './http/HttpClient.ts';
import { logger } from '../utils/Logger.ts';
import { Message, CreateMessageRequest } from '../types/Service.ts';

export class MessageApiService {
  private readonly baseUrl = '/messages';

  async createMessage(messageData: CreateMessageRequest): Promise<Message> {
    try {
      const requestData = {
        ...messageData,
        telegramId: messageData.telegramId.toString(),
      };

      const response = await httpClient.post<Message>(
        this.baseUrl,
        requestData
      );

      logger.info('Successfully created message', {
        module: 'MessageApiService',
        action: 'create_message',
        messageId: response.data.id,
        telegramId: messageData.telegramId.toString(),
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error creating message',
        {
          module: 'MessageApiService',
          action: 'create_message',
          telegramId: messageData.telegramId.toString(),
          error: (error as Error).message,
        },
        error as Error
      );
      throw error;
    }
  }

  async getMessageById(id: string): Promise<Message | null> {
    try {
      const response = await httpClient.get<Message>(`${this.baseUrl}/${id}`);

      logger.info('Successfully retrieved message by ID', {
        module: 'MessageApiService',
        action: 'get_message_by_id',
        messageId: id,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting message by ID',
        {
          module: 'MessageApiService',
          action: 'get_message_by_id',
          messageId: id,
        },
        error as Error
      );
      throw error;
    }
  }

  async getMessagesByChat(
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    try {
      const response = await httpClient.get<Message[]>(
        `${this.baseUrl}/chat/${chatId}?limit=${limit}&offset=${offset}`
      );

      logger.info('Successfully retrieved messages by chat', {
        module: 'MessageApiService',
        action: 'get_messages_by_chat',
        chatId,
        messagesCount: response.data.length,
        limit,
        offset,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error getting messages by chat',
        {
          module: 'MessageApiService',
          action: 'get_messages_by_chat',
          chatId,
        },
        error as Error
      );
      throw error;
    }
  }
}

// Singleton instance
export const messageApiService = new MessageApiService();
