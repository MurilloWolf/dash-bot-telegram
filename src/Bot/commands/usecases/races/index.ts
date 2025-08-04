export * from './commands/index.ts';
export * from './callbacks/index.ts';

import {
  RaceDetailsCallbackHandler,
  RaceListCallbackHandler,
  RaceListFavoriteCallbackHandler,
  RaceFilterCallbackHandler,
  RaceLocationCallbackHandler,
  RaceReminderCallbackHandler,
  RaceSearchCallbackHandler,
  RaceFavoriteCallbackHandler,
  RaceUnfavoriteCallbackHandler,
} from './callbacks/index.ts';

import {
  listRacesCommand,
  listRacesByDistanceCommand,
  listFavoriteRacesCommand,
  nextRacesCommand,
  searchRacesCommand,
} from './commands/index.ts';

// Automatic registration of callback handlers
export const raceCallbackHandlers = [
  new RaceDetailsCallbackHandler(),
  new RaceListCallbackHandler(),
  new RaceListFavoriteCallbackHandler(),
  new RaceFilterCallbackHandler(),
  new RaceLocationCallbackHandler(),
  new RaceReminderCallbackHandler(),
  new RaceSearchCallbackHandler(),
  new RaceFavoriteCallbackHandler(),
  new RaceUnfavoriteCallbackHandler(),
];

// Automatic registration of commands
export const raceCommands = {
  corridas: listRacesCommand,
  favoritos: listFavoriteRacesCommand,
  proxima_corrida: nextRacesCommand,
  buscar_corridas: searchRacesCommand,
};

// Re-exporting for easier access
export {
  listRacesCommand as corridasCommand,
  listRacesByDistanceCommand as corridasDistanciaCommand,
  listFavoriteRacesCommand as favoritosCommand,
};
