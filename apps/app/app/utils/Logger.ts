/**
 * Structured Logging System
 *
 * Provides consistent logging across the app with:
 * - Multiple log levels (debug, info, warn, error)
 * - Contextual logging with metadata
 * - Automatic sensitive data redaction
 * - Environment-aware behavior
 * - Integration with analytics and crash reporting
 */

import { trackEvent } from "./analytics"
import { captureException, captureMessage } from "./crashReporting"

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
}

/**
 * Sensitive data patterns to redact
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /credit[_-]?card/i,
  /ssn/i,
  /social[_-]?security/i,
]

/**
 * Check if a key contains sensitive data
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))
}

/**
 * Redact sensitive data from an object
 */
function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data !== "object") {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData)
  }

  const redacted: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      redacted[key] = "[REDACTED]"
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Format log message with metadata
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  metadata?: Record<string, any>,
): string {
  const timestamp = new Date().toISOString()
  const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : ""
  return `[${timestamp}] [${level}] ${message}${metadataStr}`
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableAnalytics: boolean
  enableCrashReporting: boolean
  redactSensitiveData: boolean
}

/**
 * Main Logger class
 */
class Logger {
  private config: LoggerConfig

  constructor() {
    // Default configuration based on environment
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableAnalytics: !__DEV__,
      enableCrashReporting: !__DEV__,
      redactSensitiveData: true,
    }
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel]
  }

  /**
   * Prepare metadata for logging
   */
  private prepareMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined

    return this.config.redactSensitiveData ? redactSensitiveData(metadata) : metadata
  }

  /**
   * Log to console
   */
  private logToConsole(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enableConsole) return

    const formattedMessage = formatLogMessage(level, message, metadata)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }
  }

  /**
   * Log to analytics
   */
  private logToAnalytics(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enableAnalytics) return

    // Only track warnings and errors to analytics
    if (level === LogLevel.WARN || level === LogLevel.ERROR) {
      trackEvent(`log_${level.toLowerCase()}`, {
        message,
        ...metadata,
      })
    }
  }

  /**
   * Log to crash reporting
   */
  private logToCrashReporting(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error,
  ): void {
    if (!this.config.enableCrashReporting) return

    // Only report errors to crash reporting
    if (level === LogLevel.ERROR) {
      if (error) {
        captureException(error, {
          tags: { level },
          extra: { message, ...metadata },
        })
      } else {
        captureMessage(message, {
          level: "error",
          extra: metadata,
        })
      }
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) return

    const preparedMetadata = this.prepareMetadata(metadata)

    this.logToConsole(level, message, preparedMetadata)
    this.logToAnalytics(level, message, preparedMetadata)
    this.logToCrashReporting(level, message, preparedMetadata, error)
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * Error level logging
   */
  error(message: string, metadata?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, metadata, error)
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger()
    childLogger.config = { ...this.config }

    // Override log method to include context
    const originalLog = childLogger.log.bind(childLogger)
    childLogger.log = (
      level: LogLevel,
      message: string,
      metadata?: Record<string, any>,
      error?: Error,
    ) => {
      originalLog(level, message, { ...context, ...metadata }, error)
    }

    return childLogger
  }

  /**
   * Create a scoped logger for a specific module
   */
  scope(moduleName: string): Logger {
    return this.child({ module: moduleName })
  }
}

// Export singleton instance
export const logger = new Logger()

/**
 * Create a scoped logger for a module
 */
export function createLogger(moduleName: string): Logger {
  return logger.scope(moduleName)
}

/**
 * Utility to measure and log execution time
 */
export async function measureExecutionTime<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, any>,
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime

    logger.debug(`${operationName} completed`, {
      duration,
      ...metadata,
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error(
      `${operationName} failed`,
      {
        duration,
        ...metadata,
      },
      error as Error,
    )

    throw error
  }
}
