import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { raceApiService } from '@services/index.ts';
import { RaceFormatter } from '../../../../../utils/formatters/index.ts';
import { logger } from '../../../../../utils/Logger.ts';

export async function nextRacesCommand(
  _input: CommandInput
): Promise<CommandOutput> {
  try {
    const nextRaces = await raceApiService.getNextRace();
    console.info('NEXT RACES', JSON.stringify(nextRaces, null, 2));
    if (!nextRaces || nextRaces.length === 0) {
      return {
        text: '❌ Nenhuma corrida disponível no momento!',
        format: 'HTML',
      };
    }

    return {
      text: RaceFormatter.formatRaceList(nextRaces),
      format: 'HTML',
    };
  } catch (error) {
    logger.commandError(
      'nextRaces',
      error as Error,
      _input.user?.id?.toString()
    );
    return {
      text: '❌ Erro ao buscar próxima corrida. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
