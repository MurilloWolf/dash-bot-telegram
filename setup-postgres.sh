#!/bin/bash

# Script para configurar o ambiente de desenvolvimento com PostgreSQL local

echo "🐘 Configurando PostgreSQL local para desenvolvimento..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Iniciar o PostgreSQL via Docker Compose
echo "🚀 Iniciando PostgreSQL..."
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
echo "📋 Comandos úteis:"
echo "  • Parar PostgreSQL: docker-compose down"
echo "  • Ver logs: docker-compose logs postgres"
echo "  • Prisma Studio: npm run prisma:studio"
echo "  • Resetar banco: npm run db:reset:complete"
echo ""
echo "🔗 PostgreSQL está rodando em: localhost:5432"
echo "   Database: dashbot"
echo "   User: dashbot"
echo "   Password: dashbot123"
