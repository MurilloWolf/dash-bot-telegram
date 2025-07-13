# 🏃‍♂️ Dash Bot Telegram

Bot inteligente para corredores que desejam encontrar corridas de rua, obter informações detalhadas e receber lembretes personalizados.

## � Setup Rápido

### Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Setup completo (PostgreSQL + migrações + dados)
npm run setup

# 3. Iniciar bot
npm run dev
```

### Produção

```bash
# Build para produção
npm run build

# Deploy no Fly.io
npm run deploy
```

## � Scripts Essenciais

```bash
npm run dev       # Desenvolvimento com hot-reload
npm run build     # Build otimizado para produção
npm run start     # Iniciar em produção
npm run setup     # Setup completo de desenvolvimento
npm run deploy    # Deploy no Fly.io
npm run prisma    # Migrações do banco
npm run db        # Popular com dados de teste
npm run test      # Executar testes
```

## ⚙️ Configuração

### Variáveis de Ambiente

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

### Pré-requisitos

- Node.js 18+
- Docker (para PostgreSQL)
- Conta no Telegram (para criar o bot)

## 🏗️ Arquitetura

**Stack**: Node.js + TypeScript + Prisma + PostgreSQL + Telegram Bot API

**Padrões**: Clean Architecture com SOLID principles

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

## 🤖 Funcionalidades do Bot

### Comandos Principais

```bash
/start                       # Apresentação e boas-vindas
/corridas                    # Ver todas as corridas disponíveis
/corridas 5km,10km          # Filtrar por distâncias específicas
/proxima_corrida            # Próxima corrida disponível
/config distancias 5,10,21   # Suas distâncias favoritas
/ajuda                       # Guia completo de comandos
```

### Recursos

- 🔍 **Busca de Corridas**: Consulte corridas com filtros por distância
- 📅 **Próximas Corridas**: Veja as próximas corridas disponíveis
- 🎯 **Filtros Personalizados**: Filtre por distâncias específicas (5km, 10km, 21km, 42km)
- 🔔 **Lembretes**: Configure lembretes para não perder inscrições
- ⚙️ **Configurações**: Personalize suas preferências
- 📱 **Interface Intuitiva**: Botões interativos para experiência fluida

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

<div align="center">
  <strong>Desenvolvido com ❤️ para a comunidade de corredores</strong>
</div>
