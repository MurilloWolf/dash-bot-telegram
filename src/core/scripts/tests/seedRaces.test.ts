import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seedRaces } from '../seedRaces.ts';
import { RaceStatus, type Race } from '../../domain/entities/Race.ts';

// Mock the dependencies
vi.mock('../../infra/dependencies.ts', () => ({
  raceService: {
    getAllRaces: vi.fn(),
    getAvailableRaces: vi.fn(),
    createRace: vi.fn(),
  },
}));

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

describe('seedRaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully seed races when database is empty', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock empty database
    mockRaceService.getAllRaces.mockResolvedValue([]);
    mockRaceService.getAvailableRaces.mockResolvedValue([]);

    // Mock successful race creation
    const mockRaces: Race[] = [
      {
        id: '1',
        title: 'Corrida de São Paulo',
        organization: 'Atletismo SP',
        distances: ['5km', '10km', '21km'],
        distancesNumbers: [5, 10, 21],
        date: new Date('2025-08-15'),
        location: 'Parque Ibirapuera, São Paulo',
        link: 'https://example.com/corrida-sp',
        time: '07:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Corrida de Prudente',
        organization: 'Street Race',
        distances: ['10km'],
        distancesNumbers: [10],
        date: new Date('2025-08-15'),
        location: 'Parque Ibirapuera, São Paulo',
        link: 'https://example.com/corrida-sp',
        time: '07:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Maratona do Rio',
        organization: 'Rio Running',
        distances: ['10km', '21km', '42km'],
        distancesNumbers: [10, 21, 42],
        date: new Date('2025-09-20'),
        location: 'Copacabana, Rio de Janeiro',
        link: 'https://example.com/maratona-rio',
        time: '06:30',
        status: RaceStatus.COMING_SOON,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRaceService.createRace.mockImplementation(race => {
      return Promise.resolve({
        id: String(mockRaces.length + 1),
        title: race.title,
        organization: race.organization,
        distances: race.distances,
        distancesNumbers: race.distancesNumbers,
        date: race.date,
        location: race.location,
        link: race.link,
        time: race.time,
        status: race.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Mock statistics call
    mockRaceService.getAllRaces
      .mockResolvedValueOnce([]) // For initial check
      .mockResolvedValueOnce(mockRaces); // For final statistics
    mockRaceService.getAvailableRaces.mockResolvedValueOnce(
      mockRaces.filter(r => r.status === RaceStatus.OPEN)
    );

    await seedRaces();

    // Verify race creation was called for each race
    expect(mockRaceService.createRace).toHaveBeenCalledTimes(8);
    expect(mockRaceService.createRace).toHaveBeenCalledWith({
      title: 'Corrida de São Paulo',
      organization: 'Atletismo SP',
      distances: ['5km', '10km', '21km'],
      distancesNumbers: [5, 10, 21],
      date: new Date('2025-08-15'),
      location: 'Parque Ibirapuera, São Paulo',
      link: 'https://example.com/corrida-sp',
      time: '07:00',
      status: RaceStatus.OPEN,
    });

    // Verify console logs
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '🌱 Iniciando seed do banco de dados...'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '\n🎉 Seed concluído! 8 corridas criadas com sucesso!'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith('\n📊 Database statistics:');
    expect(mockConsoleLog).toHaveBeenCalledWith('   Total races: 3');
    expect(mockConsoleLog).toHaveBeenCalledWith('   Open races: 2');
  });

  it('should continue seeding when database already has races', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock existing races
    const existingRaces: Race[] = [
      {
        id: 'existing-1',
        title: 'Existing Race 1',
        organization: 'Existing Org',
        distances: ['5km'],
        distancesNumbers: [5],
        date: new Date('2025-01-01'),
        location: 'Existing Location',
        link: 'https://example.com/existing',
        time: '08:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'existing-2',
        title: 'Existing Race 2',
        organization: 'Existing Org 2',
        distances: ['10km'],
        distancesNumbers: [10],
        date: new Date('2025-01-15'),
        location: 'Existing Location 2',
        link: 'https://example.com/existing2',
        time: '09:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockRaceService.getAllRaces.mockResolvedValue(existingRaces);
    mockRaceService.getAvailableRaces.mockResolvedValue([]);

    // Mock successful race creation
    mockRaceService.createRace.mockImplementation(race => {
      return Promise.resolve({
        id: 'new-' + Math.random(),
        title: race.title,
        organization: race.organization,
        distances: race.distances,
        distancesNumbers: race.distancesNumbers,
        date: race.date,
        location: race.location,
        link: race.link,
        time: race.time,
        status: race.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Mock final statistics call
    const finalRaces: Race[] = [
      ...existingRaces,
      {
        id: 'new-1',
        title: 'New Race 1',
        organization: 'New Org',
        distances: ['5km'],
        distancesNumbers: [5],
        date: new Date('2025-02-01'),
        location: 'New Location',
        link: 'https://example.com/new',
        time: '08:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockRaceService.getAllRaces.mockResolvedValueOnce(finalRaces);
    mockRaceService.getAvailableRaces.mockResolvedValueOnce([]);

    await seedRaces();

    // Verify warning message about existing races
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Banco já possui 3 corrida(s). Continuando com o seed...'
    );

    // Verify all races were still created
    expect(mockRaceService.createRace).toHaveBeenCalledTimes(8);
  });

  it('should handle race creation errors gracefully', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock empty database
    mockRaceService.getAllRaces.mockResolvedValue([]);
    mockRaceService.getAvailableRaces.mockResolvedValue([]);

    // Mock some successful and some failed race creations
    const successfulRaces: Race[] = [
      {
        id: '1',
        title: 'Corrida de São Paulo',
        organization: 'Atletismo SP',
        distances: ['5km', '10km', '21km'],
        distancesNumbers: [5, 10, 21],
        date: new Date('2025-08-15'),
        location: 'Parque Ibirapuera, São Paulo',
        link: 'https://example.com/corrida-sp',
        time: '07:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Maratona do Rio',
        organization: 'Rio Running',
        distances: ['10km', '21km', '42km'],
        distancesNumbers: [10, 21, 42],
        date: new Date('2025-09-20'),
        location: 'Copacabana, Rio de Janeiro',
        link: 'https://example.com/maratona-rio',
        time: '06:30',
        status: RaceStatus.COMING_SOON,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        title: 'Maratona Internacional',
        organization: 'World Athletics',
        distances: ['42km'],
        distancesNumbers: [42],
        date: new Date('2025-10-15'),
        location: 'Centro, São Paulo',
        link: 'https://example.com/maratona-internacional',
        time: '06:00',
        status: RaceStatus.COMING_SOON,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRaceService.createRace
      .mockResolvedValueOnce(successfulRaces[0])
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce(successfulRaces[1])
      .mockRejectedValueOnce(new Error('Validation error'))
      .mockResolvedValueOnce(successfulRaces[2]);

    // Mock final statistics call
    mockRaceService.getAllRaces.mockResolvedValueOnce(successfulRaces);
    mockRaceService.getAvailableRaces.mockResolvedValueOnce([]);

    await seedRaces();

    // Verify success messages for successful creations
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '✅ Corrida criada: Corrida de São Paulo'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '✅ Corrida criada: Maratona do Rio'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '✅ Corrida criada: Maratona Internacional'
    );

    // Verify error messages for failed creations
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Erro ao criar "Corrida de Prudente": Database error'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Erro ao criar "Corrida da Primavera": Validation error'
    );

    // Verify final count message
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '\n🎉 Seed concluído! 6 corridas criadas com sucesso!'
    );
  });

  it('should handle non-Error objects in race creation errors', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock empty database
    mockRaceService.getAllRaces.mockResolvedValue([]);
    mockRaceService.getAvailableRaces.mockResolvedValue([]);

    // Mock race creation that throws non-Error object
    mockRaceService.createRace.mockRejectedValueOnce('String error');

    // Mock final statistics call
    mockRaceService.getAllRaces.mockResolvedValueOnce([]);
    mockRaceService.getAvailableRaces.mockResolvedValueOnce([]);

    await seedRaces();

    // Verify error message handles non-Error objects
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Erro ao criar "Corrida de São Paulo": String error'
    );
  });

  it('should handle database connection errors', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock database error during initial getAllRaces call
    mockRaceService.getAllRaces.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    // Execute seedRaces and expect it to throw due to process.exit
    await expect(seedRaces()).rejects.toThrow('process.exit called');

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Erro ao executar seed:',
      new Error('Database connection failed')
    );

    // Verify process.exit was called with error code
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle errors during statistics gathering', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock successful initial flow
    mockRaceService.getAllRaces.mockResolvedValueOnce([]);
    const testRace: Race = {
      id: '1',
      title: 'Test Race',
      organization: 'Test Org',
      distances: ['5km'],
      distancesNumbers: [5],
      date: new Date('2025-01-01'),
      location: 'Test Location',
      link: 'https://example.com/test',
      time: '08:00',
      status: RaceStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRaceService.createRace.mockResolvedValue(testRace);

    // Mock error during final statistics call
    mockRaceService.getAllRaces.mockRejectedValueOnce(
      new Error('Statistics error')
    );

    // Execute seedRaces and expect it to throw due to process.exit
    await expect(seedRaces()).rejects.toThrow('process.exit called');

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Erro ao executar seed:',
      new Error('Statistics error')
    );

    // Verify process.exit was called with error code
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should create races with correct data structure', async () => {
    const { raceService } = await import('../../infra/dependencies.ts');
    const mockRaceService = vi.mocked(raceService);

    // Mock empty database
    mockRaceService.getAllRaces.mockResolvedValue([]);
    mockRaceService.getAvailableRaces.mockResolvedValue([]);

    // Mock successful race creation
    mockRaceService.createRace.mockImplementation(race => {
      return Promise.resolve({
        id: 'test-id',
        title: race.title,
        organization: race.organization,
        distances: race.distances,
        distancesNumbers: race.distancesNumbers,
        date: race.date,
        location: race.location,
        link: race.link,
        time: race.time,
        status: race.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Mock final statistics call
    mockRaceService.getAllRaces.mockResolvedValueOnce([]);
    mockRaceService.getAvailableRaces.mockResolvedValueOnce([]);

    await seedRaces();

    // Verify specific race data structures
    expect(mockRaceService.createRace).toHaveBeenCalledWith({
      title: 'Maratona do Rio',
      organization: 'Rio Running',
      distances: ['10km', '21km', '42km'],
      distancesNumbers: [10, 21, 42],
      date: new Date('2025-09-20'),
      location: 'Copacabana, Rio de Janeiro',
      link: 'https://example.com/maratona-rio',
      time: '06:30',
      status: RaceStatus.COMING_SOON,
    });

    expect(mockRaceService.createRace).toHaveBeenCalledWith({
      title: 'Corrida de São Paulo',
      organization: 'Atletismo SP',
      distances: ['5km', '10km', '21km'],
      distancesNumbers: [5, 10, 21],
      date: new Date('2025-08-15'),
      location: 'Parque Ibirapuera, São Paulo',
      link: 'https://example.com/corrida-sp',
      time: '07:00',
      status: RaceStatus.OPEN,
    });

    expect(mockRaceService.createRace).toHaveBeenCalledWith({
      title: 'Maratona Internacional',
      organization: 'World Athletics',
      distances: ['42km'],
      distancesNumbers: [42],
      date: new Date('2025-10-15'),
      location: 'Centro, São Paulo',
      link: 'https://example.com/maratona-internacional',
      time: '06:00',
      status: RaceStatus.COMING_SOON,
    });
  });
});
