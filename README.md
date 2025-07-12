# 🏃‍♂️ Dash Bot Telegram

Um bot inteligente para corredores que desejam encontrar corridas de rua, obter informações detalhadas e receber lembretes personalizados.

## 📋 Visão Geral

O **Dash Bot** é um bot do Telegram especializado em corridas de rua, desenvolvido com **Clean Architecture** e princípios **SOLID**. Ele permite que os usuários consultem corridas disponíveis, obtenham detalhes específicos e recebam lembretes personalizados.

### ✨ Principais Funcionalidades

- 🔍 **Busca de Corridas**: Consulte corridas disponíveis com filtros por distância
- 📅 **Próximas Corridas**: Veja as próximas corridas disponíveis
- 🎯 **Filtros Personalizados**: Filtre corridas por distâncias específicas (5km, 10km, 21km, 42km)
- 🔔 **Lembretes**: Configure lembretes para não perder inscrições
- ⚙️ **Configurações**: Personalize suas preferências e distâncias favoritas
- 📱 **Interface Intuitiva**: Botões interativos para uma experiência fluida

## 🚀 Como Usar o Bot

### 1. Iniciando uma Conversa

```
/start - Apresentação e boas-vindas
```

### 2. Comandos Principais

#### 🏃‍♂️ **Descobrir Corridas**

```bash
/corridas                    # Ver todas as corridas disponíveis
/corridas 5km,10km          # Filtrar por distâncias específicas
/proxima_corrida            # Próxima corrida disponível
```

#### ⚙️ **Configurações Pessoais**

```bash
/config distancias 5,10,21   # Suas distâncias favoritas
/config notificacoes on      # Ativar notificações
/config lembrete 3           # Lembretes 3 dias antes
```

#### 🆘 **Ajuda**

```bash
/ajuda                       # Guia completo de comandos
/help                        # Mesmo que /ajuda
```

### 3. Navegação por Botões

O bot oferece uma interface rica com botões interativos:

- **Filtros de Distância**: Botões rápidos para 5km, 10km, 21km, 42km
- **Detalhes da Corrida**: Informações completas sobre cada corrida
- **Ações Rápidas**: Lembretes, compartilhamento e navegação
- **Configurações**: Interface intuitiva para personalização

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

- **Runtime**: Node.js com TypeScript
- **Bot Framework**: node-telegram-bot-api
- **Database**: Prisma ORM com PostgreSQL
- **Arquitetura**: Clean Architecture com SOLID principles
- **Testes**: Vitest

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                 ADAPTERS (Interface)                        │
│                     Telegram Bot                            │
├─────────────────────────────────────────────────────────────┤
│                APPLICATION (Use Cases)                      │
│              Commands • Callbacks • Router                  │
├─────────────────────────────────────────────────────────────┤
│                   DOMAIN (Business Rules)                   │
│             Entities • Services • Repositories              │
├─────────────────────────────────────────────────────────────┤
│               INFRASTRUCTURE (Data)                         │
│                 Prisma • Database • APIs                    │
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

### 4. Iniciar Tudo com Um Comando

```bash
# Comando único que faz tudo:
# ✅ Inicia PostgreSQL
# ✅ Gera cliente Prisma  
# ✅ Executa migrações
# ✅ Popula banco com dados
# ✅ Inicia o bot
npm run dev:all
```

**Ou use os comandos separados:**

```bash
# Setup automático completo (PostgreSQL + migrations + seed)
npm run dev:setup

# Ou passo a passo:
npm run postgres:up           # Iniciar PostgreSQL
npm run prisma:migrate:dev    # Executar migrations
npm run db:seed:complete      # Popular banco com dados
npm run dev                   # Iniciar bot
```

### 5. Executar o Bot

```bash
# Se já fez o setup, apenas inicie o bot:
npm run dev

# Para ver dados no banco:
npm run prisma:studio

# Produção
npm run build
npm start
```

## 📊 Scripts Disponíveis

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

A documentação completa está organizada na pasta `/docs`:

- **[📖 Documentação Técnica](docs/DOCUMENTATION.md)** - Guia completo de desenvolvimento
- **[🏗️ Arquitetura](docs/ARCHITECTURE.md)** - Detalhes da arquitetura e padrões
- **[🗄️ Banco de Dados](docs/DATABASE.md)** - Esquema e gerenciamento do banco
- **[🚀 Deployment](docs/DEPLOYMENT.md)** - Guia de deploy e configuração
- **[🔧 API Reference](docs/API.md)** - Referência completa da API
- **[📋 Contribuição](docs/CONTRIBUTING.md)** - Como contribuir para o projeto

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/dash-bot-telegram/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/dash-bot-telegram/discussions)

---

<div align="center">
  <strong>Desenvolvido com ❤️ para a comunidade de corredores</strong>
</div>
