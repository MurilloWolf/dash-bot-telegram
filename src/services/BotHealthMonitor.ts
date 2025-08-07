import { logger } from '../utils/Logger.js';

interface BotHealthStatus {
  status: 'healthy' | 'unhealthy' | 'warning';
  checks?: {
    bot: { status: string; botUsername?: string; error?: string };
    memory: {
      status: string;
      usage?: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
    };
  };
  uptime?: number;
  timestamp?: string;
  error?: string;
}

interface AlertConfig {
  telegramToken: string;
  alertChatId: string;
  checkInterval: number;
  alertCooldown: number;
}

export class BotHealthMonitor {
  private lastKnownStatus = 'unknown';
  private lastAlertTime = 0;
  private monitoringInterval?: NodeJS.Timeout;
  private config: AlertConfig;

  constructor() {
    this.config = {
      telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
      alertChatId: process.env.TELEGRAM_ALERT_AGENT!,
      checkInterval: 60000, // 1 minuto
      alertCooldown: 300000, // 5 minutos de cooldown entre alertas do mesmo tipo
    };

    if (!this.config.telegramToken) {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }

    if (!this.config.alertChatId) {
      throw new Error('TELEGRAM_ALERT_AGENT não configurado');
    }
  }

  async checkBotStatus(): Promise<BotHealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'unhealthy',
          error: `Health endpoint failed: HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        ...data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: `Health check connection failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async sendTelegramAlert(message: string): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${this.config.telegramToken}/sendMessage`;

      const payload = {
        chat_id: this.config.alertChatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
      }

      logger.info('Alert sent to Telegram successfully', {
        module: 'BotHealthMonitor',
        chatId: this.config.alertChatId,
      });
    } catch (error) {
      logger.error('Failed to send Telegram alert', {
        module: 'BotHealthMonitor',
        error: (error as Error).message,
      });
    }
  }

  private formatAlertMessage(status: BotHealthStatus): string {
    const statusEmoji =
      status.status === 'healthy'
        ? '✅'
        : status.status === 'warning'
          ? '⚠️'
          : '🚨';
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    let message = `${statusEmoji} *DashBot Status Alert*\n\n`;
    message += `📊 *Status:* ${status.status.toUpperCase()}\n`;
    message += `🕒 *Timestamp:* ${timestamp}\n`;

    if (status.uptime) {
      const uptimeMinutes = Math.floor(status.uptime / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      message += `⏱ *Uptime:* ${uptimeHours}h ${uptimeMinutes % 60}m\n`;
    }

    if (status.checks) {
      message += `\n📋 *Detalhes:*\n`;

      if (status.checks.bot) {
        const botEmoji = status.checks.bot.status === 'healthy' ? '✅' : '❌';
        message += `${botEmoji} *Telegram Bot:* ${status.checks.bot.status}\n`;
        if (status.checks.bot.error) {
          message += `   └ Error: ${status.checks.bot.error}\n`;
        }
        if (status.checks.bot.botUsername) {
          message += `   └ Username: @${status.checks.bot.botUsername}\n`;
        }
      }

      if (status.checks.memory) {
        const memEmoji =
          status.checks.memory.status === 'healthy' ? '✅' : '⚠️';
        message += `${memEmoji} *Memory:* ${status.checks.memory.status}\n`;
        if (status.checks.memory.usage) {
          message += `   └ RSS: ${status.checks.memory.usage.rss}MB\n`;
          message += `   └ Heap: ${status.checks.memory.usage.heapUsed}/${status.checks.memory.usage.heapTotal}MB\n`;
        }
      }
    }

    if (status.error) {
      message += `\n❌ *Error:* ${status.error}\n`;
    }

    message += `\n🔗 *App:* dash-bot-telegram`;

    return message;
  }

  private shouldSendAlert(currentStatus: string): boolean {
    const now = Date.now();
    const statusChanged = currentStatus !== this.lastKnownStatus;
    const cooldownExpired =
      now - this.lastAlertTime > this.config.alertCooldown;

    return statusChanged || (currentStatus === 'unhealthy' && cooldownExpired);
  }

  startMonitoring(): void {
    logger.info('Starting bot health monitoring', {
      module: 'BotHealthMonitor',
      interval: this.config.checkInterval,
      alertChatId: this.config.alertChatId,
    });

    // Verificação inicial
    this.performHealthCheck();

    // Configurar verificação periódica
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    // Limpeza quando o processo termina
    process.on('SIGINT', () => this.stopMonitoring());
    process.on('SIGTERM', () => this.stopMonitoring());
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const status = await this.checkBotStatus();

      logger.info('Health check performed', {
        module: 'BotHealthMonitor',
        status: status.status,
        uptime: status.uptime,
      });

      // Enviar alerta se necessário
      if (this.shouldSendAlert(status.status)) {
        await this.sendTelegramAlert(this.formatAlertMessage(status));
        this.lastAlertTime = Date.now();
      }

      this.lastKnownStatus = status.status;
    } catch (error) {
      logger.error('Health check failed', {
        module: 'BotHealthMonitor',
        error: (error as Error).message,
      });

      // Em caso de erro crítico, enviar alerta
      if (this.shouldSendAlert('unhealthy')) {
        const errorMessage = `🚨 *DashBot Critical Error*\n\n❌ *Health Monitor Failed*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* ${(error as Error).message}`;
        await this.sendTelegramAlert(errorMessage);
        this.lastAlertTime = Date.now();
      }
    }
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;

      logger.info('Bot health monitoring stopped', {
        module: 'BotHealthMonitor',
      });
    }
  }

  // Método para teste manual
  async sendTestAlert(): Promise<void> {
    const testMessage = `🧪 *DashBot Test Alert*\n\n✅ *Status:* Monitoring system is working\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n\nThis is a test alert to verify the monitoring system.`;
    await this.sendTelegramAlert(testMessage);
  }

  // Método público para enviar alertas personalizados
  async sendAlert(message: string): Promise<void> {
    await this.sendTelegramAlert(message);
  }

  // Método para simular diferentes cenários de teste
  async simulateUnhealthyBot(): Promise<void> {
    const unhealthyStatus: BotHealthStatus = {
      status: 'unhealthy',
      checks: {
        bot: {
          status: 'unhealthy',
          error: 'Bot API unreachable (SIMULATED for testing)',
        },
        memory: {
          status: 'healthy',
          usage: {
            rss: 120,
            heapTotal: 150,
            heapUsed: 80,
            external: 5,
          },
        },
      },
      uptime: 300, // 5 minutos
      timestamp: new Date().toISOString(),
    };

    const alertMessage = this.formatAlertMessage(unhealthyStatus);
    const testAlert =
      alertMessage + '\n\n⚠️ *This is a SIMULATED alert for testing purposes*';
    await this.sendTelegramAlert(testAlert);
  }

  async simulateHighMemoryUsage(): Promise<void> {
    const memoryWarningStatus: BotHealthStatus = {
      status: 'warning',
      checks: {
        bot: {
          status: 'healthy',
          botUsername: 'dashbot_test',
        },
        memory: {
          status: 'warning',
          usage: {
            rss: 850,
            heapTotal: 500,
            heapUsed: 400,
            external: 20,
          },
        },
      },
      uptime: 7800, // 2h 10m
      timestamp: new Date().toISOString(),
    };

    const alertMessage = this.formatAlertMessage(memoryWarningStatus);
    const testAlert =
      alertMessage + '\n\n⚠️ *This is a SIMULATED alert for testing purposes*';
    await this.sendTelegramAlert(testAlert);
  }

  async simulateCriticalError(): Promise<void> {
    const criticalMessage = `🚨 *DashBot Critical Error (TEST)*\n\n❌ *System Failure Simulation*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* Connection timeout - service unreachable\n\n🔧 *Recommended Actions:*\n• Check server connectivity\n• Restart the bot service\n• Review system logs\n\n⚠️ *This is a SIMULATED critical error for testing*`;
    await this.sendTelegramAlert(criticalMessage);
  }

  async simulateStartupFailure(): Promise<void> {
    const startupMessage = `🚨 *DashBot Startup Failed (TEST)*\n\n❌ *Service failed to start*\n🕒 *Time:* ${new Date().toLocaleString('pt-BR')}\n⚠️ *Error:* Unable to connect to Telegram API\n\n🔧 *Check:*\n• TELEGRAM_BOT_TOKEN configuration\n• Network connectivity\n• Service permissions\n\n⚠️ *This is a SIMULATED startup failure for testing*`;
    await this.sendTelegramAlert(startupMessage);
  }
}
