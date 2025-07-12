import {
  PrismaUserRepository,
  PrismaUserPreferencesRepository,
  PrismaRaceRepository,
  PrismaProductRepository,
  PrismaPaymentRepository,
  PrismaSubscriptionRepository,
  PrismaMessageRepository,
  PrismaChatRepository,
  PrismaMediaRepository,
  PrismaLocationRepository,
} from "./prisma/index.ts";
import { UserService } from "../domain/services/UserService.ts";
import { RaceService } from "../domain/services/RaceService.ts";
import { PaymentService } from "../domain/services/PaymentService.ts";
import { MessageService } from "../domain/services/MessageService.ts";

// Repositories
export const userRepository = new PrismaUserRepository();
export const userPreferencesRepository = new PrismaUserPreferencesRepository();
export const raceRepository = new PrismaRaceRepository();
export const productRepository = new PrismaProductRepository();
export const paymentRepository = new PrismaPaymentRepository();
export const subscriptionRepository = new PrismaSubscriptionRepository();
export const messageRepository = new PrismaMessageRepository();
export const chatRepository = new PrismaChatRepository();
export const mediaRepository = new PrismaMediaRepository();
export const locationRepository = new PrismaLocationRepository();

// Services
export const userService = new UserService(
  userRepository,
  userPreferencesRepository
);
export const raceService = new RaceService(raceRepository);
export const paymentService = new PaymentService(
  paymentRepository,
  productRepository,
  subscriptionRepository
);
export const messageService = new MessageService(
  messageRepository,
  chatRepository,
  mediaRepository,
  locationRepository
);
