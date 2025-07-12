# Configuração do PostgreSQL Local

Este documento descreve como configurar e usar o PostgreSQL local para desenvolvimento.

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js e npm instalados

## Setup Rápido

### ⚡ Comando Único (Recomendado)
```bash
# Faz tudo em um comando:
# ✅ Inicia PostgreSQL
# ✅ Gera cliente Prisma  
# ✅ Executa migrações
# ✅ Popula banco com dados
# ✅ Inicia o bot
npm run dev:all
```

### 🔧 Setup Manual

1. **Executar o script de setup:**
   ```bash
   npm run dev:setup
   ```

   Ou manualmente:
   ```bash
   ./setup-postgres.sh
   ```

> **Nota**: O projeto agora usa apenas PostgreSQL com o arquivo `prisma/schema.prisma` padrão.

## Comandos Disponíveis

### ⚡ Comando Único
- `npm run dev:all` - **Setup completo + iniciar bot (RECOMENDADO)**

### 🔧 Setup por Etapas
- `npm run dev:setup` - Setup apenas (sem iniciar bot)
- `npm run dev:start` - Setup + iniciar bot (script bash)
- `npm run dev:full` - Setup + iniciar bot (comandos npm)

### PostgreSQL
- `npm run postgres:up` - Iniciar PostgreSQL
- `npm run postgres:down` - Parar PostgreSQL
- `npm run postgres:logs` - Ver logs do PostgreSQL
- `npm run postgres:reset` - Resetar completamente o PostgreSQL (apaga todos os dados)

### Prisma
- `npm run prisma:generate:dev` - Gerar cliente Prisma
- `npm run prisma:migrate:dev` - Executar migrações
- `npm run prisma:studio` - Abrir Prisma Studio

### Banco de Dados
- `npm run db:seed:complete` - Popular banco com dados de teste
- `npm run db:clear:complete` - Limpar todos os dados
- `npm run db:reset:complete` - Limpar e popular novamente
- `npm run db:setup:complete` - Migrar e popular banco

## Configuração do Banco

- **Host:** localhost
- **Porta:** 5432
- **Database:** dashbot
- **Usuário:** dashbot
- **Senha:** dashbot123

## Desenvolvimento

1. **Iniciar o ambiente:**
   ```bash
   npm run dev:setup
   ```

2. **Iniciar o bot:**
   ```bash
   npm run dev
   ```

3. **Abrir Prisma Studio (opcional):**
   ```bash
   npm run prisma:studio
   ```

## Troubleshooting

### PostgreSQL não inicia
```bash
# Verificar se o Docker está rodando
docker info

# Verificar logs
npm run postgres:logs

# Resetar PostgreSQL
npm run postgres:reset
```

### Erro de conexão
- Verificar se o PostgreSQL está rodando: `docker ps`
- Verificar se a porta 5432 está disponível: `lsof -i :5432`
- Verificar variáveis de ambiente no `.env.development`

### Problemas com migrações
```bash
# Resetar migrações
npm run postgres:reset
npm run prisma:migrate:dev
```

## Backup e Restore

### Criar backup
```bash
docker-compose exec postgres pg_dump -U dashbot dashbot > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T postgres psql -U dashbot dashbot < backup.sql
```

## Migração de Dados

Para importar dados existentes de outro banco:

1. Exporte os dados do banco anterior
2. Configure o PostgreSQL com este guia
3. Importe os dados ou use o seed para criar dados de teste
