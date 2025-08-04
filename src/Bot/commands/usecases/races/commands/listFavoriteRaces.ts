import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';
import { favoriteApiService } from '@services/index.ts';
import { logger } from '../../../../../utils/Logger.ts';

export async function listFavoriteRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    const telegramId = input.user?.id?.toString();

    if (!telegramId) {
      return {
        text: '❌ ID do usuário não encontrado.',
        format: 'HTML',
      };
    }

    const favoriteRaces =
      await favoriteApiService.getUserFavoriteRaces(telegramId);

    if (favoriteRaces.length === 0) {
      return {
        text: '📝 <b>Suas Corridas Favoritas</b>\n\n❌ Você ainda não tem corridas favoritas!\n\n💡 Para favoritar uma corrida, use o comando /corridas e clique no botão ⭐ de uma corrida.',
        format: 'HTML',
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
          text: 'Ver Todas as Corridas',
          callbackData: CallbackDataSerializer.racesList(),
        },
      ],
    ];

    return {
      text: `⭐ <strong>Suas Corridas Favoritas</strong> (${favoriteRaces.length})\n\nSelecione uma corrida para ver mais detalhes:`,
      format: 'HTML',
      keyboard: {
        buttons: [...raceButtons, ...navigationButtons],
        inline: true,
      },
    };
  } catch (error) {
    logger.error('Failed to fetch favorite races', {
      module: 'RaceCommands',
      action: 'listFavoriteRaces',
      userId: input.user?.id?.toString() || 'unknown',
      error: String(error),
    });
    return {
      text: '❌ Erro ao buscar corridas favoritas. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
