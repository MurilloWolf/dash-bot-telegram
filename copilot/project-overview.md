# Project Overview - DashBot Telegram

## 🎯 Visão Geral do Projeto

**DashBot** é um bot multiplataforma (atualmente focado em Telegram) para corridas de rua, desenvolvido com foco em:

- Listagem de corridas disponíveis com filtros por distância
- Sistema de lembretes para corridas
- Gestão de usuários com preferências personalizadas
- Sistema de pagamentos e assinaturas premium
- Arquitetura extensível para múltiplas plataformas

## 🏗️ Arquitetura Geral

### Clean Architecture + Domain Driven Design (DDD)

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTERS (External)                      │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Telegram      │  │   WhatsApp      │                  │
│  │   Adapter       │  │   (Futuro)      │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────┬───────────────────────────────────┘
                         │
┌─────────────────────────┼───────────────────────────────────┐
│                    BOT LAYER                                │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ CommandRouter   │   │   │ Middleware      │              │
│  │ + Interceptor   │   │   │ (Messages)      │              │
│  └─────────────────┘   │   └─────────────────┘              │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ Commands        │   │   │ Callbacks       │              │
│  │ Registry        │   │   │ System          │              │
│  └─────────────────┘   │   └─────────────────┘              │
└─────────────────────────┼───────────────────────────────────┘
                         │
┌─────────────────────────┼───────────────────────────────────┐
│                    SERVICES LAYER                           │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ HTTP Client     │   │   │ API Services    │              │
│  │ (Custom with    │   │   │ (UserApi,       │              │
│  │  Interceptors)  │   │   │  RaceApi, etc)  │              │
│  └─────────────────┘   │   └─────────────────┘              │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ Types &         │   │   │ Formatters      │              │
│  │ Interfaces      │   │   │ (Race, etc)     │              │
│  └─────────────────┘   │   └─────────────────┘              │
└─────────────────────────┼───────────────────────────────────┘
                         │
┌─────────────────────────┼───────────────────────────────────┐
│                 INFRASTRUCTURE                              │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ HTTP Services   │   │   │ External APIs   │              │
│  │ (API Clients)   │   │   │ Communication   │              │
│  └─────────────────┘   │   └─────────────────┘              │
│  ┌─────────────────┐   │   ┌─────────────────┐              │
│  │ File System &   │   │   │ Logging &       │              │
│  │ Utilities       │   │   │ Monitoring      │              │
│  └─────────────────┘   │   └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Stack Tecnológica

### Backend

- **Node.js** com **TypeScript** (ES Modules)
- **Custom HTTP Client** para comunicação com APIs externas
- **Vitest** para testes unitários
- **ESLint** para qualidade de código

### Bot Framework

- **node-telegram-bot-api** para integração com Telegram
- Sistema de comandos customizado e extensível
- Sistema de callbacks tipado
- Middleware para interceptação de mensagens

### Deployment

- **Docker** para containerização
- **Fly.io** para deploy em produção
- Scripts automatizados de build e deploy

## 📁 Estrutura de Diretórios

```
src/
├── adapters/           # Adapters para plataformas externas
│   └── in/
│       ├── telegram/   # Adapter específico do Telegram
│       └── whatsapp/   # Adapter futuro para WhatsApp
├── Bot/                # Camada do Bot (Application Layer)
│   ├── commands/       # Comandos organizados por use cases
│   ├── config/         # Configurações (callbacks, commands)
│   ├── middleware/     # Middleware para interceptação
│   └── router/         # Roteamento de comandos
├── services/           # Serviços modulares de comunicação externa
│   ├── http/           # HttpClient customizado e utilitários
│   ├── UserApiService.ts    # Serviço específico para usuários
│   ├── RaceApiService.ts    # Serviço específico para corridas
│   ├── ChatApiService.ts    # Serviço específico para chats
│   ├── MessageApiService.ts # Serviço específico para mensagens
│   └── index.ts        # Exportações centralizadas
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários compartilhados
    └── formatters/     # Formatadores especializados (RaceFormatter)
```

## 🎮 Funcionalidades Principais

### 1. Sistema de Corridas

- Listagem de corridas com filtros por distância
- Busca por localização e data
- Detalhes completos de cada corrida
- Sistema de lembretes automáticos

### 2. Gestão de Usuários

- Registro automático via Telegram
- Preferências personalizadas
- Sistema de usuários premium
- Histórico de interações

### 3. Sistema de Pagamentos

- Integração com Telegram Payments
- Produtos e assinaturas
- Histórico de transações
- Gestão automática de renovações

### 4. Sistema de Mensagens

- Interceptação e salvamento automático
- Histórico completo de conversas
- Suporte a múltiplos tipos de mídia
- Sistema agnóstico de plataforma

## 🔄 Fluxo Principal

1. **Recepção**: Adapter recebe mensagem da plataforma
2. **Roteamento**: CommandRouter identifica e roteia comando
3. **Interceptação**: MessageInterceptor salva mensagem de entrada
4. **Processamento**: Command handler processa a lógica de negócio
5. **Resposta**: Sistema gera resposta com keyboard/buttons
6. **Interceptação**: MessageInterceptor salva resposta
7. **Envio**: Adapter envia resposta para a plataforma

## 🧩 Características Técnicas

### Dependency Injection

- Injeção de dependências manual via `dependencies.ts`
- Services modulares com singleton pattern
- Facilita testes e mocking
- Inversão de controle clara

### HTTP Client Architecture

- `HttpClient` customizado com interceptors
- Padronização de responses com `HttpResponse<T>`
- Tratamento automático de `ApiResponse` structure
- Error handling unificado com `ApiError`

### Service Layer Modularity

- Services específicos por domínio (`UserApiService`, `RaceApiService`)
- Responsabilidade única por service
- Exportações centralizadas via `services/index.ts`
- Type safety completa com TypeScript

### Type Safety

- TypeScript strict mode
- Tipos customizados para comandos e callbacks
- Validação em tempo de compilação
- Alias de paths para imports limpos (`@services/*`, `@bot/*`)

### Error Handling

- Sistema de logging estruturado
- Tratamento gracioso de falhas
- Fallbacks para casos de erro
- Interceptors para tratamento centralizado

### Extensibilidade

- Registro automático de comandos
- Sistema de callbacks tipado
- Suporte fácil para novas plataformas
- Formatters especializados (`RaceFormatter`)

## 🎯 Objetivos de Design

1. **Separation of Concerns**: Cada camada tem responsabilidade bem definida
2. **Platform Agnostic**: Lógica de negócio independente de plataforma específica
3. **Testability**: Código facilmente testável com mocks
4. **Maintainability**: Estrutura clara e organizacional
5. **Scalability**: Preparado para crescimento e novas features
6. **Type Safety**: Máxima segurança de tipos em TypeScript
