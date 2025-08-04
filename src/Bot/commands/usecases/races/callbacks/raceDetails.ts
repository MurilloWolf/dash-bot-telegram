import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceDetailsCallbackData,
} from '@app-types/callbacks/index.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { raceApiService, favoriteApiService } from '@services/index.ts';
import { RaceFormatter } from '../../../../../utils/formatters/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

export class RaceDetailsCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_details';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceDetailsCallbackData;
      const telegramId = input.user?.id?.toString();

      const race = await raceApiService.getRaceById(data.raceId);

      if (!race) {
        return this.createErrorResponse('Corrida não encontrada.');
      }

      const detailedMessage = RaceFormatter.formatDetailedRaceMessage(race);

      let isFavorited = false;
      if (telegramId) {
        try {
          isFavorited = await favoriteApiService.isRaceFavorited(
            telegramId,
            data.raceId
          );
        } catch {
          isFavorited = false;
        }
      }

      const favoriteButton = isFavorited
        ? {
            text: '💔 Desfavoritar',
            callbackData: CallbackDataSerializer.raceUnfavorite(data.raceId),
          }
        : {
            text: '❤️ Favoritar',
            callbackData: CallbackDataSerializer.raceFavorite(data.raceId),
          };

      return {
        text: detailedMessage,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [
            [
              {
                text: '🔗 Se Inscrever',
                url: race.link,
              },
            ],
            [
              {
                text: '📍 Ver Localização',
                callbackData: CallbackDataSerializer.raceLocation(data.raceId),
              },
            ],
            [favoriteButton],
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
