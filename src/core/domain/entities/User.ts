export interface User {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  isActive: boolean;
  isPremium: boolean;
  premiumSince?: Date;
  premiumEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt?: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredDistances: number[];
  notificationsEnabled: boolean;
  reminderDays: number;
  timezone: string;
  language: string;
}
