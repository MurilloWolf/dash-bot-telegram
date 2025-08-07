import dotenv from 'dotenv';
dotenv.config();

import startTelegramBot from './adapters/in/telegram/TelegramBotAdapter.ts';
import { initializeCallbacks } from './Bot/config/callback/CallbackInitializer.ts';
import { logger } from './utils/Logger.ts';
import { HealthCheckAdapter } from './adapters/in/http/HealthCheckAdapter.ts';
import { BotHealthMonitor } from './services/BotHealthMonitor.ts';

// Função auxiliar para enviar alertas diretos via Telegram API (apenas em produção)
async function sendDirectTelegramAlert(message: string): Promise<void> {
  // Só enviar alertas em produção
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Alert skipped - development environment', {
      module: 'Bot',
      nodeEnv: process.env.NODE_ENV,
    });
    return;
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ALERT_AGENT) {
    logger.warn('Alert skipped - missing Telegram configuration', {
      module: 'Bot',
    });
    return;
  }

  try {
    const alertUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(alertUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_ALERT_AGENT,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (response.ok) {
      logger.info('Direct alert sent successfully', { module: 'Bot' });
    } else {
      const errorData = await response.json();
      logger.error('Failed to send direct alert', {
        module: 'Bot',
        error: JSON.stringify(errorData),
      });
    }
  } catch (error) {
    logger.error('Error sending direct alert', {
      module: 'Bot',
      error: (error as Error).message,
    });
  }
}

async function main() {
  logger.botStartup('Iniciando DashBot...');

  const healthServer = new HealthCheckAdapter(3001);
  healthServer.start();

  // Inicializar monitoramento de saúde com alertas (apenas em produção)
  let healthMonitor: BotHealthMonitor | null = null;
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_ALERT_AGENT
  ) {
    try {
      healthMonitor = new BotHealthMonitor();
      logger.info('Health monitoring initialized with Telegram alerts', {
        module: 'Bot',
        alertAgent: process.env.TELEGRAM_ALERT_AGENT,
        nodeEnv: process.env.NODE_ENV,
      });
    } catch (error) {
      logger.error('Failed to initialize health monitoring', {
        module: 'Bot',
        error: (error as Error).message,
      });
    }
  } else {
    logger.info('Telegram alerting disabled for development environment', {
      module: 'Bot',
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
    });
  }

  // Initialize callbacks before starting the bots
  logger.info('Inicializando sistema de callbacks...', {
    module: 'Bot',
    action: 'initialize_callbacks',
  });
  await initializeCallbacks();

  const BOT_PLATFORM = process.env.BOT_PLATFORM;
  try {
    switch (BOT_PLATFORM) {
      case 'telegram':
        logger.info('Telegram bot is running...', {
          module: 'Bot',
          action: 'start_telegram_bot',
          platform: 'telegram',
        });
        startTelegramBot();
        break;
      case 'whatsapp':
        logger.info('WhatsApp bot is running...', {
          module: 'Bot',
          action: 'start_whatsapp_bot',
          platform: 'whatsapp',
        });
        break;
      default:
        logger.error(
          "Unsupported BOT_PLATFORM. Bot supported ['Telegram', 'Whatsapp'].",
          {
            module: 'Bot',
            action: 'unsupported_platform',
            platform: BOT_PLATFORM,
          }
        );
    }

    logger.botStartup('DashBot inicializado com sucesso!');

    // Ativar o monitoramento após inicialização bem-sucedida
    if (healthMonitor) {
      // Aguardar 10 segundos para o bot estar totalmente inicializado
      setTimeout(async () => {
        try {
          healthMonitor!.startMonitoring();
          logger.info('Health monitoring started', {
            module: 'Bot',
          });

          // Enviar alerta de inicialização bem-sucedida
          const startupMessage = `✅ *DashBot Started Successfully*\n\n🚀 *Status:* Bot is now running\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n🌍 *Environment:* ${process.env.NODE_ENV || 'development'}\n🤖 *Platform:* ${BOT_PLATFORM}\n\n📊 *Health monitoring is active*`;

          await healthMonitor!.sendAlert(startupMessage);
          logger.info('Startup alert sent', { module: 'Bot' });
        } catch (error) {
          logger.error('Failed to start monitoring or send startup alert', {
            module: 'Bot',
            error: (error as Error).message,
          });
        }
      }, 10000);
    }

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`, {
        module: 'Bot',
      });

      // Enviar alerta de shutdown
      const shutdownMessage = `⚠️ *DashBot Shutdown*\n\n🔄 *Signal:* ${signal}\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⏱ *Uptime:* ${Math.floor(process.uptime() / 60)} minutes\n\n🔧 *Process is shutting down gracefully*`;

      await sendDirectTelegramAlert(shutdownMessage);

      if (healthMonitor) {
        healthMonitor.stopMonitoring();
      }

      // Aguardar um pouco para garantir que os alertas sejam enviados
      setTimeout(() => {
        logger.info('Process exiting...', { module: 'Bot' });
        process.exit(0);
      }, 2000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Para nodemon/tsx

    // Handler para uncaught exceptions
    process.on('uncaughtException', async error => {
      logger.error('Uncaught Exception', { module: 'Bot' }, error);

      const crashMessage = `🚨 *DashBot Crashed*\n\n❌ *Uncaught Exception*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* ${error.message}\n\n🔧 *Process will restart automatically*`;

      await sendDirectTelegramAlert(crashMessage);

      // Aguardar o alerta ser enviado antes de sair
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    });

    // Handler para unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      logger.error(
        'Unhandled Promise Rejection',
        { module: 'Bot', promise },
        new Error(String(reason))
      );

      const rejectionMessage = `⚠️ *DashBot Promise Rejection*\n\n❌ *Unhandled Rejection*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Reason:* ${String(reason)}\n\n🔧 *Process continues running*`;

      await sendDirectTelegramAlert(rejectionMessage);
    });
  } catch (error) {
    logger.error(
      'Error initializing bot',
      {
        module: 'Bot',
        action: 'initialize_error',
      },
      error as Error
    );

    // Enviar alerta de erro crítico de inicialização
    const errorMessage = `🚨 *DashBot Startup Failed*\n\n❌ *Error:* ${(error as Error).message}\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n\n🔧 *Check configuration and restart*`;

    await sendDirectTelegramAlert(errorMessage);

    // Aguardar o alerta ser enviado antes de sair
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  }
}

main();
