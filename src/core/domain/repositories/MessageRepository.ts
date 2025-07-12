import { Message, Chat, Media, Location } from "../entities/Message.ts";

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByTelegramId(telegramId: bigint): Promise<Message | null>;
  findByUserId(userId: string): Promise<Message[]>;
  findByChatId(chatId: string): Promise<Message[]>;
  create(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">
  ): Promise<Message>;
  update(id: string, message: Partial<Message>): Promise<Message>;
  delete(id: string): Promise<void>;
  markAsDeleted(id: string): Promise<Message>;
}

export interface ChatRepository {
  findById(id: string): Promise<Chat | null>;
  findByTelegramId(telegramId: string): Promise<Chat | null>;
  findAll(): Promise<Chat[]>;
  create(chat: Omit<Chat, "id" | "createdAt" | "updatedAt">): Promise<Chat>;
  update(id: string, chat: Partial<Chat>): Promise<Chat>;
  delete(id: string): Promise<void>;
}

export interface MediaRepository {
  findById(id: string): Promise<Media | null>;
  findByTelegramId(telegramId: string): Promise<Media | null>;
  findByMessageId(messageId: string): Promise<Media[]>;
  create(media: Omit<Media, "id">): Promise<Media>;
  update(id: string, media: Partial<Media>): Promise<Media>;
  delete(id: string): Promise<void>;
}

export interface LocationRepository {
  findById(id: string): Promise<Location | null>;
  findByMessageId(messageId: string): Promise<Location | null>;
  create(location: Omit<Location, "id">): Promise<Location>;
  update(id: string, location: Partial<Location>): Promise<Location>;
  delete(id: string): Promise<void>;
}
