# 📋 Changelog - Dash Bot

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚀 Planned

- [ ] Sistema de favoritos para corridas
- [ ] Histórico de corridas do usuário
- [ ] Compartilhamento de corridas
- [ ] Integração com calendário
- [ ] Notificações push
- [ ] Suporte ao WhatsApp
- [ ] API REST pública
- [ ] Dashboard web

## [1.0.0] - 2025-07-10

### 🎉 Initial Release

#### ✨ Added

- **Sistema de Comandos**

  - `/start` - Apresentação e boas-vindas
  - `/corridas` - Listar corridas disponíveis
  - `/proxima_corrida` - Próxima corrida disponível
  - `/config` - Configurações do usuário
  - `/ajuda` - Guia completo de comandos

- **Sistema de Callbacks**

  - Detalhes de corridas
  - Filtros por distância (5km, 10km, 21km, 42km)
  - Configuração de lembretes
  - Navegação entre telas

- **Funcionalidades de Corridas**

  - Busca e listagem de corridas
  - Filtros por distância
  - Detalhes completos da corrida
  - Status de inscrições (aberta, fechada, em breve)

- **Funcionalidades de Usuário**

  - Cadastro automático no primeiro uso
  - Configuração de distâncias favoritas
  - Sistema de notificações
  - Lembretes personalizados

- **Arquitetura**

  - Clean Architecture com SOLID principles
  - Separação em camadas (Domain, Application, Infrastructure, Adapters)
  - Dependency Injection
  - Repository Pattern
  - Command Pattern
  - Strategy Pattern

- **Tecnologias**

  - Node.js com TypeScript
  - Prisma ORM (SQLite dev, PostgreSQL prod)
  - node-telegram-bot-api
  - Vitest para testes
  - ESLint + Prettier

- **Banco de Dados**

  - Schema para corridas e usuários
  - Migrations automatizadas
  - Seeders para dados de teste
  - Suporte a SQLite e PostgreSQL

- **Sistema de Tipos**
  - Tipagem completa em TypeScript
  - Interfaces bem definidas
  - Callbacks type-safe
  - Validação de dados

#### 🏗️ Architecture Features

- **Modular Commands**: Organização por domínios (races, user, shared)
- **Callback System**: Sistema robusto de callbacks com type safety
- **Platform Abstraction**: Suporte preparado para múltiplas plataformas
- **Service Layer**: Camada de serviços com regras de negócio
- **Repository Layer**: Abstração de acesso a dados

#### 🛠️ Developer Experience

- **Hot Reload**: Desenvolvimento com tsx watch
- **Database Scripts**: Scripts para setup, seed, clear e reset
- **Testing**: Testes unitários e de integração
- **Linting**: ESLint com regras TypeScript
- **Type Safety**: Tipagem completa do projeto

#### 📝 Documentation

- **README.md**: Guia principal com instalação e uso
- **ARCHITECTURE.md**: Documentação da arquitetura
- **API.md**: Referência completa da API
- **DEPLOYMENT.md**: Guia de deploy
- **TUTORIAL.md**: Exemplos práticos
- **CONTRIBUTING.md**: Guia de contribuição
- **DATABASE.md**: Documentação do banco

#### 🚀 Deployment

- **Docker**: Containerização completa
- **Railway**: Deploy em Railway
- **Heroku**: Suporte ao Heroku
- **AWS EC2**: Deploy manual
- **Environment**: Configuração por ambiente

#### 🧪 Testing

- **Unit Tests**: Testes unitários com Vitest
- **Integration Tests**: Testes de integração
- **Mock System**: Sistema de mocks para testes
- **Coverage**: Relatórios de cobertura

### 🔧 Technical Details

#### Database Schema

```sql
-- Users table
CREATE TABLE User (
    id TEXT PRIMARY KEY,
    telegramId TEXT UNIQUE,
    name TEXT,
    username TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE UserPreferences (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE,
    preferredDistances TEXT DEFAULT '[]',
    notificationsEnabled BOOLEAN DEFAULT true,
    reminderDays INTEGER DEFAULT 3,
    FOREIGN KEY (userId) REFERENCES User(id)
);

-- Races table
CREATE TABLE Race (
    id TEXT PRIMARY KEY,
    title TEXT,
    organization TEXT,
    distances TEXT DEFAULT '[]',
    distancesNumbers TEXT DEFAULT '[]',
    date DATETIME,
    location TEXT,
    link TEXT,
    time TEXT,
    status TEXT DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Available Commands

- `/start` - Welcome message and introduction
- `/corridas` - List available races
- `/corridas [distances]` - Filter races by distances
- `/proxima_corrida` - Show next upcoming race
- `/config` - User configuration menu
- `/config distancias [distances]` - Set preferred distances
- `/config notificacoes [on/off]` - Toggle notifications
- `/config lembrete [days]` - Set reminder days
- `/ajuda` or `/help` - Complete command guide

#### Callback Types

- `race_details` - Show race details
- `races_list` - List races with optional distance filter
- `race_filter` - Filter races by distance
- `race_reminder` - Set/cancel race reminder
- `race_location` - Show race location
- `race_search` - Search races by term
- `user_config` - User configuration options
- `navigation` - Navigation between screens

### 🎯 Performance & Scalability

- **Efficient Queries**: Optimized database queries
- **Caching**: Preparation for Redis cache
- **Pagination**: Paginated results for large datasets
- **Rate Limiting**: Preparation for rate limiting
- **Error Handling**: Comprehensive error handling

### 🔐 Security

- **Environment Variables**: Secure configuration
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected by Prisma ORM
- **Error Messages**: User-friendly error messages
- **Logging**: Comprehensive logging system

### 📊 Monitoring & Debugging

- **Console Logging**: Detailed logging
- **Error Tracking**: Error tracking and reporting
- **Health Checks**: Health check endpoints
- **Performance Metrics**: Performance monitoring

---

## 🚀 Future Versions

### [1.1.0] - Planned

- Sistema de favoritos
- Histórico de corridas
- Melhorias na interface
- Otimizações de performance

### [1.2.0] - Planned

- Suporte ao WhatsApp
- Notificações push
- Integração com calendário
- Compartilhamento de corridas

### [2.0.0] - Planned

- API REST pública
- Dashboard web
- Sistema de análise
- Múltiplas plataformas

---

## 📝 Formato das Entradas

### Tipos de Mudanças

- `✨ Added` - Nova funcionalidade
- `🔧 Changed` - Mudança em funcionalidade existente
- `⚠️ Deprecated` - Funcionalidade marcada como obsoleta
- `🗑️ Removed` - Funcionalidade removida
- `🐛 Fixed` - Correção de bug
- `🔒 Security` - Correção de vulnerabilidade

### Emojis por Categoria

- 🎉 Initial Release
- ✨ New Features
- 🔧 Changes
- 🐛 Bug Fixes
- 🔒 Security
- 📝 Documentation
- 🚀 Performance
- 🎨 UI/UX
- 🏗️ Architecture
- 🧪 Testing
- 📊 Analytics
- 🔐 Security
- 🛠️ Development
- 📱 Mobile
- 🌐 Web
- 🤖 Bot Features

---

**Legenda:**

- `[Unreleased]` - Mudanças não lançadas
- `[1.0.0]` - Versão lançada
- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades obsoletas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de segurança
