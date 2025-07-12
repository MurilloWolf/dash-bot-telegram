#!/bin/bash

# Script completo para desenvolvimento - setup + iniciar bot

echo "🚀 Iniciando ambiente completo de desenvolvimento..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se o PostgreSQL já está rodando
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL já está rodando!"
else
    echo "🐘 Iniciando PostgreSQL..."
    docker-compose up -d postgres
    
    # Aguardar o PostgreSQL estar pronto
    echo "⏳ Aguardando PostgreSQL inicializar..."
    sleep 5
    
    # Verificar se o PostgreSQL está pronto
    until docker-compose exec postgres pg_isready -U dashbot -d dashbot > /dev/null 2>&1; do
        echo "⏳ Aguardando PostgreSQL..."
        sleep 2
    done
    
    echo "✅ PostgreSQL está rodando!"
fi

# Gerar o cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npm run prisma:generate:dev

# Executar migrações
echo "🔄 Executando migrações..."
npm run prisma:migrate:dev

# Seed do banco
echo "🌱 Populando banco com dados de teste..."
npm run db:seed:complete

echo "🎉 Setup concluído!"
echo ""
echo "🤖 Iniciando o bot..."
echo ""
echo "📋 Para parar o bot: Ctrl+C"
echo "📋 Para parar PostgreSQL: docker-compose down"
echo ""

# Iniciar o bot
npm run dev
