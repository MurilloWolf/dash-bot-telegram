export interface User {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredDistances: number[];
  notificationsEnabled: boolean;
  reminderDays: number;
}
