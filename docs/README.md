# 🏃‍♂️ Dash Bot Telegram

<div align="center">

![Dash Bot Logo](https://img.shields.io/badge/🏃‍♂️-Dash%20Bot-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

**🏃‍♂️ Um bot inteligente para corredores que desejam encontrar corridas de rua**

_Desenvolvido com Clean Architecture e TypeScript para uma experiência excepcional_

[🚀 Começar Agora](#🚀-instalação-e-configuração) • [📖 Documentação](#📚-documentação-completa) • [🤝 Contribuir](CONTRIBUTING.md) • [🔧 API](API.md)

</div>

---

## 📋 Visão Geral

O **Dash Bot** é um bot do Telegram especializado em corridas de rua, desenvolvido com **Clean Architecture** e princípios **SOLID**. Ele permite que os usuários consultem corridas disponíveis, obtenham detalhes específicos e recebam lembretes personalizados.

## 🎯 O que é o Dash Bot?

O **Dash Bot** é um bot inteligente para Telegram que **conecta corredores às melhores corridas de rua** do Brasil. Desenvolvido com **Clean Architecture** e **TypeScript**, oferece uma experiência moderna e intuitiva para descobrir, filtrar e se inscrever em corridas.

### 🔄 Como Funciona na Prática

**Para usuários:**

1. **Digite `/start`** → Bot se apresenta e registra seu perfil
2. **Use `/corridas`** → Veja todas as corridas disponíveis
3. **Clique nos botões** → Filtre por distância (5km, 10km, 21km, 42km)
4. **Explore detalhes** → Veja informações completas, preços e locais
5. **Configure preferências** → Personalize notificações e lembretes

**Para desenvolvedores:**

1. **Mensagem chega** → `TelegramBotAdapter` captura via webhook
2. **Comando é processado** → `CommandRouter` identifica e roteia
3. **Lógica é executada** → `UseCase` coordena fluxo de trabalho
4. **Dados são buscados** → `Service` + `Repository` acessam banco
5. **Resposta é formatada** → Interface rica com botões é enviada

> **🎯 Diferencial**: Interface **intuitiva** com botões interativos, **filtros inteligentes** e **arquitetura extensível** que permite adicionar novas funcionalidades facilmente.

## ✨ Principais Funcionalidades

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>🔍 Busca Inteligente</h3>
  <p>Consulte corridas disponíveis com filtros por distância, localização e data</p>
</div>

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>📅 Próximas Corridas</h3>
  <p>Veja as próximas corridas disponíveis e não perca nenhuma oportunidade</p>
</div>

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>🎯 Filtros Personalizados</h3>
  <p>Filtre corridas por distâncias específicas (5km, 10km, 21km, 42km)</p>
</div>

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>🔔 Lembretes</h3>
  <p>Configure lembretes personalizados para não perder inscrições</p>
</div>

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>⚙️ Configurações</h3>
  <p>Personalize suas preferências e distâncias favoritas</p>
</div>

<div style="padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
  <h3>📱 Interface Intuitiva</h3>
  <p>Botões interativos para uma experiência fluida e amigável</p>
</div>

</div>

## 🎯 Exemplos de Uso Prático

### 🏃‍♂️ Cenário 1: Corredor Iniciante

**João quer começar a correr e busca uma corrida de 5km:**

```
João: /start
Bot: 👋 Olá João! Eu sou o Dash Bot! [Interface de boas-vindas]

João: /corridas
Bot: 🏃‍♂️ Corridas Disponíveis
     [🏃‍♂️ Corrida da Primavera - 5k/10k]
     [🏃‍♂️ Maratona de SP - 21k/42k]
     [5km] [10km] [21km] [42km]  ← João clica aqui

Bot: 🏃‍♂️ Corridas de 5km
     📅 3 corridas encontradas:
     [Corrida da Primavera] [Ver Detalhes] [Lembrete]
     [Corrida do Parque] [Ver Detalhes] [Lembrete]
```

**🎯 Fluxo técnico interno:**

1. `startCommand` → registra usuário no banco
2. `listRacesCommand` → busca corridas via `RaceService`
3. `raceFilterCallback` → aplica filtro de 5km
4. Interface é atualizada instantaneamente

### 🏃‍♀️ Cenário 2: Corredora Experiente

**Maria treina para maratona e quer corridas de 21km:**

```
Maria: /config
Bot: ⚙️ Suas Configurações
     [🏃‍♂️ Configurar Distâncias] ← Maria clica

Maria: [Seleciona 21km como favorita]
Bot: ✅ Distâncias favoritas atualizadas!

Maria: /corridas
Bot: 🏃‍♂️ Corridas Recomendadas (21km)
     [🏃‍♂️ Meia Maratona de SP - 21k] [Ver Detalhes]
     💡 Baseado nas suas preferências
```

**🎯 Fluxo técnico interno:**

1. `configCommand` → interface de configuração
2. `userConfigCallback` → atualiza preferências no banco
3. `listRacesCommand` → usa `UserService` para personalizar
4. `RaceService` → filtra corridas por preferências

### 🎨 Cenário 3: Desenvolvedor Adicionando Funcionalidade

**Dev quer adicionar comando `/clima` para verificar tempo:**

```typescript
// 1. Criar comando
export async function weatherCommand(
  input: CommandInput
): Promise<CommandOutput> {
  const city = input.args?.[0] || "São Paulo";
  const weather = await weatherService.getWeather(city);

  return {
    text: `🌤️ ${city}: ${weather.temperature}°C - ${weather.condition}`,
    format: "HTML",
    keyboard: {
      inline_keyboard: [
        [{ text: "🏃‍♂️ Corridas hoje", callback_data: "races_today" }],
      ],
    },
  };
}

// 2. Registrar comando
commandRegistry.register("/clima", weatherCommand);
```

**🎯 Fluxo técnico:**

1. **Comando criado** → segue padrão `CommandInput` → `CommandOutput`
2. **Automaticamente integrado** → router identifica e executa
3. **Reutiliza infraestrutura** → usa mesma base de dados/serviços
4. **Interface consistente** → mantém padrão visual do bot

## 🚀 Como Usar o Bot

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white; margin: 30px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
  <h3 style="color: white; margin-top: 0; font-size: 1.5em;">🎯 Começar é Simples!</h3>
  <p style="font-size: 1.1em; margin-bottom: 15px;">Basta enviar <code style="background: rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 6px; font-weight: bold;">/start</code> para o bot e começar a descobrir corridas incríveis!</p>
  
  <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; flex: 1; min-width: 200px;">
      <div style="font-size: 1.5em; margin-bottom: 8px;">⚡</div>
      <strong>Resposta Instantânea</strong><br>
      <small>Resultados em segundos</small>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; flex: 1; min-width: 200px;">
      <div style="font-size: 1.5em; margin-bottom: 8px;">🎯</div>
      <strong>Filtros Precisos</strong><br>
      <small>Encontre exatamente o que procura</small>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; flex: 1; min-width: 200px;">
      <div style="font-size: 1.5em; margin-bottom: 8px;">🔔</div>
      <strong>Lembretes Inteligentes</strong><br>
      <small>Nunca perca uma inscrição</small>
    </div>
  </div>
</div>

### 📋 Comandos Principais

> **🎯 Como funciona**: Quando você digita um comando, o bot segue este fluxo:
>
> 1. **Captura** sua mensagem via API do Telegram
> 2. **Processa** o comando através do roteador interno
> 3. **Executa** a lógica de negócio específica
> 4. **Consulta** o banco de dados se necessário
> 5. **Retorna** resposta formatada com botões interativos

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin: 25px 0;">

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #007bff;">
  <h4 style="color: #007bff; margin-top: 0; display: flex; align-items: center;">
    <span style="margin-right: 10px;">🏃‍♂️</span>
    Descobrir Corridas
  </h4>
  <div style="background: #fff; padding: 15px; border-radius: 8px; font-family: monospace;">
    <div style="margin-bottom: 8px;"><strong>/corridas</strong> - Ver todas as corridas</div>
    <div style="margin-bottom: 8px;"><strong>/corridas 5km,10km</strong> - Filtrar distâncias</div>
    <div><strong>/proxima_corrida</strong> - Próxima corrida</div>
  </div>
  <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.9em;">
    💡 <strong>Dica</strong>: Use os botões que aparecem para filtrar rapidamente por distância!
  </div>
</div>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745;">
  <h4 style="color: #28a745; margin-top: 0; display: flex; align-items: center;">
    <span style="margin-right: 10px;">⚙️</span>
    Configurações
  </h4>
  <div style="background: #fff; padding: 15px; border-radius: 8px; font-family: monospace;">
    <div style="margin-bottom: 8px;"><strong>/config distancias 5,10,21</strong> - Favoritas</div>
    <div style="margin-bottom: 8px;"><strong>/config notificacoes on</strong> - Notificar</div>
    <div><strong>/config lembrete 3</strong> - Lembrete 3 dias</div>
  </div>
  <div style="background: #d4edda; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.9em;">
    💡 <strong>Dica</strong>: Configure suas distâncias favoritas para receber recomendações personalizadas!
  </div>
</div>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
  <h4 style="color: #e67e22; margin-top: 0; display: flex; align-items: center;">
    <span style="margin-right: 10px;">🆘</span>
    Ajuda
  </h4>
  <div style="background: #fff; padding: 15px; border-radius: 8px; font-family: monospace;">
    <div style="margin-bottom: 8px;"><strong>/ajuda</strong> - Guia completo</div>
    <div><strong>/help</strong> - Mesmo que /ajuda</div>
  </div>
  <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.9em;">
    💡 <strong>Dica</strong>: Use /ajuda para ver exemplos práticos de todos os comandos!
  </div>
</div>

</div>

### 📱 Navegação por Botões

> **🎯 Interface Intuitiva**: O bot oferece uma **experiência rica** com botões interativos que facilitam a navegação. Quando você clica em um botão, a **mensagem é editada instantaneamente** com as novas informações, mantendo a conversa limpa e organizada.

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">
  <span style="background: #f8f9fa; padding: 8px 16px; border-radius: 20px; border: 1px solid #dee2e6;">5km</span>
  <span style="background: #f8f9fa; padding: 8px 16px; border-radius: 20px; border: 1px solid #dee2e6;">10km</span>
  <span style="background: #f8f9fa; padding: 8px 16px; border-radius: 20px; border: 1px solid #dee2e6;">21km</span>
  <span style="background: #f8f9fa; padding: 8px 16px; border-radius: 20px; border: 1px solid #dee2e6;">42km</span>
  <span style="background: #e3f2fd; padding: 8px 16px; border-radius: 20px; border: 1px solid #2196f3;">📍 Localização</span>
  <span style="background: #fff3e0; padding: 8px 16px; border-radius: 20px; border: 1px solid #ff9800;">🔔 Lembrete</span>
</div>

**Como funciona cada tipo de botão:**

- **Filtros de Distância**: Clique para filtrar corridas por modalidade (5km, 10km, etc.)
- **Detalhes da Corrida**: Veja informações completas sobre data, local, valores e kit
- **Ações Rápidas**: Configure lembretes, compartilhe corridas ou navegue entre páginas
- **Configurações**: Interface intuitiva para personalizar suas preferências

> **💡 Dica**: Os botões são **contextuais** - aparecem diferentes opções dependendo do que você está visualizando!

## 🏗️ Arquitetura Técnica

> **🎯 Clean Architecture**: O Dash Bot foi construído seguindo os princípios da **Clean Architecture** e **SOLID**, garantindo um código **organizado, testável e fácil de manter**. Esta arquitetura permite que o bot seja **extensível** e **independente de tecnologias específicas**.

### 🔄 Fluxo de Execução

Quando você envia `/corridas`, aqui está o que acontece internamente:

```
1. 📱 Telegram → 🔄 Adapter → 🎯 Router → ⚙️ UseCase → 🏗️ Service → 💾 Repository → 📊 Database
                                                                                    ↓
2. 📤 Resposta ← 🔄 Adapter ← 🎯 Router ← ⚙️ UseCase ← 🏗️ Service ← 💾 Repository ← 📊 Database
```

**Explicação de cada camada:**

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🔄</div>
  <strong>Adapter</strong><br>
  <small>Converte mensagens do Telegram para formato interno</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🎯</div>
  <strong>Router</strong><br>
  <small>Identifica qual comando executar</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">⚙️</div>
  <strong>UseCase</strong><br>
  <small>Coordena o fluxo de trabalho</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🏗️</div>
  <strong>Service</strong><br>
  <small>Aplica regras de negócio</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">💾</div>
  <strong>Repository</strong><br>
  <small>Acessa e gerencia dados</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">📊</div>
  <strong>Database</strong><br>
  <small>Armazena corridas e usuários</small>
</div>

</div>

### 🛠️ Tecnologias Utilizadas

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">⚡</div>
  <strong>TypeScript</strong><br>
  <small>Tipagem forte e desenvolvimento seguro</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🤖</div>
  <strong>Telegram Bot API</strong><br>
  <small>Interface robusta e confiável</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🗄️</div>
  <strong>Prisma ORM</strong><br>
  <small>PostgreSQL</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🏗️</div>
  <strong>Clean Architecture</strong><br>
  <small>SOLID principles</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🧪</div>
  <strong>Vitest</strong><br>
  <small>Testes rápidos e confiáveis</small>
</div>

<div style="text-align: center; padding: 15px;">
  <div style="font-size: 2em; margin-bottom: 10px;">🚀</div>
  <strong>Deploy</strong><br>
  <small>Docker, Railway, Heroku, AWS</small>
</div>

</div>

### 📐 Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                 ADAPTERS (Interface)                        │
│                   🤖 Telegram Bot API                       │
├─────────────────────────────────────────────────────────────┤
│                APPLICATION (Use Cases)                      │
│              📋 Commands • 🔘 Callbacks • 🚏 Router          │
├─────────────────────────────────────────────────────────────┤
│                   DOMAIN (Business Rules)                   │
│           🏃‍♂️ Entities • 🔧 Services • 📚 Repositories        │
├─────────────────────────────────────────────────────────────┤
│               INFRASTRUCTURE (Data)                         │
│               🗄️ Prisma • 💾 Database • 🌐 APIs              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Telegram (para criar o bot)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/dash-bot-telegram.git
cd dash-bot-telegram
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.development`:

```env
# Bot Configuration
TELEGRAM_BOT_TOKEN=seu_token_aqui
BOT_PLATFORM=telegram

# Database
DATABASE_URL="postgresql://dashbot:dashbot123@localhost:5432/dashbot"
POSTGRES_URL_NON_POOLING="postgresql://dashbot:dashbot123@localhost:5432/dashbot"

# External APIs
RACES_ENDPOINT=https://api.sua-fonte-de-corridas.com/races
```

### 4. Configurar Banco de Dados

```bash
# Setup completo do banco (migrations + seed)
npm run db:setup

# Ou passo a passo:
npm run prisma:migrate:dev
npm run db:seed
```

### 5. Executar o Bot

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

## �️ Para Desenvolvedores

### 🔧 Debugging e Troubleshooting

**Problema: Comando não responde**

```bash
# 1. Verificar logs
npm run dev
# Procurar por: "📨 Mensagem recebida", "🎯 Roteando comando"

# 2. Verificar registro do comando
grep -r "commandRegistry.register" src/
# Confirmar se comando está registrado

# 3. Testar comando isoladamente
npm run test -- --grep "meuComando"
```

**Problema: Callback não funciona**

```bash
# 1. Verificar callback_data
console.log('🔘 Callback recebido:', query.data);

# 2. Verificar handler registrado
grep -r "CallbackHandler" src/
# Confirmar se handler está no CallbackManager

# 3. Validar formato dos dados
npm run test -- --grep "callback"
```

**Problema: Banco de dados**

```bash
# 1. Verificar conexão
npm run prisma:studio

# 2. Verificar migrations
npm run prisma:migrate:status

# 3. Recriar banco de desenvolvimento
npm run db:reset
```

### 🧪 Testes Práticos

**Teste manual via terminal:**

```bash
# Simular comando
node -e "
const { listRacesCommand } = require('./dist/Bot/commands/usecases/races');
const input = { chatId: '123', userId: 'test', command: 'corridas' };
listRacesCommand(input).then(console.log);
"
```

**Teste com dados reais:**

```bash
# Popular banco com dados de teste
npm run db:seed

# Verificar dados
npm run prisma:studio
```

### 📊 Monitoramento

**Métricas importantes:**

- **Tempo de resposta**: Comandos devem responder em < 3s
- **Taxa de erro**: Manter < 1% de erros
- **Uso de memória**: Monitorar growth de heap
- **Database queries**: Otimizar queries lentas

## �📊 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Compila TypeScript
npm run start        # Inicia em produção
npm run test         # Executa testes
```

### Banco de Dados

```bash
npm run db:setup     # Setup completo (migrations + seed)
npm run db:seed      # Popular com dados de teste
npm run db:clear     # Limpar todas as corridas
npm run db:reset     # Limpar e repopular
```

### Prisma

```bash
npm run prisma:migrate:dev    # Migrations de desenvolvimento
npm run prisma:generate:dev   # Gerar tipos do Prisma
npm run prisma:studio         # Abrir Prisma Studio
```

## 📚 Documentação Completa

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; color: white; margin: 30px 0;">
  <h3 style="color: white; margin-top: 0; text-align: center;">📖 Explore Nossa Documentação</h3>
  <p style="text-align: center; font-size: 1.1em; margin-bottom: 20px;">Tudo que você precisa para entender e contribuir com o projeto</p>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #007bff;">
  <h4 style="color: #007bff; margin-top: 0;">📖 Documentação Técnica</h4>
  <p style="color: #666; margin-bottom: 15px;">Guia completo de desenvolvimento e implementação</p>
  <a href="DOCUMENTATION.md" style="display: inline-block; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Ver Documentação</a>
</div>

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #28a745;">
  <h4 style="color: #28a745; margin-top: 0;">🏗️ Arquitetura</h4>
  <p style="color: #666; margin-bottom: 15px;">Detalhes da arquitetura e padrões utilizados</p>
  <a href="ARCHITECTURE.md" style="display: inline-block; padding: 8px 16px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Ver Arquitetura</a>
</div>

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #ffc107;">
  <h4 style="color: #e67e22; margin-top: 0;">🗄️ Banco de Dados</h4>
  <p style="color: #666; margin-bottom: 15px;">Esquema e gerenciamento do banco de dados</p>
  <a href="DATABASE.md" style="display: inline-block; padding: 8px 16px; background: #ffc107; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Ver Database</a>
</div>

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #dc3545;">
  <h4 style="color: #dc3545; margin-top: 0;">🚀 Deployment</h4>
  <p style="color: #666; margin-bottom: 15px;">Guia completo de deploy e configuração</p>
  <a href="DEPLOYMENT.md" style="display: inline-block; padding: 8px 16px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Ver Deploy</a>
</div>

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #6f42c1;">
  <h4 style="color: #6f42c1; margin-top: 0;">🔧 API Reference</h4>
  <p style="color: #666; margin-bottom: 15px;">Referência completa da API e endpoints</p>
  <a href="API.md" style="display: inline-block; padding: 8px 16px; background: #6f42c1; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Ver API</a>
</div>

<div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #17a2b8;">
  <h4 style="color: #17a2b8; margin-top: 0;">🤝 Contribuição</h4>
  <p style="color: #666; margin-bottom: 15px;">Como contribuir para o projeto</p>
  <a href="CONTRIBUTING.md" style="display: inline-block; padding: 8px 16px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Contribuir</a>
</div>

</div>

## 🤝 Contribuindo

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; margin: 30px 0;">
  <h3 style="color: white; margin-top: 0; text-align: center;">✨ Junte-se à Comunidade!</h3>
  <p style="text-align: center; font-size: 1.1em; margin-bottom: 0;">Sua contribuição faz a diferença para milhares de corredores</p>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 25px 0;">

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">🍴</div>
  <strong>1. Fork</strong><br>
  <small style="color: #666;">Fork o projeto no GitHub</small>
</div>

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">🌿</div>
  <strong>2. Branch</strong><br>
  <small style="color: #666;">Crie uma branch para sua feature</small>
</div>

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">💻</div>
  <strong>3. Code</strong><br>
  <small style="color: #666;">Implemente suas mudanças</small>
</div>

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">📝</div>
  <strong>4. Commit</strong><br>
  <small style="color: #666;">Commit com mensagens claras</small>
</div>

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">🚀</div>
  <strong>5. Push</strong><br>
  <small style="color: #666;">Push para sua branch</small>
</div>

<div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
  <div style="font-size: 2.5em; margin-bottom: 15px;">🔄</div>
  <strong>6. PR</strong><br>
  <small style="color: #666;">Abra um Pull Request</small>
</div>

</div>

```bash
# Fluxo de contribuição
git checkout -b feature/nova-funcionalidade
git commit -m 'Adiciona nova funcionalidade'
git push origin feature/nova-funcionalidade
```

<div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745; margin: 20px 0;">
  <h4 style="color: #28a745; margin-top: 0;">💡 Dicas para Contribuir</h4>
  <ul style="margin-bottom: 0; color: #155724;">
    <li>Siga os padrões de código existentes</li>
    <li>Adicione testes para novas funcionalidades</li>
    <li>Documente mudanças importantes</li>
    <li>Mantenha commits pequenos e focados</li>
  </ul>
</div>

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

<div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin: 30px 0;">
  <h3 style="margin-top: 0; text-align: center; color: #495057;">� Precisa de Ajuda?</h3>
  <p style="text-align: center; color: #6c757d; margin-bottom: 25px;">Estamos aqui para ajudar! Escolha o canal que preferir:</p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
    
    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 15px;">�📧</div>
      <strong>Email</strong><br>
      <small style="color: #666;">Para dúvidas gerais</small><br>
      <a href="mailto:seu-email@exemplo.com" style="color: #007bff; text-decoration: none;">seu-email@exemplo.com</a>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 15px;">🐛</div>
      <strong>Bug Reports</strong><br>
      <small style="color: #666;">Para reportar problemas</small><br>
      <a href="https://github.com/seu-usuario/dash-bot-telegram/issues" style="color: #dc3545; text-decoration: none;">GitHub Issues</a>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 15px;">💬</div>
      <strong>Discussões</strong><br>
      <small style="color: #666;">Para ideias e feedback</small><br>
      <a href="https://github.com/seu-usuario/dash-bot-telegram/discussions" style="color: #28a745; text-decoration: none;">GitHub Discussions</a>
    </div>
    
  </div>
</div>

---

## 🎯 Resumo e Próximos Passos

### ✅ O que você aprendeu

- **🔄 Fluxo completo**: Como uma mensagem se torna uma resposta
- **🏗️ Arquitetura limpa**: Separação de responsabilidades e extensibilidade
- **📱 Interface rica**: Botões interativos e navegação fluida
- **🛠️ Debugging prático**: Como identificar e resolver problemas
- **🧪 Testes eficientes**: Estratégias para validar funcionalidades

### 🚀 Próximos Passos

1. **📖 Explore a documentação completa** em [DOCUMENTATION.md](DOCUMENTATION.md)
2. **🔄 Entenda os fluxos detalhados** em [WORKFLOW.md](WORKFLOW.md)
3. **🏗️ Estude a arquitetura** em [ARCHITECTURE.md](ARCHITECTURE.md)
4. **🎯 Faça o tutorial prático** em [TUTORIAL.md](TUTORIAL.md)
5. **🔧 Consulte a API** em [API.md](API.md)

### 🤝 Contribuindo

Quer contribuir com o projeto? Siga estes passos:

1. **Fork** o repositório
2. **Clone** sua cópia local
3. **Crie uma branch** para sua feature
4. **Implemente** seguindo os padrões
5. **Teste** sua implementação
6. **Abra um Pull Request**

### 📞 Suporte

- **🐛 Bugs**: Abra uma issue no repositório
- **💡 Ideias**: Discussões na seção de Issues
- **📚 Documentação**: Contribua com melhorias
- **🤝 Comunidade**: Participe das discussões

<div align="center" style="margin: 40px 0;">
  <h3 style="color: #495057; margin-bottom: 20px;">🏃‍♂️ Desenvolvido com ❤️ para a comunidade de corredores</h3>
  <p style="color: #6c757d; font-size: 1.1em;">Conectando corredores às melhores oportunidades de corrida</p>
  
  <div style="margin-top: 25px;">
    <a href="https://github.com/seu-usuario/dash-bot-telegram" style="display: inline-block; margin: 0 10px; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">⭐ Star no GitHub</a>
    <a href="CONTRIBUTING.md" style="display: inline-block; margin: 0 10px; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">🤝 Contribuir</a>
  </div>
</div>
