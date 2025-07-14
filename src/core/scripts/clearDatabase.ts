import { raceService } from "../infra/dependencies.ts";

async function clearDatabase() {
  console.log("🗑️  Limpando banco de dados...");

  try {
    const allRaces = await raceService.getAllRaces();
    console.log(`Found ${allRaces.length} races to remove.`);

    let deletedCount = 0;
    for (const race of allRaces) {
      try {
        await raceService.deleteRace(race.id);
        console.log(`✅ Removida: ${race.title}`);
        deletedCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Erro ao remover "${race.title}": ${errorMessage}`);
      }
    }

    console.log(`\n🎉 Cleanup completed! ${deletedCount} races removed.`);
  } catch (error) {
    console.error("❌ Erro ao limpar banco:", error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase();
}

export { clearDatabase };
