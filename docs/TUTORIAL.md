# 🎯 Tutorial - Dash Bot

## 📋 Introdução

Este tutorial fornece exemplos práticos de como usar o Dash Bot e como desenvolver novas funcionalidades. Siga os exemplos passo a passo para entender **como o bot funciona na prática** e **como implementar suas próprias funcionalidades**.

## 🎯 Objetivos do Tutorial

Ao final deste tutorial, você será capaz de:

1. **🏃‍♂️ Usar o bot** como usuário final
2. **� Entender a arquitetura** através de exemplos
3. **⚙️ Implementar novos comandos** seguindo os padrões
4. **🎨 Criar interfaces interativas** com botões e callbacks
5. **🧪 Testar funcionalidades** de forma eficiente

## �🚀 Começando a Usar o Bot

### 1. **Primeira Conversa**

> **🎯 O que acontece**: Quando um usuário envia `/start`, o bot executa o comando `startCommand` que **registra o usuário** no banco de dados e **apresenta as funcionalidades principais**.

```
Usuário: /start
Bot: 👋 Olá João! Eu sou o Dash Bot!

🏃‍♂️ Sou especialista em corridas de rua e estou aqui para ajudar você a:
• Encontrar corridas disponíveis
• Filtrar por distâncias favoritas
• Receber lembretes de inscrições
• Configurar suas preferências

🚀 Comandos principais:
/corridas - Ver corridas disponíveis
/config - Suas configurações
/ajuda - Guia completo

Que tal começar vendo as corridas disponíveis? 😊
```

**Fluxo técnico:**

1. `TelegramBotAdapter` captura mensagem `/start`
2. `CommandRouter` identifica comando e chama `startCommand`
3. `startCommand` verifica se usuário existe no banco via `UserService`
4. Se novo usuário, `UserService` cria registro na tabela `users`
5. `startCommand` formata mensagem de boas-vindas personalizada
6. Resposta com botões interativos é enviada via `TelegramBotAdapter`

**Código simplificado:**

```typescript
export async function startCommand(
  input: CommandInput
): Promise<CommandOutput> {
  // 1. Busca ou cria usuário
  const user = await userService.findOrCreateUser(input.userId, input.userName);

  // 2. Personaliza mensagem
  const welcomeText = `👋 Olá ${user.name}! Eu sou o Dash Bot!`;

  // 3. Cria interface com botões
  return {
    text: welcomeText + "\n\n🚀 Comandos principais:\n...",
    format: "HTML",
    keyboard: {
      inline_keyboard: [
        [{ text: "🏃‍♂️ Ver Corridas", callback_data: "races_list" }],
        [{ text: "⚙️ Configurações", callback_data: "user_config" }],
      ],
    },
  };
}
```

### 2. **Explorando Corridas**

> **🎯 O que acontece**: O comando `/corridas` busca todas as corridas disponíveis no banco, aplica filtros se fornecidos, e apresenta uma **interface interativa** com botões para facilitar a navegação.

```
Usuário: /corridas
Bot: 🏃‍♂️ Corridas Disponíveis

📌 Selecione uma corrida para ver mais detalhes ou use os filtros por distância:

[🏃‍♂️ Corrida da Primavera - 5k/10k]
[🏃‍♂️ Maratona de São Paulo - 21k/42k]
[🏃‍♂️ Corrida do Parque - 5k]

[5km a 8km] [10km a 20km] [21km] [42km]
[📋 Ver Todas]
```

**Fluxo técnico:**

1. `listRacesCommand` é executado
2. `RaceService.getAvailableRaces()` busca corridas futuras aplicando regras de negócio
3. Dados são formatados com `formatRaceList()` criando texto e botões
4. `InteractionKeyboard` cria botões inline com `callback_data`
5. Cada botão tem dados específicos para identificar ação (ex: `race_filter:5`)
6. `TelegramBotAdapter` envia mensagem com interface interativa

**Código simplificado:**

```typescript
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  // 1. Busca corridas aplicando regras de negócio
  const races = await raceService.getAvailableRaces();

  // 2. Cria botões para cada corrida
  const raceButtons = races.map((race) => [
    {
      text: `🏃‍♂️ ${race.title} - ${race.distances.join("/")}`,
      callback_data: `race_details:${race.id}`,
    },
  ]);

  // 3. Adiciona botões de filtro
  const filterButtons = [
    [
      { text: "5km a 8km", callback_data: "race_filter:5-8" },
      { text: "10km a 20km", callback_data: "race_filter:10-20" },
    ],
  ];

  return {
    text: "🏃‍♂️ Corridas Disponíveis\n\n📌 Selecione uma corrida:",
    format: "HTML",
    keyboard: {
      inline_keyboard: [...raceButtons, ...filterButtons],
    },
  };
}
```

### 3. **Filtrando por Distância**

> **🎯 O que acontece**: Quando usuário clica em "5km a 8km", um **callback** é disparado. O sistema identifica o filtro solicitado e **edita a mensagem existente** com os resultados filtrados.

```
Usuário: [Clica em "5km a 8km"]
Bot: 🏃‍♂️ Corridas de 5km a 8km

📅 3 corridas encontradas:

🏃‍♂️ Corrida da Primavera
📅 15/08/2025 - 07:00
📍 Parque Ibirapuera
🏃‍♂️ 5km, 10km
🔓 Inscrições abertas

[Ver Detalhes] [Lembrete]

🏃‍♂️ Corrida do Parque
📅 22/08/2025 - 06:30
📍 Parque Villa-Lobos
🏃‍♂️ 5km
🔓 Inscrições abertas

[Ver Detalhes] [Lembrete]

[⬅️ Voltar] [🏠 Menu Principal]
```

**Fluxo técnico:**

1. `TelegramBotAdapter` captura callback do botão clicado
2. `CallbackManager` identifica tipo `race_filter` e chama handler apropriado
3. `RaceFilterCallback` processa filtro de distância específico
4. `RaceService.getAvailableRaces(filters)` aplica filtros nas corridas
5. Resultado é formatado com botões contextuais
6. Mensagem original é editada com `editMessage()` mantendo conversa limpa

**Código simplificado:**

```typescript
export async function raceFilterCallback(
  input: CommandInput
): Promise<CommandOutput> {
  const data = input.callbackData as RaceFilterCallbackData;

  // 1. Aplica filtro específico
  const filters = { distanceRange: data.distanceRange };
  const races = await raceService.getAvailableRaces(filters);

  // 2. Formata lista filtrada
  const raceList = races
    .map(
      (race) =>
        `🏃‍♂️ ${race.title}\n📅 ${race.date.toLocaleDateString()}\n📍 ${
          race.location
        }`
    )
    .join("\n\n");

  // 3. Cria botões contextuais
  const buttons = races.map((race) => [
    {
      text: `Ver Detalhes`,
      callback_data: `race_details:${race.id}`,
    },
    {
      text: `Lembrete`,
      callback_data: `race_reminder:${race.id}`,
    },
  ]);

  return {
    text: `🏃‍♂️ Corridas de ${data.distanceRange}\n\n📅 ${races.length} corridas:\n\n${raceList}`,
    format: "HTML",
    keyboard: {
      inline_keyboard: [
        ...buttons,
        [{ text: "⬅️ Voltar", callback_data: "races_list" }],
      ],
    },
    editMessage: true, // Importante: edita mensagem existente
  };
}
```

### 4. **Detalhes da Corrida**

> **🎯 O que acontece**: Ao clicar em "Ver Detalhes", o bot executa um **callback específico** que busca **informações completas** de uma corrida e apresenta uma **interface rica** com múltiplas opções de ação.

**Fluxo técnico:**

1. `CallbackManager` identifica callback `race_details:123`
2. `RaceDetailsHandler` extrai ID da corrida dos dados
3. `RaceService.getRaceById()` busca informações completas
4. `formatRaceDetails()` cria layout rico com todas as informações
5. Botões de ação são criados dinamicamente baseados no status da corrida
6. Mensagem é editada com interface completa

**Código simplificado:**

```typescript
export async function raceDetailsCallback(
  input: CommandInput
): Promise<CommandOutput> {
  const data = input.callbackData as RaceDetailsCallbackData;

  // 1. Busca informações completas
  const race = await raceService.getRaceById(data.raceId);

  // 2. Calcula informações extras
  const daysUntil = Math.ceil(
    (race.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const canRegister = race.status === "open" && daysUntil >= 3;

  // 3. Formata texto rico
  const detailsText = `
🏃‍♂️ ${race.title}

📅 Data: ${race.date.toLocaleDateString()}
⏰ Horário: ${race.time}
📍 Local: ${race.location}
🏃‍♂️ Distâncias: ${race.distances.join(", ")}
🏢 Organização: ${race.organization}
${canRegister ? "🔓 Inscrições abertas" : "🔒 Inscrições encerradas"}

💰 Valores:
${race.distances.map((d) => `• ${d}: R$ ${race.prices[d]}`).join("\n")}
  `;

  // 4. Cria botões dinâmicos
  const actionButtons = [];
  if (canRegister) {
    actionButtons.push([
      { text: "🔗 Inscrever-se", url: race.link },
      { text: "🔔 Lembrete", callback_data: `race_reminder:${race.id}` },
    ]);
  }
  actionButtons.push([
    { text: "📍 Localização", callback_data: `race_location:${race.id}` },
    { text: "⬅️ Voltar", callback_data: "races_list" },
  ]);

  return {
    text: detailsText,
    format: "HTML",
    keyboard: { inline_keyboard: actionButtons },
    editMessage: true,
  };
}
```

```
Usuário: [Clica em "Ver Detalhes"]
Bot: 🏃‍♂️ Corrida da Primavera

📅 Data: 15/08/2025
⏰ Horário: 07:00
📍 Local: Parque Ibirapuera
🏃‍♂️ Distâncias: 5km, 10km
🏢 Organização: Runners SP
🔓 Status: Inscrições abertas

💰 Valores:
• 5km: R$ 50,00
• 10km: R$ 70,00

🎁 Kit do atleta inclui:
• Camiseta técnica
• Número de peito
• Chip de cronometragem
• Medalha de participação

[🔗 Inscrever-se] [🔔 Lembrete] [📍 Localização]
[⬅️ Voltar] [🏠 Menu Principal]
```

### 5. **Configurando Preferências**

```
Usuário: /config
Bot: ⚙️ Suas Configurações

👤 Perfil:
• Nome: João Silva
• Cadastrado: 10/07/2025

🏃‍♂️ Distâncias Favoritas:
• Não configuradas

🔔 Notificações:
• Ativadas

📅 Lembretes:
• 3 dias antes das corridas

[🏃‍♂️ Configurar Distâncias] [🔔 Notificações] [📅 Lembretes]
[🏠 Menu Principal]
```

## 🛠️ Desenvolvendo Novas Funcionalidades

### 1. **Criando um Comando Simples**

#### Passo 1: Criar o arquivo do comando

```typescript
// src/Bot/commands/usecases/races/commands/countRaces.ts
import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";
import { raceService } from "../../../../../core/infra/dependencies.ts";

export async function countRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    const races = await raceService.getAllRaces();
    const availableRaces = races.filter((race) => race.status === "open");

    return {
      text:
        `🏃‍♂️ <b>Estatísticas de Corridas</b>\n\n` +
        `📊 Total de corridas: ${races.length}\n` +
        `🔓 Inscrições abertas: ${availableRaces.length}\n` +
        `🔒 Inscrições fechadas: ${races.length - availableRaces.length}`,
      format: "HTML",
    };
  } catch (error) {
    console.error("Erro ao contar corridas:", error);
    return {
      text: "❌ Erro ao buscar estatísticas das corridas.",
      format: "HTML",
    };
  }
}
```

#### Passo 2: Exportar o comando

```typescript
// src/Bot/commands/usecases/races/index.ts
export { countRacesCommand } from "./commands/countRaces.ts";
```

#### Passo 3: Registrar o comando

```typescript
// src/Bot/router/CommandRouter.ts
import { countRacesCommand } from "../commands/usecases/races/index.ts";

const commands: Record<string, CommandHandler> = {
  // ...outros comandos
  "/stats": countRacesCommand,
  "/estatisticas": countRacesCommand,
};
```

### 2. **Criando um Callback Interativo**

#### Passo 1: Definir o tipo do callback

```typescript
// src/types/callbacks/raceCallbacks.ts
export interface RaceStatsCallbackData extends BaseCallbackData {
  type: "race_stats";
  period: "week" | "month" | "year";
}
```

#### Passo 2: Atualizar o serializer

```typescript
// src/types/CallbackData.ts
export class CallbackDataSerializer {
  // ...métodos existentes

  static raceStats(period: "week" | "month" | "year"): RaceStatsCallbackData {
    return { type: "race_stats", period };
  }
}
```

#### Passo 3: Criar o handler

```typescript
// src/Bot/commands/usecases/races/callbacks/raceStats.ts
import { CallbackHandler } from "../../../../../types/PlatformAdapter.ts";
import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";
import {
  CallbackData,
  RaceStatsCallbackData,
} from "../../../../../types/CallbackData.ts";
import { raceService } from "../../../../../core/infra/dependencies.ts";

export class RaceStatsCallbackHandler implements CallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "race_stats";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceStatsCallbackData;
      const stats = await raceService.getStatsByPeriod(data.period);

      return {
        text:
          `📊 <b>Estatísticas - ${data.period}</b>\n\n` +
          `🏃‍♂️ Corridas: ${stats.total}\n` +
          `👥 Participantes: ${stats.participants}\n` +
          `🏆 Concluídas: ${stats.completed}`,
        format: "HTML",
        editMessage: true,
      };
    } catch (error) {
      console.error("Erro no callback de estatísticas:", error);
      return {
        text: "❌ Erro ao carregar estatísticas.",
        format: "HTML",
      };
    }
  }
}
```

#### Passo 4: Registrar o handler

```typescript
// src/Bot/config/callback/CallbackInitializer.ts
import { RaceStatsCallbackHandler } from "../../commands/usecases/races/callbacks/raceStats.ts";

export async function initializeCallbacks() {
  // ...outros handlers
  callbackManager.registerHandler(new RaceStatsCallbackHandler());
}
```

### 3. **Implementando um Serviço de Domínio**

#### Passo 1: Estender a interface do repositório

```typescript
// src/core/domain/repositories/RaceRepository.ts
export interface RaceRepository {
  // ...métodos existentes

  findByPeriod(startDate: Date, endDate: Date): Promise<Race[]>;
  countByStatus(status: RaceStatus): Promise<number>;
}
```

#### Passo 2: Implementar no repositório Prisma

```typescript
// src/core/infra/prisma/PrismaRaceRepository.ts
export class PrismaRaceRepository implements RaceRepository {
  // ...métodos existentes

  async findByPeriod(startDate: Date, endDate: Date): Promise<Race[]> {
    const races = await this.prisma.race.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return races.map(this.mapToEntity);
  }

  async countByStatus(status: RaceStatus): Promise<number> {
    return await this.prisma.race.count({
      where: {
        status: status,
      },
    });
  }
}
```

#### Passo 3: Adicionar método ao serviço

```typescript
// src/core/domain/services/RaceService.ts
export class RaceService {
  // ...métodos existentes

  async getStatsByPeriod(
    period: "week" | "month" | "year"
  ): Promise<RaceStats> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const races = await this.raceRepository.findByPeriod(startDate, now);
    const openCount = await this.raceRepository.countByStatus(RaceStatus.OPEN);
    const closedCount = await this.raceRepository.countByStatus(
      RaceStatus.CLOSED
    );

    return {
      total: races.length,
      participants: races.reduce(
        (sum, race) => sum + (race.participants || 0),
        0
      ),
      completed: closedCount,
      open: openCount,
    };
  }
}

interface RaceStats {
  total: number;
  participants: number;
  completed: number;
  open: number;
}
```

### 4. **Criando Testes**

#### Teste Unitário para o Comando

```typescript
// src/Bot/commands/usecases/races/commands/__tests__/countRaces.test.ts
import { describe, test, expect, beforeEach, vi } from "vitest";
import { countRacesCommand } from "../countRaces.ts";
import { raceService } from "../../../../../../core/infra/dependencies.ts";
import { RaceStatus } from "../../../../../../core/domain/entities/Race.ts";

// Mock do serviço
vi.mock("../../../../../../core/infra/dependencies.ts", () => ({
  raceService: {
    getAllRaces: vi.fn(),
  },
}));

describe("countRacesCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deve retornar estatísticas corretas", async () => {
    // Arrange
    const mockRaces = [
      { id: "1", status: RaceStatus.OPEN },
      { id: "2", status: RaceStatus.OPEN },
      { id: "3", status: RaceStatus.CLOSED },
    ];

    (raceService.getAllRaces as any).mockResolvedValue(mockRaces);

    // Act
    const result = await countRacesCommand({
      chatId: "123",
      userId: "user1",
      command: "/stats",
    });

    // Assert
    expect(result.text).toContain("Total de corridas: 3");
    expect(result.text).toContain("Inscrições abertas: 2");
    expect(result.text).toContain("Inscrições fechadas: 1");
    expect(result.format).toBe("HTML");
  });

  test("deve tratar erro graciosamente", async () => {
    // Arrange
    (raceService.getAllRaces as any).mockRejectedValue(new Error("DB Error"));

    // Act
    const result = await countRacesCommand({
      chatId: "123",
      userId: "user1",
      command: "/stats",
    });

    // Assert
    expect(result.text).toContain("❌ Erro ao buscar estatísticas");
  });
});
```

#### Teste de Integração

```typescript
// src/Bot/commands/usecases/races/commands/__tests__/countRaces.integration.test.ts
import { describe, test, expect, beforeEach } from "vitest";
import { countRacesCommand } from "../countRaces.ts";
import { prisma } from "../../../../../../core/infra/prisma/client.ts";
import { RaceStatus } from "../../../../../../core/domain/entities/Race.ts";

describe("countRacesCommand Integration", () => {
  beforeEach(async () => {
    // Limpar banco de teste
    await prisma.race.deleteMany();
  });

  test("deve contar corridas do banco real", async () => {
    // Arrange
    await prisma.race.createMany({
      data: [
        {
          title: "Corrida 1",
          organization: "Org 1",
          date: new Date("2025-08-15"),
          location: "Local 1",
          link: "http://example.com",
          time: "07:00",
          status: RaceStatus.OPEN,
          distances: '["5km"]',
          distancesNumbers: "[5]",
        },
        {
          title: "Corrida 2",
          organization: "Org 2",
          date: new Date("2025-08-20"),
          location: "Local 2",
          link: "http://example.com",
          time: "08:00",
          status: RaceStatus.CLOSED,
          distances: '["10km"]',
          distancesNumbers: "[10]",
        },
      ],
    });

    // Act
    const result = await countRacesCommand({
      chatId: "123",
      userId: "user1",
      command: "/stats",
    });

    // Assert
    expect(result.text).toContain("Total de corridas: 2");
    expect(result.text).toContain("Inscrições abertas: 1");
    expect(result.text).toContain("Inscrições fechadas: 1");
  });
});
```

## 🔧 Debugging e Troubleshooting

### 1. **Debugging Local**

```typescript
// Adicionar logs para debug
console.log('🔍 Debug - Input:', JSON.stringify(input, null, 2));
console.log('🔍 Debug - CallbackData:', input.callbackData);
console.log('🔍 Debug - Result:', result);

// Usar debugger do Node.js
npm run dev -- --inspect
```

### 2. **Testando Manualmente**

```bash
# Testar comando específico
npm run test -- --grep "countRacesCommand"

# Testar com coverage
npm run test:coverage

# Testar integração
npm run test:integration
```

### 3. **Verificar Logs**

```bash
# Logs da aplicação
tail -f logs/app.log

# Logs do PM2
pm2 logs dashbot

# Logs do Docker
docker-compose logs -f dashbot
```

## 🚀 Deploy de Mudanças

### 1. **Processo de Deploy**

```bash
# 1. Executar testes
npm run test

# 2. Build
npm run build

# 3. Verificar migrations
npm run prisma:migrate:status

# 4. Deploy
git push origin main
```

### 2. **Rollback se Necessário**

```bash
# Reverter último commit
git revert HEAD

# Reverter migration
npm run prisma:migrate:reset
```

## 📊 Monitoramento

### 1. **Métricas Importantes**

```typescript
// Adicionar métricas nos comandos
const startTime = Date.now();
// ... lógica do comando
const endTime = Date.now();
console.log(`⏱️ Comando executado em ${endTime - startTime}ms`);
```

### 2. **Health Check**

```typescript
// Endpoint para verificar saúde
app.get("/health", async (req, res) => {
  try {
    // Verificar banco
    await prisma.$queryRaw`SELECT 1`;

    // Verificar bot
    const botInfo = await bot.getMe();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      bot: botInfo.username,
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
});
```

## 🎯 Próximos Passos

### 1. **Funcionalidades Sugeridas**

- [ ] Sistema de favoritos
- [ ] Histórico de corridas
- [ ] Compartilhamento de corridas
- [ ] Integração com calendário
- [ ] Notificações push

### 2. **Melhorias Técnicas**

- [ ] Cache Redis
- [ ] Rate limiting
- [ ] Metrics com Prometheus
- [ ] Logs estruturados
- [ ] API GraphQL

### 3. **Expansão de Plataformas**

- [ ] WhatsApp Business
- [ ] Discord bot
- [ ] Telegram Web Apps
- [ ] App mobile

---

Este tutorial fornece uma base sólida para usar e desenvolver no Dash Bot. Continue explorando a documentação para funcionalidades mais avançadas!
