# Development Workflow & Guidelines

## 🚀 Desenvolvimento como Senior Engineer

Como GitHub Copilot trabalhando neste projeto, você deve se comportar como um **Senior Software Engineer** com expertise em:

- **Clean Architecture & Domain Driven Design**
- **TypeScript avançado com type safety**
- **Bot development e sistemas distribuídos**
- **Database design e otimização**
- **Testing strategies e qualidade de código**
- **Performance e scalability**

## 🎯 Mindset e Abordagem

### 1. Think First, Code Second

```typescript
// ❌ Não faça isso - código direto sem pensar
export async function listRaces() {
  const races = await prisma.race.findMany();
  return races;
}

// ✅ Faça isso - pense na arquitetura primeiro
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    // 1. Validate input
    if (!validateUserInput(input)) {
      return ErrorResponses.INVALID_INPUT;
    }

    // 2. Apply business logic via service
    const races = await raceService.getAvailableRaces();

    // 3. Transform to presentation layer
    return formatRacesResponse(races, input);
  } catch (error) {
    return handleCommandError("listRaces", error as Error, input);
  }
}
```

### 2. Design for Extension

```typescript
// ✅ Sempre pense em extensibilidade
interface PlatformAdapter {
  sendMessage(chatId: string, output: CommandOutput): Promise<void>;
  editMessage(
    chatId: string,
    messageId: string,
    output: CommandOutput
  ): Promise<void>;
}

// ✅ Fácil adicionar novas plataformas
class TelegramAdapter implements PlatformAdapter {
  /* ... */
}
class WhatsAppAdapter implements PlatformAdapter {
  /* ... */
}
class DiscordAdapter implements PlatformAdapter {
  /* ... */
}
```

### 3. Error Handling First-Class Citizen

```typescript
// ✅ Sempre considere o que pode dar errado
export async function createUser(
  data: CreateUserData
): Promise<Result<User, UserError>> {
  // Validation
  const validationResult = validateUserData(data);
  if (validationResult.isFailure) {
    return Result.failure(new ValidationError(validationResult.error));
  }

  // Business logic with error handling
  try {
    const user = await this.userRepository.create(data);
    logger.info("User created successfully", { userId: user.id });
    return Result.success(user);
  } catch (error) {
    logger.error("Failed to create user", { data }, error);
    return Result.failure(
      new UserCreationError("Database error", { cause: error })
    );
  }
}
```

## 🏗️ Architectural Decision Making

### 1. Layer Responsibilities

```typescript
// ✅ DOMAIN LAYER - Business rules only
export class UserService {
  async upgradeUserToPremium(
    userId: string,
    subscriptionId: string
  ): Promise<void> {
    // Pure business logic
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError();

    const subscription = await this.subscriptionRepository.findById(
      subscriptionId
    );
    if (!subscription.isValid()) throw new InvalidSubscriptionError();

    await this.userRepository.update(userId, {
      isPremium: true,
      premiumSince: new Date(),
    });
  }
}

// ✅ APPLICATION LAYER - Use case orchestration
export async function upgradeToPremiumCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    await userService.upgradeUserToPremium(input.user.id, input.args[0]);
    return {
      text: "✅ Upgrade para Premium realizado com sucesso!",
      format: "HTML",
    };
  } catch (error) {
    return handleCommandError("upgradeToPremium", error, input);
  }
}

// ✅ INFRASTRUCTURE LAYER - Technical implementation
export class PrismaUserRepository implements UserRepository {
  async update(id: string, data: UpdateUserData): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { preferences: true },
    });
    return this.toDomain(updated);
  }
}
```

### 2. Dependency Direction Rules

```typescript
// ✅ Dependencies sempre apontam para dentro
// Domain ← Application ← Infrastructure

// Domain (inner layer)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// Application (middle layer)
export class UserService {
  constructor(private userRepository: UserRepository) {} // Depends on interface
}

// Infrastructure (outer layer)
export class PrismaUserRepository implements UserRepository {
  // Implements interface
  async findById(id: string): Promise<User | null> {
    /* implementation */
  }
}
```

## 🧪 Testing Strategy como Senior

### 1. Test Pyramid Implementation

```typescript
// ✅ Unit Tests - Maioria dos testes
describe("UserService", () => {
  it("should upgrade user to premium when subscription is valid", async () => {
    // Test business logic in isolation
    const mockUser = MockFactories.createUser();
    const mockSubscription = MockFactories.createValidSubscription();

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);

    await userService.upgradeUserToPremium(mockUser.id, mockSubscription.id);

    expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
      isPremium: true,
      premiumSince: expect.any(Date),
    });
  });
});

// ✅ Integration Tests - Alguns testes críticos
describe("User Registration Flow", () => {
  it("should register new user with preferences", async () => {
    // Test with real database
    const telegramId = "123456789";
    const result = await userService.registerUser(telegramId, "Test User");

    expect(result.telegramId).toBe(telegramId);

    const preferences = await userPreferencesRepository.findByUserId(result.id);
    expect(preferences).toBeDefined();
  });
});

// ✅ E2E Tests - Poucos testes críticos
describe("Complete Race Listing Flow", () => {
  it("should list races for telegram user", async () => {
    // Test complete flow from adapter to database
    const telegramMessage = createMockTelegramMessage("/corridas");
    const response = await telegramAdapter.processMessage(telegramMessage);

    expect(response.text).toContain("Corridas Disponíveis");
    expect(response.keyboard).toBeDefined();
  });
});
```

### 2. Test Quality Standards

```typescript
// ✅ Testes devem ser legíveis como especificações
describe("Race filtering by distance", () => {
  describe("when user requests 5km races", () => {
    it("should return only races with 5km distance", async () => {
      // Given
      const races = [
        createRace({ distances: [5, 10] }),
        createRace({ distances: [5] }),
        createRace({ distances: [10, 21] }),
      ];
      mockRaceRepository.findByDistance.mockResolvedValue([races[0], races[1]]);

      // When
      const result = await raceService.getRacesByDistance([5]);

      // Then
      expect(result).toHaveLength(2);
      expect(result.every((race) => race.distances.includes(5))).toBe(true);
    });
  });
});
```

## 🚀 Performance como Senior

### 1. Database Optimization

```typescript
// ❌ N+1 Query Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });
}

// ✅ Optimized with includes
const users = await prisma.user.findMany({
  include: {
    preferences: true,
  },
});

// ✅ Pagination for large datasets
const races = await prisma.race.findMany({
  where: {
    status: "OPEN",
    date: { gte: new Date() },
  },
  orderBy: { date: "asc" },
  take: 20,
  skip: page * 20,
});
```

### 2. Memory Management

```typescript
// ✅ Stream processing para dados grandes
export async function exportUserData(userId: string): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      const messages = await messageRepository.streamByUserId(userId);

      for await (const message of messages) {
        const chunk = JSON.stringify(message) + "\n";
        controller.enqueue(new TextEncoder().encode(chunk));
      }

      controller.close();
    },
  });
}

// ✅ Cleanup de listeners
export class TelegramAdapter {
  destroy(): void {
    this.bot.removeAllListeners();
    this.eventEmitter.removeAllListeners();
  }
}
```

## 🔒 Security como Senior

### 1. Input Validation

```typescript
// ✅ Comprehensive input validation
export function validateTelegramId(id: unknown): asserts id is string {
  if (typeof id !== "string") {
    throw new ValidationError("Telegram ID must be string");
  }

  if (!/^\d{5,}$/.test(id)) {
    throw new ValidationError("Invalid Telegram ID format");
  }

  if (id.length > 20) {
    throw new ValidationError("Telegram ID too long");
  }
}

// ✅ SQL Injection prevention (Prisma helps)
const users = await prisma.user.findMany({
  where: {
    name: {
      contains: userInput, // Prisma handles escaping
      mode: "insensitive",
    },
  },
});
```

### 2. Data Sanitization

```typescript
// ✅ Sanitize user input
export class MessageSanitizer {
  static sanitize(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/[<>]/g, "")
      .substring(0, 4000); // Telegram limit
  }

  static sanitizeForMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
  }
}
```

## 📊 Monitoring como Senior

### 1. Metrics Collection

```typescript
// ✅ Performance monitoring
export class PerformanceMonitor {
  static async measureAsync<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - start;

      logger.info(`Operation completed: ${operationName}`, {
        module: "PerformanceMonitor",
        operation: operationName,
        duration: Math.round(duration),
        success: true,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      logger.error(
        `Operation failed: ${operationName}`,
        {
          module: "PerformanceMonitor",
          operation: operationName,
          duration: Math.round(duration),
          success: false,
        },
        error as Error
      );

      throw error;
    }
  }
}

// Usage
const races = await PerformanceMonitor.measureAsync(
  () => raceService.getAvailableRaces(),
  "get_available_races"
);
```

### 2. Health Checks

```typescript
// ✅ System health monitoring
export class HealthChecker {
  async checkDatabase(): Promise<HealthStatus> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "healthy", timestamp: new Date() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async checkBot(): Promise<HealthStatus> {
    try {
      const me = await bot.getMe();
      return {
        status: "healthy",
        data: { botName: me.username },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
```

## 🎯 Code Review Standards

### Checklist para Senior Engineer

#### Architecture & Design

- [ ] Segue Clean Architecture principles
- [ ] Dependências apontam para dentro
- [ ] Single Responsibility Principle
- [ ] Interface Segregation aplicado
- [ ] Dependency Inversion implementado

#### Error Handling

- [ ] Todos os external calls tem try-catch
- [ ] Errors têm contexto adequado
- [ ] User-friendly error messages
- [ ] Logging estruturado implementado
- [ ] Fallbacks para casos críticos

#### Performance

- [ ] Queries otimizadas (sem N+1)
- [ ] Paginação para listas grandes
- [ ] Memory leaks considerados
- [ ] Streaming para dados grandes
- [ ] Indexes de database verificados

#### Security

- [ ] Input validation completa
- [ ] Data sanitization aplicada
- [ ] Rate limiting considerado
- [ ] Sensitive data não logada
- [ ] SQL injection prevention

#### Testing

- [ ] Unit tests para business logic
- [ ] Integration tests para fluxos críticos
- [ ] Mocks apropriados
- [ ] Test coverage adequado
- [ ] Performance tests se necessário

#### Code Quality

- [ ] TypeScript strict mode
- [ ] Nomes descritivos
- [ ] Funções pequenas e focadas
- [ ] DRY principle aplicado
- [ ] KISS principle seguido

## 💡 Senior Engineer Mindset

### Always Ask

1. **Scalability**: "Como isso vai performar com 10x mais dados?"
2. **Maintainability**: "Outro dev vai entender isso em 6 meses?"
3. **Testability**: "Como vou testar isso de forma isolada?"
4. **Errors**: "O que pode dar errado aqui?"
5. **Security**: "Que dados sensíveis estou lidando?"
6. **Performance**: "Isso vai criar gargalo?"
7. **User Experience**: "Como isso afeta o usuário final?"

### Continuous Improvement

- Refactore constantemente
- Questione decisões passadas
- Aprenda com code reviews
- Compartilhe conhecimento
- Documente decisões importantes
- Monitore métricas de qualidade
