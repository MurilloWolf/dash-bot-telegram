import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import {
  CallbackData,
  RaceListCallbackData,
} from "@app-types/callbacks/index.ts";
import { raceService } from "@core/infra/dependencies.ts";
import { BaseCallbackHandler } from "@bot/commands/shared/handlers/BaseCallbackHandler.ts";
import { CallbackDataSerializer } from "@bot/config/callback/CallbackDataSerializer.ts";

export class RaceListCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "races_list";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceListCallbackData;
      let races;

      if (data.distance) {
        races = await raceService.getRacesByDistances([data.distance]);
      } else {
        races = await raceService.getAvailableRaces();
      }

      if (races.length === 0) {
        return this.createErrorResponse(
          "Nenhuma corrida disponível no momento!"
        );
      }

      const raceButtons = races.slice(0, 10).map((race) => [
        {
          text: `🏃‍♂️ ${race.title} - ${race.distances.join("/")}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id),
        },
      ]);

      const filterButtons = [
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
        text: `🏃‍♂️ <strong>Corridas Disponíveis</strong>\n\nSelecione uma corrida para ver mais detalhes:`,
        format: "HTML",
        editMessage: true,
        keyboard: {
          buttons: [...raceButtons, ...filterButtons],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, "RaceListCallbackHandler");
      return this.createErrorResponse("Erro ao buscar corridas.");
    }
  }
}
