# 🧪 Como Testar se o Pipeline Está Funcionando

Este guia te mostra **várias formas** de verificar se o pipeline CI/CD está funcionando corretamente.

## 🔬 1. Testes Locais (Simular Pipeline)

Antes de fazer push, teste localmente:

```bash
# Teste completo local
./scripts/test-pipeline.sh

# Ou teste individualmente:
npm run lint              # ✅ ESLint
npm run format:check      # ✅ Prettier  
npm test -- --run         # ✅ Testes
npm run build             # ✅ Build
```

## 🚀 2. Testes Reais no GitHub

### Método 1: Push Direto (Mais Simples)
```bash
# Faça suas alterações
git add .
git commit -m "test: validating CI/CD pipeline"
git push

# Acompanhe os resultados
gh run list
```

### Método 2: Via Pull Request (Recomendado)
```bash
# Crie uma branch de teste
git checkout -b test/pipeline-validation
echo "# Pipeline Test $(date)" >> TEST.md
git add TEST.md
git commit -m "test: create PR to validate pipeline"
git push -u origin test/pipeline-validation

# Crie o PR no GitHub ou via CLI
gh pr create --title "Test: Validate CI/CD Pipeline" --body "Testing all workflows"
```

### Método 3: Forçar Todos os Workflows
```bash
# Modifique algo que dispare todos os workflows
echo "Pipeline test at $(date)" >> README.md
git add README.md
git commit -m "test: trigger all workflows"
git push
```

## 📊 3. Monitoramento dos Workflows

### Via GitHub CLI
```bash
# Ver status dos workflows
gh run list --limit 10

# Ver detalhes de um workflow específico
gh run view <ID>

# Ver logs de falhas
gh run view <ID> --log-failed

# Acompanhar em tempo real
gh run watch
```

### Via GitHub Web
Acesse: `https://github.com/SEU_USUARIO/dash-bot-telegram/actions`

## 🎯 4. O Que Cada Workflow Testa

### ✅ Code Quality (sempre passa primeiro)
- ESLint check
- Prettier formatting
- Auto-fix de código

### 🔍 CI/CD Pipeline (principal)
- **Lint & Format**: ESLint + Prettier
- **Tests**: 272 testes automatizados  
- **Build**: Compilação TypeScript
- **Security**: npm audit
- **Deploy**: Deploy no Fly.io (só na main)

### 📝 Changelog (automático)
- Gera changelog baseado em commits
- Incrementa versão automaticamente
- Cria tag de release

### 🔒 CodeQL Security
- Análise de segurança do código
- Detecção de vulnerabilidades

### 🤖 PR Automation
- Labels automáticos
- Reviewers automáticos
- Merge conditions

## 🚨 5. Problemas Comuns e Soluções

### ❌ Prettier Formatting Failed
```bash
# Solução:
npm run format
git add .
git commit -m "fix: formatting"
git push
```

### ❌ Tests Failed
```bash
# Verificar localmente:
npm test -- --run
# Corrigir testes e fazer commit
```

### ❌ Build Failed
```bash
# Verificar build local:
npm run build
# Corrigir erros de TypeScript
```

### ❌ Security Audit Failed
```bash
# Verificar vulnerabilidades:
npm audit
# Corrigir vulnerabilidades:
npm audit fix
```

## 🎉 6. Como Saber se Está Funcionando

### ✅ Sinais de Sucesso:
- ✅ **Code Quality** sempre passa
- ✅ **CI/CD Pipeline** passa em todas as etapas
- ✅ **Tests**: 272/272 testes passando
- ✅ **Build**: Sem erros de compilação
- ✅ **Deploy**: Deploy automático no Fly.io (main)
- ✅ **Changelog**: Versão incrementada automaticamente

### 📈 Métricas Esperadas:
- **Lint**: 0 warnings, 0 errors
- **Format**: 100% arquivos formatados
- **Tests**: 272 passed, 0 failed
- **Build**: Success
- **Security**: No vulnerabilities

### 🔍 Verificação Final:
```bash
# Ver status dos últimos workflows
gh run list --limit 5

# Deve mostrar algo como:
# ✓ CI/CD Pipeline
# ✓ Code Quality  
# ✓ Changelog
# ✓ CodeQL Security
```

## 🛠️ 7. Comandos Úteis

```bash
# Teste completo local
./scripts/test-pipeline.sh

# Status dos workflows
gh run list

# Cancelar workflow em execução
gh run cancel <ID>

# Re-executar workflow falhado
gh run rerun <ID>

# Ver workflows disponíveis
gh workflow list

# Disparar workflow manualmente
gh workflow run "CI/CD Pipeline"

# Ver PRs automáticos
gh pr list --label "dependencies"
```

## 🎯 8. Próximos Passos Após Validação

Quando o pipeline estiver 100% funcionando:

1. **Configurar Secrets de Produção**
2. **Configurar Deploy Automático**
3. **Configurar Notificações**
4. **Documentar Processo para Equipe**
5. **Configurar Branch Protection Rules**

---

**💡 Dica**: Use sempre PRs para testar mudanças no pipeline. Assim você pode ver todos os workflows funcionando sem afetar a main.
