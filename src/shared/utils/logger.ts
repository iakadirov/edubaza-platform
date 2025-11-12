/**
 * Logger Utility
 * Централизованное логирование
 */

import { appConfig } from '@/shared/config/app.config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = appConfig.app.env === 'development';
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'info':
        console.log(logMessage, meta || '');
        break;
      case 'warn':
        console.warn(logMessage, meta || '');
        break;
      case 'error':
        console.error(logMessage, meta || '');
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logMessage, meta || '');
        }
        break;
    }
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
export default logger;
