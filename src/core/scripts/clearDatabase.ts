import { raceService } from '../infra/dependencies.ts';
import { logger } from '../../utils/Logger.ts';

async function clearDatabase() {
  logger.scriptStart('clearDatabase', 'Limpando banco de dados');

  try {
    const allRaces = await raceService.getAllRaces();
    logger.info(`Found ${allRaces.length} races to remove`, {
      module: 'ClearDatabase',
      action: 'found_races',
      count: allRaces.length,
    });

    let deletedCount = 0;
    for (const race of allRaces) {
      try {
        await raceService.deleteRace(race.id);
        logger.raceOperation('deleted', race.id, race.title);
        deletedCount++;
      } catch (error) {
        logger.raceError('delete', error as Error, race.id, race.title);
      }
    }

    logger.scriptComplete('clearDatabase', {
      deletedCount,
      totalRaces: allRaces.length,
    });
  } catch (error) {
    logger.scriptError('clearDatabase', error as Error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase();
}

export { clearDatabase };
