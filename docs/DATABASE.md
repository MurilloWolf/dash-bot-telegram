# 🏃‍♂️ Dash Bot - Database Management

Este documento explica como gerenciar o banco de dados do Dash Bot.

## 📋 Scripts Disponíveis

### 🚀 Setup Inicial

```bash
# Configurar banco completo (migrations + seed)
npm run db:setup
```

### 🌱 Seed do Banco

```bash
# Popular o banco com dados de teste
npm run db:seed
```

### 🗑️ Limpeza do Banco

```bash
# Remover todas as corridas
npm run db:clear
```

### 🔄 Reset Completo

```bash
# Limpar e re-popular o banco
npm run db:reset
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
