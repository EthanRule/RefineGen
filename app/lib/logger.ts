export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  userId?: string;
  requestId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      userId,
      requestId,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : undefined,
      metadata,
    };
  }

  private log(entry: LogEntry): void {
    // In production, you might want to send this to a logging service
    // For now, we'll use console with structured output
    if (process.env.NODE_ENV === 'production') {
      // In production, only log errors and warnings
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.WARN) {
        console.log(JSON.stringify(entry));
      }
    } else {
      // In development, log everything with better formatting
      const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.service}]`;
      console.log(`${prefix}: ${entry.message}`);

      if (entry.error) {
        console.error(`  Error: ${entry.error.name}: ${entry.error.message}`);
        if (entry.error.stack) {
          console.error(`  Stack: ${entry.error.stack}`);
        }
      }

      if (entry.metadata) {
        console.log(`  Metadata:`, entry.metadata);
      }
    }
  }

  error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      error,
      metadata,
      userId,
      requestId
    );
    this.log(entry);
  }

  warn(
    message: string,
    metadata?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.WARN,
      message,
      undefined,
      metadata,
      userId,
      requestId
    );
    this.log(entry);
  }

  info(
    message: string,
    metadata?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      undefined,
      metadata,
      userId,
      requestId
    );
    this.log(entry);
  }

  debug(
    message: string,
    metadata?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      message,
      undefined,
      metadata,
      userId,
      requestId
    );
    this.log(entry);
  }
}

// Create logger instances for different services
export const apiLogger = new Logger('api');
export const authLogger = new Logger('auth');
export const imageLogger = new Logger('image-generation');

// Helper function to extract user info from session
export function extractUserInfo(session: any): { userId?: string; userEmail?: string } {
  return {
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  };
}

// Helper function to generate request ID
export function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  );
}
