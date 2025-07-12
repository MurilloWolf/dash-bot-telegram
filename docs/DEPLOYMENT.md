# 🚀 Deployment Guide - Dash Bot

## 📋 Visão Geral

Este guia explica como fazer o deploy do Dash Bot em diferentes ambientes, desde desenvolvimento local até produção em nuvem.

## 🛠️ Configuração de Ambiente

### 1. **Variáveis de Ambiente**

#### Desenvolvimento (`.env.development`)

```env
# Bot Configuration
TELEGRAM_BOT_TOKEN=your_development_bot_token
BOT_PLATFORM=telegram

# Database
DATABASE_URL="postgresql://dashbot:dashbot123@localhost:5432/dashbot"
POSTGRES_URL_NON_POOLING="postgresql://dashbot:dashbot123@localhost:5432/dashbot"

# External APIs
RACES_ENDPOINT=https://api.example.com/races

# Debug
NODE_ENV=development
```

#### Produção (`.env.production`)

```env
# Bot Configuration
TELEGRAM_BOT_TOKEN=your_production_bot_token
BOT_PLATFORM=telegram

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dashbot"

# External APIs
RACES_ENDPOINT=https://api.production.com/races

# Production
NODE_ENV=production
PORT=3000
```

### 2. **Configuração do Bot no Telegram**

#### Criando o Bot

```bash
# 1. Abra o @BotFather no Telegram
# 2. Envie /newbot
# 3. Siga as instruções
# 4. Salve o token fornecido
```

#### Configurando Comandos

```bash
# Use o @BotFather para configurar os comandos:
/setcommands

# Cole esta lista:
start - Apresentação e boas-vindas
corridas - Ver todas as corridas disponíveis
proxima_corrida - Próxima corrida disponível
config - Configurações pessoais
ajuda - Guia completo de comandos
help - Guia completo de comandos
```

## 🐳 Deploy com Docker

### 1. **Dockerfile**

```dockerfile
# Crie um Dockerfile na raiz do projeto
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Gerar cliente Prisma
RUN npm run prisma:generate:prod

# Executar migrations
RUN npm run prisma:migrate:prod

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
```

### 2. **Docker Compose**

```yaml
# docker-compose.yml
version: "3.8"

services:
  dashbot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/dashbot
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dashbot
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. **Comandos Docker**

```bash
# Build e deploy
docker-compose up -d

# Visualizar logs
docker-compose logs -f dashbot

# Parar serviços
docker-compose down

# Rebuild
docker-compose up -d --build
```

## ☁️ Deploy em Nuvem

### 1. **Railway**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar PostgreSQL
railway add postgresql

# 5. Deploy
railway up
```

**Configuração no Railway:**

```json
{
  "build": {
    "command": "npm run build"
  },
  "start": {
    "command": "npm start"
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. **Heroku**

```bash
# 1. Criar app
heroku create your-dashbot-app

# 2. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Configurar variáveis
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set BOT_PLATFORM=telegram

# 4. Deploy
git push heroku main
```

**Procfile:**

```
web: npm start
release: npm run prisma:migrate:prod
```

### 3. **Vercel**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis no dashboard
# https://vercel.com/dashboard/your-project/settings/environment-variables
```

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/bot.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/bot.js"
    }
  ]
}
```

### 4. **AWS EC2**

```bash
# 1. Conectar à instância
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. Instalar Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Instalar PM2
sudo npm install -g pm2

# 4. Clonar repositório
git clone https://github.com/your-user/dash-bot-telegram.git
cd dash-bot-telegram

# 5. Instalar dependências
npm install

# 6. Configurar ambiente
cp .env.example .env
nano .env

# 7. Build e deploy
npm run build
pm2 start dist/bot.js --name dashbot

# 8. Configurar auto-start
pm2 startup
pm2 save
```

## 🗄️ Configuração de Banco de Dados

### 1. **PostgreSQL Local**

```bash
# Instalar PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Criar usuário e banco
sudo -u postgres psql
CREATE USER dashbot WITH PASSWORD 'password';
CREATE DATABASE dashbot OWNER dashbot;
GRANT ALL PRIVILEGES ON DATABASE dashbot TO dashbot;
```

### 2. **PostgreSQL na Nuvem**

#### Supabase

```bash
# 1. Criar projeto em https://supabase.com
# 2. Copiar connection string
# 3. Configurar DATABASE_URL
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"
```

#### AWS RDS

```bash
# 1. Criar instância RDS PostgreSQL
# 2. Configurar security groups
# 3. Usar connection string
DATABASE_URL="postgresql://user:password@rds.amazonaws.com:5432/dashbot"
```

### 3. **Migrations em Produção**

```bash
# Executar migrations
npm run prisma:migrate:prod

# Gerar cliente
npm run prisma:generate:prod

# Verificar status
npm run prisma:migrate:status
```

## 📊 Monitoramento

### 1. **Logs**

```bash
# PM2 logs
pm2 logs dashbot

# Docker logs
docker-compose logs -f dashbot

# Arquivos de log
tail -f /var/log/dashbot/app.log
```

### 2. **Health Check**

```typescript
// Adicionar endpoint de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### 3. **Métricas**

```bash
# PM2 monitoring
pm2 monit

# Sistema
htop
df -h
free -h
```

## 🔐 Segurança

### 1. **Variáveis de Ambiente**

```bash
# Nunca commitar .env
echo ".env*" >> .gitignore

# Usar serviços de secrets
# - AWS Secrets Manager
# - HashiCorp Vault
# - Railway/Heroku Config Vars
```

### 2. **Firewall**

```bash
# Configurar UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Configurar iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### 3. **SSL/TLS**

```bash
# Instalar Certbot
sudo apt-get install certbot

# Gerar certificado
sudo certbot certonly --standalone -d your-domain.com

# Configurar renovação automática
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 CI/CD

### 1. **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Railway
        uses: railway/cli@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          command: up
```

### 2. **Automated Testing**

```bash
# Executar testes antes do deploy
npm run test
npm run test:e2e
npm run lint
npm run type-check
```

## 📈 Scaling

### 1. **Horizontal Scaling**

```yaml
# docker-compose.yml
version: "3.8"

services:
  dashbot:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### 2. **Load Balancer**

```nginx
# nginx.conf
upstream dashbot {
    server dashbot1:3000;
    server dashbot2:3000;
    server dashbot3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://dashbot;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ Troubleshooting

### 1. **Problemas Comuns**

#### Bot não responde

```bash
# Verificar token
echo $TELEGRAM_BOT_TOKEN

# Verificar logs
pm2 logs dashbot

# Testar conexão
curl -X GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

#### Erro de banco de dados

```bash
# Verificar conexão
npm run prisma:studio

# Executar migrations
npm run prisma:migrate:prod

# Reset (apenas development)
npm run db:reset
```

#### Erro de memória

```bash
# Verificar uso de memória
pm2 monit

# Reiniciar aplicação
pm2 restart dashbot

# Aumentar limite de memória
pm2 start dist/bot.js --name dashbot --max-memory-restart 1G
```

### 2. **Logs Úteis**

```bash
# Logs detalhados
NODE_ENV=development npm run dev

# Logs em produção
pm2 logs dashbot --lines 1000

# Logs do sistema
journalctl -u dashbot -f
```

## 📋 Checklist de Deploy

### Pre-Deploy

- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Backup do banco atual
- [ ] Token do bot configurado

### Deploy

- [ ] Build sem erros
- [ ] Migrations executadas
- [ ] Aplicação iniciada
- [ ] Health check OK
- [ ] Logs verificados

### Post-Deploy

- [ ] Bot respondendo
- [ ] Comandos funcionando
- [ ] Callbacks funcionando
- [ ] Métricas normais
- [ ] Monitoramento ativo

---

Com este guia, você deve conseguir fazer o deploy do Dash Bot em qualquer ambiente de forma segura e eficiente!
