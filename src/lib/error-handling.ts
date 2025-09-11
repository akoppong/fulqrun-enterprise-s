import { toast } from 'sonner';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  timestamp: Date;
  stack?: string;
  userAgent?: string;
  url?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: ValidationErrorDetail[];
  requestId?: string;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private readonly maxErrors = 100; // Prevent memory leaks

  /**
   * Records an error with appropriate categorization and user notification
   */
  public handleError(error: Error | string, context?: Record<string, any>, severity: ErrorSeverity = 'medium'): AppError {
    const appError: AppError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: typeof error === 'string' ? error : error.message,
      severity,
      context,
      timestamp: new Date(),
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Store error (with size limit)
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('AppError:', appError);
    }

    // Show user notification based on severity
    this.notifyUser(appError);

    return appError;
  }

  /**
   * Shows appropriate user notification based on error severity
   */
  private notifyUser(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    switch (error.severity) {
      case 'critical':
        toast.error('Critical Error', {
          description: userMessage,
          duration: 10000,
        });
        break;
      case 'high':
        toast.error('Error', {
          description: userMessage,
          duration: 6000,
        });
        break;
      case 'medium':
        toast.warning('Warning', {
          description: userMessage,
          duration: 4000,
        });
        break;
      case 'low':
        toast.info('Notice', {
          description: userMessage,
          duration: 2000,
        });
        break;
    }
  }

  /**
   * Converts technical error messages to user-friendly ones
   */
  private getUserFriendlyMessage(error: AppError): string {
    // Common error patterns with user-friendly messages
    const patterns: Array<[RegExp | string, string]> = [
      [/network/i, 'Unable to connect to the server. Please check your internet connection.'],
      [/timeout/i, 'The request took too long to complete. Please try again.'],
      [/unauthorized/i, 'You are not authorized to perform this action.'],
      [/forbidden/i, 'Access denied. Please contact support if you believe this is an error.'],
      [/not found/i, 'The requested resource could not be found.'],
      [/validation/i, 'Please check your input and try again.'],
      [/parse/i, 'Invalid data format. Please contact support.'],
      ['Failed to fetch', 'Unable to connect to the server. Please check your internet connection.'],
    ];

    for (const [pattern, message] of patterns) {
      if (typeof pattern === 'string' && error.message.includes(pattern)) {
        return message;
      } else if (pattern instanceof RegExp && pattern.test(error.message)) {
        return message;
      }
    }

    // Return original message if no pattern matches (but sanitized)
    return error.message.replace(/\b(error|Error|ERROR)\b:?\s*/g, '').trim() || 'An unexpected error occurred.';
  }

  /**
   * Handle API errors with structured response
   */
  public handleApiError(apiError: ApiError, context?: Record<string, any>): AppError {
    const severity: ErrorSeverity = this.determineApiErrorSeverity(apiError.statusCode);
    const userMessage = this.createUserFriendlyApiMessage(apiError);
    
    return this.handleError(userMessage, {
      ...context,
      statusCode: apiError.statusCode,
      requestId: apiError.requestId,
      apiDetails: apiError.details
    }, severity);
  }

  /**
   * Handle validation errors from forms
   */
  public handleValidationErrors(errors: ValidationErrorDetail[], context?: Record<string, any>): void {
    const primaryError = errors[0];
    const message = errors.length === 1 
      ? primaryError.message 
      : `${primaryError.message} (and ${errors.length - 1} more error${errors.length > 2 ? 's' : ''})`;

    this.handleError(message, context, 'medium');
  }

  /**
   * Handle network/connectivity errors
   */
  public handleNetworkError(error: Error, context?: Record<string, any>): AppError {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const message = isOffline 
      ? 'You appear to be offline. Please check your connection.'
      : 'Network error occurred. Please try again.';

    return this.handleError(message, {
      ...context,
      networkError: true,
      offline: isOffline,
      originalError: error.message
    }, 'medium');
  }

  /**
   * Gets all recorded errors
   */
  public getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Gets errors by severity level
   */
  public getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Clears all recorded errors
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * Gets error count by severity
   */
  public getErrorStats(): Record<ErrorSeverity, number> {
    return this.errors.reduce((stats, error) => {
      stats[error.severity] = (stats[error.severity] || 0) + 1;
      return stats;
    }, {} as Record<ErrorSeverity, number>);
  }

  /**
   * Determines API error severity based on status code
   */
  private determineApiErrorSeverity(statusCode?: number): ErrorSeverity {
    if (!statusCode) return 'medium';
    
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    if (statusCode >= 300) return 'medium';
    return 'low';
  }

  /**
   * Creates user-friendly message for API errors
   */
  private createUserFriendlyApiMessage(apiError: ApiError): string {
    const statusCode = apiError.statusCode;
    
    if (statusCode === 401) return 'Please log in to continue.';
    if (statusCode === 403) return 'You do not have permission to perform this action.';
    if (statusCode === 404) return 'The requested resource was not found.';
    if (statusCode === 429) return 'Too many requests. Please wait a moment and try again.';
    if (statusCode && statusCode >= 500) return 'Server error. Our team has been notified.';
    
    return apiError.message || 'An error occurred while processing your request.';
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

/**
 * Utility function for wrapping async functions with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), context);
      throw error; // Re-throw for caller to handle
    }
  };
}

/**
 * Utility function for wrapping sync functions with error handling
 */
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, any>
): (...args: T) => R | null {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), context);
      return null;
    }
  };
}

/**
 * Global error boundary setup
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledrejection' },
      'high'
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    errorHandler.handleError(
      event.error || new Error(event.message),
      { 
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      'high'
    );
  });
}