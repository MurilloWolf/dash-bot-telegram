# 🚀 CI/CD Documentation

Este documento descreve a configuração completa de CI/CD do projeto usando GitHub Actions.

## 📋 Overview

O pipeline de CI/CD foi projetado para garantir qualidade de código, automação de testes e deploy seguro. Inclui:

- ✅ **Qualidade de Código**: ESLint + Prettier
- 🧪 **Testes Automatizados**: Vitest com coverage
- 🔒 **Análise de Segurança**: CodeQL + npm audit
- 📝 **Changelog Automático**: Conventional commits
- 🤖 **Automação de PRs**: Reviews, labels, merge automático
- 🚀 **Deploy Automático**: Fly.io

## 🔄 Workflows

### 1. **CI/CD Pipeline** (`ci.yml`)

- **Trigger**: Push/PR para `main` e `develop`
- **Jobs**:
  - 🔍 Lint & Format
  - 🧪 Tests com coverage
  - 🏗️ Build
  - 🔒 Security audit
  - 🚀 Deploy (apenas main)

### 2. **Code Quality** (`code-quality.yml`)

- **Trigger**: Push/PR
- **Features**:
  - ESLint com reports
  - Prettier check
  - Auto-fix em PRs

### 3. **PR Automation** (`pr-automation.yml`)

- **Features**:
  - Validação de título (conventional commits)
  - Labels automáticos
  - Análise de tamanho do PR
  - Assignment de reviewers
  - Merge automático (dependabot)

### 4. **Changelog** (`changelog.yml`)

- **Trigger**: Push para `main`
- **Features**:
  - Geração automática de changelog
  - Bump de versão
  - Criação de releases

### 5. **Security** (`codeql.yml`)

- **Trigger**: Push/PR + schedule semanal
- **Features**:
  - Análise estática de segurança
  - Upload para GitHub Security

## 🛠️ Configuração

### Secrets Necessários

Configure os seguintes secrets no GitHub:

```bash
FLY_API_TOKEN=your_fly_token
```

### Dependências

O pipeline instala automaticamente:

- Node.js 20
- Dependências npm
- Ferramentas de análise

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build           # Build para produção
npm run start           # Inicia aplicação em produção

# Qualidade de Código
npm run lint            # Executa ESLint
npm run lint:fix        # ESLint com auto-fix
npm run lint:report     # Gera relatório JSON do ESLint
npm run format          # Formata código com Prettier
npm run format:check    # Verifica formatação
npm run type-check      # Verifica tipos TypeScript

# Testes
npm run test            # Executa testes
npm run test:coverage   # Testes com coverage
npm run test:watch      # Testes em modo watch

# Database
npm run prisma          # Migrate development
npm run studio:dev      # Prisma Studio (dev)
npm run studio:prod     # Prisma Studio (prod)
npm run db             # Seed database
```

## 🏷️ Conventional Commits

O projeto usa conventional commits para automação:

### Tipos Permitidos:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção
- `ci`: CI/CD
- `build`: Build system

### Scopes Sugeridos:

- `bot`: Funcionalidades do bot
- `core`: Core business logic
- `infra`: Infraestrutura
- `config`: Configurações
- `deps`: Dependências
- `api`: API changes
- `ui`: Interface
- `docs`: Documentação

### Exemplos:

```bash
feat(bot): add new help command
fix(core): resolve user registration issue
docs: update API documentation
chore(deps): update dependencies
```

## 🔀 Fluxo de Desenvolvimento

### 1. **Feature Development**

```bash
# 1. Criar branch
git checkout -b feat/new-feature

# 2. Desenvolver
# ... código ...

# 3. Commit (conventional)
git commit -m "feat(bot): add new command"

# 4. Push
git push origin feat/new-feature

# 5. Criar PR
# GitHub Actions executará automaticamente
```

### 2. **Pull Request**

- ✅ CI/CD pipeline executa
- 🏷️ Labels automáticos
- 👥 Reviewers assignados
- 📊 Análise de qualidade
- 🤖 Auto-fix se necessário

### 3. **Merge & Deploy**

```bash
# Após merge para main:
# 1. Changelog automático
# 2. Bump de versão
# 3. Release criado
# 4. Deploy para produção
```

## 📊 Qualidade de Código

### ESLint Rules

- TypeScript strict mode
- No unused variables
- Prefer const
- No console (exceto warn/error)
- Custom rules para testes

### Prettier Config

- Single quotes
- Semicolons
- 2 spaces indentation
- Line width: 80
- Trailing commas

### Coverage Targets

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## 🔒 Segurança

### Análises Automáticas:

- **CodeQL**: Análise estática semanal
- **npm audit**: Vulnerabilidades de dependências
- **Dependabot**: Atualizações automáticas

### Best Practices:

- Secrets não commitados
- Dependências atualizadas
- Análise de código estática
- Validação de entrada

## 🚀 Deploy

### Ambiente de Produção:

- **Plataforma**: Fly.io
- **Trigger**: Push para `main`
- **Strategy**: Zero-downtime
- **Rollback**: Automático em caso de falha

### Ambientes:

- **Development**: Branch `develop`
- **Production**: Branch `main`

## 🆘 Troubleshooting

### Pipeline Falhou?

1. **Lint/Format Issues**:

   ```bash
   npm run lint:fix
   npm run format
   ```

2. **Test Failures**:

   ```bash
   npm run test
   # Fix failing tests
   ```

3. **Build Issues**:

   ```bash
   npm run build
   # Check TypeScript errors
   ```

4. **Deploy Issues**:
   - Verificar secrets
   - Verificar configuração Fly.io
   - Checar logs no GitHub Actions

### Debug Local:

```bash
# Rodar todos os checks localmente
npm run lint
npm run format:check
npm run type-check
npm run test
npm run build
```

## 📈 Métricas

### Dashboards Disponíveis:

- GitHub Actions (tempo de build)
- Codecov (coverage)
- GitHub Security (vulnerabilidades)
- Dependabot (dependências)

### KPIs Monitorados:

- ⏱️ Tempo de CI/CD
- 🧪 Coverage de testes
- 🔒 Vulnerabilidades
- 📦 Dependências desatualizadas
- 🚀 Frequency de deploy

## 🔄 Atualizações

### Dependabot:

- **Schedule**: Segundas-feiras às 9h
- **Auto-merge**: Minor/patch updates
- **Review**: Major updates

### GitHub Actions:

- Atualizações automáticas semanais
- Versões pinadas para estabilidade

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do GitHub Actions
2. Consultar documentação
3. Criar issue com template apropriado
