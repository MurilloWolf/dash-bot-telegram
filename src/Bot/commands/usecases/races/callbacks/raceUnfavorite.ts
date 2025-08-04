/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceUnfavoriteCallbackData,
} from '@app-types/callbacks/index.ts';
import { favoriteApiService } from '@services/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

export class RaceUnfavoriteCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_unfavorite';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceUnfavoriteCallbackData;
      const telegramId = input.user?.id?.toString();

      if (!telegramId) {
        return this.createErrorResponse('ID do usuário não encontrado.');
      }

      await favoriteApiService.removeFavoriteRace(telegramId, data.raceId);

      return {
        text: '✅ <b>Corrida removida dos favoritos!</b>\n\n🌟 Use o comando /favoritos para ver suas corridas favoritas atualizadas.',
        format: 'HTML',
        editMessage: false,
      };
    } catch (error: any) {
      this.logError(error, 'RaceUnfavoriteCallbackHandler');
      const errorMessage =
        'message' in error
          ? error.message
          : 'Erro ao remover corrida dos favoritos.';
      return this.createErrorResponse(errorMessage);
    }
  }
}
