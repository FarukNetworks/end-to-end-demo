/**
 * Structured JSON logging utility
 * Provides standardized logging across the application with PII filtering
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  level: LogLevel;
  timestamp: string;
  message: string;
  route?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

/**
 * Formats log data as JSON string
 */
function formatLog(data: Omit<LogData, 'timestamp'>): string {
  return JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Filters PII from user ID (mask to first 8 characters)
 */
function filterUserId(userId?: string): string | undefined {
  if (!userId) return undefined;
  return `user_${userId.slice(0, 8)}`;
}

/**
 * Structured logger with JSON output and PII filtering
 */
export const logger = {
  /**
   * Log informational message
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(formatLog({ level: 'info', message, ...meta }));
  },

  /**
   * Log warning message
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.warn(formatLog({ level: 'warn', message, ...meta }));
  },

  /**
   * Log error with optional Error object
   */
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.error(
      formatLog({
        level: 'error',
        message,
        error: error?.message,
        stack: error?.stack,
        ...meta,
      })
    );
  },

  /**
   * Log debug message (only in development)
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(formatLog({ level: 'debug', message, ...meta }));
    }
  },

  /**
   * Log API request with automatic PII filtering
   */
  apiRequest: (data: {
    method: string;
    route: string;
    userId?: string;
    statusCode: number;
    duration: number;
  }) => {
    // Filter out PII - never log email or sensitive data
    const safeData = {
      ...data,
      userId: filterUserId(data.userId),
    };
    // eslint-disable-next-line no-console
    console.log(formatLog({ level: 'info', message: 'API Request', ...safeData }));
  },
};
