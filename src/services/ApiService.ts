import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/Logger.ts';
import {
  User,
  Chat,
  Message,
  CreateChatRequest,
  CreateMessageRequest,
} from '../types/Service.ts';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      config => {
        logger.debug('API Request', {
          module: 'ApiService',
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      error => {
        logger.error(
          'API Request Error',
          {
            module: 'ApiService',
            action: 'request_interceptor',
          },
          error
        );
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      response => {
        logger.debug('API Response', {
          module: 'ApiService',
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      error => {
        logger.error(
          'API Response Error',
          {
            module: 'ApiService',
            action: 'response_interceptor',
            status: error.response?.status,
            url: error.config?.url,
          },
          error
        );
        return Promise.reject(error);
      }
    );
  }

  // User methods
  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.post(
        '/users/register',
        {
          telegramId,
          name,
          username,
        }
      );
      return response.data;
    } catch (error) {
      logger.error(
        'Error registering user',
        {
          module: 'ApiService',
          action: 'register_user',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await this.api.get(
        `/users/telegram/${telegramId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error(
        'Error getting user by telegram ID',
        {
          module: 'ApiService',
          action: 'get_user_by_telegram_id',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  // Chat methods
  async getChatByTelegramId(telegramId: string): Promise<Chat | null> {
    try {
      const response: AxiosResponse<Chat> = await this.api.get(
        `/chats/telegram/${telegramId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error(
        'Error getting chat by telegram ID',
        {
          module: 'ApiService',
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
      const response: AxiosResponse<Chat> = await this.api.post(
        '/chats',
        chatData
      );
      return response.data;
    } catch (error) {
      logger.error(
        'Error creating chat',
        {
          module: 'ApiService',
          action: 'create_chat',
          telegramId: chatData.telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  // Message methods
  async createMessage(messageData: CreateMessageRequest): Promise<Message> {
    try {
      // Convert bigint to string for JSON serialization
      const requestData = {
        ...messageData,
        telegramId: messageData.telegramId.toString(),
      };

      const response: AxiosResponse<Message> = await this.api.post(
        '/messages',
        requestData
      );
      return response.data;
    } catch (error) {
      logger.error(
        'Error creating message',
        {
          module: 'ApiService',
          action: 'create_message',
          telegramId: messageData.telegramId.toString(),
        },
        error as Error
      );
      throw error;
    }
  }

  async getMessageById(id: string): Promise<Message | null> {
    try {
      const response: AxiosResponse<Message> = await this.api.get(
        `/messages/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error(
        'Error getting message by ID',
        {
          module: 'ApiService',
          action: 'get_message_by_id',
          messageId: id,
        },
        error as Error
      );
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error(
        'Health check failed',
        {
          module: 'ApiService',
          action: 'health_check',
        },
        error as Error
      );
      return false;
    }
  }
}

// Singleton instance
export const apiService = new ApiService();
