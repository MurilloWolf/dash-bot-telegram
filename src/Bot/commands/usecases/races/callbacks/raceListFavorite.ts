import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { CallbackData } from '@app-types/callbacks/index.ts';
import { favoriteApiService } from '@services/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';

export class RaceListFavoriteCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'races_list_favorite';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const telegramId = input.user?.id?.toString();

      if (!telegramId) {
        return this.createErrorResponse('ID do usuário não encontrado.');
      }

      const favoriteRaces =
        await favoriteApiService.getUserFavoriteRaces(telegramId);

      if (favoriteRaces.length === 0) {
        return {
          text: '📝 <b>Suas Corridas Favoritas</b>\n\n❌ Você ainda não tem corridas favoritas!\n\n💡 Para favoritar uma corrida, use o comando /corridas e clique no botão ⭐ de uma corrida.',
          format: 'HTML',
          editMessage: true,
          keyboard: {
            buttons: [
              [
                {
                  text: '🏃‍♂️ Ver Todas as Corridas',
                  callbackData: CallbackDataSerializer.racesList(),
                },
              ],
            ],
            inline: true,
          },
        };
      }

      const races = favoriteRaces;

      const raceButtons = races.slice(0, 10).map(race => [
        {
          text: `🏃‍♂️ ${race.title} - ${race.distances.join('/')}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id),
        },
      ]);

      const navigationButtons = [
        [
          {
            text: '🏃‍♂️ Ver Todas as Corridas',
            callbackData: CallbackDataSerializer.racesList(),
          },
        ],
      ];

      return {
        text: `⭐ <strong>Suas Corridas Favoritas</strong> (${favoriteRaces.length})\n\nSelecione uma corrida para ver mais detalhes:`,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [...raceButtons, ...navigationButtons],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, 'RaceListFavoriteCallbackHandler');
      return this.createErrorResponse('Erro ao buscar corridas favoritas.');
    }
  }
}
