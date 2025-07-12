import dotenv from "dotenv";
dotenv.config();

import startTelegramBot from "./adapters/in/telegram/TelegramBotAdapter.ts";
import { initializeCallbacks } from "./Bot/config/callback/CallbackInitializer.ts";

async function main() {
  console.log("🚀 Iniciando DashBot...");

  // Initialize callbacks before starting the bots
  console.log("📋 Inicializando sistema de callbacks...");
  await initializeCallbacks();

  const BOT_PLATFORM = process.env.BOT_PLATFORM;
  try {
    switch (BOT_PLATFORM) {
      case "telegram":
        console.log("🤖 Telegram bot is running...");
        startTelegramBot();
        break;
      case "whatsapp":
        console.log("📱 WhatsApp bot is running...");
        break;
      default:
        console.error(
          "❌ Unsupported BOT_PLATFORM. Bot supported ['Telegram', 'Whatsapp']."
        );
    }

    console.log("✅ DashBot inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Error initializing bot:", error);
  }
}

main();
