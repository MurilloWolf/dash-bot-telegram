# MessageInterceptor - Middleware para Salvamento de Mensagens

## Visão Geral

O `MessageInterceptor` é um middleware agnóstico de plataforma que intercepta mensagens recebidas e enviadas, salvando-as no banco de dados. Esta implementação resolve o problema de duplicação de código entre diferentes adapters (Telegram, WhatsApp, etc.).

## Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │   WhatsApp      │    │   Outras        │
│   Adapter       │    │   Adapter       │    │   Plataformas   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ CommandRouter   │
                    │ (com middleware)│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │MessageInterceptor│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ MessageService  │
                    │ (Domain Layer)  │
                    └─────────────────┘
```

## Características

- **Agnóstico de Plataforma**: Funciona com Telegram, WhatsApp e outras plataformas
- **Separação de Responsabilidades**: Remove lógica de negócio dos adapters
- **Interceptação Transparente**: Funciona automaticamente sem modificar comandos existentes
- **Tratamento de Erros**: Falha graciosamente sem interromper o fluxo normal
- **Extensível**: Fácil adição de suporte a novas plataformas

## Como Funciona

### 1. Interceptação de Mensagens Recebidas

```typescript
// Antes de processar qualquer comando
await messageInterceptor.interceptIncomingMessage(input);
```

- Extrai dados da mensagem baseado na plataforma
- Salva ou atualiza informações do chat
- Salva a mensagem recebida no banco de dados

### 2. Interceptação de Mensagens Enviadas

```typescript
// Depois de processar o comando
await messageInterceptor.interceptOutgoingMessage(input, output);
```

- Usa o contexto da mensagem original
- Salva a resposta gerada no banco de dados
- Mantém histórico completo da conversa

## Integração

### CommandRouter

O middleware é integrado automaticamente no `CommandRouter`:

```typescript
export async function routeCommand(
  command: string,
  input: CommandInput
): Promise<CommandOutput> {
  try {
    // 📥 Intercepta mensagem recebida
    await messageInterceptor.interceptIncomingMessage(input);

    // ... processamento do comando ...

    // 📤 Intercepta resposta enviada
    await messageInterceptor.interceptOutgoingMessage(input, output);

    return output;
  } catch (error) {
    // Mesmo em caso de erro, salva a resposta
    await messageInterceptor.interceptOutgoingMessage(input, errorOutput);
    return errorOutput;
  }
}
```

### Adapters Simplificados

Os adapters agora focam apenas na comunicação com a plataforma:

```typescript
// Telegram Adapter - Antes
export async function handleTelegramMessage(bot: TelegramBot, msg: Message) {
  // ... lógica complexa de salvamento ...
  // ... duplicação de código ...
}

// Telegram Adapter - Depois
export async function handleTelegramMessage(bot: TelegramBot, msg: Message) {
  const input: CommandInput = {
    user: { id: msg.from?.id, name: msg.from?.first_name },
    args,
    platform: "telegram",
    raw: msg, // Dados brutos para o interceptor
  };

  const output = await routeCommand(command, input);
  // Salvamento é feito automaticamente pelo interceptor
  await adapter.sendMessage(msg.chat.id, output);
}
```

## Suporte a Plataformas

### Telegram ✅

- Extração completa de dados da mensagem
- Suporte a todos os tipos de mensagem
- Conversão de tipos de chat
- Tratamento de mensagens editadas

### WhatsApp 🚧

- Estrutura preparada para implementação
- Função `extractWhatsAppMessageData` criada
- Aguarda implementação específica

### Outras Plataformas 🔄

- Estrutura extensível
- Adicionar novo case no switch
- Implementar função de extração específica

## Vantagens da Implementação

### 1. **Centralização**

- Uma única implementação para salvamento de mensagens
- Manutenção simplificada
- Consistência entre plataformas

### 2. **Separação de Responsabilidades**

- Adapters: Comunicação com plataforma
- Middleware: Persistência de dados
- Services: Lógica de negócio

### 3. **Reutilização**

- Código compartilhado entre plataformas
- Novos adapters automaticamente suportados
- Redução de duplicação

### 4. **Manutenibilidade**

- Mudanças na estrutura de dados em um local
- Testes focados e organizados
- Debugging simplificado

## Exemplo de Uso

```typescript
// Qualquer plataforma pode usar o mesmo fluxo
const input: CommandInput = {
  user: { id: userId, name: userName },
  args: commandArgs,
  platform: "telegram", // ou "whatsapp", "discord", etc.
  raw: originalMessage, // Dados específicos da plataforma
};

// O interceptor automaticamente:
// 1. Salva a mensagem recebida
// 2. Processa o comando
// 3. Salva a resposta enviada
const output = await routeCommand(command, input);
```

## Configuração

O middleware é configurado automaticamente e não requer configuração manual. Ele usa:

- `MessageService` para operações de banco de dados
- `CommandInput.raw` para dados específicos da plataforma
- `CommandInput.platform` para identificar a origem

## Tratamento de Erros

```typescript
// Erros são tratados graciosamente
try {
  await messageInterceptor.interceptIncomingMessage(input);
} catch (error) {
  console.error("❌ Erro ao interceptar mensagem recebida:", error);
  // Não interrompe o fluxo do comando
}
```

## Logs e Monitoramento

O sistema produz logs estruturados:

```
📥 [telegram] Mensagem salva: 12345 de 67890
📤 [telegram] Resposta salva: 12346 para chat 67890
⚠️ Extração de dados do WhatsApp ainda não implementada
```

## Próximos Passos

1. **Implementar suporte ao WhatsApp**
2. **Adicionar métricas de performance**
3. **Implementar cache para otimização**
4. **Adicionar suporte a mensagens de mídia**
5. **Implementar retry logic para falhas**

## Migração

Para migrar do sistema anterior:

1. ✅ Remover lógica de salvamento dos adapters
2. ✅ Integrar middleware no CommandRouter
3. ✅ Testar fluxo completo
4. 🔄 Implementar suporte a novas plataformas

Esta implementação garante que a lógica de salvamento de mensagens seja centralizalizada, reutilizável e fácil de manter, enquanto mantém os adapters focados em sua responsabilidade principal: comunicação com as plataformas específicas.
