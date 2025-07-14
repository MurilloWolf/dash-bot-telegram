// Base types for callbacks
export interface BaseCallbackData {
  type: string;
}

// Race-specific callbacks
export interface RaceDetailsCallbackData extends BaseCallbackData {
  type: 'race_details';
  raceId: string;
}

export interface RaceListCallbackData extends BaseCallbackData {
  type: 'races_list';
  distance?: number;
}

export interface RaceSearchCallbackData extends BaseCallbackData {
  type: 'races_search';
  startDistance: number;
  endDistance: number;
}

export interface RaceReminderCallbackData extends BaseCallbackData {
  type: 'race_reminder';
  raceId: string;
  action: 'set' | 'cancel';
}

export interface RaceLocationCallbackData extends BaseCallbackData {
  type: 'race_location';
  raceId: string;
}

export interface RaceFilterCallbackData extends BaseCallbackData {
  type: 'races_filter';
  distance: number;
}

// Union type for race callbacks
export type RaceCallbackData =
  | RaceDetailsCallbackData
  | RaceListCallbackData
  | RaceReminderCallbackData
  | RaceLocationCallbackData
  | RaceFilterCallbackData
  | RaceSearchCallbackData;
