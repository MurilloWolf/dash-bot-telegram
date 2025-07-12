export interface Chat {
  id: string;
  telegramId: string;
  type: ChatTypeValue;
  title?: string;
  username?: string;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  telegramId: bigint;
  text?: string;
  direction: MessageDirectionValue;
  type: MessageTypeValue;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  userId?: string;
  chatId?: string;
  replyToId?: string;
}

export interface Media {
  id: string;
  telegramId: string;
  type: MediaTypeValue;
  url?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType?: string;
  messageId: string;
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  livePeriod?: number;
  messageId: string;
}

export const ChatType = {
  PRIVATE: "PRIVATE",
  GROUP: "GROUP",
  SUPERGROUP: "SUPERGROUP",
  CHANNEL: "CHANNEL",
  BOT: "BOT",
} as const;

export type ChatTypeValue = (typeof ChatType)[keyof typeof ChatType];

export const MessageDirection = {
  INCOMING: "INCOMING",
  OUTGOING: "OUTGOING",
} as const;

export type MessageDirectionValue =
  (typeof MessageDirection)[keyof typeof MessageDirection];

export const MessageType = {
  TEXT: "TEXT",
  PHOTO: "PHOTO",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  AUDIO: "AUDIO",
  VOICE: "VOICE",
  LOCATION: "LOCATION",
  CONTACT: "CONTACT",
  POLL: "POLL",
  OTHER: "OTHER",
} as const;

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];

export const MediaType = {
  PHOTO: "PHOTO",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  AUDIO: "AUDIO",
  VOICE: "VOICE",
  STICKER: "STICKER",
} as const;

export type MediaTypeValue = (typeof MediaType)[keyof typeof MediaType];
