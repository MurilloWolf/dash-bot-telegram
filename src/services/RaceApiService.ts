import { httpClient, ApiError } from './http/HttpClient.ts';
import { logger } from '../utils/Logger.ts';
import { Race, CreateRaceRequest } from '../types/Service.ts';

export class RaceApiService {
  private readonly baseUrl = '/races';

  async getAvailableRaces(): Promise<Race[]> {
    try {
      const response = await httpClient.get<Race[]>(
        `${this.baseUrl}/available`
      );

      logger.info('Successfully retrieved available races', {
        module: 'RaceApiService',
        action: 'get_available_races',
        racesCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error getting available races',
        {
          module: 'RaceApiService',
          action: 'get_available_races',
        },
        error as Error
      );
      throw error;
    }
  }

  async getRaceById(id: string): Promise<Race | null> {
    try {
      const response = await httpClient.get<Race>(`${this.baseUrl}/${id}`);
      logger.info('Successfully retrieved race by ID', {
        module: 'RaceApiService',
        action: 'get_race_by_id',
        raceId: id,
        raceTitle: response.data.title,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting race by ID',
        {
          module: 'RaceApiService',
          action: 'get_race_by_id',
          raceId: id,
        },
        error as Error
      );
      throw error;
    }
  }

  async getRacesByDistance(distance: number): Promise<Race[]> {
    try {
      const response = await httpClient.get<Race[]>(
        `${this.baseUrl}/by-distance?distance=${distance}`
      );

      logger.info('Successfully retrieved races by distances', {
        module: 'RaceApiService',
        action: 'get_races_by_distances',
        distances: distance,
        racesCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error getting races by distances',
        {
          module: 'RaceApiService',
          action: 'get_races_by_distances',
          distances: distance,
        },
        error as Error
      );
      throw error;
    }
  }

  async getRacesByRange(
    startDistance: number,
    endDistance: number
  ): Promise<Race[]> {
    try {
      const response = await httpClient.get<Race[]>(
        `${this.baseUrl}/by-distance?minDistance=${startDistance}&maxDistance=${endDistance}`
      );

      logger.info('Successfully retrieved races by range', {
        module: 'RaceApiService',
        action: 'get_races_by_range',
        startDistance,
        endDistance,
        racesCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error getting races by range',
        {
          module: 'RaceApiService',
          action: 'get_races_by_range',
          startDistance,
          endDistance,
        },
        error as Error
      );
      throw error;
    }
  }

  async getNextRace(): Promise<Race[]> {
    try {
      const response = await httpClient.get<Race[]>(`${this.baseUrl}/next`);

      logger.info('Successfully retrieved next races', {
        module: 'RaceApiService',
        action: 'get_next_race',
        racesCount: response.data.length,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      logger.error(
        'Error getting next race',
        {
          module: 'RaceApiService',
          action: 'get_next_race',
        },
        error as Error
      );
      throw error;
    }
  }

  async createRace(raceData: CreateRaceRequest): Promise<Race> {
    try {
      const response = await httpClient.post<Race>(this.baseUrl, raceData);

      logger.info('Successfully created race', {
        module: 'RaceApiService',
        action: 'create_race',
        raceId: response.data.id,
        title: response.data.title,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error creating race',
        {
          module: 'RaceApiService',
          action: 'create_race',
          title: raceData.title,
        },
        error as Error
      );
      throw error;
    }
  }
}

// Singleton instance
export const raceApiService = new RaceApiService();
