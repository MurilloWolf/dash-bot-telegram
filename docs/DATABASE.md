# 🏃‍♂️ Dash Bot - Database Management

Este documento explica como gerenciar o banco de dados PostgreSQL do Dash Bot.

## 📋 Scripts Disponíveis

### 🚀 Setup Inicial

```bash
# Configurar PostgreSQL + banco completo (migrations + seed)
npm run dev:setup

# Ou passo a passo:
npm run postgres:up           # Iniciar PostgreSQL
npm run db:setup:complete     # Configurar banco completo
```

### 🐘 PostgreSQL

```bash
# Iniciar PostgreSQL
npm run postgres:up

# Parar PostgreSQL
npm run postgres:down

# Ver logs do PostgreSQL
npm run postgres:logs

# Resetar PostgreSQL (apaga todos os dados)
npm run postgres:reset
```

### 🌱 Seed do Banco

```bash
# Popular o banco com dados de teste
npm run db:seed:complete
```

### 🗑️ Limpeza do Banco

```bash
# Remover todos os dados
npm run db:clear:complete
```

### 🔄 Reset Completo

```bash
# Limpar e re-popular o banco
npm run db:reset:complete
```

### 🛠️ Migrations

```bash
# Executar migrations de desenvolvimento
npm run prisma:migrate:dev

# Gerar tipos do Prisma
npm run prisma:generate:dev

# Abrir Prisma Studio
npm run prisma:studio
```
