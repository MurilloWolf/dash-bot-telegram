export * from './commands/index.ts';
export * from './callbacks/index.ts';

import { UserConfigCallbackHandler } from './callbacks/index.ts';
import { startCommand, helpCommand, configCommand } from './commands/index.ts';

export const userCallbackHandlers = [new UserConfigCallbackHandler()];

export const userCommands = {
  start: startCommand,
  ajuda: helpCommand,
  config: configCommand,
};
