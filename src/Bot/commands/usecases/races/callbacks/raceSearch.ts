import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import {
  CallbackData,
  RaceSearchCallbackData,
} from "@app-types/callbacks/index.ts";
import { raceService } from "@core/infra/dependencies.ts";
import { CallbackDataSerializer } from "@bot/config/callback/CallbackDataSerializer.ts";
import { BaseCallbackHandler } from "@bot/commands/shared/handlers/BaseCallbackHandler.ts";

/**
 * Handler para busca de corridas por distância
 */
export class RaceSearchCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "races_search";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceSearchCallbackData;
      const { startDistance, endDistance } = data;

      const races = await raceService.getRacesByRange(
        startDistance,
        endDistance
      );

      if (races && races.length === 0) {
        return {
          text: `❌ Nenhuma corrida encontrada para a distância entre ${startDistance}km e ${endDistance}km.`,
          format: "HTML",
          editMessage: true,
          keyboard: {
            buttons: [
              [
                {
                  text: "⬅️ Voltar",
                  callbackData: CallbackDataSerializer.racesList(),
                },
              ],
            ],
            inline: true,
          },
        };
      }

      const raceButtons = races.map((race) => [
        {
          text: `🏃‍♂️ ${race.title} - ${race.distances.join("/")}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id),
        },
      ]);

      const navigationButtons = [
        [
          {
            text: "⬅️ Voltar",
            callbackData: CallbackDataSerializer.racesList(),
          },
        ],
      ];

      return {
        text: `🏃‍♂️ <strong>Corridas Encontradas</strong>\n\nEncontradas ${races.length} corrida(s) entre ${startDistance}km e ${endDistance}km:`,
        format: "HTML",
        editMessage: true,
        keyboard: {
          buttons: [...raceButtons, ...navigationButtons],
          inline: true,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar corridas:", error);
      return {
        text: "❌ Erro ao buscar corridas.",
        format: "HTML",
        editMessage: true,
      };
    }
  }
}
