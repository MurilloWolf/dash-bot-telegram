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
        findById: vi.fn().mockRejectedValue(new Error('API error')),
      };

      // Act & Assert
      await expect(service.methodName('invalid')).rejects.toThrow('API error');
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
        new Error('API connection failed')
      );

      // Act & Assert
      await expect(userService.registerUser(telegramId, name)).rejects.toThrow(
        'API connection failed'
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
vi.mock('@services/index.ts', () => ({
  raceApiService: {
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

    const { raceApiService } = await import('@services/index.ts');
    vi.mocked(raceApiService.getAvailableRaces).mockResolvedValue(mockRaces);

    // Act
    const result = await listRacesCommand(input);

    // Assert
    expect(result.text).toContain('Corridas Disponíveis');
    expect(result.format).toBe('HTML');
    expect(result.keyboard).toBeDefined();
    expect(result.keyboard?.buttons).toHaveLength(3); // 2 races + filter buttons
    expect(raceApiService.getAvailableRaces).toHaveBeenCalledTimes(1);
  });

  it('should return empty message when no races available', async () => {
    // Arrange
    const input: CommandInput = {
      user: { id: 12345, name: 'Test User' },
      platform: 'telegram',
    };

    const { raceApiService } = await import('@services/index.ts');
    vi.mocked(raceApiService.getAvailableRaces).mockResolvedValue([]);

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

    const { raceApiService } = await import('@services/index.ts');
    vi.mocked(raceApiService.getAvailableRaces).mockRejectedValue(
      new Error('API connection failed')
    );

    // Act & Assert
    await expect(listRacesCommand(input)).rejects.toThrow(
      'API connection failed'
    );
  });
});
```

## 🔗 Integration Testing

### API Service Integration Test

```typescript
// UserApiService.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserApiService } from '../UserApiService.ts';

describe('UserApiService Integration', () => {
  let userService: UserApiService;

  beforeAll(() => {
    // Use real HttpClient with test environment
    userService = new UserApiService();
  });

  afterAll(() => {
    // Cleanup test data if needed
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

### API Test Helpers

```typescript
// testUtils/apiHelpers.ts
export class ApiTestHelpers {
  static createMockApiResponse<T>(data: T, success = true): ApiResponse<T> {
    return {
      success,
      data,
      message: success ? 'Success' : 'Error',
    };
  }

  static createMockHttpResponse<T>(data: T, status = 200): HttpResponse<T> {
    return {
      data,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
    };
  }

  static async simulateApiDelay(ms: number = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
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

## 🔧 Service Layer Testing Patterns

### Testing HttpClient

```typescript
// HttpClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient, ApiError } from '../HttpClient.ts';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('http://api.test.com');
    vi.clearAllMocks();
  });

  describe('Response Processing', () => {
    it('should extract data from ApiResponse structure', async () => {
      // Arrange
      const mockApiResponse = {
        success: true,
        data: { id: '1', name: 'Test Race' },
        message: 'Success',
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({
          data: mockApiResponse,
          status: 200,
          statusText: 'OK',
        }),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      // Act
      const response = await httpClient.get<{ id: string; name: string }>(
        '/races'
      );

      // Assert
      expect(response.data).toEqual({ id: '1', name: 'Test Race' });
      expect(response.status).toBe(200);
    });

    it('should throw ApiError when success is false', async () => {
      // Arrange
      const mockApiResponse = {
        success: false,
        error: 'Race not found',
        data: null,
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({
          data: mockApiResponse,
          status: 404,
        }),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      // Act & Assert
      await expect(httpClient.get('/races/invalid')).rejects.toThrow(ApiError);
      await expect(httpClient.get('/races/invalid')).rejects.toThrow(
        'Race not found'
      );
    });
  });
});
```

### Testing Service Classes

```typescript
// UserApiService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserApiService } from '../UserApiService.ts';
import { httpClient } from '../http/HttpClient.ts';
import { ApiError } from '../http/HttpClient.ts';

// Mock the HttpClient
vi.mock('../http/HttpClient.ts', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UserApiService', () => {
  let userService: UserApiService;
  const mockHttpClient = vi.mocked(httpClient);

  beforeEach(() => {
    userService = new UserApiService();
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const telegramId = '123456789';
      const name = 'John Doe';
      const username = 'john_doe';

      const expectedUser = {
        id: 'user-123',
        telegramId,
        name,
        username,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      mockHttpClient.post.mockResolvedValue({
        data: expectedUser,
        status: 201,
        statusText: 'Created',
      });

      // Act
      const result = await userService.registerUser(telegramId, name, username);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/users/register', {
        telegramId,
        name,
        username,
      });
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      // Arrange
      const telegramId = '123456789';
      const name = 'John Doe';

      mockHttpClient.post.mockRejectedValue(
        new ApiError('User already exists', 409)
      );

      // Act & Assert
      await expect(userService.registerUser(telegramId, name)).rejects.toThrow(
        'User already exists'
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith('/users/register', {
        telegramId,
        name,
        username: undefined,
      });
    });
  });

  describe('getUserByTelegramId', () => {
    it('should return user when found', async () => {
      // Arrange
      const telegramId = '123456789';
      const expectedUser = {
        id: 'user-123',
        telegramId,
        name: 'John Doe',
        isActive: true,
      };

      mockHttpClient.get.mockResolvedValue({
        data: expectedUser,
        status: 200,
        statusText: 'OK',
      });

      // Act
      const result = await userService.getUserByTelegramId(telegramId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/users/telegram/${telegramId}`
      );
    });

    it('should return null when user not found (404)', async () => {
      // Arrange
      const telegramId = '987654321';

      mockHttpClient.get.mockRejectedValue(new ApiError('User not found', 404));

      // Act
      const result = await userService.getUserByTelegramId(telegramId);

      // Assert
      expect(result).toBeNull();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/users/telegram/${telegramId}`
      );
    });

    it('should throw error for non-404 errors', async () => {
      // Arrange
      const telegramId = '123456789';

      mockHttpClient.get.mockRejectedValue(
        new ApiError('Internal server error', 500)
      );

      // Act & Assert
      await expect(userService.getUserByTelegramId(telegramId)).rejects.toThrow(
        'Internal server error'
      );
    });
  });
});
```

### Integration Testing Services

```typescript
// UserApiService.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserApiService } from '../UserApiService.ts';

describe('UserApiService Integration', () => {
  let userService: UserApiService;

  beforeAll(() => {
    // Use real HttpClient with test environment
    userService = new UserApiService();
  });

  afterAll(() => {
    // Cleanup test data if needed
  });

  it('should complete full user registration flow', async () => {
    const telegramId = `test-${Date.now()}`;
    const name = 'Integration Test User';
    const username = 'test_user';

    // Register user
    const registeredUser = await userService.registerUser(
      telegramId,
      name,
      username
    );

    expect(registeredUser.telegramId).toBe(telegramId);
    expect(registeredUser.name).toBe(name);
    expect(registeredUser.username).toBe(username);

    // Retrieve user
    const retrievedUser = await userService.getUserByTelegramId(telegramId);

    expect(retrievedUser).not.toBeNull();
    expect(retrievedUser?.id).toBe(registeredUser.id);
  });
});
```

### Testing Service Singletons

```typescript
// services.test.ts
import { describe, it, expect } from 'vitest';
import { userApiService, raceApiService, chatApiService } from '../index.ts';

describe('Service Singletons', () => {
  it('should export singleton instances', () => {
    expect(userApiService).toBeDefined();
    expect(raceApiService).toBeDefined();
    expect(chatApiService).toBeDefined();
  });

  it('should maintain singleton behavior', () => {
    const { userApiService: service1 } = require('../index.ts');
    const { userApiService: service2 } = require('../index.ts');

    expect(service1).toBe(service2);
  });
});
```

### Mock Factories for Services

```typescript
// test-utils/serviceFactories.ts
import { vi } from 'vitest';

export const createMockUserApiService = () => ({
  registerUser: vi.fn(),
  getUserByTelegramId: vi.fn(),
  getUserById: vi.fn(),
});

export const createMockRaceApiService = () => ({
  getAvailableRaces: vi.fn(),
  getRaceById: vi.fn(),
  getRacesByDistances: vi.fn(),
  getNextRace: vi.fn(),
});

export const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

// Usage in tests
import { createMockUserApiService } from './test-utils/serviceFactories.ts';

describe('SomeComponent', () => {
  it('should work with mocked service', () => {
    const mockUserService = createMockUserApiService();
    mockUserService.getUserByTelegramId.mockResolvedValue(null);

    // Test logic here
  });
});
```

### Service Error Testing

```typescript
describe('Service Error Scenarios', () => {
  it('should handle network timeouts', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('Network timeout'));

    await expect(userService.getUserByTelegramId('123')).rejects.toThrow(
      'Network timeout'
    );
  });

  it('should handle malformed API responses', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: 'invalid json response',
      status: 200,
    });

    await expect(userService.getUserByTelegramId('123')).rejects.toThrow();
  });

  it('should handle API rate limiting', async () => {
    mockHttpClient.get.mockRejectedValue(
      new ApiError('Rate limit exceeded', 429)
    );

    await expect(userService.getUserByTelegramId('123')).rejects.toThrow(
      'Rate limit exceeded'
    );
  });
});
```
