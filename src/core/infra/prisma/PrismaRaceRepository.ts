import {
  Race,
  RaceFilter,
  RaceStatus,
  RaceStatusValue,
} from "../../domain/entities/Race.ts";
import { RaceRepository } from "../../domain/repositories/RaceRepository.ts";
import prisma from "./client.ts";
import type { Race as PrismaRace, Prisma } from "@prisma/client";

export class PrismaRaceRepository implements RaceRepository {
  async findByTitle(title: string): Promise<Race[] | null> {
    const races = await prisma.race.findMany({
      where: {
        title: {
          contains: title,
        },
      },
      orderBy: { date: "asc" },
    });

    if (!races || races.length === 0) {
      return null;
    }

    return races.map((races) => this.mapToEntity(races));
  }

  async findByRange(
    startDistance: number,
    endDistance: number
  ): Promise<Race[]> {
    const races = await this.findAll();

    if (races.length === 0) {
      return Promise.resolve([]);
    }

    const fileteredRaces = races.filter((race) =>
      race.distancesNumbers.some(
        (distance) => distance >= startDistance && distance <= endDistance
      )
    );

    return fileteredRaces;
  }
  async findById(id: string): Promise<Race | null> {
    const race = await prisma.race.findUnique({
      where: { id },
    });

    return race ? this.mapToEntity(race) : null;
  }

  async findAll(filter?: RaceFilter): Promise<Race[]> {
    const where: Prisma.RaceWhereInput = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.startDate || filter?.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = filter.startDate;
      if (filter.endDate) where.date.lte = filter.endDate;
    }

    const races = await prisma.race.findMany({
      where,
      orderBy: { date: "asc" },
    });

    let result = races.map((race) => this.mapToEntity(race));

    // Filter by distances if specified
    if (filter?.distances && filter.distances.length > 0) {
      result = result.filter((race) =>
        race.distancesNumbers.some((distance) =>
          filter.distances!.includes(distance)
        )
      );
    }

    return result;
  }

  async findOpenRaces(): Promise<Race[]> {
    const today = new Date();
    const races = await prisma.race.findMany({
      where: {
        date: { gte: today },
        status: RaceStatus.OPEN,
      },
      orderBy: { date: "asc" },
    });

    return races.map((race) => this.mapToEntity(race));
  }

  async findNextRace(): Promise<Race[] | null> {
    const today = new Date();

    const nextRace = await prisma.race.findFirst({
      where: {
        date: { gte: today },
      },
      orderBy: { date: "asc" },
    });

    if (!nextRace) {
      return null;
    }

    const racesOnSameDate = await prisma.race.findMany({
      where: {
        date: nextRace.date,
      },
      orderBy: { date: "asc" },
    });

    return racesOnSameDate.map((race) => this.mapToEntity(race));
  }

  async findByDistances(distances: number[]): Promise<Race[]> {
    const races = await prisma.race.findMany({
      orderBy: { date: "asc" },
    });

    return races
      .map((race) => this.mapToEntity(race))
      .filter((race) =>
        race.distancesNumbers.some((distance) => distances.includes(distance))
      );
  }

  async create(
    raceData: Omit<Race, "id" | "createdAt" | "updatedAt">
  ): Promise<Race> {
    const race = await prisma.race.create({
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

    return this.mapToEntity(race);
  }

  async update(id: string, raceData: Partial<Race>): Promise<Race> {
    const updateData: Record<string, unknown> = { ...raceData };

    if (raceData.distances) {
      updateData.distances = JSON.stringify(raceData.distances);
    }

    if (raceData.distancesNumbers) {
      updateData.distancesNumbers = JSON.stringify(raceData.distancesNumbers);
    }

    const race = await prisma.race.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(race);
  }

  async delete(id: string): Promise<void> {
    await prisma.race.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: RaceStatusValue): Promise<Race> {
    const race = await prisma.race.update({
      where: { id },
      data: { status },
    });

    return this.mapToEntity(race);
  }

  private mapToEntity(race: PrismaRace): Race {
    return {
      id: race.id,
      title: race.title,
      organization: race.organization,
      distances: JSON.parse(
        typeof race.distances === "string"
          ? race.distances
          : JSON.stringify(race.distances || [])
      ),
      distancesNumbers: JSON.parse(
        typeof race.distancesNumbers === "string"
          ? race.distancesNumbers
          : JSON.stringify(race.distancesNumbers || [])
      ),
      date: race.date,
      location: race.location,
      link: race.link,
      time: race.time,
      status: (race.status || RaceStatus.OPEN) as RaceStatusValue,
      createdAt: race.createdAt,
      updatedAt: race.updatedAt,
    };
  }
}
