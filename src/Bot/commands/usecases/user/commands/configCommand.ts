import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";

export async function configCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    const args = input.args;

    if (!args || args.length === 0) {
      return {
        text:
          `⚙️ <b>Configurações do DashBot</b>\n\n` +
          `<b>Comandos disponíveis:</b>\n` +
          `📏 <code>/config distancias 5,10,21</code> - Definir distâncias favoritas\n` +
          `🔔 <code>/config notificacoes on/off</code> - Ativar/desativar alertas\n` +
          `📅 <code>/config lembrete 3</code> - Dias de antecedência para lembretes\n\n` +
          `<i>💡 Configure suas preferências para receber recomendações personalizadas!</i>`,
        format: "HTML",
      };
    }

    const [setting, ...values] = args;
    const value = values.join(" ");

    switch (setting.toLowerCase()) {
      case "distancias":
        return {
          text: `✅ <b>Distâncias favoritas configuradas!</b>\n\nVocê receberá recomendações para: ${value}km\n\n💡 Use /corridas para ver corridas com suas distâncias favoritas.`,
          format: "HTML",
        };

      case "notificacoes": {
        const isEnabled = value.toLowerCase() === "on";
        return {
          text: `${isEnabled ? "✅" : "❌"} <b>Notificações ${
            isEnabled ? "ativadas" : "desativadas"
          }!</b>\n\n${
            isEnabled
              ? "Você receberá alertas sobre novas corridas."
              : "Você não receberá mais alertas automáticos."
          }`,
          format: "HTML",
        };
      }

      case "lembrete": {
        const days = parseInt(value);
        if (isNaN(days)) {
          return {
            text: "❌ Número de dias inválido. Use: /config lembrete 3",
            format: "HTML",
          };
        }
        return {
          text: `⏰ <b>Lembretes configurados!</b>\n\nVocê receberá lembretes ${days} dia(s) antes das corridas.`,
          format: "HTML",
        };
      }

      default:
        return {
          text: "❌ Configuração não reconhecida. Use /config para ver as opções disponíveis.",
          format: "HTML",
        };
    }
  } catch (error) {
    console.error("Erro no comando config:", error);
    return {
      text: "❌ Erro ao processar configuração. Tente novamente mais tarde.",
      format: "HTML",
    };
  }
}
