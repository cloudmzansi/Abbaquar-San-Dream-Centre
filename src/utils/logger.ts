// Logging levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableRemote: false
};

class Logger {
  private config: LoggerConfig;
  private context?: string;

  constructor(config: Partial<LoggerConfig> = {}, context?: string) {
    this.config = { ...defaultConfig, ...config };
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = this.context ? `[${this.context}]` : '';
    
    let formatted = `${timestamp} ${levelName}${contextStr}: ${message}`;
    
    if (error) {
      formatted += `\nError: ${error.message}\nStack: ${error.stack}`;
    }
    
    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data, error);
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
      error
    };

    // Console logging
    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }

    // Remote logging (for production)
    if (this.config.enableRemote && this.config.remoteEndpoint && level >= LogLevel.ERROR) {
      this.sendToRemote(logEntry).catch(() => {
        // Silently fail if remote logging fails
      });
    }
  }

  private async sendToRemote(logEntry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      // Don't log remote logging failures to avoid infinite loops
    }
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  // Create a new logger instance with context
  withContext(context: string): Logger {
    return new Logger(this.config, context);
  }
}

// Default logger instance
export const logger = new Logger();

// Context-specific loggers
export const createLogger = (context: string, config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config, context);
};

// Utility functions for common logging patterns
export const logError = (message: string, error: Error, context?: string): void => {
  const contextLogger = context ? createLogger(context) : logger;
  contextLogger.error(message, error);
};

export const logInfo = (message: string, data?: unknown, context?: string): void => {
  const contextLogger = context ? createLogger(context) : logger;
  contextLogger.info(message, data);
};

export const logWarn = (message: string, data?: unknown, context?: string): void => {
  const contextLogger = context ? createLogger(context) : logger;
  contextLogger.warn(message, data);
};

export const logDebug = (message: string, data?: unknown, context?: string): void => {
  const contextLogger = context ? createLogger(context) : logger;
  contextLogger.debug(message, data);
};
