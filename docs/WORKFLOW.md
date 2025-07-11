# 🔄 Fluxos de Trabalho - Dash Bot

## 📋 Introdução

Este documento detalha os **fluxos de trabalho** do Dash Bot, explicando **como cada funcionalidade funciona** desde a entrada do usuário até a resposta final. Cada fluxo inclui **código prático** e **explicações técnicas** para desenvolvedores.

## 🎯 Fluxo Principal: Buscar Corridas

### 1. **Entrada do Usuário**

```
Usuário: /corridas
```

### 2. **Processamento Interno**

#### **Passo 1: Recepção (TelegramBotAdapter)**

```typescript
// src/adapters/in/telegram/TelegramBotAdapter.ts
async handleMessage(message: Message): Promise<void> {
  console.log('📨 Mensagem recebida:', message.text);

  // Extrai dados da mensagem
  const input: CommandInput = {
    chatId: message.chat.id,
    userId: message.from.id.toString(),
    command: this.extractCommand(message.text), // "corridas"
    args: this.extractArgs(message.text),       // []
    messageId: message.message_id,
    rawMessage: message
  };

  // Repassa para o roteador
  await this.commandRouter.handle(input);
}
```

#### **Passo 2: Roteamento (CommandRouter)**

```typescript
// src/Bot/router/CommandRouter.ts
async handle(input: CommandInput): Promise<void> {
  console.log('🎯 Roteando comando:', input.command);

  // Busca handler registrado
  const handler = this.commandRegistry.getHandler(input.command);

  if (!handler) {
    console.error('❌ Comando não encontrado:', input.command);
    return;
  }

  // Executa o caso de uso
  const output = await handler(input);

  // Envia resposta
  await this.adapter.sendMessage(input.chatId, output);
}
```

#### **Passo 3: Caso de Uso (listRacesCommand)**

```typescript
// src/Bot/commands/usecases/races/commands/listRaces.ts
export async function listRacesCommand(
  input: CommandInput
): Promise<CommandOutput> {
  console.log("⚙️ Executando listRacesCommand");

  try {
    // 1. Extrai filtros dos argumentos
    const filters = this.parseFilters(input.args);

    // 2. Busca corridas via serviço de domínio
    const races = await raceService.getAvailableRaces(filters);

    console.log("📋 Corridas encontradas:", races.length);

    // 3. Formata resposta
    const raceButtons = races.map((race) => [
      {
        text: `🏃‍♂️ ${race.title} - ${race.distances.join("/")}`,
        callback_data: `race_details:${race.id}`,
      },
    ]);

    const filterButtons = [
      [
        { text: "5km", callback_data: "race_filter:5" },
        { text: "10km", callback_data: "race_filter:10" },
        { text: "21km", callback_data: "race_filter:21" },
        { text: "42km", callback_data: "race_filter:42" },
      ],
    ];

    return {
      text: `🏃‍♂️ Corridas Disponíveis\n\n📌 ${races.length} corridas encontradas:`,
      format: "HTML",
      keyboard: {
        inline_keyboard: [...raceButtons, ...filterButtons],
      },
    };
  } catch (error) {
    console.error("❌ Erro em listRacesCommand:", error);
    return {
      text: "❌ Erro ao buscar corridas. Tente novamente.",
      format: "HTML",
    };
  }
}
```

#### **Passo 4: Serviço de Domínio (RaceService)**

```typescript
// src/core/domain/services/RaceService.ts
export class RaceService {
  async getAvailableRaces(filters?: RaceFilters): Promise<Race[]> {
    console.log("🏗️ Aplicando regras de negócio");

    // 1. Busca todas as corridas
    const allRaces = await this.raceRepository.findAll();

    // 2. Aplica regras de negócio
    const availableRaces = allRaces.filter((race) => {
      // Regra 1: Corrida deve estar no futuro
      if (race.date <= new Date()) {
        console.log("⏰ Corrida no passado ignorada:", race.title);
        return false;
      }

      // Regra 2: Status deve ser 'open'
      if (race.status !== "open") {
        console.log("🔒 Corrida fechada ignorada:", race.title);
        return false;
      }

      // Regra 3: Deve ter pelo menos 3 dias para inscrição
      const daysUntilRace =
        (race.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilRace < 3) {
        console.log("⏱️ Corrida muito próxima ignorada:", race.title);
        return false;
      }

      return true;
    });

    // 3. Aplica filtros se fornecidos
    if (filters && filters.distances) {
      return availableRaces.filter((race) =>
        race.distancesNumbers.some((distance) =>
          filters.distances.includes(distance)
        )
      );
    }

    console.log("✅ Corridas disponíveis:", availableRaces.length);
    return availableRaces;
  }
}
```

#### **Passo 5: Repositório (PrismaRaceRepository)**

```typescript
// src/core/infra/prisma/PrismaRaceRepository.ts
export class PrismaRaceRepository implements RaceRepository {
  async findAll(): Promise<Race[]> {
    console.log("💾 Consultando banco de dados");

    const prismaRaces = await this.prisma.race.findMany({
      orderBy: {
        date: "asc",
      },
    });

    console.log("📊 Registros encontrados:", prismaRaces.length);

    // Converte dados do Prisma para entidades de domínio
    const races = prismaRaces.map(
      (race) =>
        new Race({
          id: race.id,
          title: race.title,
          organization: race.organization,
          date: race.date,
          location: race.location,
          distances: JSON.parse(race.distances),
          distancesNumbers: JSON.parse(race.distancesNumbers),
          status: race.status,
          link: race.link,
          time: race.time,
          createdAt: race.createdAt,
          updatedAt: race.updatedAt,
        })
    );

    return races;
  }
}
```

### 3. **Resposta ao Usuário**

```
Bot: 🏃‍♂️ Corridas Disponíveis

📌 15 corridas encontradas:

[🏃‍♂️ Corrida da Primavera - 5k/10k]
[🏃‍♂️ Maratona de São Paulo - 21k/42k]
[🏃‍♂️ Corrida do Parque - 5k]

[5km] [10km] [21km] [42km]
```

## 🔘 Fluxo de Callback: Filtrar por Distância

### 1. **Entrada do Usuário**

```
Usuário: [Clica no botão "5km"]
```

### 2. **Processamento Interno**

#### **Passo 1: Recepção (TelegramBotAdapter)**

```typescript
async handleCallback(query: CallbackQuery): Promise<void> {
  console.log('🔘 Callback recebido:', query.data); // "race_filter:5"

  // Deserializa dados do callback
  const callbackData = this.deserializeCallbackData(query.data);

  const input: CommandInput = {
    chatId: query.message.chat.id,
    userId: query.from.id.toString(),
    messageId: query.message.message_id,
    callbackData: callbackData
  };

  // Repassa para o gerenciador de callbacks
  await this.callbackManager.handle(input);
}
```

#### **Passo 2: Gerenciamento (CallbackManager)**

```typescript
// src/Bot/config/callback/CallbackManager.ts
async handle(input: CommandInput): Promise<void> {
  console.log('🎯 Processando callback:', input.callbackData.type);

  // Encontra handler apropriado
  const handler = this.findHandler(input.callbackData);

  if (!handler) {
    console.error('❌ Handler não encontrado:', input.callbackData.type);
    return;
  }

  // Executa handler
  const output = await handler.handle(input);

  // Edita mensagem existente
  await this.adapter.editMessage(input.chatId, input.messageId, output);
}
```

#### **Passo 3: Handler Específico (RaceFilterHandler)**

```typescript
// src/Bot/commands/usecases/races/callbacks/raceFilter.ts
export class RaceFilterHandler extends CallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "race_filter";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    console.log("🔍 Processando filtro de corrida");

    const data = input.callbackData as RaceFilterCallbackData;

    // Busca corridas filtradas
    const races = await raceService.getAvailableRaces({
      distances: [data.distance],
    });

    // Formata resposta filtrada
    const raceList = races
      .map(
        (race) =>
          `🏃‍♂️ ${race.title}\n📅 ${race.date.toLocaleDateString()}\n📍 ${
            race.location
          }\n🏃‍♂️ ${race.distances.join(", ")}`
      )
      .join("\n\n");

    const actionButtons = races.map((race) => [
      { text: "Ver Detalhes", callback_data: `race_details:${race.id}` },
      { text: "Lembrete", callback_data: `race_reminder:${race.id}` },
    ]);

    const navigationButtons = [
      [
        { text: "⬅️ Voltar", callback_data: "races_list" },
        { text: "🏠 Menu", callback_data: "main_menu" },
      ],
    ];

    return {
      text: `🏃‍♂️ Corridas de ${data.distance}km\n\n📅 ${races.length} corridas encontradas:\n\n${raceList}`,
      format: "HTML",
      keyboard: {
        inline_keyboard: [...actionButtons, ...navigationButtons],
      },
      editMessage: true,
    };
  }
}
```

### 3. **Resposta ao Usuário**

```
Bot: 🏃‍♂️ Corridas de 5km

📅 3 corridas encontradas:

🏃‍♂️ Corrida da Primavera
📅 15/08/2025
📍 Parque Ibirapuera
🏃‍♂️ 5km, 10km

[Ver Detalhes] [Lembrete]

🏃‍♂️ Corrida do Parque
📅 22/08/2025
📍 Parque Villa-Lobos
🏃‍♂️ 5km

[Ver Detalhes] [Lembrete]

[⬅️ Voltar] [🏠 Menu]
```

## 📋 Fluxo de Detalhes: Ver Corrida Específica

### 1. **Entrada do Usuário**

```
Usuário: [Clica em "Ver Detalhes"]
```

### 2. **Processamento (RaceDetailsHandler)**

```typescript
// src/Bot/commands/usecases/races/callbacks/raceDetails.ts
export class RaceDetailsHandler extends CallbackHandler {
  async handle(input: CommandInput): Promise<CommandOutput> {
    console.log("📋 Buscando detalhes da corrida");

    const data = input.callbackData as RaceDetailsCallbackData;

    // Busca corrida específica
    const race = await raceService.getRaceById(data.raceId);

    if (!race) {
      return {
        text: "❌ Corrida não encontrada",
        format: "HTML",
        editMessage: true,
      };
    }

    // Calcula informações dinâmicas
    const daysUntil = Math.ceil(
      (race.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const canRegister = race.status === "open" && daysUntil >= 3;

    // Formata texto rico
    const detailsText = `
🏃‍♂️ ${race.title}

📅 Data: ${race.date.toLocaleDateString("pt-BR")}
⏰ Horário: ${race.time}
📍 Local: ${race.location}
🏃‍♂️ Distâncias: ${race.distances.join(", ")}
🏢 Organização: ${race.organization}
${canRegister ? "🔓 Inscrições abertas" : "🔒 Inscrições encerradas"}

⏳ Faltam ${daysUntil} dias

💰 Valores:
${race.distances
  .map((d) => `• ${d}: R$ ${race.prices?.[d] || "Consultar"}`)
  .join("\n")}

🎁 Kit inclui:
• Camiseta técnica
• Número de peito
• Chip de cronometragem
• Medalha de participação
    `;

    // Botões dinâmicos baseados no status
    const actionButtons = [];

    if (canRegister) {
      actionButtons.push([
        { text: "🔗 Inscrever-se", url: race.link },
        { text: "🔔 Lembrete", callback_data: `race_reminder:${race.id}` },
      ]);
    }

    actionButtons.push([
      { text: "📍 Localização", callback_data: `race_location:${race.id}` },
      { text: "🚀 Compartilhar", callback_data: `race_share:${race.id}` },
    ]);

    actionButtons.push([
      { text: "⬅️ Voltar", callback_data: "races_list" },
      { text: "🏠 Menu", callback_data: "main_menu" },
    ]);

    return {
      text: detailsText,
      format: "HTML",
      keyboard: {
        inline_keyboard: actionButtons,
      },
      editMessage: true,
    };
  }
}
```

### 3. **Resposta ao Usuário**

```
Bot: 🏃‍♂️ Corrida da Primavera

📅 Data: 15/08/2025
⏰ Horário: 07:00
📍 Local: Parque Ibirapuera
🏃‍♂️ Distâncias: 5km, 10km
🏢 Organização: Runners SP
🔓 Inscrições abertas

⏳ Faltam 25 dias

💰 Valores:
• 5km: R$ 50,00
• 10km: R$ 70,00

🎁 Kit inclui:
• Camiseta técnica
• Número de peito
• Chip de cronometragem
• Medalha de participação

[🔗 Inscrever-se] [🔔 Lembrete]
[📍 Localização] [🚀 Compartilhar]
[⬅️ Voltar] [🏠 Menu]
```

## 🏗️ Fluxo de Configuração: Preferências do Usuário

### 1. **Entrada do Usuário**

```
Usuário: /config
```

### 2. **Processamento (configCommand)**

```typescript
// src/Bot/commands/usecases/user/commands/configCommand.ts
export async function configCommand(
  input: CommandInput
): Promise<CommandOutput> {
  console.log("⚙️ Abrindo configurações do usuário");

  // Busca usuário e preferências
  const user = await userService.getUserById(input.userId);
  const preferences = await userService.getUserPreferences(input.userId);

  const configText = `
⚙️ Suas Configurações

👤 Perfil:
• Nome: ${user.name}
• Cadastrado: ${user.createdAt.toLocaleDateString()}

🏃‍♂️ Distâncias Favoritas:
• ${preferences?.preferredDistances?.join(", ") || "Não configuradas"}

🔔 Notificações:
• ${preferences?.notificationsEnabled ? "Ativadas" : "Desativadas"}

📅 Lembretes:
• ${preferences?.reminderDays || 3} dias antes das corridas
  `;

  const configButtons = [
    [
      {
        text: "🏃‍♂️ Configurar Distâncias",
        callback_data: "user_config:distances",
      },
      { text: "🔔 Notificações", callback_data: "user_config:notifications" },
    ],
    [
      { text: "📅 Lembretes", callback_data: "user_config:reminders" },
      { text: "🏠 Menu Principal", callback_data: "main_menu" },
    ],
  ];

  return {
    text: configText,
    format: "HTML",
    keyboard: {
      inline_keyboard: configButtons,
    },
  };
}
```

### 3. **Configuração Específica (UserConfigHandler)**

```typescript
// src/Bot/commands/usecases/user/callbacks/userConfig.ts
export class UserConfigHandler extends CallbackHandler {
  async handle(input: CommandInput): Promise<CommandOutput> {
    const data = input.callbackData as UserConfigCallbackData;

    switch (data.setting) {
      case "distances":
        return this.handleDistanceConfig(input);
      case "notifications":
        return this.handleNotificationConfig(input);
      case "reminders":
        return this.handleReminderConfig(input);
      default:
        return this.handleUnknownConfig(input);
    }
  }

  private async handleDistanceConfig(
    input: CommandInput
  ): Promise<CommandOutput> {
    const distanceButtons = [
      [
        { text: "5km", callback_data: "user_config:distances:5" },
        { text: "10km", callback_data: "user_config:distances:10" },
      ],
      [
        { text: "21km", callback_data: "user_config:distances:21" },
        { text: "42km", callback_data: "user_config:distances:42" },
      ],
      [{ text: "⬅️ Voltar", callback_data: "user_config" }],
    ];

    return {
      text: `🏃‍♂️ Configurar Distâncias Favoritas\n\nEscolha suas distâncias favoritas para receber recomendações personalizadas:`,
      format: "HTML",
      keyboard: {
        inline_keyboard: distanceButtons,
      },
      editMessage: true,
    };
  }
}
```

## 📊 Métricas e Monitoramento

### Logging Estruturado

```typescript
// Em cada ponto do fluxo, adicione logs para monitoramento
console.log("📊 Métricas:", {
  command: input.command,
  userId: input.userId,
  timestamp: new Date().toISOString(),
  processingTime: Date.now() - startTime,
});
```

### Tratamento de Erros

```typescript
try {
  // Lógica do comando
} catch (error) {
  console.error("❌ Erro no fluxo:", {
    command: input.command,
    error: error.message,
    stack: error.stack,
  });

  return {
    text: "❌ Ocorreu um erro. Nossa equipe foi notificada.",
    format: "HTML",
  };
}
```

## 🔍 Debugging

### Verificar Fluxo Específico

```bash
# Filtrar logs por comando
npm run dev | grep "📨\|🎯\|⚙️\|🏗️\|💾"

# Testar comando específico
npm run test -- --grep "listRacesCommand"
```

### Simular Fluxo Manualmente

```typescript
// Teste em ambiente isolado
const mockInput = {
  chatId: "123",
  userId: "test-user",
  command: "corridas",
  args: [],
};

const output = await listRacesCommand(mockInput);
console.log("Resultado:", output);
```

---

Este documento fornece a visão completa de como cada funcionalidade do bot trabalha internamente, facilitando o desenvolvimento e debugging de novas features.
