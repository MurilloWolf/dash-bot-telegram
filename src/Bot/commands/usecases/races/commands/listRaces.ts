import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { raceApiService } from '@services/index.ts';
import { RaceFormatter } from '../../../../../utils/formatters/index.ts';
import { logger } from '../../../../../utils/Logger.ts';

export async function listRacesCommand(
  _input: CommandInput
): Promise<CommandOutput> {
  try {
    const races = await raceApiService.getAvailableRaces();

    if (races.length === 0) {
      return {
        text: '❌ Nenhuma corrida disponível no momento!',
        format: 'HTML',
      };
    }

    const raceButtons = races.slice(0, 10).map(race => [
      {
        text: `🏃‍♂️ ${race.title} - ${race.distances.join('/')}`,
        callbackData: CallbackDataSerializer.raceDetails(race.id),
      },
    ]);

    const filterButtons = [
      [
        {
          text: '5km a 8km',
          callbackData: CallbackDataSerializer.racesFilter(5),
        },
        {
          text: '10km a 20km',
          callbackData: CallbackDataSerializer.racesFilter(10),
        },
        { text: '21km', callbackData: CallbackDataSerializer.racesFilter(21) },
        { text: '42km', callbackData: CallbackDataSerializer.racesFilter(42) },
      ],
      [
        {
          text: '📋 Ver Todas',
          callbackData: CallbackDataSerializer.racesList(),
        },
      ],
    ];

    return {
      text: `🏃‍♂️ <strong>Corridas Disponíveis</strong>\n\n📌 Selecione uma corrida para ver mais detalhes ou use os filtros por distância:`,
      format: 'HTML',
      keyboard: {
        buttons: [...raceButtons, ...filterButtons],
        inline: true,
      },
    };
  } catch (error) {
    logger.error('Failed to fetch races', {
      module: 'RaceCommands',
      action: 'listRaces',
      error: String(error),
    });
    return {
      text: '❌ Erro ao buscar corridas. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}

export async function listRacesByDistanceCommand(
  input: CommandInput,
  distance: number
): Promise<CommandOutput> {
  try {
    const races = await raceApiService.getRacesByDistance(distance);

    if (races.length === 0) {
      return {
        text: `❌ Nenhuma corrida encontrada para a distância: ${distance}km`,
        format: 'HTML',
      };
    }

    const raceMessages = races.map(race =>
      RaceFormatter.formatRaceMessage(race)
    );

    return {
      messages: raceMessages,
      text: raceMessages.join('\n\n───────────────────\n\n'),
      format: 'HTML',
    };
  } catch (error) {
    logger.error('Failed to fetch races by distance', {
      module: 'RaceCommands',
      action: 'listRacesByDistance',
      distance: input.args?.[0] || 'unknown',
      error: String(error),
    });
    return {
      text: '❌ Erro ao buscar corridas. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
