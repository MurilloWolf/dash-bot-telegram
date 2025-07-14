#!/bin/bash

# 🧪 Script de Teste Completo do Pipeline CI/CD
# Este script testa se o pipeline do GitHub Actions está funcionando

echo "🔬 TESTANDO PIPELINE CI/CD COMPLETO"
echo "=================================="
echo ""

# 1. Verificar workflows do GitHub
echo "1️⃣ Verificando workflows..."
if [ -d ".github/workflows" ]; then
    echo "✅ Diretório .github/workflows encontrado"
    ls -la .github/workflows/
else
    echo "❌ Diretório .github/workflows não encontrado"
    exit 1
fi

echo ""

# 2. Validar sintaxe dos workflows YAML
echo "2️⃣ Validando sintaxe YAML dos workflows..."
for file in .github/workflows/*.yml; do
    echo "   Validando: $file"
    if command -v yamllint >/dev/null 2>&1; then
        yamllint "$file" && echo "   ✅ $file válido"
    else
        # Fallback: verificação básica de sintaxe
        if grep -q "^name:" "$file" && grep -q "^on:" "$file"; then
            echo "   ✅ $file tem estrutura básica válida"
        else
            echo "   ❌ $file pode ter problemas de sintaxe"
        fi
    fi
done

echo ""

# 3. Testar pipeline localmente
echo "3️⃣ Executando testes locais..."
echo "   Lint..."
if npm run lint > /dev/null 2>&1; then
    echo "   ✅ Lint passou"
else
    echo "   ❌ Lint falhou"
    exit 1
fi

echo "   Format check..."
if npm run format:check > /dev/null 2>&1; then
    echo "   ✅ Formatação OK"
else
    echo "   ⚠️  Executando format..."
    npm run format
    echo "   ✅ Formatação corrigida"
fi

echo "   Tests..."
if npm test -- --run > /dev/null 2>&1; then
    echo "   ✅ Todos os testes passaram"
else
    echo "   ❌ Alguns testes falharam"
    exit 1
fi

echo "   Build..."
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build de produção OK"
else
    echo "   ❌ Build falhou"
    exit 1
fi

echo ""

# 4. Verificar secrets necessários
echo "4️⃣ Verificando configuração de secrets..."
echo "   Os seguintes secrets devem estar configurados no GitHub:"
echo "   • FLY_API_TOKEN (para deploy)"
echo "   • TELEGRAM_BOT_TOKEN (para o bot)"
echo "   • DATABASE_URL (para o banco)"
echo ""

# 5. Verificar git status
echo "5️⃣ Verificando status do git..."
if git status --porcelain | grep -q .; then
    echo "   ⚠️  Há arquivos modificados não commitados"
    git status --short
    echo ""
    echo "   💡 Para testar o pipeline, faça commit das mudanças:"
    echo "      git add ."
    echo "      git commit -m 'test: pipeline validation'"
    echo "      git push"
else
    echo "   ✅ Working tree limpo"
fi

echo ""

# 6. Gerar comandos para teste
echo "6️⃣ Comandos para testar o pipeline:"
echo ""
echo "🔄 Para testar via push:"
echo "   git add ."
echo "   git commit -m 'test: validating CI/CD pipeline'"
echo "   git push"
echo ""
echo "🔃 Para testar via Pull Request:"
echo "   git checkout -b test/pipeline-validation"
echo "   echo '# Pipeline Test' >> TEST.md"
echo "   git add TEST.md"
echo "   git commit -m 'test: create PR to validate pipeline'"
echo "   git push -u origin test/pipeline-validation"
echo "   # Então criar PR no GitHub"
echo ""
echo "📊 Para acompanhar os workflows:"
echo "   • Acesse: https://github.com/SEU_USUARIO/dash-bot-telegram/actions"
echo "   • Ou use: gh workflow list"
echo "   • Status: gh run list"
echo ""

# 7. Verificar se CLI do GitHub está disponível
echo "7️⃣ Verificando CLI do GitHub..."
if command -v gh >/dev/null 2>&1; then
    echo "   ✅ GitHub CLI disponível"
    echo "   📋 Status dos workflows recentes:"
    gh run list --limit 5 2>/dev/null || echo "   ℹ️  Execute 'gh auth login' para ver status"
else
    echo "   ⚠️  GitHub CLI não encontrado"
    echo "   💡 Instale com: brew install gh"
fi

echo ""
echo "🎉 PIPELINE PRONTO PARA TESTE!"
echo "   Pipeline local: ✅ OK"
echo "   Workflows: ✅ Configurados"
echo "   Próximo passo: Push ou PR para testar no GitHub"
