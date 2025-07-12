export * from "./commands/index.ts";
export * from "./callbacks/index.ts";

import { UserConfigCallbackHandler } from "./callbacks/index.ts";
import { startCommand, helpCommand, configCommand } from "./commands/index.ts";

// Registro automático de callbacks
export const userCallbackHandlers = [new UserConfigCallbackHandler()];

// Registro automático de comandos
export const userCommands = {
  start: startCommand,
  ajuda: helpCommand,
  help: helpCommand,
  config: configCommand,
};
