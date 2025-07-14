import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceLocationCallbackData,
} from '../../../../../types/callbacks/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';

export class RaceLocationCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_location';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceLocationCallbackData;

      // Here you would fetch race location information
      // For example, GPS coordinates, address, map, etc.

      return {
        text: `📍 <strong>Localização da Corrida</strong>\n\n🗺️ Informações de localização serão exibidas aqui.\n\n💡 Em breve você poderá ver mapas e rotas!`,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [
            [{ text: '🗺️ Abrir no Maps', url: 'https://maps.google.com' }],
            [
              this.createBackButton(
                CallbackDataSerializer.raceDetails(data.raceId)
              ),
            ],
          ],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, 'RaceLocationCallbackHandler');
      return this.createErrorResponse('Erro ao buscar localização.');
    }
  }
}
