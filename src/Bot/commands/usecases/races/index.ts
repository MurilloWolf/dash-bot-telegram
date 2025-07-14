export * from './commands/index.ts';
export * from './callbacks/index.ts';

import {
  RaceDetailsCallbackHandler,
  RaceListCallbackHandler,
  RaceFilterCallbackHandler,
  RaceLocationCallbackHandler,
  RaceReminderCallbackHandler,
  RaceSearchCallbackHandler,
} from './callbacks/index.ts';

import {
  listRacesCommand,
  listRacesByDistanceCommand,
  nextRacesCommand,
  searchRacesCommand,
} from './commands/index.ts';

// Automatic registration of callback handlers
export const raceCallbackHandlers = [
  new RaceDetailsCallbackHandler(),
  new RaceListCallbackHandler(),
  new RaceFilterCallbackHandler(),
  new RaceLocationCallbackHandler(),
  new RaceReminderCallbackHandler(),
  new RaceSearchCallbackHandler(),
];

// Automatic registration of commands
export const raceCommands = {
  corridas: listRacesCommand,
  proxima_corrida: nextRacesCommand,
  buscar_corridas: searchRacesCommand,
};

// Re-exporting for easier access
export {
  listRacesCommand as corridasCommand,
  listRacesByDistanceCommand as corridasDistanciaCommand,
};
