/**
 * Production-Safe Logger
 * 
 * Replaces console.log with environment-aware logging
 * that doesn't expose sensitive information in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Format log entry
   */
  private format(level: LogLevel, message: string, data?: any): LogContext {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
    }
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: any): any {
    if (!data) return data

    if (typeof data === 'string') {
      // Redact potential sensitive patterns
      return data
        .replace(/password[\"']?\s*[:=]\s*[\"']?[^\"'\s,}]+/gi, 'password: [REDACTED]')
        .replace(/token[\"']?\s*[:=]\s*[\"']?[^\"'\s,}]+/gi, 'token: [REDACTED]')
        .replace(/api[_-]?key[\"']?\s*[:=]\s*[\"']?[^\"'\s,}]+/gi, 'api_key: [REDACTED]')
        .replace(/secret[\"']?\s*[:=]\s*[\"']?[^\"'\s,}]+/gi, 'secret: [REDACTED]')
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {}
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()
        
        // Redact sensitive keys
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') && !lowerKey.includes('public')
        ) {
          sanitized[key] = '[REDACTED]'
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeData(value)
        } else {
          sanitized[key] = value
        }
      }
      
      return sanitized
    }

    return data
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      const log = this.format('debug', message, data)
      console.debug(`[DEBUG] ${log.timestamp} - ${message}`, data || '')
    }
  }

  /**
   * Log info messages
   */
  info(message: string, data?: any): void {
    const log = this.format('info', message, data)
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${log.timestamp} - ${message}`, log.data || '')
    } else {
      // In production, send to logging service (e.g., Sentry, Datadog)
      console.info(JSON.stringify(log))
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    const log = this.format('warn', message, data)
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${log.timestamp} - ${message}`, log.data || '')
    } else {
      console.warn(JSON.stringify(log))
    }
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: Error | any, context?: any): void {
    const log = this.format('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
      context: this.sanitizeData(context),
    })
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${log.timestamp} - ${message}`, log.data)
    } else {
      // In production, send to error tracking service
      console.error(JSON.stringify(log))
      
      // TODO: Send to Sentry or other error tracking service
      // Sentry.captureException(error, { contexts: { custom: context } })
    }
  }

  /**
   * Log HTTP request (for API routes)
   */
  request(method: string, path: string, status: number, duration: number, userId?: string): void {
    const log = {
      timestamp: new Date().toISOString(),
      type: 'http_request',
      method,
      path,
      status,
      duration,
      userId: userId || 'anonymous',
    }

    if (this.isDevelopment) {
      console.log(`[HTTP] ${method} ${path} - ${status} (${duration}ms)`)
    } else {
      console.log(JSON.stringify(log))
    }
  }

  /**
   * Log security event
   */
  security(event: string, details: any): void {
    const log = {
      timestamp: new Date().toISOString(),
      type: 'security_event',
      event,
      details: this.sanitizeData(details),
    }

    // Security events should always be logged
    if (this.isDevelopment) {
      console.warn(`[SECURITY] ${event}`, details)
    } else {
      console.warn(JSON.stringify(log))
    }
  }

  /**
   * Log database query (development only)
   */
  query(sql: string, duration: number, params?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DB] ${sql} (${duration}ms)`, params || '')
    }
  }

  /**
   * Log authentication event
   */
  auth(event: 'login' | 'logout' | 'failed_attempt' | 'session_expired', userId?: string, details?: any): void {
    const log = {
      timestamp: new Date().toISOString(),
      type: 'auth_event',
      event,
      userId: userId || 'unknown',
      details: this.sanitizeData(details),
    }

    if (this.isDevelopment) {
      console.log(`[AUTH] ${event} - User: ${userId || 'unknown'}`, details || '')
    } else {
      console.log(JSON.stringify(log))
    }
  }

  /**
   * Performance metrics
   */
  performance(operation: string, duration: number, metadata?: any): void {
    const log = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      operation,
      duration,
      metadata: this.sanitizeData(metadata),
    }

    if (this.isDevelopment && duration > 1000) {
      // Only log slow operations in development
      console.warn(`[PERF] Slow operation: ${operation} took ${duration}ms`, metadata || '')
    } else if (!this.isDevelopment) {
      console.log(JSON.stringify(log))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export individual methods for convenience
export const {
  debug,
  info,
  warn,
  error,
  request,
  security,
  query,
  auth,
  performance
} = logger

// Default export
export default logger

