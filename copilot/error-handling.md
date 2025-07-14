# Error Handling & Logging

## 🚨 Error Handling Philosophy

### Principles

- **Fail Fast**: Detect errors early and fail immediately
- **Graceful Degradation**: Continue operation when possible
- **User-Friendly Messages**: Never expose technical details to users
- **Comprehensive Logging**: Log everything for debugging
- **Recovery Strategies**: Implement fallbacks where appropriate

### Error Categories

1. **User Errors**: Invalid input, missing permissions
2. **System Errors**: Database failures, network issues
3. **Integration Errors**: External API failures
4. **Logic Errors**: Programming bugs, unexpected states

## 🎯 Error Handling Patterns

### 1. Command Error Handling

```typescript
export async function exampleCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    // 1. Input validation
    if (!input.user?.id) {
      logger.warn("Command called without user ID", {
        module: "ExampleCommand",
        action: "validate_input",
        command: "example",
      });
      return ErrorResponses.USER_NOT_FOUND;
    }

    // 2. Business logic with potential failures
    const data = await riskyOperation(input.user.id);

    // 3. Success logging
    logger.commandExecution("example", input.user.id.toString());

    return {
      text: "✅ Operação realizada com sucesso!",
      format: "HTML",
    };
  } catch (error) {
    // 4. Error logging with context
    logger.commandError("example", error as Error, input.user?.id?.toString());

    // 5. User-friendly error response
    return handleCommandError("example", error as Error, input);
  }
}
```

### 2. Service Error Handling

```typescript
export class UserService {
  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    try {
      // Input validation
      this.validateUserInput(telegramId, name);

      // Check if user exists
      const existingUser = await this.userRepository.findByTelegramId(
        telegramId
      );
      if (existingUser) {
        logger.info("User already exists, returning existing", {
          module: "UserService",
          action: "register_user_existing",
          telegramId: telegramId,
          userId: existingUser.id,
        });
        return existingUser;
      }

      // Create new user
      const userData = {
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
      };

      const newUser = await this.userRepository.create(userData);

      logger.info("User created successfully", {
        module: "UserService",
        action: "register_user_success",
        telegramId: telegramId,
        userId: newUser.id,
      });

      return newUser;
    } catch (error) {
      logger.error(
        "Failed to register user",
        {
          module: "UserService",
          action: "register_user_error",
          telegramId: telegramId,
          name: name,
          username: username,
        },
        error as Error
      );

      // Re-throw with more context
      if (error instanceof DatabaseError) {
        throw new UserRegistrationError(
          "Database error during user registration",
          { cause: error, telegramId }
        );
      }

      throw error;
    }
  }

  private validateUserInput(telegramId: string, name: string): void {
    if (!telegramId || typeof telegramId !== "string") {
      throw new ValidationError("Invalid telegram ID");
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError("Invalid name");
    }

    if (!/^\d+$/.test(telegramId)) {
      throw new ValidationError("Telegram ID must be numeric");
    }
  }
}
```

### 3. Repository Error Handling

```typescript
export class PrismaUserRepository implements UserRepository {
  async findByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: { preferences: true },
      });

      return user ? this.toDomain(user) : null;
    } catch (error) {
      logger.error(
        "Database error finding user by telegram ID",
        {
          module: "PrismaUserRepository",
          action: "find_by_telegram_id",
          telegramId: telegramId,
        },
        error as Error
      );

      // Convert Prisma errors to domain errors
      if (error instanceof PrismaClientKnownRequestError) {
        throw new DatabaseError(`Database query failed: ${error.message}`, {
          cause: error,
          code: error.code,
        });
      }

      throw new DatabaseError("Unknown database error", { cause: error });
    }
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      const prismaUser = await this.prisma.user.create({
        data: {
          telegramId: data.telegramId,
          name: data.name,
          username: data.username,
          isActive: data.isActive,
          isPremium: data.isPremium,
        },
        include: { preferences: true },
      });

      return this.toDomain(prismaUser);
    } catch (error) {
      logger.error(
        "Database error creating user",
        {
          module: "PrismaUserRepository",
          action: "create_user",
          telegramId: data.telegramId,
        },
        error as Error
      );

      // Handle unique constraint violations
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new DuplicateUserError(
          `User with telegram ID ${data.telegramId} already exists`
        );
      }

      throw new DatabaseError("Failed to create user", { cause: error });
    }
  }
}
```

## 🏗️ Custom Error Classes

### Domain-Specific Errors

```typescript
// Base domain error
export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
  }
}

// User-related errors
export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
}

export class UserRegistrationError extends DomainError {
  readonly code = "USER_REGISTRATION_FAILED";
}

export class DuplicateUserError extends DomainError {
  readonly code = "DUPLICATE_USER";
}

// Race-related errors
export class RaceNotFoundError extends DomainError {
  readonly code = "RACE_NOT_FOUND";
}

export class InvalidRaceDataError extends DomainError {
  readonly code = "INVALID_RACE_DATA";
}

// System errors
export class DatabaseError extends DomainError {
  readonly code = "DATABASE_ERROR";
}

export class ExternalAPIError extends DomainError {
  readonly code = "EXTERNAL_API_ERROR";
}

// Input validation errors
export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
}
```

## 📊 Structured Logging

### Logger Configuration

```typescript
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  // Structured log method
  private log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error
  ): void {
    if (level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: this.getLevelName(level),
      message,
      context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    const colorCode = this.getColorCode(level);
    const resetCode = this.getResetCode();
    const emoji = this.getLevelEmoji(level);

    console.log(
      `${colorCode}${emoji} [${logEntry.level}] ${logEntry.message}${resetCode}`,
      logEntry.context,
      ...(error ? [error] : [])
    );
  }

  // Specialized logging methods
  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Domain-specific logging methods
  commandExecution(commandName: string, userId?: string): void {
    this.info(`Command executed: ${commandName}`, {
      module: "CommandRouter",
      action: "command_execution",
      commandName,
      userId,
    });
  }

  commandError(commandName: string, error: Error, userId?: string): void {
    this.error(
      `Command failed: ${commandName}`,
      {
        module: "CommandRouter",
        action: "command_error",
        commandName,
        userId,
      },
      error
    );
  }

  messageIntercept(
    platform: string,
    direction: "received" | "sent",
    chatId?: string,
    userId?: string
  ): void {
    const emoji = direction === "received" ? "📥" : "📤";
    this.info(`${emoji} [${platform}] Message ${direction}`, {
      module: "MessageInterceptor",
      action: `message_${direction}`,
      platform,
      chatId,
      userId,
    });
  }

  databaseOperation(
    table: string,
    operation: string,
    success: boolean,
    duration?: number
  ): void {
    const message = `Database ${operation} on ${table}: ${
      success ? "SUCCESS" : "FAILED"
    }`;
    this.info(message, {
      module: "Database",
      action: "database_operation",
      table,
      operation,
      success,
      duration,
    });
  }

  botStartup(message: string): void {
    this.info(`🚀 ${message}`, {
      module: "Bot",
      action: "startup",
    });
  }
}
```

### Log Context Standards

```typescript
export interface LogContext {
  module?: string; // "UserService", "CommandRouter"
  action?: string; // "create_user", "command_execution"
  userId?: string; // User identifier
  chatId?: string; // Chat identifier
  commandName?: string; // Command name
  callbackType?: string; // Callback type
  table?: string; // Database table
  operation?: string; // CRUD operation
  raceId?: string; // Race identifier
  platform?: string; // "telegram", "whatsapp"
  duration?: number; // Operation duration in ms
  success?: boolean; // Operation success
  [key: string]: unknown; // Additional context
}
```

## 🎯 Error Response Strategies

### User-Friendly Error Messages

```typescript
export const ErrorResponses = {
  // User errors
  USER_NOT_FOUND: {
    text: "❌ Usuário não encontrado. Use /start para começar.",
    format: "HTML" as const,
  },

  INVALID_INPUT: {
    text: "❌ Entrada inválida. Verifique os parâmetros e tente novamente.",
    format: "HTML" as const,
  },

  PERMISSION_DENIED: {
    text: "❌ Você não tem permissão para esta ação.",
    format: "HTML" as const,
  },

  // System errors
  INTERNAL_ERROR: {
    text: "❌ Erro interno. Tente novamente mais tarde.",
    format: "HTML" as const,
  },

  DATABASE_ERROR: {
    text: "❌ Problema de conectividade. Tente novamente em alguns instantes.",
    format: "HTML" as const,
  },

  // Feature-specific errors
  NOT_PREMIUM: {
    text: "❌ Esta funcionalidade está disponível apenas para usuários premium. Use /premium para mais informações.",
    format: "HTML" as const,
  },

  RACE_NOT_FOUND: {
    text: "❌ Corrida não encontrada. Use /corridas para ver as disponíveis.",
    format: "HTML" as const,
  },
} as const;
```

### Error Mapping Strategy

```typescript
export function handleCommandError(
  commandName: string,
  error: Error,
  input: CommandInput
): CommandOutput {
  // Log the error with context
  logger.commandError(commandName, error, input.user?.id?.toString());

  // Map domain errors to user responses
  if (error instanceof UserNotFoundError) {
    return ErrorResponses.USER_NOT_FOUND;
  }

  if (error instanceof ValidationError) {
    return ErrorResponses.INVALID_INPUT;
  }

  if (error instanceof RaceNotFoundError) {
    return ErrorResponses.RACE_NOT_FOUND;
  }

  if (error instanceof DatabaseError) {
    return ErrorResponses.DATABASE_ERROR;
  }

  if (error instanceof DomainError && error.code === "NOT_PREMIUM") {
    return ErrorResponses.NOT_PREMIUM;
  }

  // Default fallback for unknown errors
  return ErrorResponses.INTERNAL_ERROR;
}
```

## 🔄 Retry Strategies

### Exponential Backoff

```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Don't retry user errors
      if (
        error instanceof ValidationError ||
        error instanceof UserNotFoundError
      ) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Operation failed, retrying in ${delay}ms`, {
        module: "RetryStrategy",
        action: "retry_attempt",
        attempt: attempt + 1,
        maxRetries,
        delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage in services
export class UserService {
  async registerUser(telegramId: string, name: string): Promise<User> {
    return withRetry(
      () => this.userRepository.create({ telegramId, name }),
      3,
      1000
    );
  }
}
```

### Circuit Breaker Pattern

```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }
}
```

## 📋 Error Handling Checklist

### For New Commands

- [ ] Input validation with descriptive errors
- [ ] Try-catch around business logic
- [ ] Structured error logging
- [ ] User-friendly error responses
- [ ] Error context preservation

### For New Services

- [ ] Domain-specific error types
- [ ] Comprehensive error logging
- [ ] Input validation
- [ ] Retry strategies for external calls
- [ ] Error type conversion

### For New Repositories

- [ ] Database error handling
- [ ] Connection error recovery
- [ ] Query error mapping
- [ ] Transaction rollback on error
- [ ] Performance logging

### Code Review Checklist

- [ ] All external calls wrapped in try-catch
- [ ] Errors logged with appropriate context
- [ ] User-friendly error messages
- [ ] No sensitive data in error responses
- [ ] Appropriate error types used
