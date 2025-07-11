# 🤝 Contribuindo para o Dash Bot

Obrigado por considerar contribuir para o Dash Bot! Este guia contém informações sobre como contribuir efetivamente para o projeto.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
5. [Processo de Pull Request](#processo-de-pull-request)
6. [Tipos de Contribuição](#tipos-de-contribuição)
7. [Reporting Bugs](#reporting-bugs)
8. [Sugestões de Features](#sugestões-de-features)

## 🤝 Código de Conduta

### Nosso Compromisso

Como colaboradores e mantenedores deste projeto, nos comprometemos a tornar a participação em nossa comunidade uma experiência livre de assédio para todos, independentemente de idade, tamanho corporal, deficiência, etnia, identidade e expressão de gênero, nível de experiência, educação, status socioeconômico, nacionalidade, aparência pessoal, raça, religião ou identidade e orientação sexual.

### Padrões Esperados

**Comportamentos que contribuem para um ambiente positivo:**

- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas de forma elegante
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

**Comportamentos inaceitáveis:**

- Uso de linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos/depreciativos
- Assédio público ou privado
- Publicar informações privadas de outros
- Outras condutas consideradas inapropriadas

## 🚀 Como Contribuir

### 1. **Fork do Repositório**

```bash
# 1. Faça um fork do repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU-USERNAME/dash-bot-telegram.git
cd dash-bot-telegram

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/dash-bot-telegram.git
```

### 2. **Mantenha seu Fork Atualizado**

```bash
# Buscar mudanças do upstream
git fetch upstream

# Mudar para a branch main
git checkout main

# Fazer merge das mudanças
git merge upstream/main

# Fazer push das mudanças
git push origin main
```

### 3. **Crie uma Branch para sua Feature**

```bash
# Criar e mudar para uma nova branch
git checkout -b feature/nome-da-feature

# Ou para bugfix
git checkout -b bugfix/nome-do-bug

# Ou para documentação
git checkout -b docs/nome-da-doc
```

## 🛠️ Configuração do Ambiente

### 1. **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- Git
- Editor de código (VS Code recomendado)

### 2. **Instalação**

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.development

# Configurar banco de dados
npm run db:setup

# Executar em modo desenvolvimento
npm run dev
```

### 3. **Configuração do Editor**

#### VS Code Extensions Recomendadas:

- TypeScript Importer
- ESLint
- Prettier
- Prisma
- GitLens

#### Configuração do VS Code (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📏 Padrões de Desenvolvimento

### 1. **Convenções de Código**

#### Nomes de Arquivos

```typescript
// Commands (camelCase)
listRacesCommand.ts;
nextRaceCommand.ts;

// Classes (PascalCase)
RaceService.ts;
UserRepository.ts;
CallbackHandler.ts;

// Interfaces (PascalCase)
Race.ts;
User.ts;
CommandInput.ts;
```

#### Nomes de Variáveis e Funções

```typescript
// Variáveis e funções (camelCase)
const raceService = new RaceService();
const getUserById = (id: string) => {};

// Constantes (UPPER_CASE)
const MAX_RACES_PER_PAGE = 10;
const DEFAULT_REMINDER_DAYS = 3;

// Classes (PascalCase)
class RaceService {}
class TelegramBotAdapter {}
```

### 2. **Estrutura de Código**

#### Ordem de Imports

```typescript
// 1. Node modules
import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";

// 2. Internal modules (ordenados por camada)
import { Race } from "../../../core/domain/entities/Race.ts";
import { RaceService } from "../../../core/domain/services/RaceService.ts";
import { CommandInput, CommandOutput } from "../../../types/Command.ts";

// 3. Relative imports
import { formatRaceMessage } from "./utils.ts";
```

#### Estrutura de Classes

```typescript
export class MyClass {
  // 1. Propriedades privadas
  private readonly property: string;

  // 2. Construtor
  constructor(private dependency: Dependency) {
    this.property = "value";
  }

  // 3. Métodos públicos
  public async publicMethod(): Promise<void> {
    // implementation
  }

  // 4. Métodos privados
  private privateMethod(): void {
    // implementation
  }
}
```

### 3. **Documentação do Código**

#### JSDoc para Funções Públicas

```typescript
/**
 * Lista todas as corridas disponíveis com filtros opcionais
 * @param filters - Filtros a serem aplicados
 * @returns Promise com array de corridas
 * @throws Error se não conseguir acessar o banco de dados
 */
async function listRaces(filters?: RaceFilter): Promise<Race[]> {
  // implementation
}
```

#### Comentários Inline

```typescript
// Buscar corridas disponíveis (status = open)
const races = await raceRepository.findByStatus(RaceStatus.OPEN);

// Filtrar por distâncias preferidas do usuário
const filteredRaces = races.filter((race) =>
  race.distancesNumbers.some((d) => userPreferences.distances.includes(d))
);
```

### 4. **Tratamento de Erros**

```typescript
// ✅ Correto
async function myCommand(input: CommandInput): Promise<CommandOutput> {
  try {
    const data = await service.getData(input.userId);
    return {
      text: `✅ Dados: ${data}`,
      format: "HTML",
    };
  } catch (error) {
    console.error("Erro em myCommand:", error);
    return {
      text: "❌ Erro ao processar comando. Tente novamente.",
      format: "HTML",
    };
  }
}

// ❌ Incorreto
async function myCommand(input: CommandInput): Promise<CommandOutput> {
  const data = await service.getData(input.userId); // Pode falhar
  return {
    text: `✅ Dados: ${data}`,
    format: "HTML",
  };
}
```

## 🔄 Processo de Pull Request

### 1. **Antes de Enviar**

```bash
# Executar testes
npm run test

# Verificar linting
npm run lint

# Verificar tipos
npm run type-check

# Build
npm run build
```

### 2. **Checklist do PR**

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Changelog foi atualizado (se aplicável)
- [ ] Não há conflitos com a branch main
- [ ] Build passa sem erros
- [ ] Testes passam
- [ ] Funcionalidade foi testada manualmente

### 3. **Template do Pull Request**

```markdown
## 📝 Descrição

Breve descrição do que foi implementado/corrigido.

## 🎯 Tipo de Mudança

- [ ] Bug fix (mudança que corrige um issue)
- [ ] New feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentation update (mudança apenas na documentação)

## 🧪 Como Testar

1. Passos para testar a mudança
2. Comandos específicos para executar
3. Comportamento esperado

## 📋 Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Executei self-review do código
- [ ] Comentei código complexo
- [ ] Atualizei documentação
- [ ] Meus testes passam
- [ ] Novos testes foram adicionados

## 📸 Screenshots (se aplicável)

## 🔗 Issues Relacionados

Closes #123
```

### 4. **Processo de Review**

1. **Automated Checks**: CI/CD executa testes automaticamente
2. **Code Review**: Mantenedor revisa o código
3. **Testing**: Funcionalidade é testada
4. **Merge**: PR é aprovado e merged

## 📝 Tipos de Contribuição

### 1. **Correções de Bugs**

```bash
# Encontrou um bug?
# 1. Verifique se já existe um issue
# 2. Crie um issue se não existir
# 3. Crie uma branch bugfix/
# 4. Implemente a correção
# 5. Adicione testes
# 6. Envie o PR
```

### 2. **Novas Funcionalidades**

```bash
# Quer adicionar uma feature?
# 1. Discuta no issue primeiro
# 2. Aguarde aprovação dos mantenedores
# 3. Crie uma branch feature/
# 4. Implemente a feature
# 5. Adicione testes e documentação
# 6. Envie o PR
```

### 3. **Melhorias na Documentação**

```bash
# Documentação pode ser melhorada?
# 1. Crie uma branch docs/
# 2. Faça as alterações
# 3. Envie o PR
```

### 4. **Refatoração**

```bash
# Código pode ser melhorado?
# 1. Discuta no issue
# 2. Crie uma branch refactor/
# 3. Mantenha os testes passando
# 4. Envie o PR
```

## 🐛 Reporting Bugs

### 1. **Antes de Reportar**

- [ ] Verifique se o bug já foi reportado
- [ ] Teste com a versão mais recente
- [ ] Verifique se não é um problema de configuração

### 2. **Template de Bug Report**

```markdown
## 🐛 Descrição do Bug

Descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir

1. Vá para '...'
2. Clique em '...'
3. Execute '...'
4. Veja o erro

## 🎯 Comportamento Esperado

Descrição do que deveria acontecer.

## 📸 Screenshots

Se aplicável, adicione screenshots.

## 🖥️ Ambiente

- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., 18.15.0]
- npm: [e.g., 9.5.0]
- Versão do bot: [e.g., 1.0.0]

## 📋 Contexto Adicional

Qualquer informação adicional sobre o problema.
```

## 💡 Sugestões de Features

### 1. **Template de Feature Request**

```markdown
## 💡 Descrição da Feature

Descrição clara da funcionalidade desejada.

## 🎯 Problema que Resolve

Qual problema esta feature resolve?

## 💭 Solução Proposta

Descrição da solução que você gostaria de ver.

## 🔄 Alternativas Consideradas

Outras soluções que você considerou.

## 📋 Contexto Adicional

Qualquer informação adicional sobre a feature.
```

### 2. **Discussão de Features**

1. **Crie um Issue**: Use o template de feature request
2. **Discussão**: Mantenedores e comunidade discutem
3. **Aprovação**: Feature é aprovada para desenvolvimento
4. **Implementação**: Alguém implementa a feature
5. **Review**: PR é revisado e merged

## 🎯 Áreas que Precisam de Ajuda

### 1. **Prioridades Altas**

- [ ] Testes automatizados
- [ ] Documentação de API
- [ ] Otimização de performance
- [ ] Suporte a WhatsApp

### 2. **Boas Primeiras Contribuições**

- [ ] Correções de typos
- [ ] Melhorias na documentação
- [ ] Testes unitários
- [ ] Pequenas funcionalidades

### 3. **Funcionalidades Avançadas**

- [ ] Sistema de notificações
- [ ] API REST
- [ ] Dashboard web
- [ ] Métricas e analytics

## 📞 Suporte

### 1. **Canais de Comunicação**

- **GitHub Issues**: Para bugs e features
- **GitHub Discussions**: Para discussões gerais
- **Discord**: [Link do servidor] (se aplicável)
- **Email**: [email do mantenedor]

### 2. **Tempo de Resposta**

- **Issues**: 1-3 dias úteis
- **Pull Requests**: 2-5 dias úteis
- **Discussões**: 1-2 dias úteis

## 🏆 Reconhecimento

Todos os contribuidores são reconhecidos:

- **README.md**: Lista de contribuidores
- **CHANGELOG.md**: Créditos por versão
- **All Contributors**: Bot do GitHub

## 📄 Licença

Ao contribuir para este projeto, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (ISC).

---

**Obrigado por contribuir para o Dash Bot! 🏃‍♂️💨**

Sua contribuição ajuda a tornar a comunidade de corredores mais conectada e informada!
