# Architecture Patterns

## 🏗️ Padrões Arquiteturais Implementados

### 1. Clean Architecture (Arquitetura Limpa)

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTERS (Framework)                     │
│  • TelegramBotAdapter                                       │
│  • WhatsAppBotAdapter (futuro)                             │
│  • Database Adapters (Prisma)                              │
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
│  • Prisma Repositories                                    │
│  • Database (PostgreSQL)                                  │
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
export const userRepository = new PrismaUserRepository();
export const userService = new UserService(
  userRepository,
  userPreferencesRepository
);

// Uso nos handlers
export async function listUsersCommand(
  input: CommandInput
): Promise<CommandOutput> {
  // Injeta dependência via import
  const users = await userService.getAllUsers();
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

### 7. Repository Pattern

```typescript
// Interface do domínio
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementação de infraestrutura
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { preferences: true },
    });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(prismaUser: PrismaUser): User {
    // Converte modelo Prisma para entidade de domínio
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

## 📋 Vantagens dos Padrões Implementados

### Manutenibilidade

- Separação clara de responsabilidades
- Código organizado em camadas
- Facilidade para mudanças

### Testabilidade

- Dependency injection facilita mocking
- Interfaces permitem test doubles
- Isolamento de componentes

### Extensibilidade

- Novos adapters facilmente adicionados
- Novos comandos seguem mesmo padrão
- Sistema de callbacks expansível

### Reusabilidade

- Componentes podem ser reutilizados
- Lógica de negócio independente de framework
- Patterns consistentes

## 🎯 Guidelines para Novos Desenvolvimentos

1. **Sempre seguir Clean Architecture**: Dependências apontam para dentro
2. **Usar interfaces para contratos**: Facilita testes e extensões
3. **Separar lógica de negócio**: Domain layer independente
4. **Implementar error handling**: Try-catch em todas as operações externas
5. **Adicionar logs estruturados**: Para debugging e monitoramento
6. **Seguir patterns existentes**: Consistência é fundamental
