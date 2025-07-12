import { CommandInput, CommandOutput } from "../../types/Command.ts";
import { CommandRegistry } from "../config/commands/CommandRegistry.ts";

import { listRacesByDistanceCommand as corridasDistanciaCommand } from "../commands/usecases/races/index.ts";

let commandRegistry: CommandRegistry | null = null;

async function getCommandRegistry(): Promise<CommandRegistry> {
  if (!commandRegistry) {
    commandRegistry = CommandRegistry.getInstance();
    try {
      await commandRegistry.autoRegisterCommands();
    } catch (error) {
      console.error("❌ Erro ao inicializar registry de comandos:", error);
    }
  }
  return commandRegistry;
}

export async function routeCommand(
  command: string,
  input: CommandInput
): Promise<CommandOutput> {
  try {
    const runDistanceMatch = command.match(/^corridas_(.+)$/);
    if (runDistanceMatch) {
      const distanceStr = runDistanceMatch[1];
      const distances = distanceStr
        .split(",")
        .map((d) => parseInt(d.replace("km", "")))
        .filter((d) => !isNaN(d));

      if (distances.length > 0) {
        return corridasDistanciaCommand(input, distances);
      }
    }

    const registry = await getCommandRegistry();
    const handler = registry.getHandler(command);

    if (handler) {
      console.log(`🎯 [registry] Executando comando: /${command}`);
      return handler(input);
    }

    console.warn(`❌ Comando não encontrado: /${command}`);
    return {
      text: "❌ Comando não reconhecido. Use /help para ver os comandos disponíveis.",
      format: "HTML",
    };
  } catch (error) {
    console.error(`❌ Erro ao executar comando /${command}:`, error);
    return {
      text: "❌ Erro interno. Tente novamente mais tarde.",
      format: "HTML",
    };
  }
}

export async function getAvailableCommands(): Promise<string[]> {
  try {
    const registry = await getCommandRegistry();
    const registryCommands = registry.getAllCommands();

    const allCommands = [...new Set([...registryCommands])];
    return allCommands.sort();
  } catch (error) {
    console.error("❌ Erro ao obter comandos disponíveis:", error);
    return [];
  }
}
