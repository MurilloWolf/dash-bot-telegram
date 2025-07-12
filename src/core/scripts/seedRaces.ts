import { raceService } from "../infra/dependencies.ts";
import { RaceStatus } from "../domain/entities/Race.ts";

async function seedRaces() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const races = [
    {
      title: "Corrida de São Paulo",
      organization: "Atletismo SP",
      distances: ["5km", "10km", "21km"],
      distancesNumbers: [5, 10, 21],
      date: new Date("2025-08-15"),
      location: "Parque Ibirapuera, São Paulo",
      link: "https://example.com/corrida-sp",
      time: "07:00",
      status: RaceStatus.OPEN,
    },
    {
      title: "Corrida de Prudente",
      organization: "Street Race",
      distances: ["10km"],
      distancesNumbers: [10],
      date: new Date("2025-08-15"),
      location: "Parque Ibirapuera, São Paulo",
      link: "https://example.com/corrida-sp",
      time: "07:00",
      status: RaceStatus.OPEN,
    },
    {
      title: "Maratona do Rio",
      organization: "Rio Running",
      distances: ["10km", "21km", "42km"],
      distancesNumbers: [10, 21, 42],
      date: new Date("2025-09-20"),
      location: "Copacabana, Rio de Janeiro",
      link: "https://example.com/maratona-rio",
      time: "06:30",
      status: RaceStatus.COMING_SOON,
    },
    {
      title: "Corrida da Primavera",
      organization: "Verde Running",
      distances: ["5km", "10km"],
      distancesNumbers: [5, 10],
      date: new Date("2025-07-23"),
      location: "Parque da Cidade, Brasília",
      link: "https://example.com/corrida-primavera",
      time: "06:00",
      status: RaceStatus.OPEN,
    },
    {
      title: "Desafio da Serra",
      organization: "Trail Brasil",
      distances: ["15km", "30km"],
      distancesNumbers: [15, 30],
      date: new Date("2025-07-20"),
      location: "Serra da Mantiqueira, MG",
      link: "https://example.com/desafio-serra",
      time: "05:30",
      status: RaceStatus.OPEN,
    },
    {
      title: "Desafio da Serra2",
      organization: "Trail Brasil",
      distances: ["15km", "30km"],
      distancesNumbers: [15, 30],
      date: new Date("2025-07-20"),
      location: "Serra da Mantiqueira, MG",
      link: "https://example.com/desafio-serra",
      time: "05:30",
      status: RaceStatus.OPEN,
    },
    {
      title: "Corrida Noturna",
      organization: "Night Runners",
      distances: ["5km", "10km"],
      distancesNumbers: [5, 10],
      date: new Date("2025-08-01"),
      location: "Aterro do Flamengo, RJ",
      link: "https://example.com/corrida-noturna",
      time: "19:00",
      status: RaceStatus.OPEN,
    },
    {
      title: "Maratona Internacional",
      organization: "World Athletics",
      distances: ["42km"],
      distancesNumbers: [42],
      date: new Date("2025-10-15"),
      location: "Centro, São Paulo",
      link: "https://example.com/maratona-internacional",
      time: "06:00",
      status: RaceStatus.COMING_SOON,
    },
  ];

  try {
    // Check if races already exist
    const existingRaces = await raceService.getAllRaces();
    if (existingRaces.length > 0) {
      console.log(
        `⚠️  Banco já possui ${existingRaces.length} corrida(s). Continuando com o seed...`
      );
    }

    let createdCount = 0;
    for (const race of races) {
      try {
        const createdRace = await raceService.createRace(race);
        console.log(`✅ Corrida criada: ${createdRace.title}`);
        createdCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Erro ao criar "${race.title}": ${errorMessage}`);
      }
    }

    console.log(
      `\n🎉 Seed concluído! ${createdCount} corridas criadas com sucesso!`
    );

    // Show statistics
    const totalRaces = await raceService.getAllRaces();
    const openRaces = await raceService.getAvailableRaces();

    console.log(`\n📊 Estatísticas do banco:`);
    console.log(`   Total de corridas: ${totalRaces.length}`);
    console.log(`   Corridas abertas: ${openRaces.length}`);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRaces();
}

export { seedRaces };
