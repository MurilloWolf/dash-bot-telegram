import { BaseCallbackData } from './raceCallbacks.ts';

// User-specific callbacks
export interface UserConfigCallbackData extends BaseCallbackData {
  type: 'user_config';
  action: 'distances' | 'notifications' | 'reminder';
  value?: string;
}

export interface UserPreferencesCallbackData extends BaseCallbackData {
  type: 'user_preferences';
  setting: string;
  value: string | number | boolean;
}

// Union type for user callbacks
export type UserCallbackData =
  | UserConfigCallbackData
  | UserPreferencesCallbackData;
