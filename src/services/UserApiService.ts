import { httpClient, ApiError } from './http/HttpClient.ts';
import { logger } from '../utils/Logger.ts';
import { User } from '../types/Service.ts';

export class UserApiService {
  private readonly baseUrl = '/users';

  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    try {
      const response = await httpClient.post<User>(`${this.baseUrl}/register`, {
        telegramId,
        name,
        username,
      });

      logger.info('Successfully registered user', {
        module: 'UserApiService',
        action: 'register_user',
        userId: response.data.id,
        telegramId,
        name,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error registering user',
        {
          module: 'UserApiService',
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
      const response = await httpClient.get<User>(
        `${this.baseUrl}/telegram/${telegramId}`
      );

      logger.info('Successfully retrieved user by telegram ID', {
        module: 'UserApiService',
        action: 'get_user_by_telegram_id',
        userId: response.data.id,
        telegramId,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting user by telegram ID',
        {
          module: 'UserApiService',
          action: 'get_user_by_telegram_id',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await httpClient.get<User>(`${this.baseUrl}/${id}`);

      logger.info('Successfully retrieved user by ID', {
        module: 'UserApiService',
        action: 'get_user_by_id',
        userId: id,
        userTelegramId: response.data.telegramId,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting user by ID',
        {
          module: 'UserApiService',
          action: 'get_user_by_id',
          userId: id,
        },
        error as Error
      );
      throw error;
    }
  }
}

// Singleton instance
export const userApiService = new UserApiService();
