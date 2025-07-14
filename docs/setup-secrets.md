# 🔐 Configuração de Secrets e Tokens

Este guia explica como configurar todos os secrets necessários para o CI/CD funcionar corretamente.

## 📋 Secrets Necessários

| Secret          | Descrição                   | Obrigatório     |
| --------------- | --------------------------- | --------------- |
| `FLY_API_TOKEN` | Token para deploy no Fly.io | ✅              |
| `GITHUB_TOKEN`  | Token automático do GitHub  | ✅ (automático) |

## 🚀 1. Configurando FLY_API_TOKEN

### Passo 1: Instalar Fly CLI

```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### Passo 2: Fazer Login no Fly.io

```bash
# Fazer login (abrirá o navegador)
fly auth login

# Verificar se está logado
fly auth whoami
```

### Passo 3: Obter o Token API

```bash
# Gerar um novo token
fly auth token

# O comando retornará algo como:
# FlyV1 fm1_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0
```

### Passo 4: Configurar App no Fly.io (se ainda não existe)

```bash
# Navegar até o diretório do projeto
cd /Users/murillowolfcavalheiro/dev/deploy/dash-bot-telegram

# Inicializar app no Fly.io (se ainda não existe)
fly launch --no-deploy

# Ou se já existe o fly.toml, apenas configurar
fly apps create dash-bot-telegram --org personal
```

## 🔧 2. Configurando Secrets no GitHub

### Método 1: Via Interface Web

1. **Acesse seu repositório** no GitHub
2. **Vá para Settings** (aba no topo do repositório)
3. **Clique em "Secrets and variables"** no menu lateral
4. **Selecione "Actions"**
5. **Clique em "New repository secret"**

Para cada secret:

#### FLY_API_TOKEN

- **Name:** `FLY_API_TOKEN`
- **Secret:** Cole o token obtido no Passo 3 acima
- **Clique em "Add secret"**

### Método 2: Via GitHub CLI

```bash
# Instalar GitHub CLI se não tiver
brew install gh

# Fazer login
gh auth login

# Configurar secrets
gh secret set FLY_API_TOKEN --body "FlyV1_seu_token_aqui"

# Verificar secrets configurados
gh secret list
```

## 🌍 3. Configurando Variáveis de Ambiente no Fly.io

```bash
# Configurar variáveis de ambiente do bot
fly secrets set TELEGRAM_BOT_TOKEN="seu_token_do_bot_telegram"
fly secrets set DATABASE_URL="sua_connection_string_do_banco"

# Verificar secrets configurados
fly secrets list

# Se precisar de outras variáveis, adicione conforme necessário
fly secrets set NODE_ENV="production"
```

## 🔍 4. Testando a Configuração

### Teste 1: Verificar Secrets no GitHub

```bash
# Listar secrets (não mostra valores, apenas nomes)
gh secret list
```

### Teste 2: Teste de Deploy Manual

```bash
# Testar deploy manual para verificar se tudo está funcionando
fly deploy --remote-only
```

### Teste 3: Verificar Logs

```bash
# Verificar logs do app
fly logs

# Verificar status
fly status
```

## 🚨 5. Troubleshooting

### Erro: "Invalid token"

```bash
# Gerar novo token
fly auth token

# Atualizar secret no GitHub
gh secret set FLY_API_TOKEN --body "novo_token_aqui"
```

### Erro: "App not found"

```bash
# Verificar apps disponíveis
fly apps list

# Criar app se necessário
fly apps create nome-do-app
```

### Erro: "Database connection"

```bash
# Verificar secrets do Fly.io
fly secrets list

# Configurar DATABASE_URL se necessário
fly secrets set DATABASE_URL="postgresql://..."
```

## 📚 6. Comandos Úteis

```bash
# Fly.io
fly auth token                    # Gerar novo token
fly secrets list                  # Listar secrets
fly logs                         # Ver logs
fly status                       # Ver status do app
fly deploy --remote-only         # Deploy manual

# GitHub CLI
gh secret list                   # Listar secrets
gh secret set NOME --body "valor" # Configurar secret
gh secret delete NOME            # Deletar secret

# Git
git push origin main             # Trigger do workflow
```

## ⚙️ 7. Estrutura de Secrets Recomendada

```yaml
# Secrets no GitHub Actions
secrets:
  FLY_API_TOKEN: 'FlyV1_...'

# Secrets no Fly.io
fly_secrets:
  TELEGRAM_BOT_TOKEN: 'bot_token...'
  DATABASE_URL: 'postgresql://...'
  NODE_ENV: 'production'
```

## 🔐 8. Segurança

### ✅ Boas Práticas:

- ✅ Nunca commite tokens no código
- ✅ Use secrets do GitHub para CI/CD
- ✅ Use secrets do Fly.io para runtime
- ✅ Regenere tokens periodicamente
- ✅ Use diferentes tokens para diferentes ambientes

### ❌ Não Faça:

- ❌ Não coloque tokens em .env files commitados
- ❌ Não compartilhe tokens em chat/email
- ❌ Não use o mesmo token em múltiplos projetos
- ❌ Não deixe logs com tokens expostos

---

## 🎯 Checklist de Setup

- [ ] Fly CLI instalado
- [ ] Login no Fly.io realizado
- [ ] Token API gerado
- [ ] Secret `FLY_API_TOKEN` configurado no GitHub
- [ ] App criado no Fly.io
- [ ] Variáveis de ambiente configuradas no Fly.io
- [ ] Teste de deploy manual realizado
- [ ] Workflows GitHub Actions funcionando

Após completar este checklist, seu CI/CD estará totalmente funcional! 🚀
