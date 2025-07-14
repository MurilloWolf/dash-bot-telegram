/**
 * Utilitário para criar resumos simples das respostas do bot baseado no comando
 */

export class MessageSanitizer {
  /**
   * Cria um resumo simples da resposta do bot baseado no comando original
   */
  static createCommandSummary(commandText: string): string {
    const command = this.extractCommand(commandText);

    switch (command) {
      case "/start":
        return "Enviou mensagem de boas-vindas";

      case "/corridas": {
        const hasFilters = commandText.includes(" ");
        if (hasFilters) {
          const filters = commandText.split(" ").slice(1).join(", ");
          return `Enviou corridas filtradas: ${filters}`;
        }
        return "Enviou lista de corridas";
      }

      case "/proxima_corrida":
        return "Enviou próxima corrida";

      case "/config":
        return "Enviou menu de configurações";

      case "/ajuda":
      case "/help":
        return "Enviou lista de comandos";

      default:
        return `Respondeu ao comando: ${command}`;
    }
  }

  /**
   * Extrai o comando principal do texto
   */
  private static extractCommand(text: string): string {
    if (!text.startsWith("/")) {
      return text;
    }

    // Pega apenas o comando, sem argumentos
    const parts = text.split(" ");
    return parts[0].toLowerCase();
  }
}
