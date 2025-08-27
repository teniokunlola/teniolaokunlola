/**
 * Logger utility for production-safe logging
 * 
 * This logger provides environment-aware logging that automatically:
 * - Shows all log levels in development
 * - Only shows errors in production
 * - Stores error logs locally for debugging
 * - Can be extended to send logs to remote services
 * 
 * 
 * Usage: debug(), info(), warn(), error() methods available
 */

export const LogLevel = {
  /** Only log errors (production mode) */
  ERROR: 0,
  /** Log warnings and errors */
  WARN: 1,
  /** Log info, warnings, and errors */
  INFO: 2,
  /** Log everything (development mode) */
  DEBUG: 3,
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

interface LogConfig {
  /** Current log level threshold */
  level: LogLevelType;
  /** Whether to output to console */
  enableConsole: boolean;
  /** Whether to store logs remotely/local storage */
  enableRemote: boolean;
}

/**
 * Production-safe logger class
 * 
 * Automatically configures itself based on NODE_ENV:
 * - Development: All log levels, console output enabled
 * - Production: Error-only logging, remote storage enabled
 */
class Logger {
  private config: LogConfig;

  constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
    };
  }

  /**
   * Check if a log level should be output
   * @param level - The log level to check
   * @returns True if the level should be logged
   */
  private shouldLog(level: LogLevelType): boolean {
    return level <= this.config.level;
  }

  /**
   * Format a log message with timestamp and structured data
   * @param level - The log level name
   * @param message - The main log message
   * @param data - Optional structured data to include
   * @returns Formatted log string
   */
  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  /**
   * Internal logging method that handles all log levels
   * @param level - The numeric log level
   * @param levelName - The human-readable level name
   * @param message - The log message
   * @param data - Optional structured data
   */
  private log(level: LogLevelType, levelName: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelName, message, data);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    if (this.config.enableRemote && level === LogLevel.ERROR) {
      this.sendToRemote(levelName, message, data);
    }
  }

  /**
   * Store error logs locally for debugging purposes
   * In production, this could be extended to send to a logging service
   * @param level - The log level
   * @param message - The log message
   * @param data - Optional structured data
   */
  private async sendToRemote(_level: string, message: string, data?: unknown): Promise<void> {
    try {
      // In production, you might want to send errors to a logging service
      // For now, we'll just store them in localStorage for debugging
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level: _level,
        message,
        data,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch {
      // Silently fail to avoid infinite loops
    }
  }

  /**
   * Log an error message
   * @param message - The error message
   * @param data - Optional structured data
   */
  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  /**
   * Log a warning message
   * @param message - The warning message
   * @param data - Optional structured data
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  /**
   * Log an info message
   * @param message - The info message
   * @param data - Optional structured data
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  /**
   * Log a debug message
   * @param message - The debug message
   * @param data - Optional structured data
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Get stored logs for debugging (development only)
   * @returns Array of stored log entries
   */
  getLogs(): unknown[] {
    if (process.env.NODE_ENV === 'production') return [];
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    localStorage.removeItem('app_logs');
  }
}

export const logger = new Logger();

// Export individual methods for convenience
export const { error, warn, info, debug } = logger;
