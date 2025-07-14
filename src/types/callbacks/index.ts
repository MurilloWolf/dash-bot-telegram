export * from './raceCallbacks.ts';
export * from './userCallbacks.ts';
export * from './sharedCallbacks.ts';
import { RaceCallbackData } from './raceCallbacks.ts';
import { UserCallbackData } from './userCallbacks.ts';
import { SharedCallbackData } from './sharedCallbacks.ts';

export type CallbackData =
  | RaceCallbackData
  | UserCallbackData
  | SharedCallbackData;
