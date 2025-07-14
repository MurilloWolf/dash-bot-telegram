# Domain Models & Entities

## 🏃‍♂️ Core Domain Entities

### User Aggregate

```typescript
// Core User Entity
export interface User {
  id: string; // CUID identifier
  telegramId: string; // Unique per platform
  name: string; // Display name
  username?: string; // Platform username
  isActive: boolean; // Account status
  isPremium: boolean; // Premium subscription
  premiumSince?: Date; // Premium start date
  premiumEndsAt?: Date; // Premium end date
  createdAt: Date; // Registration date
  updatedAt: Date; // Last modification
  lastSeenAt?: Date; // Last activity
}

// User Preferences Value Object
export interface UserPreferences {
  id: string;
  userId: string; // FK to User
  preferredDistances: number[]; // [5, 10, 21] km
  notificationsEnabled: boolean;
  reminderDays: number; // Days before race
  timezone: string; // "America/Sao_Paulo"
  language: string; // "pt-BR"
}
```

### Race Aggregate

```typescript
export interface Race {
  id: string; // CUID identifier
  title: string; // Race name
  organization: string; // Organizing entity
  distances: Json; // ["5km", "10km", "21km"]
  distancesNumbers: Json; // [5, 10, 21] for filtering
  date: DateTime; // Race date and time
  location: string; // Location description
  link: string; // Registration/info URL
  time: string; // Start time
  status: RaceStatus; // OPEN | CLOSED | COMING_SOON | CANCELLED
  createdAt: DateTime;
  updatedAt: DateTime;
}

export enum RaceStatus {
  OPEN = "OPEN", // Registration open
  CLOSED = "CLOSED", // Registration closed
  COMING_SOON = "COMING_SOON", // Announced but not open
  CANCELLED = "CANCELLED", // Event cancelled
}
```

### Message Aggregate

```typescript
export interface Message {
  id: string; // CUID identifier
  telegramId: BigInt; // Platform message ID
  text?: string; // Message content
  direction: MessageDirection; // INCOMING | OUTGOING
  type: MessageType; // TEXT | PHOTO | VIDEO | etc
  createdAt: DateTime;
  updatedAt: DateTime;
  editedAt?: DateTime; // If message was edited
  isDeleted: boolean; // Soft delete flag

  // Relationships
  userId?: string; // FK to User
  chatId?: string; // FK to Chat
  replyToId?: string; // FK to parent Message
  media: Media[]; // Associated media
  location?: Location; // Location data if shared
}

export interface Chat {
  id: string; // CUID identifier
  telegramId: string; // Platform chat ID
  type: ChatType; // PRIVATE | GROUP | SUPERGROUP | etc
  title?: string; // Chat title (for groups)
  username?: string; // Chat username
  memberCount?: number; // Number of members
  createdAt: DateTime;
  updatedAt: DateTime;
}

export enum MessageDirection {
  INCOMING = "INCOMING", // User to bot
  OUTGOING = "OUTGOING", // Bot to user
}

export enum MessageType {
  TEXT = "TEXT",
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  VOICE = "VOICE",
  LOCATION = "LOCATION",
  CONTACT = "CONTACT",
  POLL = "POLL",
  OTHER = "OTHER",
}

export enum ChatType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
  SUPERGROUP = "SUPERGROUP",
  CHANNEL = "CHANNEL",
  BOT = "BOT",
}
```

### Media & Location Value Objects

```typescript
export interface Media {
  id: string; // CUID identifier
  telegramId: string; // Platform file ID
  type: MediaType; // PHOTO | VIDEO | DOCUMENT | etc
  url?: string; // Download URL
  fileSize?: number; // File size in bytes
  width?: number; // Image/video width
  height?: number; // Image/video height
  duration?: number; // Audio/video duration
  mimeType?: string; // MIME type
  messageId: string; // FK to Message
}

export interface Location {
  id: string; // CUID identifier
  latitude: number; // GPS latitude
  longitude: number; // GPS longitude
  accuracy?: number; // Location accuracy
  livePeriod?: number; // Live location period
  messageId: string; // FK to Message (unique)
}

export enum MediaType {
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  VOICE = "VOICE",
  STICKER = "STICKER",
}
```

### Payment Aggregate

```typescript
export interface Product {
  id: string; // CUID identifier
  name: string; // Product name
  description?: string; // Product description
  price: number; // Price in currency
  currency: string; // "BRL", "USD", etc
  billingType: BillingType; // ONE_TIME | RECURRING
  interval?: string; // "month", "year" for recurring
  isActive: boolean; // Product availability
  features: Json; // {"advancedAnalytics": true}
  createdAt: DateTime;
}

export interface Payment {
  id: string; // CUID identifier
  telegramChargeId?: string; // Platform payment ID
  provider: string; // "telegram", "stripe", etc
  amount: number; // Payment amount
  currency: string; // Payment currency
  status: PaymentStatus; // PENDING | PAID | FAILED | etc
  userEmail?: string; // Payer email
  userPhone?: string; // Payer phone
  createdAt: DateTime;
  paidAt?: DateTime; // Payment completion
  expiresAt?: DateTime; // Payment expiration
  invoiceUrl?: string; // Payment invoice URL

  // Relationships
  userId: string; // FK to User
  productId?: string; // FK to Product
}

export interface Subscription {
  id: string; // CUID identifier
  startDate: DateTime; // Subscription start
  endDate?: DateTime; // Subscription end
  isActive: boolean; // Current status
  autoRenew: boolean; // Auto-renewal setting
  cancelledAt?: DateTime; // Cancellation date

  // Relationships
  userId: string; // FK to User
  productId: string; // FK to Product
  paymentId?: string; // FK to Payment
}

export enum BillingType {
  ONE_TIME = "ONE_TIME",
  RECURRING = "RECURRING",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}
```

## 🔄 Value Objects and Types

### Command System Types

```typescript
export interface CommandInput {
  user?: { id?: number | string; name?: string };
  args?: string[]; // Command arguments
  platform?: string; // "telegram", "whatsapp"
  raw?: unknown; // Platform-specific data
  callbackData?: CallbackData; // For button callbacks
  messageId?: number | string; // Message identifier
}

export interface CommandOutput {
  text: string; // Response text
  format?: "markdown" | "html" | "markdownV2" | string;
  messages?: string[]; // Multiple messages
  keyboard?: InteractionKeyboard; // Interactive buttons
  editMessage?: boolean; // Edit vs new message
}

export interface InteractionButton {
  text: string; // Button label
  callbackData?: CallbackData; // Callback data
  url?: string; // URL button
}

export interface InteractionKeyboard {
  buttons: InteractionButton[][]; // 2D button array
  inline?: boolean; // Inline vs reply keyboard
}
```

### Callback System Types

```typescript
// Base callback data
export interface CallbackData {
  type: string;
}

// Race-related callbacks
export interface RaceDetailsCallbackData extends CallbackData {
  type: "race_details";
  raceId: string;
}

export interface RaceFilterCallbackData extends CallbackData {
  type: "races_filter";
  distance: number;
}

export interface RaceReminderCallbackData extends CallbackData {
  type: "race_reminder";
  raceId: string;
  action: "set" | "cancel";
}

// User-related callbacks
export interface UserCallbackData extends CallbackData {
  type: "user_config";
  action: "distances" | "notifications" | "reminder";
  value?: string;
}

// Navigation callbacks
export interface SharedCallbackData extends CallbackData {
  type: "navigation" | "pagination";
  action: string;
  target: string;
  page?: number;
}
```

## 🎯 Domain Rules & Invariants

### User Rules

```typescript
// User must have valid telegramId
const isValidTelegramId = (id: string): boolean => {
  return /^\d+$/.test(id) && id.length >= 5;
};

// Premium users have additional features
const canAccessPremiumFeatures = (user: User): boolean => {
  return (
    user.isPremium && (!user.premiumEndsAt || user.premiumEndsAt > new Date())
  );
};
```

### Race Rules

```typescript
// Race must have valid date in future
const isValidRaceDate = (date: Date): boolean => {
  return date > new Date();
};

// Distances must be positive numbers
const areValidDistances = (distances: number[]): boolean => {
  return distances.every((d) => d > 0 && d <= 100);
};
```

### Message Rules

```typescript
// Messages must have either text or media
const isValidMessage = (message: Partial<Message>): boolean => {
  return !!(message.text || (message.media && message.media.length > 0));
};
```

## 📊 Repository Interfaces

```typescript
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface RaceRepository {
  findById(id: string): Promise<Race | null>;
  findAvailable(): Promise<Race[]>;
  findByDistance(distances: number[]): Promise<Race[]>;
  findByDateRange(start: Date, end: Date): Promise<Race[]>;
  create(data: CreateRaceData): Promise<Race>;
  update(id: string, data: UpdateRaceData): Promise<Race>;
}

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByChatId(chatId: string, limit?: number): Promise<Message[]>;
  findByUserId(userId: string, limit?: number): Promise<Message[]>;
  create(data: CreateMessageData): Promise<Message>;
  update(id: string, data: UpdateMessageData): Promise<Message>;
}
```

## 🔍 Domain Services

```typescript
export class UserService {
  // Business logic for user management
  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User>;
  async upgradeToPremium(userId: string, subscriptionId: string): Promise<void>;
  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void>;
}

export class RaceService {
  // Business logic for race management
  async getAvailableRaces(): Promise<Race[]>;
  async getRacesByDistance(distances: number[]): Promise<Race[]>;
  async setRaceReminder(
    userId: string,
    raceId: string,
    days: number
  ): Promise<void>;
}

export class MessageService {
  // Business logic for message management
  async saveMessage(data: CreateMessageData): Promise<Message>;
  async getChatHistory(chatId: string, limit: number): Promise<Message[]>;
  async getUserConversations(userId: string): Promise<Chat[]>;
}
```
