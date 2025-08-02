# 🚀 Deploy no Fly.io - Guia Passo a Passo

## 📋 Pré-requisitos

- ✅ Código commitado no GitHub
- ✅ Conta no Fly.io (gratuita)
- ✅ Token do Bot Telegram
- ✅ Fly CLI instalado

---

## 🗂️ PARTE 1: Fazer Push para GitHub

### 1. Verificar que arquivos sensíveis NÃO estão no repositório

```bash
# Verificar se .env está sendo ignorado
git ls-files | grep -E "\.env"

# Deve retornar vazio ou apenas .env.production.example
```

### 2. Push para GitHub

```bash
git push origin main
```

---

## ⚙️ PARTE 2: Configurar Fly.io

### 1. Instalar Fly CLI

**macOS:**

```bash
curl -L https://fly.io/install.sh | sh
```

**Linux:**

```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**

```bash
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Fazer Login no Fly.io

```bash
fly auth login
```

### 3. Clonar projeto do GitHub

```bash
git clone https://github.com/SEU_USUARIO/dash-bot-telegram.git
cd dash-bot-telegram
```

---

## � PARTE 3: Deploy da Aplicação

### 1. Configurar Secrets (Variáveis Sensíveis)

```bash
# Token do Bot Telegram
fly secrets set TELEGRAM_BOT_TOKEN="SEU_TOKEN_AQUI"

# Opcional: API de corridas
fly secrets set RACES_ENDPOINT="https://api.sua-fonte-de-corridas.com/races"
```

### 2. Fazer Deploy

```bash
# Deploy usando o script automático
npm run deploy
```

### 3. Verificar Deploy

```bash
# Ver status da aplicação
fly status --app dash-bot-telegram

# Ver logs em tempo real
fly logs --app dash-bot-telegram
```

---

## ✅ PARTE 4: Verificação do Deploy

### 1. Configurar Domínio Personalizado (Opcional)

```bash
fly certs add SEU_DOMINIO.com --app dash-bot-telegram
```

### 2. Configurar Escalabilidade

```bash
# Configurar recursos da máquina
fly scale memory 512 --app dash-bot-telegram
fly scale cpu shared-cpu-1x --app dash-bot-telegram
```

---

## 📊 PARTE 5: Monitoramento

### 1. Verificar Status

```bash
# Status da aplicação
fly status --app dash-bot-telegram

# Métricas
fly dashboard --app dash-bot-telegram
```

### 2. Ver Logs

```bash
# Logs em tempo real
fly logs --app dash-bot-telegram

# Logs específicos
fly logs --app dash-bot-telegram --filter="error"
```

### 3. Restart da Aplicação

```bash
# Restart manual
fly apps restart dash-bot-telegram
```

---

## 🔄 PARTE 6: Atualizações

### 1. Deploy de Nova Versão

```bash
# No seu computador local
git pull origin main
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy automático
npm run deploy
```

### 2. Rollback (se necessário)

```bash
# Ver histórico de releases
fly releases --app dash-bot-telegram

# Fazer rollback para versão anterior
fly releases rollback --app dash-bot-telegram
```

---

## 🚨 Troubleshooting

### 1. Bot não inicia

```bash
# Verificar logs
fly logs --app dash-bot-telegram

# Verificar secrets
fly secrets list --app dash-bot-telegram

# Testar token do bot
curl -s "https://api.telegram.org/botSEU_TOKEN/getMe"
```

### 2. Build falha

```bash
# Limpar cache e rebuild
fly apps restart dash-bot-telegram

# Deploy forçado
fly deploy --force-machines --app dash-bot-telegram
```

---

## 💰 Custos Estimados

- **Aplicação**: Grátis (até 3 máquinas shared)
- **Bandwidth**: Grátis (até 160GB/mês)

**Total estimado: Grátis** 💰

---

## 🔗 Links Úteis

- [Dashboard Fly.io](https://fly.io/dashboard)
- [Documentação Fly.io](https://fly.io/docs/)
- [Status Page](https://status.fly.io/)
- [Comunidade](https://community.fly.io/)

---

## ⚡ Script Completo de Deploy

Se quiser automatizar tudo:

```bash
#!/bin/bash
# deploy-complete.sh

echo "🚀 Deploy Completo no Fly.io"

# 1. Build local
npm run build

# 2. Deploy
fly deploy --app dash-bot-telegram

# 3. Verificar status
fly status --app dash-bot-telegram

echo "✅ Deploy concluído!"
echo "📋 Logs: fly logs --app dash-bot-telegram"
```

---

**🎯 Pronto! Seu bot estará rodando no Fly.io 24/7!** ✨
