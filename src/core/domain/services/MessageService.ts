import { Message, Chat, Media, Location } from "../entities/Message.ts";
import {
  MessageRepository,
  ChatRepository,
  MediaRepository,
  LocationRepository,
} from "../repositories/MessageRepository.ts";

export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private chatRepository: ChatRepository,
    private mediaRepository: MediaRepository,
    private locationRepository: LocationRepository
  ) {}

  async getMessageById(id: string): Promise<Message | null> {
    return this.messageRepository.findById(id);
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return this.messageRepository.findByUserId(userId);
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageRepository.findByChatId(chatId);
  }

  async createMessage(
    messageData: Omit<Message, "id" | "createdAt" | "updatedAt">
  ): Promise<Message> {
    return this.messageRepository.create(messageData);
  }

  async updateMessage(
    id: string,
    messageData: Partial<Message>
  ): Promise<Message> {
    return this.messageRepository.update(id, messageData);
  }

  async deleteMessage(id: string): Promise<Message> {
    return this.messageRepository.markAsDeleted(id);
  }

  async getChatById(id: string): Promise<Chat | null> {
    return this.chatRepository.findById(id);
  }

  async getChatByTelegramId(telegramId: string): Promise<Chat | null> {
    return this.chatRepository.findByTelegramId(telegramId);
  }

  async createChat(
    chatData: Omit<Chat, "id" | "createdAt" | "updatedAt">
  ): Promise<Chat> {
    return this.chatRepository.create(chatData);
  }

  async updateChat(id: string, chatData: Partial<Chat>): Promise<Chat> {
    return this.chatRepository.update(id, chatData);
  }

  async getMediaByMessageId(messageId: string): Promise<Media[]> {
    return this.mediaRepository.findByMessageId(messageId);
  }

  async createMedia(mediaData: Omit<Media, "id">): Promise<Media> {
    return this.mediaRepository.create(mediaData);
  }

  async getLocationByMessageId(messageId: string): Promise<Location | null> {
    return this.locationRepository.findByMessageId(messageId);
  }

  async createLocation(locationData: Omit<Location, "id">): Promise<Location> {
    return this.locationRepository.create(locationData);
  }
}
