// Re-exportar da nova estrutura modular
export * from './races/index.ts';
export * from './user/index.ts';
export * from './shared/index.ts';

// Keep old exports for compatibility
import { helpCommand, startCommand } from './user/index.ts';
import {
  listRacesCommand as corridasCommand,
  listRacesByDistanceCommand as corridasDistanciaCommand,
  nextRacesCommand,
  searchRacesCommand,
} from './races/index.ts';

export {
  helpCommand,
  startCommand,
  corridasCommand,
  corridasDistanciaCommand,
  nextRacesCommand,
  searchRacesCommand as searchCommand,
};
