export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  chatId?: string;
  commandName?: string;
  callbackType?: string;
  table?: string;
  operation?: string;
  raceId?: string;
  raceTitle?: string;
  platform?: string;
  messageType?: string;
  error?: string;
  success?: boolean;
  count?: number;
  duration?: number;
  [key: string]: unknown;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private enableColors: boolean;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.enableColors = process.env.NODE_ENV !== 'production';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private getColorCode(level: LogLevel): string {
    if (!this.enableColors) {
      return '';
    }

    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '';
    }
  }

  private getResetCode(): string {
    return this.enableColors ? '\x1b[0m' : '';
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      default:
        return '';
    }
  }

  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getLevelEmoji(level);
    const levelName = this.getLevelName(level);
    const colorCode = this.getColorCode(level);
    const resetCode = this.getResetCode();

    let formattedMessage = `${colorCode}[${timestamp}] ${emoji} ${levelName}${resetCode}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      const contextStr = Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');

      if (contextStr) {
        formattedMessage += ` | Context: {${contextStr}}`;
      }
    }

    if (error) {
      formattedMessage += `\n${colorCode}Error: ${error.message}${resetCode}`;
      if (error.stack && this.logLevel <= LogLevel.DEBUG) {
        formattedMessage += `\n${colorCode}Stack: ${error.stack}${resetCode}`;
      }
    }

    return formattedMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context, error);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Convenience methods for common use cases
  botStartup(message: string): void {
    this.info(message, { module: 'Bot', action: 'startup' });
  }

  commandExecution(
    commandName: string,
    userId?: string,
    chatId?: string
  ): void {
    this.info(`Executing command: ${commandName}`, {
      module: 'CommandRouter',
      action: 'execute_command',
      commandName,
      userId,
      chatId,
    });
  }

  commandError(
    commandName: string,
    error: Error,
    userId?: string,
    chatId?: string
  ): void {
    this.error(
      `Command execution failed: ${commandName}`,
      {
        module: 'CommandRouter',
        action: 'command_error',
        commandName,
        userId,
        chatId,
      },
      error
    );
  }

  callbackExecution(
    callbackType: string,
    userId?: string,
    chatId?: string
  ): void {
    this.info(`Handling callback: ${callbackType}`, {
      module: 'CallbackManager',
      action: 'execute_callback',
      callbackType,
      userId,
      chatId,
    });
  }

  callbackError(
    callbackType: string,
    error: Error,
    userId?: string,
    chatId?: string
  ): void {
    this.error(
      `Callback execution failed: ${callbackType}`,
      {
        module: 'CallbackManager',
        action: 'callback_error',
        callbackType,
        userId,
        chatId,
      },
      error
    );
  }

  databaseOperation(
    operation: string,
    table?: string,
    context?: LogContext
  ): void {
    this.debug(`Database operation: ${operation}`, {
      module: 'Database',
      action: operation,
      table,
      ...context,
    });
  }

  databaseError(
    operation: string,
    error: Error,
    table?: string,
    context?: LogContext
  ): void {
    this.error(
      `Database operation failed: ${operation}`,
      {
        module: 'Database',
        action: operation,
        table,
        ...context,
      },
      error
    );
  }

  registryOperation(
    type: 'command' | 'callback',
    name: string,
    module: string
  ): void {
    this.info(`Registered ${type}: ${name}`, {
      module: 'Registry',
      action: `register_${type}`,
      handlerName: name,
      handlerModule: module,
    });
  }

  messageIntercept(
    platform: string,
    messageType: string,
    chatId?: string,
    userId?: string
  ): void {
    this.debug(`Message intercepted`, {
      module: 'MessageInterceptor',
      action: 'intercept_message',
      platform,
      messageType,
      chatId,
      userId,
    });
  }

  // Script-specific logging methods
  scriptStart(scriptName: string, description?: string): void {
    this.info(
      `Starting script: ${scriptName}${description ? ` - ${description}` : ''}`,
      {
        module: 'Script',
        action: 'start',
        scriptName,
      }
    );
  }

  scriptComplete(scriptName: string, results?: LogContext): void {
    this.info(`Script completed: ${scriptName}`, {
      module: 'Script',
      action: 'complete',
      scriptName,
      ...results,
    });
  }

  scriptError(scriptName: string, error: Error, context?: LogContext): void {
    this.error(
      `Script failed: ${scriptName}`,
      {
        module: 'Script',
        action: 'error',
        scriptName,
        ...context,
      },
      error
    );
  }

  // Race-specific logging methods
  raceOperation(
    operation: string,
    raceId?: string,
    raceTitle?: string,
    context?: LogContext
  ): void {
    this.info(`Race ${operation}`, {
      module: 'RaceService',
      action: operation,
      raceId,
      raceTitle,
      ...context,
    });
  }

  raceError(
    operation: string,
    error: Error,
    raceId?: string,
    raceTitle?: string
  ): void {
    this.error(
      `Race operation failed: ${operation}`,
      {
        module: 'RaceService',
        action: operation,
        raceId,
        raceTitle,
      },
      error
    );
  }

  // Message handling logging
  messageReceived(
    platform: string,
    chatId?: string,
    userId?: string,
    messageType?: string
  ): void {
    this.debug(`Message received from ${platform}`, {
      module: 'MessageAdapter',
      action: 'receive_message',
      platform,
      chatId,
      userId,
      messageType,
    });
  }

  messageSent(
    platform: string,
    chatId?: string,
    userId?: string,
    success = true
  ): void {
    this.debug(`Message sent via ${platform}`, {
      module: 'MessageAdapter',
      action: 'send_message',
      platform,
      chatId,
      userId,
      success,
    });
  }

  messageError(
    platform: string,
    error: Error,
    chatId?: string,
    userId?: string
  ): void {
    this.error(
      `Message handling failed on ${platform}`,
      {
        module: 'MessageAdapter',
        action: 'message_error',
        platform,
        chatId,
        userId,
      },
      error
    );
  }

  // Registry logging
  moduleRegistration(
    moduleName: string,
    type: 'command' | 'callback',
    count?: number
  ): void {
    this.info(`Module ${moduleName} registered`, {
      module: 'Registry',
      action: 'module_registration',
      moduleName,
      type,
      count,
    });
  }

  duplicateRegistration(
    type: 'command' | 'callback',
    name: string,
    module: string
  ): void {
    this.warn(`Duplicate ${type} registration: ${name}`, {
      module: 'Registry',
      action: 'duplicate_registration',
      type,
      name,
      handlerModule: module,
    });
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level changed to: ${this.getLevelName(level)}`, {
      module: 'Logger',
      action: 'set_log_level',
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
