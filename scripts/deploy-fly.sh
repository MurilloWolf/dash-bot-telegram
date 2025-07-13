#!/bin/bash

# Deploy Script para Fly.io
set -e

echo "🚀 Deploy DashBot para Fly.io..."

# Verificações básicas
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI não encontrado. Instale em: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

if ! fly auth whoami &> /dev/null; then
    echo "❌ Não está logado no Fly.io. Execute: fly auth login"
    exit 1
fi

# Build e deploy
echo "🔧 Building aplicação..."
npm run build

echo "🚀 Fazendo deploy..."
fly deploy --app dash-bot-telegram

echo "✅ Deploy concluído!"
echo ""
echo "📋 Para ver logs: fly logs --app dash-bot-telegram"
echo "� Para ver status: fly status --app dash-bot-telegram"
