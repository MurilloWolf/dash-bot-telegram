import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import { raceService } from "@core/infra/dependencies.ts";
import { logger } from "../../../../../utils/Logger.ts";

export async function nextRacesCommand(
  _input: CommandInput
): Promise<CommandOutput> {
  try {
    const nextRace = await raceService.getNextRace();

    if (!nextRace) {
      return {
        text: "❌ Nenhuma corrida disponível no momento!",
        format: "HTML",
      };
    }

    return {
      text: "Proximas corridas",
      format: "HTML",
      messages: raceService.formatRaceMessages(nextRace),
    };
  } catch (error) {
    logger.commandError(
      "nextRaces",
      error as Error,
      _input.user?.id?.toString()
    );
    return {
      text: "❌ Erro ao buscar próxima corrida. Tente novamente mais tarde.",
      format: "HTML",
    };
  }
}
