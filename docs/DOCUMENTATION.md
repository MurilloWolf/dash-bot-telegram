# 📚 Dash Bot Telegram Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How to Add Commands](#how-to-add-commands)
4. [How to Create Callbacks](#how-to-create-callbacks)
5. [How to Implement Business Rules](#how-to-implement-business-rules)
6. [Folder Structure](#folder-structure)
7. [Execution Flow](#execution-flow)
8. [Practical Examples](#practical-examples)

---

## 🎯 Overview

Dash Bot is a Telegram bot specialized in road races, developed with Clean Architecture and following SOLID principles. It allows users to query available races, get specific details, and receive reminders.

## 🔄 Como o Bot Funciona na Prática

Antes de mergulhar na implementação, é fundamental entender **como uma mensagem se transforma em resposta**:

### 🚀 Fluxo Completo de Execução

1. **📱 Usuário interage** → Envia `/corridas` ou clica em botão
2. **🔄 Sistema captura** → Telegram API chama webhook do bot
3. **🎯 Adaptador processa** → Converte mensagem para formato interno
4. **⚙️ Roteador dirige** → Identifica comando ou callback
5. **🏗️ Caso de uso executa** → Aplica lógica de negócio
6. **💾 Dados são acessados** → Consulta banco via repositório
7. **📤 Resposta é enviada** → Usuário recebe resultado

Esta **separação clara de responsabilidades** torna o código **testável, manutenível e extensível**.

### Technologies Used

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js implicit
- **Database**: Prisma ORM com PostgreSQL
- **Bot Framework**: node-telegram-bot-api
- **Testing**: Vitest

---

## 🏗️ Architecture

The project follows **Clean Architecture** with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTERS (Interface)                     │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION (Use Cases)                   │
├─────────────────────────────────────────────────────────────┤
│                     DOMAIN (Business Rules)                 │
├─────────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE (Data)                       │
└─────────────────────────────────────────────────────────────┘
```

### 🆕 **New Modular Architecture (2025)**

> **🎯 Por que mudamos?** A nova arquitetura resolve problemas de **escalabilidade** e **manutenibilidade** que surgiram com o crescimento do projeto. Agora comandos são **organizados por domínio** e **registrados automaticamente**.

A nova arquitetura organiza comandos e callbacks por **domínios de negócio**:

```
src/Bot/commands/usecases/
├── races/          # 🏃‍♂️ Domínio de Corridas
├── user/           # 👤 Domínio de Usuário
├── shared/         # 🔄 Componentes Compartilhados
```

**Benefícios**:

- ✅ **Registro automático** de comandos e callbacks
- ✅ **Organização por domínio** facilita manutenção
- ✅ **Reutilização** de componentes entre módulos
- ✅ **Migração incremental** sem breaking changes

> 📖 **Veja mais detalhes em**: [NOVA-ARQUITETURA.md](./NOVA-ARQUITETURA.md)

### Architecture Principles:

- **Separation of Concerns**: Each layer has its well-defined responsibility
- **Dependency Inversion**: Inner layers don't depend on outer ones
- **Testability**: Each layer can be tested in isolation

---

## 🚀 How to Add Commands

> **🎯 Processo completo**: Vamos criar um comando `/tempo` que mostra a previsão do tempo para corridas. Este exemplo mostra **todo o fluxo** desde a ideia até a implementação.

### 1. Create the Command (Use Case)

> **🎯 O que fazer**: Comandos são **casos de uso** que coordenam o fluxo de trabalho. Eles **não contêm lógica de negócio**, apenas coordenam chamadas para serviços.

Create a file in `src/Bot/commands/usecases/weather/commands/`:

```typescript
// checkWeatherCommand.ts
import { CommandInput, CommandOutput } from "../../../types/Command.ts";
import { weatherService } from "../../../../core/infra/dependencies.ts";

export async function checkWeatherCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    // 1. Extrai cidade dos argumentos (padrão: São Paulo)
    const city = input.args?.[0] || "São Paulo";

    // 2. Busca previsão do tempo via serviço de domínio
    const weather = await weatherService.getWeatherForCity(city);

    // 3. Formata resposta com informações úteis para corrida
    const isGoodForRunning = weather.isGoodForRunning();
    const recommendation = isGoodForRunning
      ? "✅ Ótimo tempo para correr!"
      : "⚠️ Considere reagendar sua corrida.";

    return {
      text: `
🌤️ **Previsão para ${city}**

🌡️ **Temperatura**: ${weather.temperature}°C
☁️ **Condições**: ${weather.condition}
💨 **Vento**: ${weather.windSpeed} km/h

🏃‍♂️ **Para corridas**: ${recommendation}

${
  isGoodForRunning
    ? "🎯 Perfeito para sua corrida!"
    : "🏠 Melhor ficar em casa hoje."
}
      `,
      format: "HTML",
      keyboard: {
        inline_keyboard: [
          [
            { text: "📍 Outra cidade", callback_data: "weather_change_city" },
            {
              text: "📅 Previsão 7 dias",
              callback_data: `weather_forecast:${city}`,
            },
          ],
          [{ text: "🏃‍♂️ Corridas hoje", callback_data: "races_today" }],
        ],
      },
    };
  } catch (error) {
    console.error("Error getting weather:", error);
    return {
      text: "❌ Erro ao buscar previsão do tempo. Tente novamente.",
      format: "HTML",
    };
  }
}
```

### 2. Register the Command

> **🎯 Registro automático**: Com a nova arquitetura, comandos são registrados automaticamente. Basta criar o arquivo de índice:

Edit `src/Bot/commands/usecases/weather/commands/index.ts`:

```typescript
export const weatherCommands = {
  tempo: checkWeatherCommand,
  weather: checkWeatherCommand,
  clima: checkWeatherCommand,
};
```

### 3. Create Domain Service

> **🎯 Lógica de negócio**: Serviços de domínio contêm as **regras específicas** do negócio. Eles **não dependem** de tecnologias externas.

Create `src/core/domain/services/WeatherService.ts`:

```typescript
import { Weather } from "../entities/Weather.ts";

export class WeatherService {
  constructor(private weatherRepository: WeatherRepository) {}

  async getWeatherForCity(city: string): Promise<Weather> {
    // 1. Busca dados via repositório
    const data = await this.weatherRepository.getWeatherData(city);

    // 2. Aplica regras de negócio
    const weather = new Weather(data);

    // 3. Valida se dados são confiáveis
    if (!weather.isDataValid()) {
      throw new Error("Dados meteorológicos inválidos");
    }

    return weather;
  }
}
```

### 4. Create Domain Entity

> **🎯 Entidade de domínio**: Representa conceitos do negócio e contém **regras específicas** sobre como esses conceitos se comportam.

Create `src/core/domain/entities/Weather.ts`:

```typescript
export class Weather {
  constructor(
    public temperature: number,
    public condition: string,
    public windSpeed: number,
    public humidity: number,
    public city: string
  ) {}

  isGoodForRunning(): boolean {
    // Regras específicas para corridas
    return (
      this.temperature >= 10 &&
      this.temperature <= 30 &&
      this.windSpeed < 20 &&
      !this.isRaining()
    );
  }

  isRaining(): boolean {
    const rainyConditions = ["rain", "thunderstorm", "drizzle"];
    return rainyConditions.some((condition) =>
      this.condition.toLowerCase().includes(condition)
    );
  }

  isDataValid(): boolean {
    return (
      this.temperature >= -50 &&
      this.temperature <= 60 &&
      this.windSpeed >= 0 &&
      this.humidity >= 0 &&
      this.humidity <= 100
    );
  }
}
```

### 5. Update Help Command

> **🎯 Documentação automática**: Usuários precisam descobrir novos comandos facilmente.

Edit help command to include your new command:

```typescript
// Em helpCommand.ts
const helpText = `
🚀 **Comandos Disponíveis**

🏃‍♂️ **Corridas**
/corridas - Ver corridas disponíveis
/proximas - Próximas corridas

🌤️ **Tempo** (NOVO!)
/tempo - Previsão do tempo para corridas
/tempo [cidade] - Tempo em cidade específica

⚙️ **Configurações**
/config - Suas preferências
`;
```

---

## 🔄 How to Create Callbacks

> **🎯 Interatividade**: Callbacks permitem criar **interfaces ricas** com botões. Quando usuário clica, a mensagem é **editada** sem criar nova mensagem.

### 1. Define Callback Data Type

> **🎯 Type Safety**: Definir tipos específicos garante que **dados corretos** sejam passados entre componentes.

Create in `src/types/callbacks/weatherCallbacks.ts`:

```typescript
import { CallbackData } from "../CallbackData.ts";

export interface WeatherForecastCallbackData extends CallbackData {
  type: "weather_forecast";
  city: string;
  days: number;
}

export interface WeatherCityCallbackData extends CallbackData {
  type: "weather_change_city";
}
```

### 2. Create Callback Handler

> **🎯 Processamento**: Callback handlers **processam cliques** e **editam mensagens** existentes com novos dados.

Create `src/Bot/commands/usecases/weather/callbacks/weatherForecast.ts`:

```typescript
import { CommandInput, CommandOutput } from "../../../../types/Command.ts";
import { WeatherForecastCallbackData } from "../../../../types/callbacks/weatherCallbacks.ts";
import { weatherService } from "../../../../core/infra/dependencies.ts";

export async function weatherForecastCallback(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    const data = input.callbackData as WeatherForecastCallbackData;

    // 1. Busca previsão estendida
    const forecast = await weatherService.getWeatherForecast(
      data.city,
      data.days
    );

    // 2. Formata previsão de múltiplos dias
    const forecastText = forecast
      .map((day) => `📅 ${day.date}: ${day.temperature}°C - ${day.condition}`)
      .join("\n");

    return {
      text: `
🌤️ **Previsão 7 dias - ${data.city}**

${forecastText}

🏃‍♂️ **Melhores dias para correr**: ${
        forecast.filter((day) => day.isGoodForRunning()).length
      } dias
      `,
      format: "HTML",
      keyboard: {
        inline_keyboard: [
          [
            { text: "⬅️ Voltar", callback_data: `weather_today:${data.city}` },
            { text: "📍 Outra cidade", callback_data: "weather_change_city" },
          ],
        ],
      },
    };
  } catch (error) {
    return {
      text: "❌ Erro ao buscar previsão estendida.",
      format: "HTML",
    };
  }
}
```

### 3. Register Callback

> **🎯 Registro automático**: Como comandos, callbacks também são registrados automaticamente.

Edit `src/Bot/commands/usecases/weather/callbacks/index.ts`:

```typescript
export const weatherCallbacks = {
  weather_forecast: weatherForecastCallback,
  weather_change_city: weatherChangeCityCallback,
};
```

---

## 🏗️ How to Implement Business Rules

> **🎯 Regras de negócio**: São as **regras específicas** do domínio que definem **como o sistema deve se comportar** em diferentes situações.

### 1. Entity Business Rules

> **🎯 Regras na entidade**: Regras que **pertencem ao conceito** em si devem ficar na entidade.

```typescript
// src/core/domain/entities/Race.ts
export class Race {
  isAvailable(): boolean {
    // Regra: corrida só está disponível se:
    // 1. Data é futura
    // 2. Status é "open"
    // 3. Não passou da data limite de inscrição
    const now = new Date();
    const inscriptionLimit = new Date(this.date);
    inscriptionLimit.setDate(inscriptionLimit.getDate() - 3); // 3 dias antes

    return (
      this.status === RaceStatus.OPEN &&
      this.date > now &&
      now < inscriptionLimit
    );
  }

  isGoodForBeginner(): boolean {
    // Regra: corrida é boa para iniciantes se tem distâncias <= 10km
    return this.distancesNumbers.some((distance) => distance <= 10);
  }

  getDaysUntilRace(): number {
    const now = new Date();
    const diffTime = this.date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
```

### 2. Service Business Rules

> **🎯 Regras complexas**: Regras que **envolvem múltiplas entidades** ou **lógica complexa** ficam nos serviços.

```typescript
// src/core/domain/services/RaceService.ts
export class RaceService {
  async getRecommendedRaces(user: User): Promise<Race[]> {
    // Regra complexa: recomendar corridas baseado no perfil do usuário

    // 1. Busca todas as corridas disponíveis
    const availableRaces = await this.raceRepository.findAvailable();

    // 2. Aplica filtros baseados no usuário
    const filteredRaces = availableRaces.filter((race) => {
      // Regra: se usuário tem distâncias favoritas, priorizar
      if (user.favoriteDistances.length > 0) {
        return race.distancesNumbers.some((distance) =>
          user.favoriteDistances.includes(distance)
        );
      }

      // Regra: se usuário é iniciante, mostrar corridas adequadas
      if (user.isBeginnerRunner()) {
        return race.isGoodForBeginner();
      }

      return true;
    });

    // 3. Ordena por relevância
    return this.sortRacesByRelevance(filteredRaces, user);
  }

  private sortRacesByRelevance(races: Race[], user: User): Race[] {
    return races.sort((a, b) => {
      // Regra: priorizar corridas mais próximas
      const daysA = a.getDaysUntilRace();
      const daysB = b.getDaysUntilRace();

      // Regra: corridas em 7-30 dias são mais relevantes
      const isAOptimal = daysA >= 7 && daysA <= 30;
      const isBOptimal = daysB >= 7 && daysB <= 30;

      if (isAOptimal && !isBOptimal) return -1;
      if (!isAOptimal && isBOptimal) return 1;

      return daysA - daysB;
    });
  }
}
```

### 3. Repository Interface

> **🎯 Abstração**: Repositórios **definem como** acessar dados sem se preocupar com **onde** eles estão armazenados.

```typescript
// src/core/domain/repositories/RaceRepository.ts
export interface RaceRepository {
  findAll(): Promise<Race[]>;
  findById(id: string): Promise<Race | null>;
  findAvailable(): Promise<Race[]>;
  findByDistance(distances: number[]): Promise<Race[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Race[]>;
  findByLocation(location: string): Promise<Race[]>;
  save(race: Race): Promise<Race>;
  delete(id: string): Promise<void>;
}
```

### 4. Infrastructure Implementation

> **🎯 Implementação**: A infraestrutura **implementa** as interfaces definidas pelo domínio usando tecnologias específicas.

```typescript
// src/core/infra/prisma/PrismaRaceRepository.ts
export class PrismaRaceRepository implements RaceRepository {
  constructor(private prisma: PrismaClient) {}

  async findAvailable(): Promise<Race[]> {
    // Implementação específica do Prisma
    const races = await this.prisma.race.findMany({
      where: {
        status: "open",
        date: {
          gte: new Date(), // Data futura
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Converte dados do Prisma para entidade de domínio
    return races.map((race) => new Race(race));
  }

  async findByDistance(distances: number[]): Promise<Race[]> {
    const races = await this.prisma.race.findMany({
      where: {
        distancesNumbers: {
          hasSome: distances,
        },
      },
    });

    return races.map((race) => new Race(race));
  }
}
```

Esta abordagem garante que:

- **Regras de negócio** estão centralizadas e testáveis
- **Tecnologias podem ser trocadas** sem afetar regras
- **Código é mais limpo** e fácil de manter
- **Testes são simples** de escrever

---

## 📁 Folder Structure

Callbacks are used to respond to inline button interactions using type safety.

### 1. Define Callback Types

First, define the types in `src/types/CallbackData.ts`:

```typescript
// Add new callback type
export interface MyCallbackData extends BaseCallbackData {
  type: "my_callback";
  parameter1: string;
  parameter2?: number;
}

// Update the union type
export type CallbackData =
  | RaceDetailsCallbackData
  | RaceListCallbackData
  | MyCallbackData; // Add here

// Add factory method
export class CallbackDataSerializer {
  // ... existing methods

  static myCallback(parameter1: string, parameter2?: number): MyCallbackData {
    return { type: "my_callback", parameter1, parameter2 };
  }
}
```

### 2. Create the Callback Handler

Create a file in `src/application/callbacks/`:

```typescript
// src/application/callbacks/MyCallback.ts
import { CommandInput, CommandOutput } from "../../types/Command.ts";
import { CallbackHandler } from "../../types/PlatformAdapter.ts";
import {
  CallbackData,
  CallbackDataSerializer,
  MyCallbackData,
} from "../../types/CallbackData.ts";

export class MyCallbackHandler implements CallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "my_callback";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as MyCallbackData;

      // Access typed data
      console.log(data.parameter1); // ✅ Type-safe
      console.log(data.parameter2); // ✅ Type-safe

      return {
        text: `✅ Callback executed with ${data.parameter1}!`,
        format: "HTML",
        editMessage: true,
        keyboard: {
          buttons: [
            [
              {
                text: "⬅️ Back",
                callbackData: CallbackDataSerializer.racesList(),
              },
            ],
          ],
          inline: true,
        },
      };
    } catch (error) {
      console.error("Callback error:", error);
      return {
        text: "❌ Error processing action.",
        format: "HTML",
      };
    }
  }
}
```

### 3. Register the Callback

---

## 🎯 Practical Examples

### Example 1: Complete Weather Command Flow

> **🎯 Scenario**: User wants to check weather for running in São Paulo

**1. User sends command:**

```
/tempo São Paulo
```

**2. System processing:**

```typescript
// CommandRouter identifies command
const handler = registry.getHandler("tempo");

// checkWeatherCommand executes
const city = input.args[0]; // "São Paulo"
const weather = await weatherService.getWeatherForCity(city);

// Response is formatted and sent
return formatWeatherResponse(weather);
```

**3. User receives response:**

```
🌤️ **Previsão para São Paulo**

🌡️ **Temperatura**: 22°C
☁️ **Condições**: Parcialmente nublado
💨 **Vento**: 8 km/h

🏃‍♂️ **Para corridas**: ✅ Ótimo tempo para correr!

🎯 Perfeito para sua corrida!

[📍 Outra cidade] [📅 Previsão 7 dias]
[🏃‍♂️ Corridas hoje]
```

**4. User clicks button:**

```
// User clicks "📅 Previsão 7 dias"
// Callback "weather_forecast:São Paulo" is triggered
// Message is edited with 7-day forecast
```

### Example 2: Race Filtering with Callbacks

> **🎯 Scenario**: User wants to see only 5km races

**1. User sends command:**

```
/corridas
```

**2. System shows all races with filter buttons:**

```
🏃‍♂️ Corridas Disponíveis

[🏃‍♂️ Corrida da Primavera - 5k/10k]
[🏃‍♂️ Maratona de São Paulo - 21k/42k]
[🏃‍♂️ Corrida do Parque - 5k]

[5km] [10km] [21km] [42km]
```

**3. User clicks "5km" button:**

```typescript
// raceFilterCallback processes click
const data = input.callbackData as RaceFilterCallbackData;
const races = await raceService.getAvailableRaces({ distance: data.distance });

// Message is edited with filtered results
return formatFilteredRaceList(races, data.distance);
```

**4. User sees filtered results:**

```
🏃‍♂️ Corridas de 5km

📅 2 corridas encontradas:

🏃‍♂️ Corrida da Primavera
📅 15/08/2025 - 07:00
🏃‍♂️ 5km, 10km

🏃‍♂️ Corrida do Parque
📅 22/08/2025 - 06:30
🏃‍♂️ 5km

[⬅️ Voltar] [🏠 Menu Principal]
```

## 🧪 Testing Your Implementation

### Unit Tests

> **🎯 Test each layer independently**:

```typescript
// Test command use case
describe("checkWeatherCommand", () => {
  it("should return weather for default city", async () => {
    const mockWeatherService = {
      getWeatherForCity: jest.fn().mockResolvedValue(mockWeather),
    };

    const input: CommandInput = {
      chatId: 123,
      userId: "user123",
      command: "tempo",
      args: [],
    };

    const result = await checkWeatherCommand(input);

    expect(result.text).toContain("São Paulo");
    expect(mockWeatherService.getWeatherForCity).toHaveBeenCalledWith(
      "São Paulo"
    );
  });
});

// Test domain service
describe("WeatherService", () => {
  it("should validate weather data", async () => {
    const invalidWeather = new Weather(-100, "sunny", 0, 50, "Test");

    expect(invalidWeather.isDataValid()).toBe(false);
  });
});
```

### Integration Tests

> **🎯 Test complete flows**:

```typescript
describe("Weather Command Integration", () => {
  it("should handle complete weather flow", async () => {
    // Setup
    const bot = new TestBot();

    // User sends command
    await bot.sendMessage("/tempo Rio de Janeiro");

    // Verify response
    const response = await bot.getLastResponse();
    expect(response.text).toContain("Rio de Janeiro");
    expect(response.keyboard).toBeDefined();

    // User clicks button
    await bot.clickButton("weather_forecast:Rio de Janeiro");

    // Verify callback response
    const callbackResponse = await bot.getLastResponse();
    expect(callbackResponse.text).toContain("Previsão 7 dias");
  });
});
```

## 🚀 Deployment and Production

### Environment Variables

```bash
# .env
TELEGRAM_BOT_TOKEN=your_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/dashbot
NODE_ENV=production
```

### Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📚 Additional Resources

### Documentation Links

- **[🏗️ Architecture](ARCHITECTURE.md)** - Detailed architecture explanation
- **[🔧 API Reference](API.md)** - Complete API documentation
- **[🎯 Tutorial](TUTORIAL.md)** - Step-by-step tutorial
- **[🚀 Deployment](DEPLOYMENT.md)** - Production deployment guide

### Development Resources

- **[🧪 Testing Guide](TESTING.md)** - Testing strategies and examples
- **[🔄 Contributing](CONTRIBUTING.md)** - How to contribute to the project
- **[📝 Changelog](CHANGELOG.md)** - Version history and changes

### External Resources

- **[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)** - Uncle Bob's Clean Architecture
- **[SOLID Principles](https://en.wikipedia.org/wiki/SOLID)** - Object-oriented design principles
- **[Telegram Bot API](https://core.telegram.org/bots/api)** - Official Telegram Bot API documentation
- **[Prisma Documentation](https://www.prisma.io/docs/)** - Database toolkit documentation

## 🤝 Getting Help

If you need help implementing new features:

1. **📖 Check existing documentation** - Most questions are answered here
2. **🔍 Look at similar implementations** - Find similar commands/callbacks as examples
3. **🧪 Write tests first** - It helps clarify requirements
4. **📝 Follow the patterns** - Use the same structure as existing code
5. **🤝 Ask for help** - Create an issue or discussion

## 📈 Next Steps

After reading this documentation, you should be able to:

1. **✅ Understand the project architecture**
2. **✅ Add new commands following the patterns**
3. **✅ Create interactive callbacks**
4. **✅ Implement business rules properly**
5. **✅ Test your implementations**
6. **✅ Deploy to production**

**Happy coding! 🎉**
buttons: [
[
{
text: "🔥 My Action",
callbackData: CallbackDataSerializer.myCallback("value1", 42),
},
],
],
inline: true,
},
};

````

### 5. Typed Callbacks Advantages

✅ **Type Safety**: No typos in callback data
✅ **IntelliSense**: Autocomplete for properties
✅ **Refactoring**: Name changes are detected at compile time
✅ **Validation**: Data is automatically validated
✅ **Maintainability**: Cleaner and easier to understand code

---

## 💼 How to Implement Business Rules

### 1. Create Domain Entities

Create or edit files in `src/domain/entities/`:

```typescript
// src/domain/entities/MyEntity.ts
export interface MyEntity {
  id: string;
  name: string;
  status: StatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export enum StatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
````

### 2. Create Repository (Interface)

Create in `src/domain/repositories/`:

```typescript
// src/domain/repositories/MyEntityRepository.ts
import { MyEntity } from "../entities/MyEntity.ts";

export interface MyEntityRepository {
  findById(id: string): Promise<MyEntity | null>;
  findAll(): Promise<MyEntity[]>;
  create(
    data: Omit<MyEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<MyEntity>;
  update(id: string, data: Partial<MyEntity>): Promise<MyEntity>;
  delete(id: string): Promise<void>;
}
```

### 3. Implement Repository

Create in `src/infra/prisma/`:

```typescript
// src/infra/prisma/PrismaMyEntityRepository.ts
import { MyEntity, StatusEnum } from "../../domain/entities/MyEntity.ts";
import { MyEntityRepository } from "../../domain/repositories/MyEntityRepository.ts";
import { prisma } from "./client.ts";

export class PrismaMyEntityRepository implements MyEntityRepository {
  async findById(id: string): Promise<MyEntity | null> {
    const entity = await prisma.myEntity.findUnique({
      where: { id },
    });
    return entity;
  }

  async findAll(): Promise<MyEntity[]> {
    return await prisma.myEntity.findMany();
  }

  async create(
    data: Omit<MyEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<MyEntity> {
    return await prisma.myEntity.create({
      data,
    });
  }

  async update(id: string, data: Partial<MyEntity>): Promise<MyEntity> {
    return await prisma.myEntity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.myEntity.delete({
      where: { id },
    });
  }
}
```

### 4. Create Service (Business Logic)

Create in `src/domain/services/`:

```typescript
// src/domain/services/MyEntityService.ts
import { MyEntity, StatusEnum } from "../entities/MyEntity.ts";
import { MyEntityRepository } from "../repositories/MyEntityRepository.ts";

export class MyEntityService {
  constructor(private repository: MyEntityRepository) {}

  async getActiveEntities(): Promise<MyEntity[]> {
    const all = await this.repository.findAll();
    return all.filter((entity) => entity.status === StatusEnum.ACTIVE);
  }

  async createWithValidation(
    data: Omit<MyEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<MyEntity> {
    // Business validations
    if (!data.name || data.name.trim().length < 3) {
      throw new Error("Name must have at least 3 characters");
    }

    return await this.repository.create(data);
  }

  async activate(id: string): Promise<MyEntity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error("Entity not found");
    }

    return await this.repository.update(id, { status: StatusEnum.ACTIVE });
  }
}
```

### 5. Register Dependencies

Edit `src/infra/dependencies.ts`:

```typescript
import { PrismaMyEntityRepository } from "./prisma/PrismaMyEntityRepository.ts";
import { MyEntityService } from "../domain/services/MyEntityService.ts";

// Repositories
export const myEntityRepository = new PrismaMyEntityRepository();

// Services
export const myEntityService = new MyEntityService(myEntityRepository);
```

---

## 📁 Folder Structure

```
src/
├── adapters/              # Interface Layer
│   ├── in/
│   │   ├── telegram/      # Telegram Adapter
│   │   └── whatsapp/      # WhatsApp Adapter
│
├── application/           # Application Layer
│   ├── callbacks/         # Callback handlers
│   ├── usecases/          # Use cases (commands)
│   ├── CallbackInitializer.ts
│   ├── CallbackManager.ts
│   └── CommandRouter.ts
│
├── domain/               # Domain Layer
│   ├── entities/         # Business entities
│   ├── repositories/     # Repository interfaces
│   └── services/         # Domain services
│
├── infra/               # Infrastructure Layer
│   ├── prisma/          # Prisma implementations
│   └── dependencies.ts  # Dependency injection
│
├── types/               # Types and interfaces
├── utils/               # Utilities
├── config/              # Configurations
└── scripts/             # Auxiliary scripts
```

---

## 🔄 Execution Flow

### Command Flow:

1. **User** sends command `/corridas`
2. **TelegramBotAdapter** receives and processes
3. **CommandRouter** identifies the command
4. **CorridasCommand** (Use Case) is executed
5. **RaceService** (Domain) applies business logic
6. **PrismaRaceRepository** (Infra) accesses data
7. **Response** returns through reverse chain

### Callback Flow:

1. **User** clicks inline button
2. **TelegramBotAdapter** receives callback
3. **CallbackManager** finds appropriate handler
4. **CallbackHandler** processes action
5. **Response** edits existing message

---

## 🎯 Practical Examples

### Example 1: Command with Arguments

```typescript
// src/application/usecases/SearchRaceCommand.ts
export async function searchRaceCommand(
  input: CommandInput
): Promise<CommandOutput> {
  const term = input.args?.join(" ");

  if (!term) {
    return {
      text: "❌ Provide a search term.\nUsage: /search <term>",
      format: "HTML",
    };
  }

  const races = await raceService.searchByTerm(term);

  if (races.length === 0) {
    return {
      text: `❌ No races found for "${term}"`,
      format: "HTML",
    };
  }

  // Process results...
}
```

### Example 2: Callback with Complex Data

```typescript
// Callback data: "race_action:123:reminder:7"
export class RaceActionCallbackHandler implements CallbackHandler {
  canHandle(callbackData: string): boolean {
    return callbackData.startsWith("race_action:");
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    const [, raceId, action, ...params] = input.callbackData!.split(":");

    switch (action) {
      case "reminder":
        const days = parseInt(params[0]);
        return await this.createReminder(raceId, days);
      case "share":
        return await this.shareRace(raceId);
      default:
        return { text: "❌ Unrecognized action." };
    }
  }
}
```

### Example 3: Business Rules Validation

```typescript
// src/domain/services/RaceService.ts
async createRace(data: NewRace): Promise<Race> {
  // Domain validation
  if (data.date < new Date()) {
    throw new Error("Race date must be in the future");
  }

  if (data.distances.length === 0) {
    throw new Error("Race must have at least one distance");
  }

  // Check for duplicates
  const existing = await this.raceRepository.findByTitleAndDate(
    data.title,
    data.date
  );

  if (existing) {
    throw new Error("A race with this title already exists on this date");
  }

  return await this.raceRepository.create(data);
}
```

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                    # Start in development mode
npm run build                  # Compile TypeScript
npm run start                  # Start in production

# Database
npm run db:setup               # Setup initial database
npm run db:seed                # Populate with test data
npm run db:reset               # Reset and repopulate
npm run prisma:studio          # Open Prisma Studio

# Testing
npm run test                   # Run tests
npm run test:watch             # Run tests in watch mode
```

---

## 📝 Project Conventions

### Naming:

- **Commands**: `nameCommand` (camelCase)
- **Callbacks**: `NameCallbackHandler` (PascalCase)
- **Services**: `NameService` (PascalCase)
- **Entities**: `NameEntity` (PascalCase)
- **Repositories**: `NameRepository` (PascalCase)

### File Structure:

- One file per command/callback/service
- Descriptive and specific names
- Clear separation between responsibilities

### Code Patterns:

- Always use try/catch in commands and callbacks
- Validate input data
- User-friendly error messages
- Appropriate logs for debugging

---

## 🚨 Important Notes

1. **Always register new callbacks** in `CallbackInitializer.ts`
2. **Validate input data** before processing
3. **Use transactions** for critical database operations
4. **Test callbacks** with simulated data
5. **Keep messages** within Telegram's limit (4096 characters)

---

This documentation should be updated as the project evolves. For specific questions, consult the source code or contact the development team.
