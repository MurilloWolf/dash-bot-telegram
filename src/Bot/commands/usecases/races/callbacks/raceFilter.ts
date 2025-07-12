import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";
import {
  CallbackData,
  RaceFilterCallbackData,
} from "../../../../../types/callbacks/index.ts";
import { raceService } from "../../../../../core/infra/dependencies.ts";
import { BaseCallbackHandler } from "../../../shared/handlers/BaseCallbackHandler.ts";
import { CallbackDataSerializer } from "../../../../config/callback/CallbackDataSerializer.ts";

export class RaceFilterCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "races_filter";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceFilterCallbackData;
      const races = await raceService.getRacesByDistances([data.distance]);

      if (races.length === 0) {
        return {
          text: `❌ Nenhuma corrida encontrada para a distância: ${data.distance}km`,
          format: "HTML",
          editMessage: true,
          keyboard: {
            buttons: [
              [this.createBackButton(CallbackDataSerializer.racesList())],
            ],
            inline: true,
          },
        };
      }

      // Create buttons for each filtered race
      const raceButtons = races.slice(0, 10).map((race) => [
        {
          text: `🏃‍♂️ ${race.title} - ${race.distances.join("/")}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id),
        },
      ]);

      // Navigation buttons
      const navigationButtons = [
        [
          { text: "5km", callbackData: CallbackDataSerializer.racesFilter(5) },
          {
            text: "10km",
            callbackData: CallbackDataSerializer.racesFilter(10),
          },
          {
            text: "21km",
            callbackData: CallbackDataSerializer.racesFilter(21),
          },
        ],
        [
          {
            text: "42km",
            callbackData: CallbackDataSerializer.racesFilter(42),
          },
          {
            text: "📋 Todas",
            callbackData: CallbackDataSerializer.racesList(),
          },
        ],
      ];

      return {
        text: `🏃‍♂️ <strong>Corridas de ${data.distance}km</strong>\n\nEncontradas ${races.length} corrida(s):`,
        format: "HTML",
        editMessage: true,
        keyboard: {
          buttons: [...raceButtons, ...navigationButtons],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, "RaceFilterCallbackHandler");
      return this.createErrorResponse("Erro ao filtrar corridas.");
    }
  }
}
