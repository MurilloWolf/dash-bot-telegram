# Callback System Implementation Guide

## 🔄 Sistema de Callbacks Tipado

### Arquitetura do Sistema

```typescript
// Fluxo completo do sistema de callbacks
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User clicks   │    │   Telegram      │    │ CallbackManager │
│   button with   │───▶│   receives      │───▶│ deserializes    │
│   callback_data │    │   callback      │    │ and routes      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Response      │◀───│   Handler       │◀───│   Specific      │
│   sent to user  │    │   processes     │    │   CallbackHandler│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1. Callback Data Definition

```typescript
// ✅ Base interface for all callbacks
export interface CallbackData {
  type: string;
  [key: string]: unknown;
}

// ✅ Race-specific callback types
export interface RaceDetailsCallbackData extends CallbackData {
  type: 'race_details';
  raceId: string;
  source?: 'list' | 'search' | 'recommendation';
}

export interface RaceFilterCallbackData extends CallbackData {
  type: 'races_filter';
  distance: number;
  location?: string;
}

export interface RaceReminderCallbackData extends CallbackData {
  type: 'race_reminder';
  raceId: string;
  action: 'set' | 'cancel' | 'modify';
  reminderDays?: number;
}

// ✅ User-specific callback types
export interface UserConfigCallbackData extends CallbackData {
  type: 'user_config';
  action: 'distances' | 'notifications' | 'reminder' | 'timezone';
  value?: string | number | boolean;
}

// ✅ Navigation callback types
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
  target: string;
  itemsPerPage?: number;
}

// ✅ Union type for all callback data
export type AllCallbackData =
  | RaceDetailsCallbackData
  | RaceFilterCallbackData
  | RaceReminderCallbackData
  | UserConfigCallbackData
  | NavigationCallbackData
  | PaginationCallbackData;
```

### 2. Callback Data Serialization

```typescript
// ✅ Serializer para conversão string ↔ objeto
export class CallbackDataSerializer {
  // Factory methods para criar callback data
  static raceDetails(raceId: string, source?: string): RaceDetailsCallbackData {
    return { type: 'race_details', raceId, source };
  }

  static racesFilter(
    distance: number,
    location?: string
  ): RaceFilterCallbackData {
    return { type: 'races_filter', distance, location };
  }

  static raceReminder(
    raceId: string,
    action: 'set' | 'cancel',
    reminderDays?: number
  ): RaceReminderCallbackData {
    return { type: 'race_reminder', raceId, action, reminderDays };
  }

  static userConfig(
    action: string,
    value?: string | number | boolean
  ): UserConfigCallbackData {
    return { type: 'user_config', action, value };
  }

  static navigation(
    action: string,
    target: string,
    context?: Record<string, unknown>
  ): NavigationCallbackData {
    return { type: 'navigation', action, target, context };
  }

  static pagination(
    action: 'next' | 'prev' | 'goto',
    page: number,
    target: string
  ): PaginationCallbackData {
    return { type: 'pagination', action, page, target };
  }

  // Serialização para transmissão
  static serialize(data: AllCallbackData): string {
    try {
      switch (data.type) {
        case 'race_details':
          return `rd:${data.raceId}${data.source ? `:${data.source}` : ''}`;

        case 'races_filter':
          return `rf:${data.distance}${
            data.location ? `:${encodeURIComponent(data.location)}` : ''
          }`;

        case 'race_reminder':
          return `rr:${data.raceId}:${data.action}${
            data.reminderDays ? `:${data.reminderDays}` : ''
          }`;

        case 'user_config':
          return `uc:${data.action}${
            data.value ? `:${encodeURIComponent(String(data.value))}` : ''
          }`;

        case 'navigation':
          const contextStr = data.context
            ? encodeURIComponent(JSON.stringify(data.context))
            : '';
          return `nav:${data.action}:${data.target}${
            contextStr ? `:${contextStr}` : ''
          }`;

        case 'pagination':
          return `pag:${data.action}:${data.page}:${data.target}`;

        default:
          throw new Error(
            `Unsupported callback type: ${(data as AllCallbackData).type}`
          );
      }
    } catch (error) {
      logger.error(
        'Failed to serialize callback data',
        { data },
        error as Error
      );
      throw new CallbackSerializationError('Serialization failed', {
        cause: error,
      });
    }
  }

  // Desserialização de transmissão
  static deserialize(serialized: string): AllCallbackData {
    try {
      const parts = serialized.split(':');
      const prefix = parts[0];

      switch (prefix) {
        case 'rd':
          return {
            type: 'race_details',
            raceId: parts[1],
            source: parts[2] as
              | 'list'
              | 'search'
              | 'recommendation'
              | undefined,
          } as RaceDetailsCallbackData;

        case 'rf':
          return {
            type: 'races_filter',
            distance: parseInt(parts[1]),
            location: parts[2] ? decodeURIComponent(parts[2]) : undefined,
          } as RaceFilterCallbackData;

        case 'rr':
          return {
            type: 'race_reminder',
            raceId: parts[1],
            action: parts[2] as 'set' | 'cancel',
            reminderDays: parts[3] ? parseInt(parts[3]) : undefined,
          } as RaceReminderCallbackData;

        case 'uc':
          return {
            type: 'user_config',
            action: parts[1],
            value: parts[2] ? decodeURIComponent(parts[2]) : undefined,
          } as UserConfigCallbackData;

        case 'nav':
          return {
            type: 'navigation',
            action: parts[1],
            target: parts[2],
            context: parts[3]
              ? JSON.parse(decodeURIComponent(parts[3]))
              : undefined,
          } as NavigationCallbackData;

        case 'pag':
          return {
            type: 'pagination',
            action: parts[1] as 'next' | 'prev' | 'goto',
            page: parseInt(parts[2]),
            target: parts[3],
          } as PaginationCallbackData;

        default:
          throw new Error(`Unknown callback prefix: ${prefix}`);
      }
    } catch (error) {
      logger.error(
        'Failed to deserialize callback data',
        { serialized },
        error as Error
      );
      throw new CallbackDeserializationError('Deserialization failed', {
        cause: error,
      });
    }
  }

  // Validação
  static validate(serialized: string): boolean {
    try {
      this.deserialize(serialized);
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3. Callback Handler Implementation

```typescript
// ✅ Interface base para handlers
export interface CallbackHandler<T extends CallbackData> {
  readonly type: string;
  handle(data: T, input: CommandInput): Promise<CommandOutput>;
  validate?(data: unknown): data is T;
}

// ✅ Handler para detalhes de corrida
export class RaceDetailsCallbackHandler
  implements CallbackHandler<RaceDetailsCallbackData>
{
  readonly type = 'race_details';

  async handle(
    data: RaceDetailsCallbackData,
    input: CommandInput
  ): Promise<CommandOutput> {
    try {
      // 1. Validação de entrada
      if (!data.raceId) {
        logger.warn('Race details callback without raceId', {
          module: 'RaceDetailsCallbackHandler',
          data,
          userId: input.user?.id,
        });
        return {
          text: '❌ ID da corrida não especificado',
          format: 'HTML',
        };
      }

      // 2. Buscar dados da corrida
      const race = await raceService.getRaceById(data.raceId);

      if (!race) {
        logger.warn('Race not found for details callback', {
          module: 'RaceDetailsCallbackHandler',
          raceId: data.raceId,
          userId: input.user?.id,
        });
        return {
          text: '❌ Corrida não encontrada',
          format: 'HTML',
        };
      }

      // 3. Formatar detalhes da corrida
      const raceDetails = this.formatRaceDetails(race);

      // 4. Construir keyboard de ações
      const actionButtons = this.buildActionButtons(race, data.source);

      // 5. Log da ação
      logger.callbackExecution('race_details', input.user?.id?.toString(), {
        raceId: data.raceId,
        raceTitle: race.title,
        source: data.source,
      });

      return {
        text: raceDetails,
        format: 'HTML',
        keyboard: {
          buttons: actionButtons,
          inline: true,
        },
        editMessage: true, // Edita mensagem existente
      };
    } catch (error) {
      logger.callbackError(
        'race_details',
        error as Error,
        input.user?.id?.toString()
      );
      return {
        text: '❌ Erro ao carregar detalhes da corrida. Tente novamente.',
        format: 'HTML',
      };
    }
  }

  private formatRaceDetails(race: Race): string {
    const statusEmoji = this.getRaceStatusEmoji(race.status);
    const distancesText = race.distances.join(', ');
    const dateText = this.formatDate(race.date);

    return `
🏃‍♂️ **${race.title}**

🏢 **Organização:** ${race.organization}
📅 **Data:** ${dateText}
⏰ **Horário:** ${race.time}
📍 **Local:** ${race.location}
🏃‍♂️ **Distâncias:** ${distancesText}
📊 **Status:** ${statusEmoji} ${race.status}

🔗 [Mais informações e inscrições](${race.link})
    `.trim();
  }

  private buildActionButtons(
    race: Race,
    source?: string
  ): InteractionButton[][] {
    const buttons: InteractionButton[][] = [
      [
        {
          text: '🔔 Lembrete',
          callbackData: CallbackDataSerializer.raceReminder(race.id, 'set'),
        },
        {
          text: '📍 Localização',
          callbackData: CallbackDataSerializer.raceLocation(race.id),
        },
      ],
      [
        {
          text: '📤 Compartilhar',
          callbackData: CallbackDataSerializer.shareRace(race.id),
        },
      ],
    ];

    // Botão de voltar baseado na origem
    const backButton = this.getBackButton(source);
    if (backButton) {
      buttons.push([backButton]);
    }

    return buttons;
  }

  private getBackButton(source?: string): InteractionButton | null {
    switch (source) {
      case 'list':
        return {
          text: '⬅️ Voltar à Lista',
          callbackData: CallbackDataSerializer.racesList(),
        };
      case 'search':
        return {
          text: '⬅️ Voltar à Busca',
          callbackData: CallbackDataSerializer.racesSearch(),
        };
      default:
        return {
          text: '⬅️ Menu Principal',
          callbackData: CallbackDataSerializer.navigation('home', 'main'),
        };
    }
  }

  private getRaceStatusEmoji(status: string): string {
    switch (status) {
      case 'OPEN':
        return '🟢';
      case 'CLOSED':
        return '🔴';
      case 'COMING_SOON':
        return '🟡';
      case 'CANCELLED':
        return '⛔';
      default:
        return '❓';
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}

// ✅ Handler para filtros de corrida
export class RaceFilterCallbackHandler
  implements CallbackHandler<RaceFilterCallbackData>
{
  readonly type = 'races_filter';

  async handle(
    data: RaceFilterCallbackData,
    input: CommandInput
  ): Promise<CommandOutput> {
    try {
      // Buscar corridas por distância
      const races = await raceService.getRacesByDistance([data.distance]);

      if (races.length === 0) {
        return {
          text: `❌ Nenhuma corrida encontrada para ${data.distance}km`,
          format: 'HTML',
          keyboard: {
            buttons: [
              [
                {
                  text: '⬅️ Voltar aos Filtros',
                  callbackData: CallbackDataSerializer.racesList(),
                },
              ],
            ],
            inline: true,
          },
        };
      }

      // Construir lista de corridas
      const raceButtons = races.slice(0, 10).map(race => [
        {
          text: `🏃‍♂️ ${race.title} - ${this.formatDate(race.date)}`,
          callbackData: CallbackDataSerializer.raceDetails(race.id, 'list'),
        },
      ]);

      // Adicionar controles de navegação
      const navigationButtons = [
        [
          {
            text: '🔄 Outros Filtros',
            callbackData: CallbackDataSerializer.racesList(),
          },
        ],
      ];

      // Log da ação
      logger.callbackExecution('races_filter', input.user?.id?.toString(), {
        distance: data.distance,
        resultCount: races.length,
      });

      return {
        text: `🏃‍♂️ **Corridas ${data.distance}km**

Encontradas ${races.length} corrida(s):`,
        format: 'HTML',
        keyboard: {
          buttons: [...raceButtons, ...navigationButtons],
          inline: true,
        },
        editMessage: true,
      };
    } catch (error) {
      logger.callbackError(
        'races_filter',
        error as Error,
        input.user?.id?.toString()
      );
      return {
        text: '❌ Erro ao filtrar corridas. Tente novamente.',
        format: 'HTML',
      };
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }
}
```

### 4. Callback Manager

```typescript
// ✅ Gerenciador central de callbacks
export class CallbackManager {
  private handlers = new Map<string, CallbackHandler<CallbackData>>();

  // Registro de handlers
  register<T extends CallbackData>(handler: CallbackHandler<T>): void {
    this.handlers.set(handler.type, handler as CallbackHandler<CallbackData>);
    logger.info(`Callback handler registered: ${handler.type}`, {
      module: 'CallbackManager',
      action: 'register_handler',
      handlerType: handler.type,
    });
  }

  // Execução de callback
  async handle(
    callbackData: string,
    input: CommandInput
  ): Promise<CommandOutput> {
    try {
      // 1. Deserializar dados do callback
      const data = CallbackDataSerializer.deserialize(callbackData);

      // 2. Encontrar handler
      const handler = this.handlers.get(data.type);
      if (!handler) {
        logger.warn(`No handler found for callback type: ${data.type}`, {
          module: 'CallbackManager',
          action: 'handle_callback',
          callbackType: data.type,
          userId: input.user?.id,
        });

        return {
          text: '❌ Ação não suportada. Tente novamente.',
          format: 'HTML',
        };
      }

      // 3. Executar handler
      logger.callbackExecution(data.type, input.user?.id?.toString());
      return await handler.handle(data, input);
    } catch (error) {
      logger.error(
        'Callback execution failed',
        {
          module: 'CallbackManager',
          action: 'handle_callback_error',
          callbackData,
          userId: input.user?.id,
        },
        error as Error
      );

      return {
        text: '❌ Erro interno. Tente novamente mais tarde.',
        format: 'HTML',
      };
    }
  }

  // Métodos utilitários
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }

  unregister(type: string): boolean {
    return this.handlers.delete(type);
  }
}

// ✅ Instância singleton
export const callbackManager = new CallbackManager();
```

### 5. Callback Initialization

```typescript
// ✅ Inicialização automática de callbacks
export async function initializeCallbacks(): Promise<void> {
  logger.info('Initializing callback system...', {
    module: 'CallbackInitializer',
    action: 'initialize_start',
  });

  try {
    // Registrar handlers de corridas
    const raceHandlers = await import(
      '@bot/commands/usecases/races/callbacks/index.ts'
    );
    for (const handler of raceHandlers.raceCallbackHandlers) {
      callbackManager.register(handler);
    }

    // Registrar handlers de usuário
    const userHandlers = await import(
      '@bot/commands/usecases/user/callbacks/index.ts'
    );
    for (const handler of userHandlers.userCallbackHandlers) {
      callbackManager.register(handler);
    }

    // Registrar handlers compartilhados
    const sharedHandlers = await import(
      '@bot/commands/usecases/shared/callbacks/index.ts'
    );
    for (const handler of sharedHandlers.sharedCallbackHandlers) {
      callbackManager.register(handler);
    }

    const registeredTypes = callbackManager.getRegisteredTypes();
    logger.info('Callback system initialized successfully', {
      module: 'CallbackInitializer',
      action: 'initialize_complete',
      handlerCount: registeredTypes.length,
      registeredTypes,
    });
  } catch (error) {
    logger.error(
      'Failed to initialize callback system',
      {
        module: 'CallbackInitializer',
        action: 'initialize_error',
      },
      error as Error
    );

    throw new CallbackInitializationError(
      'Callback system initialization failed',
      {
        cause: error,
      }
    );
  }
}
```

### 6. Integration with Telegram Adapter

```typescript
// ✅ Integração com adapter do Telegram
export class TelegramBotAdapter {
  constructor(private bot: TelegramBot) {
    this.setupCallbackHandling();
  }

  private setupCallbackHandling(): void {
    this.bot.on('callback_query', async callbackQuery => {
      try {
        const input: CommandInput = {
          user: {
            id: callbackQuery.from.id,
            name: callbackQuery.from.first_name,
            username: callbackQuery.from.username,
          },
          platform: 'telegram',
          raw: callbackQuery,
          messageId: callbackQuery.message?.message_id,
        };

        // Processar callback via manager
        const output = await callbackManager.handle(
          callbackQuery.data || '',
          input
        );

        // Enviar resposta
        if (output.editMessage && callbackQuery.message) {
          await this.editMessage(
            callbackQuery.message.chat.id,
            callbackQuery.message.message_id,
            output
          );
        } else {
          await this.sendMessage(
            callbackQuery.message?.chat.id || callbackQuery.from.id,
            output
          );
        }

        // Confirmar callback
        await this.bot.answerCallbackQuery(callbackQuery.id);
      } catch (error) {
        logger.error(
          'Callback query handling failed',
          {
            module: 'TelegramBotAdapter',
            action: 'handle_callback_query',
            callbackData: callbackQuery.data,
            userId: callbackQuery.from.id,
          },
          error as Error
        );

        // Resposta de erro para usuário
        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Erro interno. Tente novamente.',
          show_alert: true,
        });
      }
    });
  }
}
```

### 7. Testing Callback System

```typescript
// ✅ Testes para sistema de callbacks
describe('CallbackDataSerializer', () => {
  describe('serialize/deserialize', () => {
    it('should serialize and deserialize race details correctly', () => {
      const data: RaceDetailsCallbackData = {
        type: 'race_details',
        raceId: 'race-123',
        source: 'list',
      };

      const serialized = CallbackDataSerializer.serialize(data);
      expect(serialized).toBe('rd:race-123:list');

      const deserialized = CallbackDataSerializer.deserialize(serialized);
      expect(deserialized).toEqual(data);
    });

    it('should handle complex callback data with special characters', () => {
      const data: RaceFilterCallbackData = {
        type: 'races_filter',
        distance: 10,
        location: 'São Paulo, SP',
      };

      const serialized = CallbackDataSerializer.serialize(data);
      const deserialized = CallbackDataSerializer.deserialize(serialized);

      expect(deserialized.location).toBe('São Paulo, SP');
    });
  });
});

describe('RaceDetailsCallbackHandler', () => {
  let handler: RaceDetailsCallbackHandler;
  let mockRaceService: jest.Mocked<RaceService>;

  beforeEach(() => {
    handler = new RaceDetailsCallbackHandler();
    mockRaceService = {
      getRaceById: jest.fn(),
    } as any;
  });

  it('should return race details when race exists', async () => {
    const mockRace = MockFactories.createMockRace();
    mockRaceService.getRaceById.mockResolvedValue(mockRace);

    const data: RaceDetailsCallbackData = {
      type: 'race_details',
      raceId: 'race-123',
    };

    const input = MockFactories.createMockCommandInput();
    const result = await handler.handle(data, input);

    expect(result.text).toContain(mockRace.title);
    expect(result.keyboard?.buttons).toBeDefined();
    expect(result.editMessage).toBe(true);
  });
});
```

## 🎯 Best Practices para Callbacks

### 1. Design Principles

- **Type Safety**: Use discriminated unions para type safety
- **Serialization**: Keep serialized data compact para Telegram limits
- **Error Handling**: Always handle errors gracefully
- **Logging**: Log all callback executions para debugging

### 2. Performance Tips

- **Caching**: Cache race data para avoid repeated queries
- **Batching**: Batch database operations when possible
- **Lazy Loading**: Load data only when needed
- **Pagination**: Implement pagination para large lists

### 3. User Experience

- **Quick Responses**: Provide immediate feedback
- **Context Preservation**: Maintain navigation context
- **Error Recovery**: Provide ways to recover from errors
- **Consistent UI**: Keep interface patterns consistent
