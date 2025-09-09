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
  private maxErrors = 100; // Keep last 100 errors
  
  /**
   * Handle application errors with appropriate user feedback
   */
  handleError(error: Error | string, severity: ErrorSeverity = 'medium', context?: Record<string, any>): string {
    const errorId = this.generateErrorId();
    const appError: AppError = {
      id: errorId,
      message: typeof error === 'string' ? error : error.message,
      severity,
      context,
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError(appError);
    this.showUserFeedback(appError);

    return errorId;
  }

  /**
   * Handle API errors with structured response
   */
  handleApiError(apiError: ApiError, context?: Record<string, any>): string {
    const severity: ErrorSeverity = this.determineApiErrorSeverity(apiError.statusCode);
    
    // Create user-friendly message
    let userMessage = this.createUserFriendlyMessage(apiError);
    
    return this.handleError(userMessage, severity, {
      ...context,
      statusCode: apiError.statusCode,
      requestId: apiError.requestId,
      apiDetails: apiError.details
    });
  }

  /**
   * Handle validation errors from forms
   */
  handleValidationErrors(errors: ValidationErrorDetail[], context?: Record<string, any>): void {
    const primaryError = errors[0];
    const message = errors.length === 1 
      ? primaryError.message 
      : `${primaryError.message} (and ${errors.length - 1} more error${errors.length > 2 ? 's' : ''})`;

    toast.error('Validation Error', {
      description: message,
      action: errors.length > 1 ? {
        label: 'View All',
        onClick: () => this.showDetailedValidationErrors(errors)
      } : undefined
    });
  }

  /**
   * Handle network/connectivity errors
   */
  handleNetworkError(error: Error, context?: Record<string, any>): string {
    const isOffline = !navigator.onLine;
    const message = isOffline 
      ? 'You appear to be offline. Please check your connection.'
      : 'Network error occurred. Please try again.';

    return this.handleError(message, 'medium', {
      ...context,
      networkError: true,
      offline: isOffline,
      originalError: error.message
    });
  }

  /**
   * Handle permission/authorization errors
   */
  handlePermissionError(action: string, resource?: string): string {
    const message = resource 
      ? `You don't have permission to ${action} ${resource}`
      : `You don't have permission to ${action}`;

    return this.handleError(message, 'high', {
      permissionError: true,
      action,
      resource
    });
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errors = [];
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: AppError): void {
    // Add to internal log
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Console logging based on severity
    if (error.severity === 'critical') {
      console.error('[CRITICAL ERROR]', error);
    } else if (error.severity === 'high') {
      console.error('[ERROR]', error);
    } else if (error.severity === 'medium') {
      console.warn('[WARNING]', error);
    } else {
      console.log('[INFO]', error);
    }

    // In production, send to error reporting service
    if (import.meta.env.PROD && error.severity !== 'low') {
      this.reportToService(error);
    }
  }

  private showUserFeedback(error: AppError): void {
    switch (error.severity) {
      case 'critical':
        toast.error('Critical Error', {
          description: error.message,
          duration: Infinity, // Don't auto-dismiss
          action: {
            label: 'Report Issue',
            onClick: () => this.openErrorReport(error)
          }
        });
        break;
        
      case 'high':
        toast.error('Error', {
          description: error.message,
          duration: 8000,
          action: {
            label: 'Details',
            onClick: () => this.showErrorDetails(error)
          }
        });
        break;
        
      case 'medium':
        toast.warning('Warning', {
          description: error.message,
          duration: 5000
        });
        break;
        
      case 'low':
        // Don't show toast for low severity, just log
        break;
    }
  }

  private determineApiErrorSeverity(statusCode?: number): ErrorSeverity {
    if (!statusCode) return 'medium';
    
    if (statusCode >= 500) return 'high';
    if (statusCode === 403 || statusCode === 401) return 'high';
    if (statusCode >= 400) return 'medium';
    
    return 'low';
  }

  private createUserFriendlyMessage(apiError: ApiError): string {
    switch (apiError.statusCode) {
      case 400:
        return apiError.details?.length 
          ? 'Please check the form for errors and try again.'
          : 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data. Please refresh and try again.';
      case 422:
        return 'The submitted data is invalid. Please check the form.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Our team has been notified.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      default:
        return apiError.message || 'An unexpected error occurred.';
    }
  }

  private showDetailedValidationErrors(errors: ValidationErrorDetail[]): void {
    const errorList = errors.map(error => `• ${error.field}: ${error.message}`).join('\n');
    
    toast.error('Validation Errors', {
      description: (
        <div className="whitespace-pre-line text-sm">
          <div className="font-medium mb-2">Please fix the following issues:</div>
          <div className="text-xs opacity-90">{errorList}</div>
        </div>
      ),
      duration: 10000
    });
  }

  private showErrorDetails(error: AppError): void {
    console.group(`Error Details: ${error.id}`);
    console.log('Message:', error.message);
    console.log('Severity:', error.severity);
    console.log('Timestamp:', error.timestamp);
    console.log('Context:', error.context);
    if (error.stack) console.log('Stack:', error.stack);
    console.groupEnd();
    
    toast.info('Error Details', {
      description: `Error ID: ${error.id}\nCheck console for full details.`,
      duration: 5000
    });
  }

  private openErrorReport(error: AppError): void {
    // In a real app, this might open a modal or redirect to a support page
    const report = {
      errorId: error.id,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      url: error.url,
      userAgent: error.userAgent
    };
    
    console.log('Error Report Generated:', report);
    toast.success('Error Report', {
      description: 'Error details copied to console. Please contact support.',
    });
  }

  private async reportToService(error: AppError): Promise<void> {
    try {
      // In a real application, send to error reporting service like Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Global error event listeners
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error || event.message, 'high', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(
    event.reason instanceof Error ? event.reason : String(event.reason),
    'high',
    { unhandledPromise: true }
  );
});

// Utility functions for common error patterns
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          errorHandler.handleError(error, 'medium', context);
          throw error; // Re-throw to allow caller to handle if needed
        });
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(error as Error, 'medium', context);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }) as T;
};

export const safeAsync = async <T>(
  promise: Promise<T>,
  context?: Record<string, any>
): Promise<[T | null, Error | null]> => {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    const errorId = errorHandler.handleError(error as Error, 'medium', context);
    return [null, error as Error];
  }
};