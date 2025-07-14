import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { raceService } from '@core/infra/dependencies.ts';
import { logger } from '../../../../../utils/Logger.ts';

export async function searchRacesCommand(
  _input: CommandInput
): Promise<CommandOutput> {
  try {
    const races = await raceService.getAvailableRaces();

    if (races.length === 0) {
      return {
        text: '❌ Nenhuma corrida disponível no momento!',
        format: 'HTML',
      };
    }

    const filterButtons = [
      [
        {
          text: '5km a 9km',
          callbackData: CallbackDataSerializer.racesSearch(5, 9),
        },
      ],
      [
        {
          text: '10km a 20km',
          callbackData: CallbackDataSerializer.racesSearch(10, 20),
        },
      ],
      [{ text: '21km', callbackData: CallbackDataSerializer.racesFilter(21) }],
      [{ text: '42km', callbackData: CallbackDataSerializer.racesFilter(42) }],
      [
        {
          text: '📋 Ver Todas',
          callbackData: CallbackDataSerializer.racesList(),
        },
      ],
    ];

    return {
      text: `🏃‍♂️ <strong>Próximas corridas</strong>\n\n📌 Selecione uma corrida para ver mais detalhes ou use os filtros por distância:`,
      format: 'HTML',
      keyboard: {
        buttons: [...filterButtons],
        inline: true,
      },
    };
  } catch (error) {
    logger.error('Failed to search races', {
      module: 'RaceCommands',
      action: 'searchRaces',
      error: String(error),
    });
    return {
      text: '❌ Erro ao buscar corridas. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
