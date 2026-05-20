/**
 * Simple structured logger per debugging e monitoring
 * In production, integrare con Sentry o altri error tracking
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  error?: string;
  data?: unknown;
}

class Logger {
  private level: LogLevel = LogLevel.DEBUG;

  constructor() {
    // In production, solo WARN e ERROR
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      this.level = LogLevel.WARN;
    }
  }

  private formatEntry(level: LogLevel, levelName: string, message: string, context?: string, data?: unknown, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      context,
      data,
      error: error?.message,
    };
  }

  private log(level: LogLevel, levelName: string, message: string, context?: string, data?: unknown, error?: Error) {
    if (level < this.level) return;

    const entry = this.formatEntry(level, levelName, message, context, data, error);
    const method = {
      [LogLevel.DEBUG]: "log",
      [LogLevel.INFO]: "info",
      [LogLevel.WARN]: "warn",
      [LogLevel.ERROR]: "error",
    }[level] as keyof typeof console;

    console[method](`[${entry.timestamp}] ${entry.level}${context ? ` [${context}]` : ""}: ${message}`, data || "");

    // In production: inviare a error tracking service
    if (level === LogLevel.ERROR && typeof window !== "undefined") {
      // Sentry.captureException(error, { extra: { context, data, message } });
    }
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.DEBUG, "DEBUG", message, context, data);
  }

  info(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.INFO, "INFO", message, context, data);
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.WARN, "WARN", message, context, data);
  }

  error(message: string, error?: Error, context?: string, data?: unknown) {
    this.log(LogLevel.ERROR, "ERROR", message, context, data, error);
  }
}

export const logger = new Logger();
