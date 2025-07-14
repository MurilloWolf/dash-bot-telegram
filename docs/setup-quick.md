# 🎯 Guia Rápido: Configurar Secrets em 5 Minutos

## 🚀 Opção 1: Script Automatizado (Recomendado)

```bash
# Execute o script automatizado
./scripts/setup-secrets.sh
```

O script fará tudo automaticamente! 🎉

---

## 🛠️ Opção 2: Manual

### 1️⃣ Instalar Ferramentas

```bash
# Instalar Fly CLI
brew install flyctl

# Instalar GitHub CLI (opcional)
brew install gh
```

### 2️⃣ Obter FLY_API_TOKEN

```bash
# Login no Fly.io
fly auth login

# Gerar token
fly auth token
```

**Copie o token que aparecer!** 📋

### 3️⃣ Configurar Secret no GitHub

#### Via Interface Web:
1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. **Name:** `FLY_API_TOKEN`
5. **Secret:** Cole o token copiado
6. **Add secret**

#### Via GitHub CLI:
```bash
gh auth login
gh secret set FLY_API_TOKEN --body "FlyV1_seu_token_aqui"
```

### 4️⃣ Configurar App no Fly.io

```bash
# Se ainda não existe
fly launch --no-deploy

# Configurar secrets do app
fly secrets set TELEGRAM_BOT_TOKEN="seu_bot_token"
fly secrets set NODE_ENV="production"
```

### 5️⃣ Testar

```bash
# Fazer push para trigger CI/CD
git add .
git commit -m "feat: setup CI/CD pipeline"
git push origin main
```

---

## ✅ Checklist Final

- [ ] ✅ Fly CLI instalado
- [ ] ✅ Login no Fly.io feito
- [ ] ✅ Token API obtido
- [ ] ✅ Secret no GitHub configurado
- [ ] ✅ App no Fly.io configurado
- [ ] ✅ Secrets do runtime configurados
- [ ] ✅ Push feito para testar

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "fly command not found" | `brew install flyctl` |
| "Invalid token" | Gerar novo token: `fly auth token` |
| "App not found" | Criar app: `fly launch --no-deploy` |
| "GitHub secret not working" | Verificar nome: deve ser `FLY_API_TOKEN` |

## 📞 Suporte

Se precisar de ajuda:
1. 📖 Leia: `docs/setup-secrets.md`
2. 🤖 Execute: `./scripts/setup-secrets.sh`
3. 🌐 Acesse: [fly.io/docs](https://fly.io/docs)

**Tempo estimado:** 5-10 minutos ⏱️
