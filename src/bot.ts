import dotenv from 'dotenv';
dotenv.config();

import startTelegramBot from './adapters/in/telegram/TelegramBotAdapter.ts';
import { initializeCallbacks } from './Bot/config/callback/CallbackInitializer.ts';
import { logger } from './utils/Logger.ts';
import { HealthCheckAdapter } from './adapters/in/http/HealthCheckAdapter.ts';
import { BotHealthMonitor } from './services/BotHealthMonitor.ts';
import { alertService } from './services/AlertService.ts';

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
          await alertService.sendStartupAlert({
            platform: BOT_PLATFORM || 'unknown',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date(),
          });

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
      await alertService.sendShutdownAlert({
        signal,
        uptime: process.uptime(),
        timestamp: new Date(),
      });

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

      await alertService.sendCriticalAlert({
        message: `Uncaught Exception: ${error.message}`,
        stack: error.stack,
        context: { type: 'uncaughtException' },
        timestamp: new Date(),
      });

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

      await alertService.sendErrorAlert({
        message: `Unhandled Promise Rejection: ${String(reason)}`,
        context: { type: 'unhandledRejection' },
        timestamp: new Date(),
      });
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
    await alertService.sendCriticalAlert({
      message: `Bot startup failed: ${(error as Error).message}`,
      stack: (error as Error).stack,
      context: { action: 'initialize_error' },
      timestamp: new Date(),
    });

    // Aguardar o alerta ser enviado antes de sair
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  }
}

main();
