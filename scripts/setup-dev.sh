#!/bin/bash

# Setup de Desenvolvimento do DashBot
set -e

echo "🚀 Setup de Desenvolvimento - DashBot"
echo "=================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop."
    exit 1
fi

# Iniciar PostgreSQL
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando PostgreSQL..."
sleep 5

# Executar migrações
echo "🔄 Executando migrações..."
npm run prisma:migrate:dev

# Popular banco com dados
echo "📊 Populando banco de dados..."
npm run db:seed

echo "✅ Setup concluído!"
echo ""
echo "🚀 Para iniciar o bot:"
echo "   npm run dev"
