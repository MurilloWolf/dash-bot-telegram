import { CommandRegistry } from "@bot/config/commands/CommandRegistry.ts";
import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import { messageInterceptor } from "@bot/middleware/MessageInterceptor.ts";
import { logger } from "../../utils/Logger.ts";

import { listRacesByDistanceCommand as corridasDistanciaCommand } from "@bot/commands/usecases/races/index.ts";

let commandRegistry: CommandRegistry | null = null;

async function getCommandRegistry(): Promise<CommandRegistry> {
  if (!commandRegistry) {
    commandRegistry = CommandRegistry.getInstance();
    try {
      await commandRegistry.autoRegisterCommands();
    } catch (error) {
      logger.error(
        "Erro ao inicializar registry de comandos",
        {
          module: "CommandRouter",
          action: "initialize_registry",
        },
        error as Error
      );
    }
  }
  return commandRegistry;
}

export async function routeCommand(
  command: string,
  input: CommandInput
): Promise<CommandOutput> {
  try {
    await messageInterceptor.interceptIncomingMessage(input);

    const runDistanceMatch = command.match(/^corridas_(.+)$/);
    if (runDistanceMatch) {
      const distanceStr = runDistanceMatch[1];
      const distances = distanceStr
        .split(",")
        .map((d) => parseInt(d.replace("km", "")))
        .filter((d) => !isNaN(d));

      if (distances.length > 0) {
        logger.commandExecution(command, input.user?.id?.toString());
        const output = await corridasDistanciaCommand(input, distances);
        await messageInterceptor.interceptOutgoingMessage(input, output);
        return output;
      }
    }

    const registry = await getCommandRegistry();
    const handler = registry.getHandler(command);

    if (handler) {
      logger.commandExecution(command, input.user?.id?.toString());
      const output = await handler(input);
      await messageInterceptor.interceptOutgoingMessage(input, output);
      return output;
    }

    logger.warn(`Comando não encontrado: /${command}`, {
      module: "CommandRouter",
      action: "command_not_found",
      commandName: command,
      userId: input.user?.id?.toString(),
    });
    const output = {
      text: "❌ Comando não reconhecido. Use /help para ver os comandos disponíveis.",
      format: "HTML",
    };
    await messageInterceptor.interceptOutgoingMessage(input, output);
    return output;
  } catch (error) {
    logger.commandError(command, error as Error, input.user?.id?.toString());
    const output = {
      text: "❌ Erro interno. Tente novamente mais tarde.",
      format: "HTML",
    };
    await messageInterceptor.interceptOutgoingMessage(input, output);
    return output;
  }
}

export async function getAvailableCommands(): Promise<string[]> {
  try {
    const registry = await getCommandRegistry();
    const registryCommands = registry.getAllCommands();

    const allCommands = [...new Set([...registryCommands])];
    return allCommands.sort();
  } catch (error) {
    logger.error(
      "Erro ao obter comandos disponíveis",
      {
        module: "CommandRouter",
        action: "get_available_commands",
      },
      error as Error
    );
    return [];
  }
}
