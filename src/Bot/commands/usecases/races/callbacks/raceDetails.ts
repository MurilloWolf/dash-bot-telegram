import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceDetailsCallbackData,
} from '@app-types/callbacks/index.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { raceService } from '@core/infra/dependencies.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

export class RaceDetailsCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_details';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceDetailsCallbackData;

      const race = await raceService.getRaceById(data.raceId);

      if (!race) {
        return this.createErrorResponse('Corrida não encontrada.');
      }

      const detailedMessage = raceService.formatDetailedRaceMessage(race);

      return {
        text: detailedMessage,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [
            [
              {
                text: '📍 Ver Localização',
                callbackData: CallbackDataSerializer.raceLocation(data.raceId),
              },
              {
                text: '⏰ Definir Lembrete',
                callbackData: CallbackDataSerializer.raceReminder(
                  data.raceId,
                  'set'
                ),
              },
            ],
            [this.createBackButton(CallbackDataSerializer.racesList())],
          ],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, 'RaceDetailsCallbackHandler');
      return this.createErrorResponse('Erro ao buscar detalhes da corrida.');
    }
  }
}
