import { Race, RaceFilter } from "../entities/Race.ts";

export interface RaceRepository {
  findById(id: string): Promise<Race | null>;
  findAll(filter?: RaceFilter): Promise<Race[]>;
  findOpenRaces(): Promise<Race[]>;
  findNextRace(): Promise<Race[] | null>;
  findByTitle(title: string): Promise<Race[] | null>;
  findByRange(startDistance: number, endDistance: number): Promise<Race[]>;
  findByDistances(distances: number[]): Promise<Race[]>;
  create(race: Omit<Race, "id" | "createdAt" | "updatedAt">): Promise<Race>;
  update(id: string, race: Partial<Race>): Promise<Race>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<Race>;
}
