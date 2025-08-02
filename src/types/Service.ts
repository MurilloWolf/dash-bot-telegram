export interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string; // For private chats
    last_name?: string; // For private chats
    all_members_are_administrators?: boolean;
  };
  from?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  text?: string;
  photo?: unknown;
  video?: unknown;
  document?: unknown;
  audio?: unknown;
  voice?: unknown;
  location?: unknown;
  contact?: unknown;
  poll?: unknown;
  reply_to_message?: {
    message_id: number;
  };
  edit_date?: number;
}

// Types for WhatsApp messages (example structure)
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  text?: string;
  type: string;
  timestamp: number;
}

export interface User {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chat {
  id: string;
  telegramId: string;
  type: string;
  title?: string;
  username?: string;
  memberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id?: string;
  telegramId: bigint;
  text?: string;
  direction: string;
  type: string;
  userId?: string;
  chatId: string;
  replyToId?: string;
  editedAt?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  telegramId: string;
  name: string;
  username?: string;
}

export interface CreateChatRequest {
  telegramId: string;
  type: string;
  title?: string;
  username?: string;
  memberCount?: number;
}

export interface CreateMessageRequest {
  telegramId: bigint;
  text?: string;
  direction: string;
  type: string;
  editedAt?: Date;
  userTelegramId?: string;
  chatTelegramId: string;
  replyToTelegramId?: string;
  chat?: {
    telegramId: string;
    type: string;
    title?: string;
    username?: string;
    memberCount?: number;
  };
  media?: {
    type: string;
    url?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
    mimeType?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    livePeriod?: number;
  };
}

export interface Race {
  id: string;
  title: string;
  organization: string;
  distances: string[];
  distancesNumbers: number[];
  date: string;
  location: string;
  link: string;
  time: string;
  status: RaceStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum RaceStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  COMING_SOON = 'COMING_SOON',
  CANCELLED = 'CANCELLED',
}

export interface CreateRaceRequest {
  title: string;
  organization: string;
  distances: string[];
  distancesNumbers: number[];
  date: string;
  location: string;
  link: string;
  time: string;
  status: RaceStatus;
}
