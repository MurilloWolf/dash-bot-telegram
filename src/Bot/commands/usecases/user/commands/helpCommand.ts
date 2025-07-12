import { CommandOutput } from "../../../../../types/Command.ts";

export async function helpCommand(): Promise<CommandOutput> {
  return {
    text:
      `🏃‍♂️ <b>GUIA COMPLETO DO DASHBOT</b> 🏃‍♀️\n` +
      `🔍 <b>DESCOBRIR CORRIDAS</b>\n` +
      `┣ 🏃‍♂️ <code>/corridas</code> - Todas as corridas disponíveis\n` +
      `┣ 🎯 <code>/corridas 5km,10km</code> - Filtre por distâncias\n` +
      `┣ ⏰ <code>/proxima_corrida</code> - Próxima corrida chegando\n` +
      `┗ 🔥 <i>Encontre a corrida perfeita para você!</i>\n\n` +
      `⚙️ <b>PERSONALIZAÇÃO</b>\n` +
      `┣ 📏 <code>/config distancias 5,10,21</code> - Suas distâncias favoritas\n` +
      `┣ 🔔 <code>/config notificacoes on/off</code> - Ativar/desativar alertas\n` +
      `┣ 📅 <code>/config lembrete 3</code> - Dias de antecedência para lembretes\n` +
      `┗ 💡 <i>Configure para receber recomendações personalizadas!</i>\n\n` +
      `🚀 <b>OUTRAS FUNÇÕES</b>\n` +
      `┣ 🏠 <code>/start</code> - Apresentação e boas-vindas\n` +
      `┣ ❓ <code>/ajuda</code> ou <code>/help</code> - Este guia completo\n` +
      `┗ 📊 <i>Mantenha-se sempre atualizado!</i>\n\n` +
      `🏆 <b>DICAS PRO</b>\n` +
      `💎 Configure suas distâncias favoritas para receber sugestões certeiras\n` +
      `🎯 Use filtros para encontrar corridas do seu perfil rapidamente\n` +
      `⚡ Ative notificações para nunca perder uma inscrição\n\n` +
      `🔥 <i>Bora correr? Escolha seu comando e vamos nessa!</i> 🔥`,
    format: "HTML",
  };
}
