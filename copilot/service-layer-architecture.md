# Service Layer Architecture

## 🎯 Visão Geral

A arquitetura da camada de serviços foi refatorada para seguir princípios de **Single Responsibility** e **Modularidade**, substituindo o monolítico `ApiService.ts` por services específicos por domínio.

## 🏗️ Estrutura Modular

### Services por Domínio

```
src/services/
├── http/                    # HTTP Client personalizado
│   ├── HttpClient.ts        # Cliente HTTP com interceptors
│   ├── HttpClient.test.ts   # Testes unitários
│   └── HttpClient.integration.test.ts  # Testes de integração
├── UserApiService.ts        # Operações de usuário
├── RaceApiService.ts        # Operações de corridas
├── ChatApiService.ts        # Operações de chat
├── MessageApiService.ts     # Operações de mensagens
├── HealthApiService.ts      # Health checks
└── index.ts                 # Exportações centralizadas
```

## 🔧 HttpClient Architecture

### Problema Resolvido

O backend retorna respostas no formato `ApiResponse`:

```json
{
  "success": true,
  "data": {
    /* dados reais */
  },
  "message": "optional message"
}
```

O Axios adiciona automaticamente um wrapper `data`, resultando em:

```typescript
response.data.data; // ❌ Acesso duplo aos dados
```

### Solução Implementada

```typescript
export interface HttpResponse<T> {
  data: T; // Apenas os dados reais
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

      // Verifica se é uma ApiResponse válida
      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData
      ) {
        if (!responseData.success) {
          throw new ApiError(
            responseData.error ||
              responseData.message ||
              'API operation failed',
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
      }

      return response;
    });
  }

  async get<T>(url: string): Promise<HttpResponse<T>> {
    return this.api.get<T>(url) as Promise<HttpResponse<T>>;
  }
}
```

### Benefícios

1. **API Consistente**: Sempre `response.data` para acessar os dados
2. **Tratamento de Erros**: Automático para `success: false`
3. **Type Safety**: TypeScript garante tipos corretos
4. **Transparente**: Services existentes continuam funcionando
5. **Centralizado**: Uma única implementação para todas as requests

## 📋 Service Implementation Pattern

### Base Service Structure

```typescript
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
        name,
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

      logger.info('Successfully retrieved user by telegram ID', {
        module: 'UserApiService',
        action: 'get_user_by_telegram_id',
        userId: response.data.id,
        telegramId,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      logger.error(
        'Error getting user by telegram ID',
        {
          module: 'UserApiService',
          action: 'get_user_by_telegram_id',
          telegramId,
        },
        error as Error
      );
      throw error;
    }
  }
}
```

### Singleton Export Pattern

```typescript
// Singleton instance
export const userApiService = new UserApiService();
```

## 🎯 Service Responsibilities

### UserApiService

- `registerUser()`: Registro de novos usuários
- `getUserByTelegramId()`: Busca por Telegram ID
- `getUserById()`: Busca por ID interno

### RaceApiService

- `getAvailableRaces()`: Corridas disponíveis
- `getRaceById()`: Busca por ID da corrida
- `getRacesByDistances()`: Filtro por distâncias
- `getRacesByRange()`: Filtro por faixa de distância
- `getNextRace()`: Próximas corridas
- `createRace()`: Criação de corridas

### ChatApiService

- `getChatByTelegramId()`: Busca chat por Telegram ID
- `createChat()`: Criação de chat
- `getChatById()`: Busca por ID interno

### MessageApiService

- `createMessage()`: Criação de mensagens
- `getMessageById()`: Busca por ID da mensagem
- `getMessagesByChat()`: Histórico por chat

### HealthApiService

- `healthCheck()`: Verificação básica de saúde
- `getDetailedHealth()`: Status detalhado dos serviços

## 📦 Centralized Exports

```typescript
// services/index.ts
export { httpClient } from './http/HttpClient.ts';
export { userApiService } from './UserApiService.ts';
export { chatApiService } from './ChatApiService.ts';
export { messageApiService } from './MessageApiService.ts';
export { raceApiService } from './RaceApiService.ts';
export { healthApiService } from './HealthApiService.ts';

// Re-export types for convenience
export type { CreateUserRequest } from '../types/Service.ts';
export type { CreateChatRequest } from '../types/Service.ts';
export type { CreateMessageRequest } from '../types/Service.ts';
export type { Race, RaceStatus, CreateRaceRequest } from '../types/Service.ts';
```

## ✅ Usage Examples

### Simple Request

```typescript
import { raceApiService } from '@services/index.ts';

// ✅ Acesso direto aos dados
const races = await raceApiService.getAvailableRaces();
console.log(races); // Array<Race>
```

### Error Handling

```typescript
import { userApiService } from '@services/index.ts';
import { ApiError } from '@services/http/HttpClient.ts';

try {
  const user = await userApiService.getUserByTelegramId('123456');
  console.log(user); // User | null
} catch (error) {
  if (error instanceof ApiError && error.status === 404) {
    console.log('User not found');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Multiple Services

```typescript
import {
  userApiService,
  raceApiService,
  chatApiService,
} from '@services/index.ts';

// Coordenação entre múltiplos services
async function handleUserRegistration(telegramData: TelegramData) {
  const user = await userApiService.registerUser(
    telegramData.id.toString(),
    telegramData.first_name,
    telegramData.username
  );

  const chat = await chatApiService.createChat({
    telegramId: telegramData.id.toString(),
    type: 'private',
    title: telegramData.first_name,
    username: telegramData.username,
  });

  const races = await raceApiService.getAvailableRaces();

  return { user, chat, races };
}
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// HttpClient.test.ts
describe('HttpClient Response Logic', () => {
  it('should extract data from ApiResponse structure', () => {
    const mockApiResponse = {
      success: true,
      data: { id: '1', name: 'Test' },
    };

    // Test interceptor logic
    expect(extractedResponse.data).toEqual({ id: '1', name: 'Test' });
  });

  it('should handle error when success is false', () => {
    const mockApiResponse = {
      success: false,
      error: 'Something went wrong',
    };

    expect(() => {
      // Should throw ApiError
    }).toThrow('Something went wrong');
  });
});
```

### Integration Tests

```typescript
// HttpClient.integration.test.ts
describe('HttpClient Response Processing', () => {
  it('should correctly process ApiResponse structure', () => {
    const mockApiResponse: ApiResponse<{ id: string; name: string }> = {
      success: true,
      data: { id: '1', name: 'Test Race' },
      message: 'Success',
    };

    // Test real interceptor behavior
    expect(result.data).toEqual({ id: '1', name: 'Test Race' });
  });
});
```

## 🔄 Migration from Old Architecture

### Before (Monolithic)

```typescript
// ❌ Old way - Tudo em um service
class ApiService {
  async registerUser() {
    /* ... */
  }
  async getChatByTelegramId() {
    /* ... */
  }
  async createMessage() {
    /* ... */
  }
  async getAvailableRaces() {
    /* ... */
  }
  // ... 20+ methods
}
```

### After (Modular)

```typescript
// ✅ New way - Services específicos
class UserApiService {
  async registerUser() {
    /* ... */
  }
  async getUserByTelegramId() {
    /* ... */
  }
}

class ChatApiService {
  async getChatByTelegramId() {
    /* ... */
  }
  async createChat() {
    /* ... */
  }
}

class RaceApiService {
  async getAvailableRaces() {
    /* ... */
  }
  async getRaceById() {
    /* ... */
  }
}
```

## 📊 Benefits Summary

| Aspecto              | Antes                        | Depois                         |
| -------------------- | ---------------------------- | ------------------------------ |
| **Responsabilidade** | Monolítico (20+ métodos)     | Modular (3-5 métodos/service)  |
| **Testabilidade**    | Complexo (mock gigante)      | Simples (mocks específicos)    |
| **Manutenção**       | Difícil (arquivo grande)     | Fácil (arquivos pequenos)      |
| **Type Safety**      | Parcial                      | Completa com interceptors      |
| **Error Handling**   | Manual em cada método        | Automático no interceptor      |
| **Code Reuse**       | Baixo                        | Alto (HttpClient reutilizável) |
| **Development DX**   | Confuso (response.data.data) | Limpo (response.data)          |

## 🎯 Next Steps

1. **Adicionar Cache Layer**: Implementar cache nos services críticos
2. **Request Batching**: Otimizar múltiplas requests simultâneas
3. **Retry Logic**: Implementar retry automático para falhas temporárias
4. **Request Deduplication**: Evitar requests duplicadas
5. **Metrics Integration**: Adicionar métricas de performance por service
