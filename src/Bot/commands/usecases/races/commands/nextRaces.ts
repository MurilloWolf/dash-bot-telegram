import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";
import { raceService } from "../../../../../core/infra/dependencies.ts";

export async function nextRacesCommand(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    console.error("Erro ao buscar próxima corrida:", error);
    return {
      text: "❌ Erro ao buscar próxima corrida. Tente novamente mais tarde.",
      format: "HTML",
    };
  }
}
