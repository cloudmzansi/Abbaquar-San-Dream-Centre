import { logger } from '../utils/logger';

export interface ErrorContext {
  operation: string;
  component?: string;
  data?: unknown;
  userId?: string;
}

export interface ErrorResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Centralized error handler for consistent error logging and handling
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle errors with consistent logging and optional user feedback
   */
  handleError(
    error: Error | string | unknown,
    context: ErrorContext,
    showUserFeedback = false
  ): void {
    const errorMessage = typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error : error;

    // Log error with context
    logger.error(
      `Error in ${context.operation}${context.component ? ` (${context.component})` : ''}: ${errorMessage}`,
      errorDetails,
      context.component || 'ErrorHandler'
    );

    // Show user feedback if requested
    if (showUserFeedback) {
      this.showUserError(errorMessage);
    }
  }

  /**
   * Execute a function with error handling wrapper
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallback?: T
  ): Promise<ErrorResult<T>> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      this.handleError(error, context);
      return { 
        success: false, 
        error: typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error',
        details: error,
        data: fallback
      };
    }
  }

  /**
   * Execute a synchronous function with error handling wrapper
   */
  executeWithErrorHandlingSync<T>(
    operation: () => T,
    context: ErrorContext,
    fallback?: T
  ): ErrorResult<T> {
    try {
      const result = operation();
      return { success: true, data: result };
    } catch (error) {
      this.handleError(error, context);
      return { 
        success: false, 
        error: typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error',
        details: error,
        data: fallback
      };
    }
  }

  /**
   * Show user-friendly error message
   */
  private showUserError(message: string): void {
    // In a real app, this would show a toast notification
    // For now, we'll use console.warn in development
    if (this.isDevelopment) {
      console.warn('User Error:', message);
    }
  }

  /**
   * Validate required parameters and throw descriptive errors
   */
  validateRequired<T>(value: T | null | undefined, paramName: string, context: string): T {
    if (value === null || value === undefined) {
      const error = new Error(`Required parameter '${paramName}' is missing in ${context}`);
      this.handleError(error, { operation: 'validation', component: context });
      throw error;
    }
    return value;
  }

  /**
   * Validate array is not empty
   */
  validateNonEmptyArray<T>(array: T[], arrayName: string, context: string): T[] {
    if (!Array.isArray(array) || array.length === 0) {
      const error = new Error(`Array '${arrayName}' is empty or invalid in ${context}`);
      this.handleError(error, { operation: 'validation', component: context });
      throw error;
    }
    return array;
  }

  /**
   * Validate object has required properties
   */
  validateObjectProperties(
    obj: Record<string, unknown>,
    requiredProps: string[],
    objectName: string,
    context: string
  ): void {
    const missingProps = requiredProps.filter(prop => !(prop in obj));
    if (missingProps.length > 0) {
      const error = new Error(
        `Object '${objectName}' is missing required properties: ${missingProps.join(', ')} in ${context}`
      );
      this.handleError(error, { operation: 'validation', component: context });
      throw error;
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions for common error handling patterns
export const handleAsyncError = <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<ErrorResult<T>> => {
  return errorHandler.executeWithErrorHandling(operation, context, fallback);
};

export const handleSyncError = <T>(
  operation: () => T,
  context: ErrorContext,
  fallback?: T
): ErrorResult<T> => {
  return errorHandler.executeWithErrorHandlingSync(operation, context, fallback);
};

// Legacy support - replace console.error calls
export const logError = (message: string, error: unknown, context: string): void => {
  errorHandler.handleError(error, { operation: message, component: context });
};
