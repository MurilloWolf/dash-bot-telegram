/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceFavoriteCallbackData,
} from '@app-types/callbacks/index.ts';
import { favoriteApiService } from '@services/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

export class RaceFavoriteCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_favorite';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceFavoriteCallbackData;
      const telegramId = input.user?.id?.toString();

      if (!telegramId) {
        return this.createErrorResponse('ID do usuário não encontrado.');
      }

      const response = await favoriteApiService.addFavoriteRace(
        telegramId,
        data.raceId
      );

      if (response.id) {
        return {
          text: '✅ <b>Corrida favoritada com sucesso!</b>\n\n🌟 Agora você pode visualizar suas corridas favoritas usando o comando /favoritos',
          format: 'HTML',
          editMessage: false,
        };
      } else {
        return this.createErrorResponse('Erro ao favoritar corrida.');
      }
    } catch (error: any) {
      this.logError(error, 'RaceFavoriteCallbackHandler');
      const errorMessage =
        'message' in error ? error.message : 'Erro ao favoritar corrida.';
      return this.createErrorResponse(errorMessage);
    }
  }
}
