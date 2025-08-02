import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  CallbackData,
  RaceSearchCallbackData,
} from '@app-types/callbacks/index.ts';
import { raceApiService } from '@services/index.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';
import { logger } from '../../../../../utils/Logger.ts';

/**
 * Handler para busca de corridas por distância
 */
export class RaceSearchCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'races_search';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceSearchCallbackData;
      const { startDistance, endDistance } = data;

      const races = await raceApiService.getRacesByRange(
        startDistance,
        endDistance
      );

      if (races && races.length === 0) {
        return {
          text: `❌ Nenhuma corrida encontrada para a distância entre ${startDistance}km e ${endDistance}km.`,
          format: 'HTML',
          editMessage: true,
          keyboard: {
            buttons: [
              [
                {
                  text: '⬅️ Voltar',
                  callbackData: CallbackDataSerializer.racesSearchMenu(),
                },
              ],
            ],
            inline: true,
          },
        };
      }

      const raceButtons = races.map(race => [
        {
          text: `🏃‍♂️ ${race.title} - ${race.distances.join('/')}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id),
        },
      ]);

      const navigationButtons = [
        [
          {
            text: '⬅️ Voltar',
            callbackData: CallbackDataSerializer.racesSearchMenu(),
          },
        ],
      ];

      return {
        text: `🏃‍♂️ <strong>Corridas Encontradas</strong>\n\nEncontradas ${races.length} corrida(s) entre ${startDistance}km e ${endDistance}km:`,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [...raceButtons, ...navigationButtons],
          inline: true,
        },
      };
    } catch (error) {
      logger.error('Failed to search races in callback', {
        module: 'RaceCallbacks',
        action: 'raceSearchCallback',
        error: String(error),
      });
      return {
        text: '❌ Erro ao buscar corridas.',
        format: 'HTML',
        editMessage: true,
      };
    }
  }
}
