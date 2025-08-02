# Architecture Patterns

## 🏗️ Padrões Arquiteturais Implementados

### 1. Clean Architecture (Arquitetura Limpa)

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTERS (Framework)                     │
│  • TelegramBotAdapter                                       │
│  • WhatsAppBotAdapter (futuro)                             │
│  • HTTP Service Adapters                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Interface Adapters
┌─────────────────────────┼───────────────────────────────────┐
│                 APPLICATION LAYER                           │
│  • CommandRouter                                           │
│  • MessageInterceptor (Middleware)                         │
│  • Command Handlers                                        │
│  • Callback Handlers                                       │
└─────────────────────────┼───────────────────────────────────┘
                          │ Use Cases
┌─────────────────────────┼───────────────────────────────────┐
│                 DOMAIN LAYER                               │
│  • Entities (User, Race, Message, Payment)                │
│  • Services (Business Logic)                              │
│  • Repository Interfaces                                  │
│  • Value Objects                                          │
└─────────────────────────┼───────────────────────────────────┘
                          │ Enterprise Business Rules
┌─────────────────────────┼───────────────────────────────────┐
│               INFRASTRUCTURE                               │
│  • HTTP Services (UserApiService, RaceApiService)         │
│  • External APIs                                          │
│  • File System, Logging                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Domain Driven Design (DDD)

#### Bounded Contexts

- **User Management**: Gestão de usuários e preferências
- **Race Management**: Corridas, filtros, busca
- **Payment Management**: Pagamentos, assinaturas, produtos
- **Message Management**: Histórico de mensagens e chats
- **Bot Management**: Comandos, callbacks, interações

#### Aggregates

```typescript
// User Aggregate
User {
  - id: UserId
  - telegramId: TelegramId
  - preferences: UserPreferences
  - subscriptions: Subscription[]
}

// Race Aggregate
Race {
  - id: RaceId
  - title: RaceTitle
  - distances: Distance[]
  - location: Location
  - date: RaceDate
}

// Message Aggregate
Message {
  - id: MessageId
  - chat: Chat
  - user: User
  - content: MessageContent
  - media: Media[]
}
```

### 3. Dependency Injection Pattern

```typescript
// dependencies.ts - Container manual
export const userApiService = new UserApiService();
export const raceApiService = new RaceApiService();

// Uso nos handlers
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  // Injeta dependência via import
  const races = await raceApiService.getAvailableRaces();
  // ...
}
```

### 4. Command Pattern

```typescript
// Estrutura padrão para comandos
interface CommandHandler {
  (input: CommandInput): Promise<CommandOutput>;
}

// Registry de comandos
export class CommandRegistry {
  private handlers = new Map<string, CommandHandler>();

  register(name: string, handler: CommandHandler): void {
    this.handlers.set(name, handler);
  }

  getHandler(name: string): CommandHandler | undefined {
    return this.handlers.get(name);
  }
}
```

### 5. Observer Pattern (Callbacks)

```typescript
// Sistema de callbacks tipado
export interface CallbackHandler<T extends CallbackData> {
  handle(data: T, input: CommandInput): Promise<CommandOutput>;
}

// Implementação específica
export class RaceDetailsCallbackHandler
  implements CallbackHandler<RaceDetailsCallbackData>
{
  async handle(
    data: RaceDetailsCallbackData,
    input: CommandInput
  ): Promise<CommandOutput> {
    // Lógica específica para detalhes de corrida
  }
}
```

### 6. Middleware Pattern

```typescript
// MessageInterceptor como middleware
export class MessageInterceptor {
  async interceptIncomingMessage(input: CommandInput): Promise<void> {
    // Processa antes da execução do comando
  }

  async interceptOutgoingMessage(
    input: CommandInput,
    output: CommandOutput
  ): Promise<void> {
    // Processa após execução do comando
  }
}

// Uso no CommandRouter
export async function routeCommand(
  command: string,
  input: CommandInput
): Promise<CommandOutput> {
  // Intercepta entrada
  await messageInterceptor.interceptIncomingMessage(input);

  // Executa comando
  const output = await handler(input);

  // Intercepta saída
  await messageInterceptor.interceptOutgoingMessage(input, output);

  return output;
}
```

### 7. Service Layer Pattern

```typescript
// Interface para services
export interface ApiService {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

// Implementação específica por domínio
export class UserApiService {
  constructor(private httpClient: HttpClient) {}

  async registerUser(telegramId: string, name: string): Promise<User> {
    const response = await this.httpClient.post<User>('/users/register', {
      telegramId,
      name,
    });
    return response.data;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(
        `/users/telegram/${telegramId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
```

### 8. Adapter Pattern

```typescript
// Interface genérica para plataformas
export interface PlatformAdapter {
  sendMessage(chatId: string | number, output: CommandOutput): Promise<void>;
  editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void>;
}

// Implementação específica do Telegram
export class TelegramPlatformAdapter implements PlatformAdapter {
  constructor(private bot: TelegramBot) {}

  async sendMessage(
    chatId: string | number,
    output: CommandOutput
  ): Promise<void> {
    const keyboard = this.convertKeyboardToTelegram(output.keyboard);
    await this.bot.sendMessage(chatId, output.text, {
      parse_mode: output.format as ParseMode,
      reply_markup: keyboard,
    });
  }

  private convertKeyboardToTelegram(
    keyboard?: InteractionKeyboard
  ): InlineKeyboardMarkup | ReplyKeyboardMarkup | undefined {
    // Converte keyboard genérico para formato Telegram
  }
}
```

### 9. Factory Pattern

```typescript
// CallbackDataSerializer como Factory
export class CallbackDataSerializer {
  static raceDetails(raceId: string): RaceDetailsCallbackData {
    return {
      type: 'race_details',
      raceId,
    };
  }

  static racesFilter(distance: number): RaceFilterCallbackData {
    return {
      type: 'races_filter',
      distance,
    };
  }

  static serialize(data: CallbackData): string {
    switch (data.type) {
      case 'race_details':
        return `rd:${data.raceId}`;
      case 'races_filter':
        return `rf:${data.distance}`;
      // ...
    }
  }
}
```

### 10. Strategy Pattern

```typescript
// Estratégias para diferentes tipos de mensagem
interface MessageExtractionStrategy {
  extractMessageData(raw: unknown): MessageData | null;
}

class TelegramMessageStrategy implements MessageExtractionStrategy {
  extractMessageData(raw: unknown): MessageData | null {
    const telegramMsg = raw as TelegramMessage;
    return {
      messageId: telegramMsg.message_id,
      chatId: telegramMsg.chat.id,
      text: telegramMsg.text,
      // ...
    };
  }
}

class WhatsAppMessageStrategy implements MessageExtractionStrategy {
  extractMessageData(raw: unknown): MessageData | null {
    const whatsappMsg = raw as WhatsAppMessage;
    // Implementação específica
  }
}

// Uso no MessageInterceptor
export class MessageInterceptor {
  private strategies = new Map<string, MessageExtractionStrategy>([
    ['telegram', new TelegramMessageStrategy()],
    ['whatsapp', new WhatsAppMessageStrategy()],
  ]);

  private extractMessageData(input: CommandInput): MessageData | null {
    const strategy = this.strategies.get(input.platform || '');
    return strategy?.extractMessageData(input.raw) || null;
  }
}
```

### 11. HTTP Client Pattern (Interceptor + Response Wrapper)

```typescript
// Custom HTTP Client com interceptors
export class HttpClient {
  private api: AxiosInstance;

  constructor(baseURL?: string) {
    this.api = axios.create({ baseURL });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.response.use(response => {
      // Auto-extração da estrutura ApiResponse
      const responseData = response.data as ApiResponse;

      if (responseData?.success === false) {
        throw new ApiError(responseData.error || 'API operation failed');
      }

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

// Usage nos services
export class RaceApiService {
  async getAvailableRaces(): Promise<Race[]> {
    const response = await httpClient.get<Race[]>('/races/available');
    return response.data; // Acesso direto aos dados
  }
}
```

### 12. Service Layer Pattern (Modular)

```typescript
// Services especializados por domínio
export class UserApiService {
  private readonly baseUrl = '/users';

  async registerUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User> {
    const response = await httpClient.post<User>(`${this.baseUrl}/register`, {
      telegramId,
      name,
      username,
    });
    return response.data;
  }
}

export class RaceApiService {
  private readonly baseUrl = '/races';

  async getAvailableRaces(): Promise<Race[]> {
    const response = await httpClient.get<Race[]>(`${this.baseUrl}/available`);
    return response.data;
  }
}

// Exportação centralizada
export { userApiService } from './UserApiService.ts';
export { raceApiService } from './RaceApiService.ts';
export { chatApiService } from './ChatApiService.ts';
```

## 📋 Vantagens dos Padrões Implementados

### Manutenibilidade

- Separação clara de responsabilidades
- Código organizado em camadas
- Facilidade para mudanças
- Services modulares por domínio

### Testabilidade

- Dependency injection facilita mocking
- Interfaces permitem test doubles
- Isolamento de componentes
- HTTP Client testável com interceptors

### Extensibilidade

- Novos adapters facilmente adicionados
- Novos comandos seguem mesmo padrão
- Sistema de callbacks expansível
- HTTP Client extensível para novas APIs

### Reusabilidade

- Componentes podem ser reutilizados
- Lógica de negócio independente de framework
- Patterns consistentes
- Services modulares reutilizáveis

### Performance

- HTTP Client com interceptors otimizados
- Response caching capabilities
- Error handling centralizado
- Logging estruturado para debugging

## 🎯 Guidelines para Novos Desenvolvimentos

1. **Sempre seguir Clean Architecture**: Dependências apontam para dentro
2. **Usar interfaces para contratos**: Facilita testes e extensões
3. **Separar lógica de negócio**: Domain layer independente
4. **Implementar error handling**: Try-catch em todas as operações externas
5. **Adicionar logs estruturados**: Para debugging e monitoramento
6. **Seguir patterns existentes**: Consistência é fundamental
7. **Criar services modulares**: Um service por domínio/contexto
8. **Usar HttpClient customizado**: Para comunicação externa padronizada
