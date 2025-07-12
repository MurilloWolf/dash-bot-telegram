import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { RaceService } from "../RaceService.ts";
import {
  Race,
  RaceFilter,
  RaceStatus,
  RaceStatusValue,
} from "../../entities/Race.ts";
import { RaceRepository } from "../../repositories/RaceRepository.ts";

describe("RaceService", () => {
  let raceService: RaceService;
  let mockRaceRepository: RaceRepository;

  beforeEach(() => {
    mockRaceRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findOpenRaces: vi.fn(),
      findNextRace: vi.fn(),
      findByTitle: vi.fn(),
      findByRange: vi.fn(),
      findByDistances: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateStatus: vi.fn(),
    };

    raceService = new RaceService(mockRaceRepository);
  });

  describe("getAvailableRaces", () => {
    it("should return available races", async () => {
      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida 1",
          organization: "Org 1",
          distances: ["5km"],
          distancesNumbers: [5],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findOpenRaces as Mock).mockResolvedValue(races);

      const result = await raceService.getAvailableRaces();

      expect(mockRaceRepository.findOpenRaces).toHaveBeenCalled();
      expect(result).toEqual(races);
    });

    it("should return empty array when no races are available", async () => {
      (mockRaceRepository.findOpenRaces as Mock).mockResolvedValue([]);

      const result = await raceService.getAvailableRaces();

      expect(mockRaceRepository.findOpenRaces).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("getRacesByDistances", () => {
    it("should return races by distances", async () => {
      const distances = [5, 10, 21];
      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida 1",
          organization: "Org 1",
          distances: ["5km", "10km"],
          distancesNumbers: [5, 10],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findByDistances as Mock).mockResolvedValue(races);

      const result = await raceService.getRacesByDistances(distances);

      expect(mockRaceRepository.findByDistances).toHaveBeenCalledWith(
        distances
      );
      expect(result).toEqual(races);
    });

    it("should return empty array when no races match distances", async () => {
      const distances = [42];

      (mockRaceRepository.findByDistances as Mock).mockResolvedValue([]);

      const result = await raceService.getRacesByDistances(distances);

      expect(mockRaceRepository.findByDistances).toHaveBeenCalledWith(
        distances
      );
      expect(result).toEqual([]);
    });
  });

  describe("getRacesByTitle", () => {
    it("should return races by title", async () => {
      const title = "Corrida São Paulo";
      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida São Paulo 2024",
          organization: "Org 1",
          distances: ["5km"],
          distancesNumbers: [5],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findByTitle as Mock).mockResolvedValue(races);

      const result = await raceService.getRacesByTitle(title);

      expect(mockRaceRepository.findByTitle).toHaveBeenCalledWith(title);
      expect(result).toEqual(races);
    });

    it("should return null when no races match title", async () => {
      const title = "Corrida Inexistente";

      (mockRaceRepository.findByTitle as Mock).mockResolvedValue(null);

      const result = await raceService.getRacesByTitle(title);

      expect(mockRaceRepository.findByTitle).toHaveBeenCalledWith(title);
      expect(result).toBeNull();
    });
  });

  describe("getRacesByRange", () => {
    it("should return races by distance range", async () => {
      const startDistance = 5;
      const endDistance = 21;
      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida 1",
          organization: "Org 1",
          distances: ["10km", "21km"],
          distancesNumbers: [10, 21],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findByRange as Mock).mockResolvedValue(races);

      const result = await raceService.getRacesByRange(
        startDistance,
        endDistance
      );

      expect(mockRaceRepository.findByRange).toHaveBeenCalledWith(
        startDistance,
        endDistance
      );
      expect(result).toEqual(races);
    });

    it("should return empty array when no races match range", async () => {
      const startDistance = 50;
      const endDistance = 100;

      (mockRaceRepository.findByRange as Mock).mockResolvedValue([]);

      const result = await raceService.getRacesByRange(
        startDistance,
        endDistance
      );

      expect(mockRaceRepository.findByRange).toHaveBeenCalledWith(
        startDistance,
        endDistance
      );
      expect(result).toEqual([]);
    });
  });

  describe("getNextRace", () => {
    it("should return next race", async () => {
      const races: Race[] = [
        {
          id: "race-1",
          title: "Próxima Corrida",
          organization: "Org 1",
          distances: ["10km"],
          distancesNumbers: [10],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findNextRace as Mock).mockResolvedValue(races);

      const result = await raceService.getNextRace();

      expect(mockRaceRepository.findNextRace).toHaveBeenCalled();
      expect(result).toEqual(races);
    });

    it("should return null when no next race is available", async () => {
      (mockRaceRepository.findNextRace as Mock).mockResolvedValue(null);

      const result = await raceService.getNextRace();

      expect(mockRaceRepository.findNextRace).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getAllRaces", () => {
    it("should return all races without filter", async () => {
      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida 1",
          organization: "Org 1",
          distances: ["5km"],
          distancesNumbers: [5],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findAll as Mock).mockResolvedValue(races);

      const result = await raceService.getAllRaces();

      expect(mockRaceRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(races);
    });

    it("should return filtered races", async () => {
      const filter: RaceFilter = {
        distances: [5, 10],
        status: RaceStatus.OPEN,
      };

      const races: Race[] = [
        {
          id: "race-1",
          title: "Corrida 1",
          organization: "Org 1",
          distances: ["5km", "10km"],
          distancesNumbers: [5, 10],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRaceRepository.findAll as Mock).mockResolvedValue(races);

      const result = await raceService.getAllRaces(filter);

      expect(mockRaceRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(races);
    });
  });

  describe("getRaceById", () => {
    it("should return race by id", async () => {
      const raceId = "race-123";
      const race: Race = {
        id: raceId,
        title: "Corrida Específica",
        organization: "Org 1",
        distances: ["10km"],
        distancesNumbers: [10],
        date: new Date("2024-12-25"),
        location: "São Paulo",
        link: "https://example.com",
        time: "07:00",
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRaceRepository.findById as Mock).mockResolvedValue(race);

      const result = await raceService.getRaceById(raceId);

      expect(mockRaceRepository.findById).toHaveBeenCalledWith(raceId);
      expect(result).toEqual(race);
    });

    it("should return null when race does not exist", async () => {
      const raceId = "race-inexistente";

      (mockRaceRepository.findById as Mock).mockResolvedValue(null);

      const result = await raceService.getRaceById(raceId);

      expect(mockRaceRepository.findById).toHaveBeenCalledWith(raceId);
      expect(result).toBeNull();
    });
  });

  describe("createRace", () => {
    it("should create a new race", async () => {
      const raceData: Omit<Race, "id" | "createdAt" | "updatedAt"> = {
        title: "Nova Corrida",
        organization: "Org 1",
        distances: ["5km", "10km"],
        distancesNumbers: [5, 10],
        date: new Date("2024-12-25"),
        location: "São Paulo",
        link: "https://example.com",
        time: "07:00",
        status: RaceStatus.OPEN,
      };

      const createdRace: Race = {
        id: "race-123",
        ...raceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRaceRepository.create as Mock).mockResolvedValue(createdRace);

      const result = await raceService.createRace(raceData);

      expect(mockRaceRepository.create).toHaveBeenCalledWith(raceData);
      expect(result).toEqual(createdRace);
    });
  });

  describe("updateRaceStatus", () => {
    it("should update race status", async () => {
      const raceId = "race-123";
      const status: RaceStatusValue = RaceStatus.CLOSED;

      const updatedRace: Race = {
        id: raceId,
        title: "Corrida Fechada",
        organization: "Org 1",
        distances: ["10km"],
        distancesNumbers: [10],
        date: new Date("2024-12-25"),
        location: "São Paulo",
        link: "https://example.com",
        time: "07:00",
        status: RaceStatus.CLOSED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRaceRepository.updateStatus as Mock).mockResolvedValue(updatedRace);

      const result = await raceService.updateRaceStatus(raceId, status);

      expect(mockRaceRepository.updateStatus).toHaveBeenCalledWith(
        raceId,
        status
      );
      expect(result).toEqual(updatedRace);
    });

    it("should handle different status values", async () => {
      const raceId = "race-123";
      const statuses: RaceStatusValue[] = [
        RaceStatus.OPEN,
        RaceStatus.CLOSED,
        RaceStatus.COMING_SOON,
        RaceStatus.CANCELLED,
      ];

      for (const status of statuses) {
        const updatedRace: Race = {
          id: raceId,
          title: "Corrida Teste",
          organization: "Org 1",
          distances: ["10km"],
          distancesNumbers: [10],
          date: new Date("2024-12-25"),
          location: "São Paulo",
          link: "https://example.com",
          time: "07:00",
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (mockRaceRepository.updateStatus as Mock).mockResolvedValue(
          updatedRace
        );

        const result = await raceService.updateRaceStatus(raceId, status);

        expect(mockRaceRepository.updateStatus).toHaveBeenCalledWith(
          raceId,
          status
        );
        expect(result.status).toBe(status);
      }
    });
  });

  describe("deleteRace", () => {
    it("should delete a race", async () => {
      const raceId = "race-123";

      (mockRaceRepository.delete as Mock).mockResolvedValue(undefined);

      await raceService.deleteRace(raceId);

      expect(mockRaceRepository.delete).toHaveBeenCalledWith(raceId);
    });
  });
});
