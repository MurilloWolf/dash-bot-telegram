# Testing Guidelines & Best Practices

## 🧪 Testing Philosophy

### Testing Pyramid

```
    /\
   /  \    E2E Tests (Poucos)
  /____\   Integration Tests (Alguns)
 /______\  Unit Tests (Muitos)
/________\
```

- **Unit Tests**: 70-80% - Testam unidades isoladas
- **Integration Tests**: 15-25% - Testam integração entre componentes
- **E2E Tests**: 5-10% - Testam fluxos completos

### Principles

- **F.I.R.S.T**: Fast, Independent, Repeatable, Self-validating, Timely
- **AAA Pattern**: Arrange, Act, Assert
- **Given-When-Then**: Given context, When action, Then outcome
- **Test Behavior, Not Implementation**: Foco no que o código faz, não como

## 🎯 Test Structure Standards

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks, initialize test data
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('methodName', () => {
    it('should do something when conditions are met', async () => {
      // Arrange - Setup test data and mocks
      const mockData = { id: '123', name: 'Test' };
      const mockRepository = {
        findById: vi.fn().mockResolvedValue(mockData),
      };

      // Act - Execute the code under test
      const result = await service.methodName('123');

      // Assert - Verify the outcome
      expect(result).toEqual(mockData);
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle error case when something fails', async () => {
      // Arrange
      const mockRepository = {
        findById: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      // Act & Assert
      await expect(service.methodName('invalid')).rejects.toThrow(
        'Database error'
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('invalid');
    });
  });
});
```

### Service Test Example

```typescript
// UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../UserService.ts';
import {
  UserRepository,
  UserPreferencesRepository,
} from '../../repositories/UserRepository.ts';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: UserRepository;
  let mockUserPreferencesRepository: UserPreferencesRepository;

  beforeEach(() => {
    // Create mocks for all dependencies
    mockUserRepository = {
      findById: vi.fn(),
      findByTelegramId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockUserPreferencesRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Inject mocks into service
    userService = new UserService(
      mockUserRepository,
      mockUserPreferencesRepository
    );
  });

  describe('registerUser', () => {
    it('should create new user when user does not exist', async () => {
      // Arrange
      const telegramId = '123456789';
      const name = 'João Silva';
      const username = 'joao_silva';

      const expectedUser = {
        id: 'user-123',
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByTelegramId.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.registerUser(telegramId, name, username);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        telegramId,
        name,
        username,
        isActive: true,
        isPremium: false,
      });
    });

    it('should return existing user when user already exists', async () => {
      // Arrange
      const telegramId = '123456789';
      const name = 'João Silva';
      const existingUser = {
        id: 'user-123',
        telegramId,
        name: 'João Silva Existing',
        isActive: true,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByTelegramId.mockResolvedValue(existingUser);

      // Act
      const result = await userService.registerUser(telegramId, name);

      // Assert
      expect(result).toEqual(existingUser);
      expect(mockUserRepository.findByTelegramId).toHaveBeenCalledWith(
        telegramId
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when create fails', async () => {
      // Arrange
      const telegramId = '123456789';
      const name = 'João Silva';

      mockUserRepository.findByTelegramId.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(userService.registerUser(telegramId, name)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
```

### Command Handler Test Example

```typescript
// listRacesCommand.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listRacesCommand } from '../listRacesCommand.ts';
import { CommandInput } from '@app-types/Command.ts';

// Mock dependencies
vi.mock('@core/infra/dependencies', () => ({
  raceService: {
    getAvailableRaces: vi.fn(),
  },
}));

describe('listRacesCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return races list when races are available', async () => {
    // Arrange
    const mockRaces = [
      {
        id: 'race-1',
        title: 'Corrida do Ibirapuera',
        distances: ['5km', '10km'],
        date: new Date('2024-03-15'),
        location: 'São Paulo',
      },
      {
        id: 'race-2',
        title: 'Maratona de São Paulo',
        distances: ['21km', '42km'],
        date: new Date('2024-04-20'),
        location: 'São Paulo',
      },
    ];

    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      platform: 'telegram',
    };

    const { raceService } = await import('@core/infra/dependencies');
    vi.mocked(raceService.getAvailableRaces).mockResolvedValue(mockRaces);

    // Act
    const result = await listRacesCommand(input);

    // Assert
    expect(result.text).toContain('Corridas Disponíveis');
    expect(result.format).toBe('HTML');
    expect(result.keyboard).toBeDefined();
    expect(result.keyboard?.buttons).toHaveLength(3); // 2 races + filter buttons
    expect(raceService.getAvailableRaces).toHaveBeenCalledTimes(1);
  });

  it('should return empty message when no races available', async () => {
    // Arrange
    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      platform: 'telegram',
    };

    const { raceService } = await import('@core/infra/dependencies');
    vi.mocked(raceService.getAvailableRaces).mockResolvedValue([]);

    // Act
    const result = await listRacesCommand(input);

    // Assert
    expect(result.text).toBe('❌ Nenhuma corrida disponível no momento!');
    expect(result.format).toBe('HTML');
    expect(result.keyboard).toBeUndefined();
  });

  it('should handle service errors gracefully', async () => {
    // Arrange
    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      platform: 'telegram',
    };

    const { raceService } = await import('@core/infra/dependencies');
    vi.mocked(raceService.getAvailableRaces).mockRejectedValue(
      new Error('Database connection failed')
    );

    // Act & Assert
    await expect(listRacesCommand(input)).rejects.toThrow(
      'Database connection failed'
    );
  });
});
```

## 🔗 Integration Testing

### Repository Integration Test

```typescript
// PrismaUserRepository.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../PrismaUserRepository.ts';

describe('PrismaUserRepository Integration', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeEach(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });

    repository = new PrismaUserRepository(prisma);

    // Clean test data
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should create and find user', async () => {
    // Arrange
    const userData = {
      telegramId: '123456789',
      name: 'João Silva',
      username: 'joao_silva',
      isActive: true,
      isPremium: false,
    };

    // Act
    const createdUser = await repository.create(userData);
    const foundUser = await repository.findById(createdUser.id);

    // Assert
    expect(foundUser).toMatchObject(userData);
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.createdAt).toBeInstanceOf(Date);
  });
});
```

### Command Router Integration Test

```typescript
// CommandRouter.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { routeCommand } from '../CommandRouter.ts';
import { CommandInput } from '@app-types/Command.ts';

describe('CommandRouter Integration', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should route known command successfully', async () => {
    // Arrange
    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      args: [],
      platform: 'telegram',
    };

    // Act
    const result = await routeCommand('corridas', input);

    // Assert
    expect(result.text).toBeDefined();
    expect(result.format).toBe('HTML');
  });

  it('should handle unknown command gracefully', async () => {
    // Arrange
    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      platform: 'telegram',
    };

    // Act
    const result = await routeCommand('unknown_command', input);

    // Assert
    expect(result.text).toContain('Comando não reconhecido');
  });
});
```

## 🎯 Test Utilities & Helpers

### Mock Factories

```typescript
// testUtils/mockFactories.ts
export class MockFactories {
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-123',
      telegramId: '123456789',
      name: 'Test User',
      username: 'test_user',
      isActive: true,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockRace(overrides: Partial<Race> = {}): Race {
    return {
      id: 'race-123',
      title: 'Test Race',
      organization: 'Test Org',
      distances: ['5km', '10km'],
      distancesNumbers: [5, 10],
      date: new Date('2024-12-31'),
      location: 'Test Location',
      link: 'https://test.com',
      time: '08:00',
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockCommandInput(
    overrides: Partial<CommandInput> = {}
  ): CommandInput {
    return {
      user: { id: 12345, name: 'Test User' },
      args: [],
      platform: 'telegram',
      ...overrides,
    };
  }
}
```

### Database Test Helpers

```typescript
// testUtils/databaseHelpers.ts
export class DatabaseTestHelpers {
  static async cleanDatabase(prisma: PrismaClient): Promise<void> {
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.user.deleteMany();
    await prisma.race.deleteMany();
  }

  static async seedTestData(prisma: PrismaClient): Promise<void> {
    await prisma.user.create({
      data: MockFactories.createMockUser(),
    });

    await prisma.race.createMany({
      data: [
        MockFactories.createMockRace({ title: 'Test Race 1' }),
        MockFactories.createMockRace({ title: 'Test Race 2' }),
      ],
    });
  }
}
```

## 📊 Test Coverage Standards

### Coverage Requirements

- **Unit Tests**: Minimum 80% coverage
- **Critical Paths**: 95% coverage (payment, user registration)
- **Integration Tests**: Cover main user flows
- **E2E Tests**: Cover critical business scenarios

### Coverage Commands

```bash
# Run tests with coverage
npm run test -- --coverage

# Coverage thresholds in vitest.config.ts
test: {
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  }
}
```

## 🐛 Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle database connection errors', async () => {
    // Arrange
    mockRepository.findById.mockRejectedValue(new Error('Connection refused'));

    // Act & Assert
    await expect(service.getUser('123')).rejects.toThrow('Connection refused');
  });

  it('should handle invalid input gracefully', async () => {
    // Act
    const result = await service.registerUser('', '');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid input');
  });
});
```

## 🚀 Test Performance

```typescript
describe('Performance Tests', () => {
  it('should process large dataset efficiently', async () => {
    // Arrange
    const largeDataset = Array.from({ length: 1000 }, (_, i) =>
      MockFactories.createMockRace({ id: `race-${i}` })
    );

    const startTime = performance.now();

    // Act
    const result = await service.processRaces(largeDataset);

    // Assert
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
    expect(result).toHaveLength(1000);
  });
});
```

## 📋 Test Checklist

### Before Implementing New Feature

- [ ] Escrever testes falhando primeiro (TDD)
- [ ] Implementar funcionalidade mínima
- [ ] Refatorar com testes passando
- [ ] Verificar cobertura de testes

### Code Review Checklist

- [ ] Testes cobrem cenários felizes
- [ ] Testes cobrem cenários de erro
- [ ] Testes são independentes
- [ ] Nomes de testes são descritivos
- [ ] Mocks são apropriados
- [ ] Cobertura é adequada
