// Centralized exports following dependency injection pattern
export { httpClient } from './http/HttpClient.ts';
export { userApiService } from './UserApiService.ts';
export { chatApiService } from './ChatApiService.ts';
export { messageApiService } from './MessageApiService.ts';
export { raceApiService } from './RaceApiService.ts';
export { favoriteApiService } from './FavoriteApiService.ts';
export { healthApiService } from './HealthApiService.ts';

// Alert service singleton
export { alertService } from './AlertService.ts';

// Re-export types for convenience
export type { CreateUserRequest } from '../types/Service.ts';
export type { CreateChatRequest } from '../types/Service.ts';
export type { CreateMessageRequest } from '../types/Service.ts';
export type { Race, RaceStatus, CreateRaceRequest } from '../types/Service.ts';
export type { FavoriteRace } from './FavoriteApiService.ts';
