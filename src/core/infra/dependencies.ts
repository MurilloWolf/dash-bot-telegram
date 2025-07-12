import {
  PrismaUserRepository,
  PrismaUserPreferencesRepository,
  PrismaRaceRepository,
} from "./prisma/index.ts";
import { UserService } from "../domain/services/UserService.ts";
import { RaceService } from "../domain/services/RaceService.ts";

// Repositories
export const userRepository = new PrismaUserRepository();
export const userPreferencesRepository = new PrismaUserPreferencesRepository();
export const raceRepository = new PrismaRaceRepository();

// Services
export const userService = new UserService(
  userRepository,
  userPreferencesRepository
);
export const raceService = new RaceService(raceRepository);
