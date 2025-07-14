import {
  Message,
  Chat,
  Media,
  Location,
  MessageDirectionValue,
  MessageTypeValue,
  ChatTypeValue,
  MediaTypeValue,
} from '../../domain/entities/Message.ts';
import {
  MessageRepository,
  ChatRepository,
  MediaRepository,
  LocationRepository,
} from '../../domain/repositories/MessageRepository.ts';
import prisma from './client.ts';
import type {
  Message as PrismaMessage,
  Chat as PrismaChat,
  Media as PrismaMedia,
  Location as PrismaLocation,
} from '@prisma/client';

export class PrismaMessageRepository implements MessageRepository {
  async findById(id: string): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id },
    });

    return message ? this.mapToEntity(message) : null;
  }

  async findByTelegramId(telegramId: bigint): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { telegramId },
    });

    return message ? this.mapToEntity(message) : null;
  }

  async findByUserId(userId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map(message => this.mapToEntity(message));
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map(message => this.mapToEntity(message));
  }

  async create(
    messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Message> {
    const message = await prisma.message.create({
      data: messageData,
    });

    return this.mapToEntity(message);
  }

  async update(id: string, messageData: Partial<Message>): Promise<Message> {
    const message = await prisma.message.update({
      where: { id },
      data: messageData,
    });

    return this.mapToEntity(message);
  }

  async delete(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  }

  async markAsDeleted(id: string): Promise<Message> {
    const message = await prisma.message.update({
      where: { id },
      data: { isDeleted: true },
    });

    return this.mapToEntity(message);
  }

  private mapToEntity(message: PrismaMessage): Message {
    return {
      id: message.id,
      telegramId: message.telegramId,
      text: message.text || undefined,
      direction: message.direction as MessageDirectionValue,
      type: message.type as MessageTypeValue,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      editedAt: message.editedAt || undefined,
      isDeleted: message.isDeleted,
      userId: message.userId || undefined,
      chatId: message.chatId || undefined,
      replyToId: message.replyToId || undefined,
    };
  }
}

export class PrismaChatRepository implements ChatRepository {
  async findById(id: string): Promise<Chat | null> {
    const chat = await prisma.chat.findUnique({
      where: { id },
    });

    return chat ? this.mapToEntity(chat) : null;
  }

  async findByTelegramId(telegramId: string): Promise<Chat | null> {
    const chat = await prisma.chat.findUnique({
      where: { telegramId },
    });

    return chat ? this.mapToEntity(chat) : null;
  }

  async findAll(): Promise<Chat[]> {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return chats.map(chat => this.mapToEntity(chat));
  }

  async create(
    chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Chat> {
    const chat = await prisma.chat.create({
      data: chatData,
    });

    return this.mapToEntity(chat);
  }

  async update(id: string, chatData: Partial<Chat>): Promise<Chat> {
    const chat = await prisma.chat.update({
      where: { id },
      data: chatData,
    });

    return this.mapToEntity(chat);
  }

  async delete(id: string): Promise<void> {
    await prisma.chat.delete({
      where: { id },
    });
  }

  private mapToEntity(chat: PrismaChat): Chat {
    return {
      id: chat.id,
      telegramId: chat.telegramId,
      type: chat.type as ChatTypeValue,
      title: chat.title || undefined,
      username: chat.username || undefined,
      memberCount: chat.memberCount || undefined,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}

export class PrismaMediaRepository implements MediaRepository {
  async findById(id: string): Promise<Media | null> {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    return media ? this.mapToEntity(media) : null;
  }

  async findByTelegramId(telegramId: string): Promise<Media | null> {
    const media = await prisma.media.findUnique({
      where: { telegramId },
    });

    return media ? this.mapToEntity(media) : null;
  }

  async findByMessageId(messageId: string): Promise<Media[]> {
    const medias = await prisma.media.findMany({
      where: { messageId },
    });

    return medias.map(media => this.mapToEntity(media));
  }

  async create(mediaData: Omit<Media, 'id'>): Promise<Media> {
    const media = await prisma.media.create({
      data: mediaData,
    });

    return this.mapToEntity(media);
  }

  async update(id: string, mediaData: Partial<Media>): Promise<Media> {
    const media = await prisma.media.update({
      where: { id },
      data: mediaData,
    });

    return this.mapToEntity(media);
  }

  async delete(id: string): Promise<void> {
    await prisma.media.delete({
      where: { id },
    });
  }

  private mapToEntity(media: PrismaMedia): Media {
    return {
      id: media.id,
      telegramId: media.telegramId,
      type: media.type as MediaTypeValue,
      url: media.url || undefined,
      fileSize: media.fileSize || undefined,
      width: media.width || undefined,
      height: media.height || undefined,
      duration: media.duration || undefined,
      mimeType: media.mimeType || undefined,
      messageId: media.messageId,
    };
  }
}

export class PrismaLocationRepository implements LocationRepository {
  async findById(id: string): Promise<Location | null> {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    return location ? this.mapToEntity(location) : null;
  }

  async findByMessageId(messageId: string): Promise<Location | null> {
    const location = await prisma.location.findUnique({
      where: { messageId },
    });

    return location ? this.mapToEntity(location) : null;
  }

  async create(locationData: Omit<Location, 'id'>): Promise<Location> {
    const location = await prisma.location.create({
      data: locationData,
    });

    return this.mapToEntity(location);
  }

  async update(id: string, locationData: Partial<Location>): Promise<Location> {
    const location = await prisma.location.update({
      where: { id },
      data: locationData,
    });

    return this.mapToEntity(location);
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }

  private mapToEntity(location: PrismaLocation): Location {
    return {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || undefined,
      livePeriod: location.livePeriod || undefined,
      messageId: location.messageId,
    };
  }
}
