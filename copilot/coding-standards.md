# Coding Standards & Best Practices

## 🎯 Princípios Gerais

### SOLID Principles

- **Single Responsibility**: Cada classe/função tem uma única responsabilidade
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Liskov Substitution**: Subtipos devem ser substituíveis por seus tipos base
- **Interface Segregation**: Interfaces específicas são melhores que genéricas
- **Dependency Inversion**: Dependa de abstrações, não de implementações

### Clean Code

- Nomes descritivos e claros
- Funções pequenas e focadas
- Evitar comentários desnecessários
- Código auto-documentado

## 📝 Convenções de Nomenclatura

### Arquivos e Diretórios

```typescript
// ✅ Bom - PascalCase para classes/tipos
UserService.ts
CommandRouter.ts
MessageInterceptor.ts

// ✅ Bom - camelCase para funções/variáveis
listRacesCommand.ts
parseCommand.ts
markdownUtils.ts

// ✅ Bom - kebab-case para diretórios
src/adapters/in/telegram/
src/services/http/
src/Bot/commands/
```

### Variáveis e Funções

```typescript
// ✅ Bom - camelCase
const userName = 'João';
const isUserPremium = true;
const userPreferences = {};

// ✅ Bom - Verbos para funções
async function createUser() {}
async function getUserById() {}
async function updateUserPreferences() {}

// ✅ Bom - Nomes descritivos
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const databaseConnectionUrl = process.env.DATABASE_URL;
```

### Classes e Interfaces

```typescript
// ✅ Bom - PascalCase
class UserService {}
interface UserRepository {}
type CommandOutput = {};

// ✅ Bom - Prefixos claros para interfaces
interface IUserRepository {} // Interface
type TUserData = {}; // Type
enum EMessageType {} // Enum
```

## 🏗️ Estrutura de Código

### Imports Organization

````typescript
### Imports Organization

```typescript
// ✅ Bom - Ordem de imports
// 1. Node modules
import axios from 'axios';
import { TelegramBot } from 'node-telegram-bot-api';

// 2. Internal modules (com alias)
import { httpClient } from '@services/http/HttpClient.ts';
import { userApiService, raceApiService } from '@services/index.ts';
import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { logger } from '../utils/Logger.ts';

// 3. Types (separados)
import type { User, Race, Chat } from '@app-types/Service.ts';
import type { HttpResponse } from '@services/http/HttpClient.ts';
````

### Path Aliases

```typescript
// ✅ Use alias configurados no tsconfig.json
import { CommandRouter } from '@bot/router/CommandRouter.ts';
import { httpClient } from '@services/http/HttpClient.ts';
import { userApiService, raceApiService } from '@services/index.ts';
import { RaceFormatter } from '@utils/formatters/RaceFormatter.ts';

// ❌ Evite imports relativos longos
import { CommandRouter } from '../../../Bot/router/CommandRouter.ts';
```

````

### Function Structure

```typescript
// ✅ Estrutura padrão para comandos
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    // 1. Validação de entrada
    if (!input.user?.id) {
      return {
        text: '❌ Erro: usuário não identificado',
        format: 'HTML',
      };
    }

    // 2. Lógica de negócio
    const races = await raceService.getAvailableRaces();

    // 3. Formatação da resposta
    const buttons = races.map(race => ({
      text: `🏃‍♂️ ${race.title}`,
      callbackData: CallbackDataSerializer.raceDetails(race.id),
    }));

    // 4. Retorno estruturado
    return {
      text: '🏃‍♂️ **Corridas Disponíveis**',
      format: 'HTML',
      keyboard: { buttons: [buttons], inline: true },
    };
  } catch (error) {
    logger.commandError('listRaces', error as Error, input.user?.id);
    return {
      text: '❌ Erro interno. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
````

### Class Structure

```typescript
// ✅ Estrutura padrão para services
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private preferencesRepository: UserPreferencesRepository
  ) {}

  // Public methods primeiro
  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    // Implementation
  }

  async getUserById(id: string): Promise<User | null> {
    // Implementation
  }

  // Private methods por último
  private validateUserData(data: UserData): void {
    // Implementation
  }
}
```

## 🎨 Formatting & Style

### TypeScript Configuration

```typescript
// Sempre usar strict mode
"strict": true
"noImplicitAny": true
"strictNullChecks": true

// Imports com extensões explícitas
import { UserService } from "./UserService.ts";

// Preferir interfaces para contratos
interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: UserData): Promise<User>;
}
```

### Error Handling Pattern

```typescript
// ✅ Padrão para tratamento de erros
try {
  const result = await riskyOperation();
  logger.info('Operation completed', {
    module: 'UserService',
    action: 'create_user',
    userId: result.id,
  });
  return result;
} catch (error) {
  logger.error(
    'Failed to create user',
    {
      module: 'UserService',
      action: 'create_user_error',
      telegramId: data.telegramId,
    },
    error as Error
  );
  throw new UserCreationError('Could not create user', { cause: error });
}
```

### Logging Pattern

```typescript
// ✅ Sempre usar contexto estruturado
logger.info('User registered successfully', {
  module: 'UserService',
  action: 'register_user',
  userId: user.id,
  telegramId: user.telegramId,
});

logger.commandExecution('listRaces', input.user?.id);
logger.commandError('searchRaces', error, input.user?.id);
```

## 🧪 Testing Standards

### Unit Test Structure

```typescript
// ✅ Estrutura padrão para testes
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    // Setup mocks
    mockUserRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };

    userService = new UserService(mockUserRepository);
  });

  describe('registerUser', () => {
    it('should create new user when user does not exist', async () => {
      // Arrange
      const telegramId = '123456';
      const name = 'Test User';
      mockUserRepository.findByTelegramId.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await userService.registerUser(telegramId, name);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        telegramId,
        name,
        isActive: true,
        isPremium: false,
      });
    });
  });
});
```

## 📊 Performance Guidelines

### Performance Guidelines

### HTTP Requests

```typescript
// ✅ Sempre usar HttpClient customizado
// ✅ Implementar retry logic quando necessário
// ✅ Usar timeout apropriado

// Exemplo com HttpClient
const races = await raceApiService.getAvailableRaces();
```

### Memory Management

```typescript
// ✅ Evitar vazamentos de memória
// ✅ Limpar listeners quando não precisar
// ✅ Usar streams para dados grandes

// Exemplo com cleanup
export class TelegramBotAdapter {
  constructor(private bot: TelegramBot) {
    this.setupEventListeners();
  }

  destroy(): void {
    this.bot.removeAllListeners();
  }
}
```

## 🚀 Code Quality

### ESLint Rules Applied

- `@typescript-eslint/no-unused-vars`: Error
- `@typescript-eslint/no-explicit-any`: Warn
- `prefer-const`: Error
- `no-var`: Error

### Code Review Checklist

- [ ] Nomes descritivos e claros
- [ ] Funções pequenas (< 20 linhas idealmente)
- [ ] Error handling adequado
- [ ] Logs estruturados
- [ ] Tipos TypeScript corretos
- [ ] Testes unitários
- [ ] Performance considerada
- [ ] Segurança validada

## 🔒 Security Best Practices

```typescript
// ✅ Sanitização de inputs
const sanitizedText = MessageSanitizer.sanitize(userInput);

// ✅ Validação de tipos
if (typeof telegramId !== 'string' || !telegramId.trim()) {
  throw new InvalidInputError('Invalid telegram ID');
}

// ✅ Rate limiting (futuro)
// ✅ Input validation
// ✅ API error handling with HttpClient
```

## 🌐 Service Layer Standards

### HTTP Client Usage

```typescript
// ✅ Bom - Use HttpClient customizado
import { httpClient, ApiError } from '@services/http/HttpClient.ts';

export class RaceApiService {
  private readonly baseUrl = '/races';

  async getAvailableRaces(): Promise<Race[]> {
    try {
      const response = await httpClient.get<Race[]>(
        `${this.baseUrl}/available`
      );

      logger.info('Successfully retrieved available races', {
        module: 'RaceApiService',
        action: 'get_available_races',
        racesCount: response.data.length,
      });

      return response.data; // Acesso direto aos dados
    } catch (error) {
      logger.error(
        'Error getting available races',
        {
          module: 'RaceApiService',
          action: 'get_available_races',
        },
        error as Error
      );
      throw error;
    }
  }

  async getRaceById(id: string): Promise<Race | null> {
    try {
      const response = await httpClient.get<Race>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: unknown) {
      // ✅ Handle specific errors
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
```

### Service Export Pattern

```typescript
// ✅ Bom - Singleton pattern
export class UserApiService {
  private readonly baseUrl = '/users';
  // implementation...
}

// Export singleton instance
export const userApiService = new UserApiService();

// ✅ Centralized exports in index.ts
export { httpClient } from './http/HttpClient.ts';
export { userApiService } from './UserApiService.ts';
export { raceApiService } from './RaceApiService.ts';
export { chatApiService } from './ChatApiService.ts';
```

### Error Handling Standards

```typescript
// ✅ Bom - Consistent error handling
async getUserByTelegramId(telegramId: string): Promise<User | null> {
  try {
    const response = await httpClient.get<User>(`${this.baseUrl}/telegram/${telegramId}`);

    logger.info('Successfully retrieved user', {
      module: 'UserApiService',
      action: 'get_user_by_telegram_id',
      userId: response.data.id,
      telegramId,
    });

    return response.data;
  } catch (error: unknown) {
    // Handle expected 404s
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // Log and re-throw unexpected errors
    logger.error('Error getting user by telegram ID', {
      module: 'UserApiService',
      action: 'get_user_by_telegram_id',
      telegramId,
    }, error as Error);

    throw error;
  }
}
```
