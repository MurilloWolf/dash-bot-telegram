import { CommandInput, CommandOutput } from "../../../../../types/Command.ts";
import { userService } from "../../../../../core/infra/dependencies.ts";

export async function startCommand(
  input: CommandInput
): Promise<CommandOutput> {
  try {
    if (input.user?.id && input.user?.name) {
      const telegramId = String(input.user.id);
      await userService.registerUser(telegramId, input.user.name);
    }

    const userName = input.user?.name ?? "Corredor";
    return {
      text:
        `🏃‍♂️ <b>Bem-vindo ao DashBot, ${userName}!</b> 🏃‍♀️\n\n` +
        `🎯 <b>Seu assistente pessoal para corridas de rua!</b>\n\n` +
        `Aqui você encontra as melhores corridas, organiza suas preferências e nunca mais perde uma inscrição! 🏆\n\n` +
        `<b>🚀 Comandos principais:</b>\n` +
        `🏃‍♂️ /corridas - Veja todas as corridas disponíveis\n` +
        `🔍 /corridas 5km,10km - Filtre por distâncias\n` +
        `⏰ /proxima_corrida - Próxima corrida chegando\n` +
        `⚙️ /config - Configure suas preferências\n` +
        `❓ /ajuda - Guia completo de comandos\n\n` +
        `<i>💡 Dica: Configure suas distâncias favoritas com /config para receber recomendações personalizadas!</i>`,
      format: "HTML",
    };
  } catch (error) {
    console.error("Erro no comando start:", error);
    const userName = input.user?.name ?? "Corredor";
    return {
      text:
        `🏃‍♂️ <b>Bem-vindo ao DashBot, ${userName}!</b> 🏃‍♀️\n\n` +
        `🎯 <b>Seu assistente pessoal para corridas de rua!</b>\n\n` +
        `Aqui você encontra as melhores corridas, organiza suas preferências e nunca mais perde uma inscrição! 🏆\n\n` +
        `<b>🚀 Comandos principais:</b>\n` +
        `🏃‍♂️ /corridas - Veja todas as corridas disponíveis\n` +
        `🔍 /corridas 5km,10km - Filtre por distâncias\n` +
        `⏰ /proxima_corrida - Próxima corrida chegando\n` +
        `⚙️ /config - Configure suas preferências\n` +
        `❓ /ajuda - Guia completo de comandos\n\n` +
        `<i>💡 Dica: Configure suas distâncias favoritas com /config para receber recomendações personalizadas!</i>`,
      format: "HTML",
    };
  }
}
