# API Patterns & Interface Design

## 🔌 Interface Design Principles

### 1. Platform Adapter Pattern

```typescript
// ✅ Generic interface for all platforms
export interface PlatformAdapter {
  // Core messaging methods
  sendMessage(chatId: string | number, output: CommandOutput): Promise<void>;
  editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void>;

  // Platform-specific methods
  deleteMessage(
    chatId: string | number,
    messageId: string | number
  ): Promise<void>;
  sendTypingAction(chatId: string | number): Promise<void>;

  // Event handling
  onMessage(handler: (message: PlatformMessage) => Promise<void>): void;
  onCallback(handler: (callback: PlatformCallback) => Promise<void>): void;

  // Lifecycle methods
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ✅ Platform-agnostic message interface
export interface PlatformMessage {
  id: string;
  chatId: string;
  userId?: string;
  text?: string;
  type: MessageType;
  timestamp: Date;
  platform: string;
  raw: unknown; // Platform-specific data
}

// ✅ Platform-agnostic callback interface
export interface PlatformCallback {
  id: string;
  chatId: string;
  messageId: string;
  userId: string;
  data: string;
  platform: string;
  raw: unknown; // Platform-specific data
}
```

### 2. Command Interface Standards

```typescript
// ✅ Standardized command input
export interface CommandInput {
  user?: {
    id?: number | string;
    name?: string;
    username?: string;
    platform?: string;
  };
  chat?: {
    id: string;
    type: ChatType;
    title?: string;
  };
  args?: string[]; // Command arguments ["5km", "10km"]
  platform: string; // "telegram", "whatsapp", "discord"
  raw: unknown; // Platform-specific message data
  callbackData?: CallbackData; // Button callback data
  messageId?: number | string; // Original message ID
  metadata?: Record<string, unknown>; // Additional context
}

// ✅ Standardized command output
export interface CommandOutput {
  text: string; // Main response text
  format?: MessageFormat; // "markdown", "html", "plain"
  messages?: string[]; // Multiple messages to send
  keyboard?: InteractionKeyboard; // Interactive buttons
  editMessage?: boolean; // Edit vs new message
  deleteOriginal?: boolean; // Delete triggering message
  typing?: boolean; // Show typing indicator
  silent?: boolean; // Send silently
  metadata?: Record<string, unknown>; // Additional response data
}

// ✅ Message formatting enum
export enum MessageFormat {
  PLAIN = 'plain',
  MARKDOWN = 'markdown',
  HTML = 'html',
  MARKDOWN_V2 = 'markdownV2',
}
```

### 3. Service Interface Patterns

```typescript
// ✅ Generic service interface with Result pattern
export interface ServiceResult<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
}

// ✅ Service interface for business operations
export interface UserService {
  // Core operations
  registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<ServiceResult<User, UserError>>;

  getUserById(id: string): Promise<ServiceResult<User, UserError>>;

  updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<ServiceResult<UserPreferences, UserError>>;

  // Premium operations
  upgradeToPremium(
    userId: string,
    subscriptionData: SubscriptionData
  ): Promise<ServiceResult<Subscription, PaymentError>>;

  // Query operations
  findActiveUsers(
    filter?: UserFilter
  ): Promise<ServiceResult<User[], UserError>>;
  getUserStatistics(
    userId: string
  ): Promise<ServiceResult<UserStats, UserError>>;
}

// ✅ Race service interface
export interface RaceService {
  // Query operations
  getAvailableRaces(): Promise<ServiceResult<Race[], RaceError>>;
  getRaceById(id: string): Promise<ServiceResult<Race, RaceError>>;
  getRacesByDistance(
    distances: number[]
  ): Promise<ServiceResult<Race[], RaceError>>;
  searchRaces(
    criteria: RaceSearchCriteria
  ): Promise<ServiceResult<Race[], RaceError>>;

  // User interactions
  setRaceReminder(
    userId: string,
    raceId: string,
    reminderData: ReminderData
  ): Promise<ServiceResult<Reminder, RaceError>>;

  getUserRaceHistory(
    userId: string
  ): Promise<ServiceResult<RaceHistory[], RaceError>>;
}
```

## 🎯 Repository Interface Design

### 1. Generic Repository Pattern

```typescript
// ✅ Base repository interface
export interface BaseRepository<TEntity, TCreateInput, TUpdateInput> {
  // Basic CRUD operations
  findById(id: string): Promise<TEntity | null>;
  findMany(options?: FindManyOptions<TEntity>): Promise<TEntity[]>;
  create(data: TCreateInput): Promise<TEntity>;
  update(id: string, data: TUpdateInput): Promise<TEntity>;
  delete(id: string): Promise<void>;

  // Query operations
  count(filter?: FilterOptions<TEntity>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// ✅ Query options interface
export interface FindManyOptions<TEntity> {
  where?: FilterOptions<TEntity>;
  orderBy?: OrderByOptions<TEntity>;
  take?: number;
  skip?: number;
  include?: string[];
}

export interface FilterOptions<TEntity> {
  [K in keyof TEntity]?: TEntity[K] | FilterOperator<TEntity[K]>;
}

export interface FilterOperator<T> {
  equals?: T;
  not?: T;
  in?: T[];
  notIn?: T[];
  lt?: T;
  lte?: T;
  gt?: T;
  gte?: T;
  contains?: T;
  startsWith?: T;
  endsWith?: T;
}
```

### 2. Specialized Repository Interfaces

```typescript
// ✅ User-specific repository interface
export interface UserRepository
  extends BaseRepository<User, CreateUserData, UpdateUserData> {
  // User-specific queries
  findByTelegramId(telegramId: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findPremiumUsers(): Promise<User[]>;
  findActiveUsersInDateRange(start: Date, end: Date): Promise<User[]>;

  // Batch operations
  updateLastSeenBatch(userIds: string[]): Promise<void>;
  deactivateInactiveUsers(days: number): Promise<number>;
}

// ✅ Message repository with advanced querying
export interface MessageRepository
  extends BaseRepository<Message, CreateMessageData, UpdateMessageData> {
  // Chat-based queries
  findByChatId(chatId: string, options?: PaginationOptions): Promise<Message[]>;
  findConversationHistory(
    userId: string,
    chatId: string,
    options?: ConversationOptions
  ): Promise<Message[]>;

  // User-based queries
  findByUserId(userId: string, options?: PaginationOptions): Promise<Message[]>;
  findUserMessageStats(userId: string): Promise<MessageStats>;

  // Advanced queries
  searchMessages(query: string, options?: SearchOptions): Promise<Message[]>;
  findMessagesWithMedia(chatId: string): Promise<Message[]>;

  // Bulk operations
  markAsRead(messageIds: string[]): Promise<void>;
  softDeleteByChat(chatId: string): Promise<number>;
}

// ✅ Race repository with complex filtering
export interface RaceRepository
  extends BaseRepository<Race, CreateRaceData, UpdateRaceData> {
  // Distance-based queries
  findByDistance(distances: number[]): Promise<Race[]>;
  findByDistanceRange(min: number, max: number): Promise<Race[]>;

  // Date-based queries
  findUpcoming(limit?: number): Promise<Race[]>;
  findInDateRange(start: Date, end: Date): Promise<Race[]>;
  findByMonth(year: number, month: number): Promise<Race[]>;

  // Location-based queries
  findByLocation(location: string): Promise<Race[]>;
  findNearLocation(lat: number, lng: number, radius: number): Promise<Race[]>;

  // Status-based queries
  findByStatus(status: RaceStatus[]): Promise<Race[]>;
  findOpenForRegistration(): Promise<Race[]>;

  // Analytics
  getRaceStatistics(): Promise<RaceStatistics>;
  getPopularDistances(): Promise<DistanceStats[]>;
}
```

## 🔄 Callback System Interface

### 1. Callback Handler Interface

```typescript
// ✅ Generic callback handler
export interface CallbackHandler<TCallbackData extends CallbackData> {
  // Type identifier for routing
  readonly type: string;

  // Main handler method
  handle(data: TCallbackData, input: CommandInput): Promise<CommandOutput>;

  // Validation method
  validate(data: unknown): data is TCallbackData;

  // Optional middleware hooks
  beforeHandle?(data: TCallbackData, input: CommandInput): Promise<void>;
  afterHandle?(
    data: TCallbackData,
    input: CommandInput,
    output: CommandOutput
  ): Promise<void>;
}

// ✅ Callback manager interface
export interface CallbackManager {
  // Registration
  register<T extends CallbackData>(handler: CallbackHandler<T>): void;
  unregister(type: string): void;

  // Execution
  handle(callbackData: string, input: CommandInput): Promise<CommandOutput>;

  // Introspection
  getRegisteredTypes(): string[];
  hasHandler(type: string): boolean;
}

// ✅ Callback data serialization interface
export interface CallbackDataSerializer {
  serialize(data: CallbackData): string;
  deserialize(serialized: string): CallbackData;
  validate(serialized: string): boolean;
}
```

### 2. Typed Callback Data Interfaces

```typescript
// ✅ Base callback data interface
export interface CallbackData {
  type: string;
  [key: string]: unknown;
}

// ✅ Race-related callback interfaces
export interface RaceDetailsCallbackData extends CallbackData {
  type: 'race_details';
  raceId: string;
  source?: 'list' | 'search' | 'recommendation';
}

export interface RaceFilterCallbackData extends CallbackData {
  type: 'races_filter';
  distance: number;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface RaceReminderCallbackData extends CallbackData {
  type: 'race_reminder';
  raceId: string;
  action: 'set' | 'cancel' | 'modify';
  reminderDays?: number;
}

// ✅ User-related callback interfaces
export interface UserPreferencesCallbackData extends CallbackData {
  type: 'user_preferences';
  action: 'view' | 'edit' | 'save';
  field?: 'distances' | 'notifications' | 'timezone' | 'language';
  value?: unknown;
}

export interface UserSubscriptionCallbackData extends CallbackData {
  type: 'user_subscription';
  action: 'upgrade' | 'downgrade' | 'cancel' | 'renew';
  productId?: string;
}

// ✅ Navigation callback interfaces
export interface NavigationCallbackData extends CallbackData {
  type: 'navigation';
  action: 'back' | 'forward' | 'home' | 'menu';
  target: string;
  context?: Record<string, unknown>;
}

export interface PaginationCallbackData extends CallbackData {
  type: 'pagination';
  action: 'next' | 'prev' | 'goto';
  page: number;
  target: string; // What we're paginating
  filters?: Record<string, unknown>;
}
```

## 🛠️ Middleware Interface Pattern

### 1. Middleware Pipeline Interface

```typescript
// ✅ Generic middleware interface
export interface Middleware<TInput, TOutput> {
  name: string;
  priority: number; // Lower numbers run first

  execute(input: TInput, next: () => Promise<TOutput>): Promise<TOutput>;
}

// ✅ Message middleware interface
export interface MessageMiddleware
  extends Middleware<CommandInput, CommandOutput> {
  // Pre-processing hooks
  beforeCommand?(input: CommandInput): Promise<CommandInput>;

  // Post-processing hooks
  afterCommand?(
    input: CommandInput,
    output: CommandOutput
  ): Promise<CommandOutput>;

  // Error handling
  onError?(error: Error, input: CommandInput): Promise<CommandOutput>;
}

// ✅ Middleware manager interface
export interface MiddlewareManager<TInput, TOutput> {
  // Registration
  use(middleware: Middleware<TInput, TOutput>): void;
  remove(name: string): void;

  // Execution
  execute(
    input: TInput,
    finalHandler: () => Promise<TOutput>
  ): Promise<TOutput>;

  // Introspection
  getMiddleware(): Middleware<TInput, TOutput>[];
  hasMiddleware(name: string): boolean;
}
```

### 2. Specific Middleware Implementations

```typescript
// ✅ Message interceptor middleware
export interface MessageInterceptor extends MessageMiddleware {
  // Message saving
  interceptIncomingMessage(input: CommandInput): Promise<void>;
  interceptOutgoingMessage(
    input: CommandInput,
    output: CommandOutput
  ): Promise<void>;

  // Message extraction
  extractMessageData(input: CommandInput): MessageData | null;

  // Platform-specific extractors
  extractTelegramMessageData(raw: unknown): MessageData | null;
  extractWhatsAppMessageData(raw: unknown): MessageData | null;
}

// ✅ Rate limiting middleware
export interface RateLimitMiddleware extends MessageMiddleware {
  // Rate limit configuration
  setRateLimit(userId: string, limit: RateLimit): void;
  getRateLimit(userId: string): RateLimit | null;

  // Rate limit checking
  checkRateLimit(userId: string): Promise<RateLimitResult>;

  // Rate limit enforcement
  enforceRateLimit(input: CommandInput): Promise<boolean>;
}

// ✅ Authentication middleware
export interface AuthenticationMiddleware extends MessageMiddleware {
  // User authentication
  authenticateUser(input: CommandInput): Promise<AuthenticationResult>;

  // Permission checking
  checkPermissions(userId: string, action: string): Promise<boolean>;

  // Session management
  createSession(userId: string): Promise<Session>;
  validateSession(sessionId: string): Promise<Session | null>;
}
```

## 📊 Analytics & Metrics Interface

### 1. Analytics Service Interface

```typescript
// ✅ Analytics service interface
export interface AnalyticsService {
  // Event tracking
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackUserAction(
    userId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
  trackCommandUsage(
    command: string,
    userId?: string,
    success?: boolean
  ): Promise<void>;

  // Metrics collection
  getUserEngagementMetrics(
    userId: string,
    period: TimePeriod
  ): Promise<EngagementMetrics>;
  getSystemMetrics(period: TimePeriod): Promise<SystemMetrics>;
  getCommandUsageStats(period: TimePeriod): Promise<CommandUsageStats>;

  // Reporting
  generateUserReport(userId: string, period: TimePeriod): Promise<UserReport>;
  generateSystemReport(period: TimePeriod): Promise<SystemReport>;
}

// ✅ Analytics event interface
export interface AnalyticsEvent {
  type: string;
  userId?: string;
  timestamp: Date;
  platform: string;
  data: Record<string, unknown>;
  sessionId?: string;
}

// ✅ Metrics interfaces
export interface EngagementMetrics {
  totalMessages: number;
  commandsUsed: number;
  sessionsCount: number;
  averageSessionDuration: number;
  mostUsedCommands: CommandUsageStat[];
  activityByHour: HourlyActivity[];
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  messageVolume: number;
  errorRate: number;
  averageResponseTime: number;
  platformDistribution: PlatformStat[];
}
```

## 🔍 Error Interface Patterns

### 1. Error Type Interfaces

```typescript
// ✅ Base error interface
export interface DomainError {
  code: string;
  message: string;
  context: Record<string, unknown>;
  cause?: Error;
  timestamp: Date;
}

// ✅ Specific error interfaces
export interface UserError extends DomainError {
  userId?: string;
  telegramId?: string;
}

export interface RaceError extends DomainError {
  raceId?: string;
  raceTitle?: string;
}

export interface PaymentError extends DomainError {
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export interface ValidationError extends DomainError {
  field?: string;
  value?: unknown;
  constraint?: string;
}
```

### 2. Error Handler Interface

```typescript
// ✅ Error handler interface
export interface ErrorHandler {
  // Error processing
  handle(error: Error, context?: ErrorContext): Promise<ErrorResponse>;

  // Error mapping
  mapToUserMessage(error: Error): string;
  mapToLogMessage(error: Error): string;

  // Error classification
  classify(error: Error): ErrorClassification;
  isRetryable(error: Error): boolean;
  getSeverity(error: Error): ErrorSeverity;
}

export interface ErrorContext {
  userId?: string;
  command?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorResponse {
  userMessage: string;
  shouldRetry: boolean;
  severity: ErrorSeverity;
  logData: Record<string, unknown>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
```

## 🎯 Best Practices for Interface Design

### 1. Consistency Principles

- Use consistent naming conventions across all interfaces
- Return the same data structures for similar operations
- Handle errors uniformly across all interfaces
- Use proper TypeScript generics for reusability

### 2. Extensibility Guidelines

- Design interfaces to be easily extended
- Use composition over inheritance
- Provide optional parameters for future features
- Use discriminated unions for type safety

### 3. Performance Considerations

- Design interfaces with pagination in mind
- Provide options for selective data loading
- Include performance hints in interface design
- Consider batching operations for efficiency

## 🌐 HTTP Client & Service Layer Patterns

### 1. HttpClient Architecture

```typescript
// Custom HTTP Client com interceptors
export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class HttpClient {
  private setupInterceptors(): void {
    this.api.interceptors.response.use(response => {
      const responseData = response.data as ApiResponse;

      if (responseData?.success === false) {
        throw new ApiError(
          responseData.error || 'API operation failed',
          response.status,
          responseData
        );
      }

      // Retorna estrutura limpa
      return {
        data: responseData.data,
        status: response.status,
        statusText: response.statusText,
      } as HttpResponse<typeof responseData.data>;
    });
  }

  async get<T>(url: string): Promise<HttpResponse<T>> {
    return this.api.get<T>(url) as Promise<HttpResponse<T>>;
  }
}
```

### 2. Modular Service Pattern

```typescript
// Services especializados por domínio
export class UserApiService {
  private readonly baseUrl = '/users';

  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    try {
      const response = await httpClient.post<User>(`${this.baseUrl}/register`, {
        telegramId,
        name,
        username,
      });

      logger.info('Successfully registered user', {
        module: 'UserApiService',
        action: 'register_user',
        userId: response.data.id,
        telegramId,
      });

      return response.data;
    } catch (error) {
      logger.error(
        'Error registering user',
        {
          module: 'UserApiService',
          action: 'register_user',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response = await httpClient.get<User>(
        `${this.baseUrl}/telegram/${telegramId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

// Singleton exports
export const userApiService = new UserApiService();
export const raceApiService = new RaceApiService();
export const chatApiService = new ChatApiService();
```

### 3. Centralized Service Exports

```typescript
// services/index.ts - Ponto central de exportação
export { httpClient } from './http/HttpClient.ts';
export { userApiService } from './UserApiService.ts';
export { chatApiService } from './ChatApiService.ts';
export { messageApiService } from './MessageApiService.ts';
export { raceApiService } from './RaceApiService.ts';

// Re-export types for convenience
export type { CreateUserRequest } from '../types/Service.ts';
export type { CreateChatRequest } from '../types/Service.ts';
export type { Race, RaceStatus } from '../types/Service.ts';
```
