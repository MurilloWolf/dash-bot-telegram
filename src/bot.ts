import dotenv from "dotenv";
dotenv.config();

import startTelegramBot from "./adapters/in/telegram/TelegramBotAdapter.ts";
import { initializeCallbacks } from "./Bot/config/callback/CallbackInitializer.ts";
import { logger } from "./utils/Logger.ts";

async function main() {
  logger.botStartup("Iniciando DashBot...");

  // Initialize callbacks before starting the bots
  logger.info("Inicializando sistema de callbacks...", {
    module: "Bot",
    action: "initialize_callbacks",
  });
  await initializeCallbacks();

  const BOT_PLATFORM = process.env.BOT_PLATFORM;
  try {
    switch (BOT_PLATFORM) {
      case "telegram":
        logger.info("Telegram bot is running...", {
          module: "Bot",
          action: "start_telegram_bot",
          platform: "telegram",
        });
        startTelegramBot();
        break;
      case "whatsapp":
        logger.info("WhatsApp bot is running...", {
          module: "Bot",
          action: "start_whatsapp_bot",
          platform: "whatsapp",
        });
        break;
      default:
        logger.error(
          "Unsupported BOT_PLATFORM. Bot supported ['Telegram', 'Whatsapp'].",
          {
            module: "Bot",
            action: "unsupported_platform",
            platform: BOT_PLATFORM,
          }
        );
    }

    logger.botStartup("DashBot inicializado com sucesso!");
  } catch (error) {
    logger.error(
      "Error initializing bot",
      {
        module: "Bot",
        action: "initialize_error",
      },
      error as Error
    );
  }
}

main();
