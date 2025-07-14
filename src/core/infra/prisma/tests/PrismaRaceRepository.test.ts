import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaRaceRepository } from "../PrismaRaceRepository.ts";
import { RaceStatus } from "../../../domain/entities/Race.ts";
import prisma from "../client.ts";
import type {
  Race as PrismaRace,
  RaceStatus as PrismaRaceStatus,
} from "@prisma/client";

// Mock Prisma client
vi.mock("../client.ts", () => ({
  default: {
    race: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PrismaRaceRepository", () => {
  let repository: PrismaRaceRepository;
  let mockRace: PrismaRace;

  beforeEach(() => {
    repository = new PrismaRaceRepository();
    vi.clearAllMocks();

    mockRace = {
      id: "race-id",
      title: "Test Race",
      organization: "Test Organization",
      distances: JSON.stringify(["5K", "10K"]), // Keep as string for compatibility
      distancesNumbers: JSON.stringify([5, 10]), // Keep as string for compatibility
      date: new Date("2024-01-15"),
      location: "Test Location",
      link: "https://test.com",
      time: "08:00",
      status: "OPEN" as PrismaRaceStatus, // Type assertion for enum compatibility
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    } as PrismaRace;
  });

  describe("findByTitle", () => {
    it("should find races by title", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findByTitle("Test Race");

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: {
          title: {
            contains: "Test Race",
          },
        },
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
      expect(result![0].title).toBe("Test Race");
    });

    it("should return null if no races found", async () => {
      vi.mocked(prisma.race.findMany).mockResolvedValue([]);

      const result = await repository.findByTitle("Non-existent Race");

      expect(result).toBeNull();
    });

    it("should return null if races is null", async () => {
      // @ts-expect-error - mocking null return
      vi.mocked(prisma.race.findMany).mockResolvedValue(null);

      const result = await repository.findByTitle("Test Race");

      expect(result).toBeNull();
    });
  });

  describe("findByRange", () => {
    it("should find races within distance range", async () => {
      // Mock findAll to return races
      vi.spyOn(repository, "findAll").mockResolvedValue([
        {
          ...mockRace,
          distances: ["5K", "10K", "21K"],
          distancesNumbers: [5, 10, 21],
          status: RaceStatus.OPEN,
        },
      ]);

      const result = await repository.findByRange(5, 15);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Race");
    });

    it("should return empty array if no races found", async () => {
      vi.spyOn(repository, "findAll").mockResolvedValue([]);

      const result = await repository.findByRange(5, 15);

      expect(result).toEqual([]);
    });

    it("should filter races by distance range", async () => {
      vi.spyOn(repository, "findAll").mockResolvedValue([
        {
          ...mockRace,
          distances: ["5K", "10K"],
          distancesNumbers: [5, 10],
          status: RaceStatus.OPEN,
        },
        {
          ...mockRace,
          id: "race-id-2",
          distances: ["21K", "42K"],
          distancesNumbers: [21, 42],
          status: RaceStatus.OPEN,
        },
      ]);

      const result = await repository.findByRange(5, 15);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("race-id");
    });
  });

  describe("findById", () => {
    it("should find race by id", async () => {
      vi.mocked(prisma.race.findUnique).mockResolvedValue(mockRace);

      const result = await repository.findById("race-id");

      expect(prisma.race.findUnique).toHaveBeenCalledWith({
        where: { id: "race-id" },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe("race-id");
    });

    it("should return null if race not found", async () => {
      vi.mocked(prisma.race.findUnique).mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all races without filter", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findAll();

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });

    it("should filter by status", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findAll({ status: RaceStatus.OPEN });

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: { status: RaceStatus.OPEN },
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });

    it("should filter by date range", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      const result = await repository.findAll({ startDate, endDate });

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });

    it("should filter by distances", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findAll({ distances: [5, 10] });

      expect(result).toHaveLength(1);
    });

    it("should filter by distances and exclude non-matching", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findAll({ distances: [21, 42] });

      expect(result).toHaveLength(0);
    });
  });

  describe("findOpenRaces", () => {
    it("should find open races", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findOpenRaces();

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: {
          date: { gte: expect.any(Date) },
          status: RaceStatus.OPEN,
        },
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("findNextRace", () => {
    it("should find next race", async () => {
      const nextRaceDate = new Date("2024-01-15");
      const mockNextRace = { ...mockRace, date: nextRaceDate };
      const mockRacesOnSameDate = [mockNextRace];

      vi.mocked(prisma.race.findFirst).mockResolvedValue(mockNextRace);
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRacesOnSameDate);

      const result = await repository.findNextRace();

      expect(prisma.race.findFirst).toHaveBeenCalledWith({
        where: {
          date: { gte: expect.any(Date) },
        },
        orderBy: { date: "asc" },
      });

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        where: {
          date: nextRaceDate,
        },
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });

    it("should return null if no next race found", async () => {
      vi.mocked(prisma.race.findFirst).mockResolvedValue(null);

      const result = await repository.findNextRace();

      expect(result).toBeNull();
    });
  });

  describe("findByDistances", () => {
    it("should find races by distances", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findByDistances([5, 10]);

      expect(prisma.race.findMany).toHaveBeenCalledWith({
        orderBy: { date: "asc" },
      });

      expect(result).toHaveLength(1);
    });

    it("should filter races by distances", async () => {
      const mockRaces = [mockRace];
      vi.mocked(prisma.race.findMany).mockResolvedValue(mockRaces);

      const result = await repository.findByDistances([21, 42]);

      expect(result).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create a race", async () => {
      const raceData = {
        title: "New Race",
        organization: "New Organization",
        distances: ["5K", "10K"],
        distancesNumbers: [5, 10],
        date: new Date("2024-01-15"),
        location: "New Location",
        link: "https://new.com",
        time: "09:00",
        status: RaceStatus.OPEN,
      };

      vi.mocked(prisma.race.create).mockResolvedValue({
        ...mockRace,
        title: raceData.title,
        organization: raceData.organization,
        distances: JSON.stringify(raceData.distances),
        distancesNumbers: JSON.stringify(raceData.distancesNumbers),
        date: raceData.date,
        location: raceData.location,
        link: raceData.link,
        time: raceData.time,
        status: raceData.status,
      });

      const result = await repository.create(raceData);

      expect(prisma.race.create).toHaveBeenCalledWith({
        data: {
          title: raceData.title,
          organization: raceData.organization,
          distances: JSON.stringify(raceData.distances),
          distancesNumbers: JSON.stringify(raceData.distancesNumbers),
          date: raceData.date,
          location: raceData.location,
          link: raceData.link,
          time: raceData.time,
          status: raceData.status,
        },
      });

      expect(result.title).toBe(raceData.title);
    });
  });

  describe("update", () => {
    it("should update a race", async () => {
      const updateData = {
        title: "Updated Race",
        distances: ["5K", "10K", "21K"],
        distancesNumbers: [5, 10, 21],
      };

      vi.mocked(prisma.race.update).mockResolvedValue({
        ...mockRace,
        title: updateData.title,
        distances: JSON.stringify(updateData.distances),
        distancesNumbers: JSON.stringify(updateData.distancesNumbers),
      });

      const result = await repository.update("race-id", updateData);

      expect(prisma.race.update).toHaveBeenCalledWith({
        where: { id: "race-id" },
        data: {
          title: updateData.title,
          distances: JSON.stringify(updateData.distances),
          distancesNumbers: JSON.stringify(updateData.distancesNumbers),
        },
      });

      expect(result.title).toBe(updateData.title);
    });

    it("should update without distances", async () => {
      const updateData = {
        title: "Updated Race",
      };

      vi.mocked(prisma.race.update).mockResolvedValue({
        ...mockRace,
        title: updateData.title,
      });

      const result = await repository.update("race-id", updateData);

      expect(prisma.race.update).toHaveBeenCalledWith({
        where: { id: "race-id" },
        data: {
          title: updateData.title,
        },
      });

      expect(result.title).toBe(updateData.title);
    });
  });

  describe("delete", () => {
    it("should delete a race", async () => {
      vi.mocked(prisma.race.delete).mockResolvedValue(mockRace);

      await repository.delete("race-id");

      expect(prisma.race.delete).toHaveBeenCalledWith({
        where: { id: "race-id" },
      });
    });
  });

  describe("updateStatus", () => {
    it("should update race status", async () => {
      const updatedRace = {
        ...mockRace,
        status: RaceStatus.CLOSED,
      };

      vi.mocked(prisma.race.update).mockResolvedValue(updatedRace);

      const result = await repository.updateStatus(
        "race-id",
        RaceStatus.CLOSED
      );

      expect(prisma.race.update).toHaveBeenCalledWith({
        where: { id: "race-id" },
        data: { status: RaceStatus.CLOSED },
      });

      expect(result.status).toBe(RaceStatus.CLOSED);
    });
  });

  describe("mapToEntity", () => {
    it("should map prisma race to entity", () => {
      const prismaRace = {
        ...mockRace,
        distances: JSON.stringify(["5K", "10K"]),
        distancesNumbers: JSON.stringify([5, 10]),
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaRace);

      expect(result).toEqual({
        id: mockRace.id,
        title: mockRace.title,
        organization: mockRace.organization,
        distances: ["5K", "10K"],
        distancesNumbers: [5, 10],
        date: mockRace.date,
        location: mockRace.location,
        link: mockRace.link,
        time: mockRace.time,
        status: mockRace.status,
        createdAt: mockRace.createdAt,
        updatedAt: mockRace.updatedAt,
      });
    });

    it("should handle null distances", () => {
      const prismaRace = {
        ...mockRace,
        distances: null,
        distancesNumbers: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaRace);

      expect(result.distances).toEqual([]);
      expect(result.distancesNumbers).toEqual([]);
    });

    it("should handle null status", () => {
      const prismaRace = {
        ...mockRace,
        status: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaRace);

      expect(result.status).toBe(RaceStatus.OPEN);
    });
  });
});
