# 🔧 API Reference - Dash Bot

## 📋 Visão Geral

Esta documentação descreve a API interna do Dash Bot, incluindo interfaces, tipos, serviços e utilitários disponíveis para desenvolvimento.

## � Como Usar Esta API

> **Antes de mergulhar nos exemplos de código**, é importante entender **como estas interfaces trabalham juntas** para criar a experiência do usuário:

### 🔄 Fluxo de Interação Completo

1. **📱 Plataforma → Adapter**: Telegram/WhatsApp envia mensagem
2. **🔄 Adapter → Router**: Converte para formato interno
3. **🎯 Router → UseCase**: Identifica e executa comando
4. **⚙️ UseCase → Service**: Aplica regras de negócio
5. **💾 Service → Repository**: Acessa dados
6. **📤 Repository → Plataforma**: Resultado volta ao usuário

Esta API foi projetada para ser **flexível e extensível**, permitindo adicionar novos comandos, callbacks e até mesmo novas plataformas sem modificar código existente.

## �🏗️ Arquitetura da API

### 1. **Platform Adapters**

> **🎯 Propósito**: Os adapters são a **ponte entre plataformas externas** (Telegram, WhatsApp) e o código interno do bot. Eles **traduzem** mensagens da plataforma para um formato padrão que o bot entende.

#### Interface Base

```typescript
interface PlatformAdapter {
  sendMessage(chatId: string | number, output: CommandOutput): Promise<void>;
  editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void>;
  handleCallback(query: any): Promise<void>;
  handleMessage(message: any): Promise<void>;
}
```

**Como funciona:**

- `sendMessage`: Envia nova mensagem para o usuário
- `editMessage`: Edita mensagem existente (útil para callbacks)
- `handleCallback`: Processa cliques em botões
- `handleMessage`: Processa mensagens de texto/comandos

#### Implementação Telegram

> **🎯 Exemplo prático**: Quando um usuário envia `/corridas`, o `TelegramBotAdapter` captura esta mensagem, extrai o comando e argumentos, e repassa para o sistema interno.

**Fluxo detalhado:**

1. **Webhook recebe mensagem** do Telegram
2. **parseMessage()** extrai informações relevantes
3. **CommandRouter** identifica comando `/corridas`
4. **listRacesCommand** é executado
5. **Resposta formatada** é enviada de volta

```typescript
class TelegramBotAdapter implements PlatformAdapter {
  constructor(private bot: TelegramBot);

  async sendMessage(
    chatId: string | number,
    output: CommandOutput
  ): Promise<void> {
    // 🎯 Converte CommandOutput para formato do Telegram
    const options = {
      parse_mode: output.format,
      reply_markup: output.keyboard
        ? {
            inline_keyboard: output.keyboard.inline_keyboard,
          }
        : undefined,
    };

    await this.bot.sendMessage(chatId, output.text, options);
  }

  async editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void> {
    // 🎯 Edita mensagem existente (usado em callbacks)
    await this.bot.editMessageText(output.text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: output.format,
      reply_markup: output.keyboard
        ? {
            inline_keyboard: output.keyboard.inline_keyboard,
          }
        : undefined,
    });
  }

  async handleCallback(query: CallbackQuery): Promise<void>;
  async handleMessage(message: Message): Promise<void>;
}
```

### 2. **Command System**

> **🎯 Propósito**: O sistema de comandos **padroniza** como informações fluem dentro do bot. Independente da plataforma, todos os comandos recebem `CommandInput` e retornam `CommandOutput`.

#### Command Input

> **🎯 O que é**: Estrutura padronizada que **representa uma solicitação** do usuário, seja um comando digitado ou um botão clicado.

```typescript
interface CommandInput {
  chatId: string | number; // Identificador da conversa
  userId: string; // Identificador do usuário
  command?: string; // Comando enviado (/corridas, /start)
  args?: string[]; // Argumentos do comando
  messageId?: string | number; // ID da mensagem (para callbacks)
  callbackData?: CallbackData; // Dados do botão clicado
  rawMessage?: any; // Mensagem original da plataforma
}
```

**Exemplo prático:**

```typescript
// Usuário digita: /corridas 5km,10km
// O sistema cria automaticamente este CommandInput:
const input: CommandInput = {
  chatId: 123456789,
  userId: "user123",
  command: "corridas",
  args: ["5km,10km"],
  messageId: undefined,
  callbackData: undefined,
};

// 🎯 Fluxo interno:
// 1. TelegramBotAdapter recebe "/corridas 5km,10km"
// 2. parseMessage() separa comando dos argumentos
// 3. CommandRouter identifica handler para 'corridas'
// 4. listRacesCommand processa com filtros de distância
```

#### Command Output

> **🎯 O que é**: Estrutura padronizada que **define a resposta** que será enviada ao usuário, incluindo texto, formatação e botões interativos.

```typescript
interface CommandOutput {
  text: string; // Texto da resposta
  format?: "HTML" | "Markdown" | "MarkdownV2"; // Formatação
  keyboard?: InteractionKeyboard; // Botões interativos
  editMessage?: boolean; // Editar mensagem existente?
  messages?: string[]; // Múltiplas mensagens
  shouldPin?: boolean; // Fixar mensagem?
  shouldDelete?: boolean; // Deletar mensagem?
}
```

**Exemplo prático:**

```typescript
// Resposta do comando /corridas
// Este CommandOutput será convertido para formato do Telegram
const output: CommandOutput = {
  text: "🏃‍♂️ Corridas Disponíveis\n\n📌 Escolha uma corrida:",
  format: "HTML",
  keyboard: {
    inline_keyboard: [
      [{ text: "🏃‍♂️ Corrida da Primavera", callback_data: "race_details:1" }],
      [
        { text: "5km", callback_data: "filter:5km" },
        { text: "10km", callback_data: "filter:10km" },
      ],
    ],
  },
};

// 🎯 O que acontece depois:
// 1. TelegramBotAdapter recebe este output
// 2. Converte para formato específico do Telegram
// 3. Envia mensagem com botões inline
// 4. Usuário vê interface interativa
```

#### Command Handler

> **🎯 O que é**: Função que **processa uma solicitação** e gera uma resposta. É o ponto onde a lógica de negócio é executada.

```typescript
type CommandHandler = (input: CommandInput) => Promise<CommandOutput>;
```

**Exemplo prático:**

```typescript
// Handler do comando /corridas
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  // 🎯 Fluxo de trabalho:
  // 1. Extrai filtros dos argumentos do usuário
  // 2. Chama serviço de domínio para aplicar regras de negócio
  // 3. Formata resposta com botões interativos

  // 1. Extrai filtros dos argumentos
  const filters = parseFilters(input.args);
  console.log("🔍 Filtros aplicados:", filters);

  // 2. Busca corridas aplicando filtros
  const races = await raceService.getAvailableRaces(filters);
  console.log("📋 Corridas encontradas:", races.length);

  // 3. Formata resposta com botões
  const output = formatRaceList(races);

  return output;
}
```

### 3. **Callback System**

> **🎯 Propósito**: O sistema de callbacks **gerencia interações com botões**. Quando um usuário clica em um botão, o callback identifica qual ação executar e **edita a mensagem existente** com novos dados.

#### Base Callback Data

> **🎯 Estrutura base**: Todos os callbacks compartilham uma estrutura comum que permite identificar o tipo de ação e os dados necessários.

```typescript
interface BaseCallbackData {
  type: string; // Tipo da ação (ex: "race_details", "race_filter")
}
```

#### Callback Data Types

> **🎯 Tipos específicos**: Cada tipo de callback tem sua própria estrutura de dados, garantindo **type safety** e clareza sobre quais informações são necessárias.

```typescript
// Race-related callbacks
interface RaceDetailsCallbackData extends BaseCallbackData {
  type: "race_details";
  raceId: string; // ID da corrida para buscar detalhes
}

interface RaceListCallbackData extends BaseCallbackData {
  type: "races_list";
  distance?: number; // Filtro opcional por distância
}

interface RaceFilterCallbackData extends BaseCallbackData {
  type: "race_filter";
  distance: number; // Distância específica para filtrar
}

// User-related callbacks
interface UserConfigCallbackData extends BaseCallbackData {
  type: "user_config";
  setting: "distances" | "notifications" | "reminder";
  value?: string; // Valor da configuração
}

// Shared callbacks
interface NavigationCallbackData extends BaseCallbackData {
  type: "navigation";
  action: "back" | "next" | "home";
  context?: string; // Contexto para navegação
}
```

**Exemplo prático:**

```typescript
// Usuário clica em "🏃‍♂️ Corrida da Primavera"
// O sistema cria automaticamente este callback:
const callbackData: RaceDetailsCallbackData = {
  type: "race_details",
  raceId: "race_123",
};

// Usuário clica em "5km"
// O sistema cria este callback:
const filterData: RaceFilterCallbackData = {
  type: "race_filter",
  distance: 5,
};

// 🎯 Fluxo interno:
// 1. TelegramBotAdapter recebe callback_query
// 2. parseCallback() deserializa os dados
// 3. CallbackManager identifica handler apropriado
// 4. RaceDetailsHandler ou RaceFilterHandler processa
// 5. Mensagem original é editada com novos dados
```

#### Callback Handler

> **🎯 Como funciona**: Callback handlers **processam cliques em botões** e **editam mensagens existentes**. Eles seguem o padrão Strategy para permitir diferentes tipos de processamento.

```typescript
abstract class CallbackHandler {
  abstract canHandle(callbackData: CallbackData): boolean;
  abstract handle(input: CommandInput): Promise<CommandOutput>;
}
```

**Exemplo prático:**

```typescript
// Handler para detalhes de corrida
export class RaceDetailsHandler extends CallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "race_details";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    // 🎯 Fluxo de trabalho:
    // 1. Extrai ID da corrida dos dados do callback
    // 2. Busca informações detalhadas no banco
    // 3. Formata resposta rica com botões de ação

    const data = input.callbackData as RaceDetailsCallbackData;

    console.log("📋 Buscando detalhes da corrida:", data.raceId);

    // 1. Busca detalhes da corrida
    const race = await raceService.getRaceById(data.raceId);

    if (!race) {
      return {
        text: "❌ Corrida não encontrada",
        format: "HTML",
        editMessage: true,
      };
    }

    // 2. Formata resposta detalhada
    const output = formatRaceDetails(race);

    // 3. Marca para editar mensagem existente
    output.editMessage = true;

    return output;
  }
}
```

## 🏃‍♂️ Domínio de Corridas

> **🎯 Contexto**: O domínio de corridas é o **núcleo do negócio** do Dash Bot. Aqui estão definidas todas as estruturas de dados e regras relacionadas às corridas de rua.

### 1. **Entidades**

#### Race

> **🎯 Entidade principal**: Representa uma corrida de rua com todas as informações necessárias para os usuários tomarem decisões sobre participação.

```typescript
interface Race {
  id: string; // Identificador único
  title: string; // Nome da corrida
  organization: string; // Organizadora do evento
  distances: string[]; // Distâncias disponíveis (ex: ["5km", "10km"])
  distancesNumbers: number[]; // Distâncias em números (ex: [5, 10])
  date: Date; // Data da corrida
  location: string; // Local do evento
  link: string; // Link para inscrição
  time: string; // Horário de início
  status: RaceStatus; // Status atual
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
}

enum RaceStatus {
  OPEN = "open", // Inscrições abertas
  CLOSED = "closed", // Inscrições encerradas
  COMING_SOON = "coming_soon", // Em breve
  CANCELLED = "cancelled", // Cancelada
}

interface RaceFilter {
  distances?: number[];
  status?: RaceStatus;
  startDate?: Date;
  endDate?: Date;
}
```

### 2. **Repository**

#### Interface

```typescript
interface RaceRepository {
  findAll(): Promise<Race[]>;
  findById(id: string): Promise<Race | null>;
  findByFilters(filters: RaceFilter): Promise<Race[]>;
  findUpcoming(): Promise<Race[]>;
  findByDistance(distance: number): Promise<Race[]>;
  create(data: Omit<Race, "id" | "createdAt" | "updatedAt">): Promise<Race>;
  update(id: string, data: Partial<Race>): Promise<Race>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
```

#### Implementação Prisma

```typescript
class PrismaRaceRepository implements RaceRepository {
  constructor(private prisma: PrismaClient);

  async findAll(): Promise<Race[]>;
  async findById(id: string): Promise<Race | null>;
  async findByFilters(filters: RaceFilter): Promise<Race[]>;
  async findUpcoming(): Promise<Race[]>;
  async findByDistance(distance: number): Promise<Race[]>;
  async create(
    data: Omit<Race, "id" | "createdAt" | "updatedAt">
  ): Promise<Race>;
  async update(id: string, data: Partial<Race>): Promise<Race>;
  async delete(id: string): Promise<void>;
  async count(): Promise<number>;
}
```

### 3. **Service**

#### Race Service

```typescript
class RaceService {
  constructor(private raceRepository: RaceRepository);

  async getAllRaces(): Promise<Race[]>;
  async getRaceById(id: string): Promise<Race | null>;
  async getAvailableRaces(): Promise<Race[]>;
  async getRacesByDistance(distance: number): Promise<Race[]>;
  async getUpcomingRaces(): Promise<Race[]>;
  async searchRaces(term: string): Promise<Race[]>;
  async filterRaces(filters: RaceFilter): Promise<Race[]>;
  async createRace(
    data: Omit<Race, "id" | "createdAt" | "updatedAt">
  ): Promise<Race>;
  async updateRace(id: string, data: Partial<Race>): Promise<Race>;
  async deleteRace(id: string): Promise<void>;
  async getRaceStats(): Promise<RaceStats>;
}

interface RaceStats {
  total: number;
  byStatus: Record<RaceStatus, number>;
  byMonth: Record<string, number>;
  upcomingCount: number;
}
```

### 4. **Commands**

#### List Races

```typescript
async function listRacesCommand(input: CommandInput): Promise<CommandOutput>;
```

#### Next Race

```typescript
async function nextRaceCommand(input: CommandInput): Promise<CommandOutput>;
```

#### Search Races

```typescript
async function searchRacesCommand(input: CommandInput): Promise<CommandOutput>;
```

### 5. **Callbacks**

#### Race Details

```typescript
class RaceDetailsCallbackHandler extends CallbackHandler {
  canHandle(callbackData: CallbackData): boolean;
  async handle(input: CommandInput): Promise<CommandOutput>;
}
```

#### Race Filter

```typescript
class RaceFilterCallbackHandler extends CallbackHandler {
  canHandle(callbackData: CallbackData): boolean;
  async handle(input: CommandInput): Promise<CommandOutput>;
}
```

## 👤 Domínio de Usuário

### 1. **Entidades**

#### User

```typescript
interface User {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  id: string;
  userId: string;
  preferredDistances: number[];
  notificationsEnabled: boolean;
  reminderDays: number;
}
```

### 2. **Repository**

#### Interface

```typescript
interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findOrCreateByTelegramId(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User>;

  // Preferences
  findPreferences(userId: string): Promise<UserPreferences | null>;
  updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences>;
}
```

### 3. **Service**

#### User Service

```typescript
class UserService {
  constructor(private userRepository: UserRepository);

  async getAllUsers(): Promise<User[]>;
  async getUserById(id: string): Promise<User | null>;
  async getUserByTelegramId(telegramId: string): Promise<User | null>;
  async createUser(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User>;
  async updateUser(id: string, data: Partial<User>): Promise<User>;
  async deleteUser(id: string): Promise<void>;
  async findOrCreateUser(
    telegramId: string,
    name: string,
    username?: string
  ): Promise<User>;

  // Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null>;
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  async getRecommendedRaces(userId: string): Promise<Race[]>;
}
```

### 4. **Commands**

#### Start Command

```typescript
async function startCommand(input: CommandInput): Promise<CommandOutput>;
```

#### Help Command

```typescript
async function helpCommand(input: CommandInput): Promise<CommandOutput>;
```

#### Config Command

```typescript
async function configCommand(input: CommandInput): Promise<CommandOutput>;
```

## 🔄 Sistema de Callbacks

### 1. **Callback Manager**

```typescript
class CallbackManager {
  private handlers: CallbackHandler[] = [];

  registerHandler(handler: CallbackHandler): void;
  async handleCallback(input: CommandInput): Promise<CommandOutput>;
  private findHandler(callbackData: CallbackData): CallbackHandler | null;
}
```

### 2. **Callback Serializer**

```typescript
class CallbackDataSerializer {
  static serialize(data: CallbackData): string;
  static deserialize(serialized: string): CallbackData;

  // Factory methods
  static raceDetails(raceId: string): RaceDetailsCallbackData;
  static racesList(distance?: number): RaceListCallbackData;
  static racesFilter(distance: number): RaceFilterCallbackData;
  static raceReminder(
    raceId: string,
    action: "set" | "cancel"
  ): RaceReminderCallbackData;
  static raceLocation(raceId: string): RaceLocationCallbackData;
  static raceSearch(term: string): RaceSearchCallbackData;
  static userConfig(setting: string, value?: string): UserConfigCallbackData;
  static navigation(action: string, context?: string): NavigationCallbackData;
}
```

## 🛠️ Utilitários

### 1. **Markdown Utils**

```typescript
function stripFormatting(text: string): string;
function escapeMarkdown(text: string): string;
function formatBold(text: string): string;
function formatItalic(text: string): string;
function formatCode(text: string): string;
function formatLink(text: string, url: string): string;
```

### 2. **Parse Command**

```typescript
interface ParsedCommand {
  command: string;
  args: string[];
  fullText: string;
}

function parseCommand(text: string): ParsedCommand;
```

### 3. **Date Utils**

```typescript
function formatDate(date: Date): string;
function formatDateTime(date: Date): string;
function isToday(date: Date): boolean;
function isTomorrow(date: Date): boolean;
function isThisWeek(date: Date): boolean;
function daysBetween(date1: Date, date2: Date): number;
```

## 🔧 Configuração

### 1. **Command Registry**

```typescript
class CommandRegistry {
  private commands: Map<string, CommandHandler> = new Map();
  private aliases: Map<string, string> = new Map();

  registerCommand(command: string, handler: CommandHandler): void;
  registerAlias(alias: string, command: string): void;
  getHandler(command: string): CommandHandler | null;
  getAllCommands(): string[];
  getAliases(command: string): string[];
}
```

### 2. **Dependencies**

```typescript
// Repository instances
export const raceRepository: RaceRepository;
export const userRepository: UserRepository;

// Service instances
export const raceService: RaceService;
export const userService: UserService;

// Manager instances
export const callbackManager: CallbackManager;
export const commandRegistry: CommandRegistry;
```

## 📊 Tipos de Teclado

### 1. **Interaction Keyboard**

```typescript
interface InteractionKeyboard {
  buttons: InteractionButton[][];
  inline: boolean;
  resize?: boolean;
  oneTime?: boolean;
}

interface InteractionButton {
  text: string;
  callbackData?: CallbackData;
  url?: string;
  switchInline?: string;
}
```

### 2. **Keyboard Builders**

```typescript
class KeyboardBuilder {
  private buttons: InteractionButton[][] = [];

  addButton(
    text: string,
    callbackData?: CallbackData,
    url?: string
  ): KeyboardBuilder;
  addRow(): KeyboardBuilder;
  addButtonRow(buttons: InteractionButton[]): KeyboardBuilder;
  build(inline: boolean = true): InteractionKeyboard;

  // Utility methods
  static raceListKeyboard(races: Race[]): InteractionKeyboard;
  static raceDetailsKeyboard(race: Race): InteractionKeyboard;
  static filterKeyboard(): InteractionKeyboard;
  static navigationKeyboard(context?: string): InteractionKeyboard;
}
```

## 🧪 Testing Utils

### 1. **Test Helpers**

```typescript
// Mock factories
function createMockRace(overrides?: Partial<Race>): Race;
function createMockUser(overrides?: Partial<User>): User;
function createMockCommandInput(
  overrides?: Partial<CommandInput>
): CommandInput;

// Test utilities
function expectCommandOutput(
  output: CommandOutput
): jest.Matchers<CommandOutput>;
function mockRaceRepository(): jest.Mocked<RaceRepository>;
function mockUserRepository(): jest.Mocked<UserRepository>;
```

### 2. **Integration Test Helpers**

```typescript
class TestBotAdapter implements PlatformAdapter {
  private sentMessages: CommandOutput[] = [];
  private editedMessages: CommandOutput[] = [];

  async sendMessage(
    chatId: string | number,
    output: CommandOutput
  ): Promise<void>;
  async editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void>;

  // Test methods
  getLastSentMessage(): CommandOutput | null;
  getLastEditedMessage(): CommandOutput | null;
  getAllSentMessages(): CommandOutput[];
  clear(): void;
}
```

## 🚀 Exemplos de Uso

### 1. **Criando um Novo Comando**

```typescript
// 1. Definir o comando
async function myNewCommand(input: CommandInput): Promise<CommandOutput> {
  const { userId } = input;

  try {
    // Lógica do comando
    const data = await myService.getData(userId);

    return {
      text: `✅ Dados: ${data}`,
      format: "HTML",
      keyboard: KeyboardBuilder.navigationKeyboard(),
    };
  } catch (error) {
    return {
      text: "❌ Erro ao processar comando",
      format: "HTML",
    };
  }
}

// 2. Registrar o comando
commandRegistry.registerCommand("/my_command", myNewCommand);
commandRegistry.registerAlias("/mc", "/my_command");
```

### 2. **Criando um Novo Callback**

```typescript
// 1. Definir o tipo
interface MyCallbackData extends BaseCallbackData {
  type: "my_callback";
  parameter: string;
}

// 2. Implementar o handler
class MyCallbackHandler extends CallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "my_callback";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    const data = input.callbackData as MyCallbackData;

    return {
      text: `✅ Processado: ${data.parameter}`,
      format: "HTML",
      editMessage: true,
    };
  }
}

// 3. Registrar o handler
callbackManager.registerHandler(new MyCallbackHandler());

// 4. Usar no comando
const button = {
  text: "Clique aqui",
  callbackData: { type: "my_callback", parameter: "valor" } as MyCallbackData,
};
```

### 3. **Integrando com Serviços**

```typescript
// Service personalizado
class MyCustomService {
  constructor(private repository: MyRepository) {}

  async processData(userId: string): Promise<MyData> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Lógica de negócio
    return this.performBusinessLogic(user);
  }
}

// Registrar nas dependências
export const myCustomService = new MyCustomService(myRepository);
```

---

Esta API fornece uma base sólida e extensível para desenvolver novas funcionalidades no Dash Bot, mantendo a consistência e qualidade do código.
