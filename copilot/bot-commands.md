# Bot Commands & Callback System

## 🤖 Command System Architecture

### Command Pattern Implementation

```typescript
// Base command signature
type CommandHandler = (input: CommandInput) => Promise<CommandOutput>;

// Command registration
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

### Command Input/Output Standards

```typescript
// Standardized command input
export interface CommandInput {
  user?: { id?: number | string; name?: string }; // User context
  args?: string[]; // Command arguments
  platform?: string; // "telegram", "whatsapp"
  raw?: unknown; // Platform-specific data
  callbackData?: CallbackData; // Button callback data
  messageId?: number | string; // Message identifier
}

// Standardized command output
export interface CommandOutput {
  text: string; // Main response text
  format?: 'markdown' | 'html'; // Text formatting
  messages?: string[]; // Multiple messages
  keyboard?: InteractionKeyboard; // Interactive buttons
  editMessage?: boolean; // Edit vs new message
}
```

## 📋 Command Development Patterns

### 1. Basic Command Template

```typescript
// Basic command without dependencies
export async function helpCommand(
  _input: CommandInput
): Promise<CommandOutput> {
  return {
    text: `
🤖 **DashBot - Comandos Disponíveis**

🏃‍♂️ **Corridas**
• /corridas - Ver corridas disponíveis
• /proxima_corrida - Próxima corrida
• /buscar_corridas - Buscar por critérios

👤 **Perfil**
• /perfil - Suas informações
• /configuracoes - Ajustar preferências

📞 **Suporte**
• /help - Esta mensagem
• /contato - Falar conosco
    `,
    format: 'HTML',
  };
}
```

### 2. Command with Service Dependencies

```typescript
// Command with business logic
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

    // 2. Buscar dados via service
    const races = await raceService.getAvailableRaces();

    // 3. Verificar se há dados
    if (races.length === 0) {
      return {
        text: '❌ Nenhuma corrida disponível no momento!',
        format: 'HTML',
      };
    }

    // 4. Construir buttons com callbacks
    const raceButtons = races.slice(0, 10).map(race => [
      {
        text: `🏃‍♂️ ${race.title} - ${race.distances.join('/')}`,
        callbackData: CallbackDataSerializer.raceDetails(race.id),
      },
    ]);

    const filterButtons = [
      [
        {
          text: '5km a 8km',
          callbackData: CallbackDataSerializer.racesFilter(5),
        },
        {
          text: '10km a 20km',
          callbackData: CallbackDataSerializer.racesFilter(10),
        },
      ],
    ];

    // 5. Retorno estruturado
    return {
      text: `🏃‍♂️ <strong>Corridas Disponíveis</strong>

📌 Selecione uma corrida para ver mais detalhes ou use os filtros por distância:`,
      format: 'HTML',
      keyboard: {
        buttons: [...raceButtons, ...filterButtons],
        inline: true,
      },
    };
  } catch (error) {
    logger.commandError('listRaces', error as Error, input.user?.id);
    return {
      text: '❌ Erro interno. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
```

### 3. Parameterized Command

```typescript
// Command with parameters
export async function listRacesByDistanceCommand(
  input: CommandInput,
  distances: number[]
): Promise<CommandOutput> {
  try {
    // Validação de parâmetros
    if (!distances || distances.length === 0) {
      return {
        text: '❌ Distâncias não especificadas',
        format: 'HTML',
      };
    }

    // Buscar corridas filtradas
    const races = await raceService.getRacesByDistance(distances);

    if (races.length === 0) {
      return {
        text: `❌ Nenhuma corrida encontrada para as distâncias: ${distances.join(
          ', '
        )}km`,
        format: 'HTML',
      };
    }

    // Construir resposta
    const raceList = races
      .map(
        race =>
          `🏃‍♂️ **${race.title}**
📅 ${formatDate(race.date)}
📍 ${race.location}
🏃‍♂️ ${race.distances.join(', ')}
🔗 [Inscrições](${race.link})`
      )
      .join('\n\n');

    return {
      text: `🏃‍♂️ **Corridas ${distances.join(', ')}km**

${raceList}`,
      format: 'HTML',
    };
  } catch (error) {
    logger.commandError('listRacesByDistance', error as Error, input.user?.id);
    return {
      text: '❌ Erro interno. Tente novamente mais tarde.',
      format: 'HTML',
    };
  }
}
```

## 🔄 Callback System Patterns

### 1. Callback Data Types

```typescript
// Typed callback data for race operations
export interface RaceDetailsCallbackData extends CallbackData {
  type: 'race_details';
  raceId: string;
}

export interface RaceFilterCallbackData extends CallbackData {
  type: 'races_filter';
  distance: number;
}

export interface RaceReminderCallbackData extends CallbackData {
  type: 'race_reminder';
  raceId: string;
  action: 'set' | 'cancel';
}
```

### 2. Callback Handler Template

```typescript
export class RaceDetailsCallbackHandler
  implements CallbackHandler<RaceDetailsCallbackData>
{
  async handle(
    data: RaceDetailsCallbackData,
    input: CommandInput
  ): Promise<CommandOutput> {
    try {
      // 1. Validação
      if (!data.raceId) {
        return {
          text: '❌ ID da corrida não especificado',
          format: 'HTML',
        };
      }

      // 2. Buscar dados
      const race = await raceService.getRaceById(data.raceId);

      if (!race) {
        return {
          text: '❌ Corrida não encontrada',
          format: 'HTML',
        };
      }

      // 3. Construir resposta detalhada
      const raceDetails = `
🏃‍♂️ **${race.title}**

🏢 **Organização:** ${race.organization}
📅 **Data:** ${formatDate(race.date)}
⏰ **Horário:** ${race.time}
📍 **Local:** ${race.location}
🏃‍♂️ **Distâncias:** ${race.distances.join(', ')}
📊 **Status:** ${getRaceStatusEmoji(race.status)} ${race.status}

🔗 [Mais informações e inscrições](${race.link})
      `;

      // 4. Buttons de ação
      const actionButtons = [
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
            text: '⬅️ Voltar',
            callbackData: CallbackDataSerializer.racesList(),
          },
        ],
      ];

      return {
        text: raceDetails,
        format: 'HTML',
        keyboard: {
          buttons: actionButtons,
          inline: true,
        },
        editMessage: true, // Edit message instead of new one
      };
    } catch (error) {
      logger.callbackError('race_details', error as Error, input.user?.id);
      return {
        text: '❌ Erro ao carregar detalhes da corrida',
        format: 'HTML',
      };
    }
  }
}
```

### 3. Callback Data Serialization

```typescript
export class CallbackDataSerializer {
  // Factory methods for creating callback data
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

  // Serialization for platform transmission
  static serialize(data: CallbackData): string {
    switch (data.type) {
      case 'race_details':
        return `rd:${data.raceId}`;

      case 'races_filter':
        return `rf:${data.distance}`;

      case 'race_reminder':
        return `rr:${data.raceId}:${data.action}`;

      default:
        throw new Error(`Unsupported callback type: ${data.type}`);
    }
  }

  // Deserialization from platform data
  static deserialize(serialized: string): CallbackData {
    const parts = serialized.split(':');
    const prefix = parts[0];

    switch (prefix) {
      case 'rd':
        return {
          type: 'race_details',
          raceId: parts[1],
        } as RaceDetailsCallbackData;

      case 'rf':
        return {
          type: 'races_filter',
          distance: parseInt(parts[1]),
        } as RaceFilterCallbackData;

      default:
        throw new Error(`Unknown callback prefix: ${prefix}`);
    }
  }
}
```

## 🎯 Command Registration Patterns

### Auto-Registration System

```typescript
// Auto-register commands from use case modules
export async function autoRegisterCommands(): Promise<void> {
  const registry = CommandRegistry.getInstance();

  // Race commands
  const { raceCommands } = await import(
    '@bot/commands/usecases/races/index.ts'
  );
  for (const [name, handler] of Object.entries(raceCommands)) {
    registry.register(name, handler);
  }

  // User commands
  const { userCommands } = await import('@bot/commands/usecases/user/index.ts');
  for (const [name, handler] of Object.entries(userCommands)) {
    registry.register(name, handler);
  }

  // Shared commands
  const { sharedCommands } = await import(
    '@bot/commands/usecases/shared/index.ts'
  );
  for (const [name, handler] of Object.entries(sharedCommands)) {
    registry.register(name, handler);
  }
}
```

### Manual Registration for Special Cases

```typescript
// Special command with regex pattern
export function registerSpecialCommands(): void {
  const registry = CommandRegistry.getInstance();

  // Dynamic distance commands: /corridas_5km,10km
  registry.registerPattern(
    /^corridas_(.+)$/,
    async (match: RegExpMatchArray, input: CommandInput) => {
      const distanceStr = match[1];
      const distances = distanceStr
        .split(',')
        .map(d => parseInt(d.replace('km', '')))
        .filter(d => !isNaN(d));

      return await listRacesByDistanceCommand(input, distances);
    }
  );
}
```

## 🛠️ Utility Functions for Commands

### Text Formatting Helpers

```typescript
// Format race date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Get status emoji
export function getRaceStatusEmoji(status: string): string {
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

// Truncate text for buttons
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + '...'
    : text;
}
```

### Input Validation Helpers

```typescript
// Validate user input
export function validateUserInput(input: CommandInput): boolean {
  return !!(input.user?.id && input.platform);
}

// Validate numeric parameters
export function validateDistances(distances: unknown[]): number[] {
  return distances
    .filter((d): d is number => typeof d === 'number' && d > 0 && d <= 100)
    .sort((a, b) => a - b);
}
```

## 📊 Command Error Handling

### Standard Error Responses

```typescript
export const ErrorResponses = {
  USER_NOT_FOUND: {
    text: '❌ Usuário não encontrado. Use /start para começar.',
    format: 'HTML' as const,
  },

  INVALID_INPUT: {
    text: '❌ Entrada inválida. Verifique os parâmetros e tente novamente.',
    format: 'HTML' as const,
  },

  INTERNAL_ERROR: {
    text: '❌ Erro interno. Tente novamente mais tarde.',
    format: 'HTML' as const,
  },

  NOT_PREMIUM: {
    text: '❌ Esta funcionalidade está disponível apenas para usuários premium.',
    format: 'HTML' as const,
  },
} as const;
```

### Error Logging Pattern

```typescript
export function handleCommandError(
  commandName: string,
  error: Error,
  input: CommandInput
): CommandOutput {
  logger.commandError(commandName, error, input.user?.id?.toString());

  // Return user-friendly error
  if (error instanceof ValidationError) {
    return ErrorResponses.INVALID_INPUT;
  }

  if (error instanceof NotFoundError) {
    return ErrorResponses.USER_NOT_FOUND;
  }

  return ErrorResponses.INTERNAL_ERROR;
}
```

## 🎮 Command Testing Patterns

```typescript
// Test template for commands
describe('listRacesCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return races with keyboard when races exist', async () => {
    // Arrange
    const mockRaces = [MockFactories.createMockRace()];
    vi.mocked(raceService.getAvailableRaces).mockResolvedValue(mockRaces);

    const input = MockFactories.createMockCommandInput();

    // Act
    const result = await listRacesCommand(input);

    // Assert
    expect(result.text).toContain('Corridas Disponíveis');
    expect(result.keyboard?.buttons).toHaveLength(2); // race + filter buttons
    expect(result.format).toBe('HTML');
  });
});
```
