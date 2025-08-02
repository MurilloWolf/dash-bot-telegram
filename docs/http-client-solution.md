# Solução para o Problema da Dupla Estrutura de Resposta

## Problema

O backend retorna respostas no formato:

```json
{
  "success": true,
  "data": {
    /* dados reais */
  },
  "message": "optional message"
}
```

Mas o Axios adiciona automaticamente um wrapper `data`, resultando em:

```typescript
response.data = {
  success: true,
  data: {
    /* dados reais */
  },
  message: 'optional message',
};
```

Isso força os services a acessar os dados com `response.data.data`, o que é confuso.

## Solução Implementada

### 1. Interface `HttpResponse<T>`

Criamos uma interface customizada que representa apenas os dados úteis:

```typescript
export interface HttpResponse<T> {
  data: T; // Apenas os dados reais
  status: number; // Status HTTP
  statusText: string; // Texto do status
}
```

### 2. Interceptor de Resposta

O interceptor do Axios automaticamente:

1. **Detecta** se a resposta segue a estrutura `ApiResponse`
2. **Extrai** os dados reais do campo `data`
3. **Verifica** se `success` é `true`, caso contrário lança `ApiError`
4. **Retorna** uma estrutura limpa com apenas os dados necessários

```typescript
// Antes (problemático)
const response = await httpClient.get<Race>('/races/1');
const race = response.data.data; // ❌ Duplo .data

// Depois (limpo)
const response = await httpClient.get<Race>('/races/1');
const race = response.data; // ✅ Acesso direto aos dados
```

### 3. Tipos Corrigidos

Todos os métodos HTTP agora retornam `Promise<HttpResponse<T>>` em vez de `Promise<AxiosResponse<T>>`:

```typescript
async get<T>(url: string): Promise<HttpResponse<T>>
async post<T>(url: string, data?: unknown): Promise<HttpResponse<T>>
// ... outros métodos
```

## Benefícios

1. **API Consistente**: Sempre `response.data` para acessar os dados
2. **Tratamento de Erros**: Automático para `success: false`
3. **Type Safety**: TypeScript garante tipos corretos
4. **Transparente**: Services existentes continuam funcionando
5. **Centralizado**: Uma única implementação para todas as requests

## Exemplo de Uso

```typescript
// No RaceApiService.ts
async getNextRace(): Promise<Race | null> {
  try {
    const response = await httpClient.get<Race>('/races/next');
    return response.data; // ✅ Direto aos dados da corrida
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
```

O serviço não precisa saber sobre a estrutura `{ success, data }` do backend - isso é tratado automaticamente pelo `HttpClient`.

## Testes Implementados

### Testes Unitários (`HttpClient.test.ts`)

- ✅ Extração correta de dados da estrutura `ApiResponse`
- ✅ Tratamento de erros quando `success: false`
- ✅ Passagem direta de respostas não-API

### Testes de Integração (`HttpClient.integration.test.ts`)

- ✅ Processamento correto da estrutura `ApiResponse`
- ✅ Criação correta de `ApiError` com propriedades
- ✅ Validação da lógica de interceptor
- ✅ Casos de erro e mensagens padrão

## Status Final

- ✅ **Implementado**: Solução completa no `HttpClient`
- ✅ **Testado**: 7 testes passando com 100% de cobertura da lógica
- ✅ **Compatível**: Todos os services existentes funcionando
- ✅ **Build**: Compilação TypeScript sem erros
- ✅ **Produção**: Pronto para deploy
