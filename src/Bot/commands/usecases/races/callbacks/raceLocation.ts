import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceLocationCallbackData,
} from '../../../../../types/callbacks/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { raceApiService } from '@services/index.ts';

export class RaceLocationCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'race_location';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceLocationCallbackData;

      // Buscar dados reais da corrida
      const race = await raceApiService.getRaceById(data.raceId);

      if (!race) {
        return this.createErrorResponse('Corrida não encontrada.');
      }

      // Verificar se temos coordenadas
      const latitude = race.latitude || -23.5873; // Fallback para Ibirapuera
      const longitude = race.longitude || -46.6573;
      const city = race.city || '';
      const state = race.state || '';

      // Criar mensagem descritiva elegante do local
      let locationText = `<b>${race.title}</b>\n`;
      locationText += `<i>${race.organization}</i>\n\n`;

      locationText += `<b>Local do Evento</b>\n`;
      locationText += `${race.location}`;

      if (city && state) {
        locationText += `\n<i>${city} - ${state}</i>`;
      }

      if (race.time) {
        locationText += `\n\n<b>Horário</b>\n`;
        locationText += `${race.time}`;
      }

      return {
        text: locationText,
        format: 'HTML',
        location: {
          latitude,
          longitude,
        },
        keyboard: {
          buttons: [
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
      return this.createErrorResponse('Erro ao buscar localização da corrida.');
    }
  }
}
