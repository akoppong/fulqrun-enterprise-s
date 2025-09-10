/**
 * Centralized error handling system for FulQrun CRM
 * 
 * This module provides:
 * - Standardized error types and interfaces
 * - Error boundary components
 * - Error logging and reporting utilities
 * - User-friendly error message formatting
 */

import { ErrorInfo } from 'react';
import { toast } from 'sonner';

/**
 * Application error types
 */
export type ApplicationErrorType = 
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'  
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'CLIENT_ERROR'
  | 'TIMEOUT_ERROR'
  | 'STORAGE_ERROR'
  | 'PARSING_ERROR'
  | 'BUSINESS_LOGIC_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Application error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Base application error interface
 */
export interface ApplicationError {
  id: string;
  type: ApplicationErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stackTrace?: string;
  originalError?: Error;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string; // User-friendly message
}

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  component?: string;
  function?: string;
  userId?: string;
  action?: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Error recovery action interface
 */
export interface ErrorRecoveryAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ApplicationError[] = [];
  private errorListeners: ((error: ApplicationError) => void)[] = [];

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Set up global error event listeners
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'Global',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        component: 'Global',
        action: 'unhandled_promise_rejection'
      });
    });
  }

  /**
   * Handle and process an error
   */
  handleError(
    error: Error | string | ApplicationError,
    context: ErrorContext = {},
    recoveryActions: ErrorRecoveryAction[] = []
  ): ApplicationError {
    const appError = this.createApplicationError(error, context);
    
    // Store error
    this.errors.push(appError);
    
    // Notify listeners
    this.errorListeners.forEach(listener => listener(appError));
    
    // Log error
    this.logError(appError);
    
    // Handle error display
    this.displayError(appError, recoveryActions);
    
    return appError;
  }

  /**
   * Create a standardized ApplicationError from various error types
   */
  private createApplicationError(
    error: Error | string | ApplicationError,
    context: ErrorContext
  ): ApplicationError {
    // If it's already an ApplicationError, return it
    if (this.isApplicationError(error)) {
      return {
        ...error,
        context: { ...error.context, ...context },
        timestamp: new Date().toISOString()
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = this.determineErrorType(error, errorMessage);
    const severity = this.determineSeverity(errorType);

    return {
      id: this.generateErrorId(),
      type: errorType,
      severity,
      message: errorMessage,
      context,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: error instanceof Error ? error.stack : undefined,
      originalError: error instanceof Error ? error : undefined,
      recoverable: this.isRecoverable(errorType),
      retryable: this.isRetryable(errorType),
      userMessage: this.generateUserMessage(errorType, errorMessage)
    };
  }

  /**
   * Check if an error is already an ApplicationError
   */
  private isApplicationError(error: any): error is ApplicationError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error;
  }

  /**
   * Determine error type from error content
   */
  private determineErrorType(error: Error | string, message: string): ApplicationErrorType {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (lowerMessage.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
      return 'AUTHENTICATION_ERROR';
    }
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
      return 'AUTHORIZATION_ERROR';
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return 'NOT_FOUND_ERROR';
    }
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (lowerMessage.includes('storage') || lowerMessage.includes('localstorage')) {
      return 'STORAGE_ERROR';
    }
    if (lowerMessage.includes('parse') || lowerMessage.includes('json')) {
      return 'PARSING_ERROR';
    }
    if (error instanceof Error && error.name === 'TypeError') {
      return 'CLIENT_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Determine error severity based on type
   */
  private determineSeverity(type: ApplicationErrorType): ErrorSeverity {
    switch (type) {
      case 'AUTHENTICATION_ERROR':
      case 'AUTHORIZATION_ERROR':
      case 'SERVER_ERROR':
        return 'critical';
      case 'NETWORK_ERROR':
      case 'TIMEOUT_ERROR':
      case 'STORAGE_ERROR':
        return 'high';
      case 'VALIDATION_ERROR':
      case 'NOT_FOUND_ERROR':
      case 'BUSINESS_LOGIC_ERROR':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Check if error type is recoverable
   */
  private isRecoverable(type: ApplicationErrorType): boolean {
    return [
      'VALIDATION_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'NOT_FOUND_ERROR'
    ].includes(type);
  }

  /**
   * Check if error type is retryable
   */
  private isRetryable(type: ApplicationErrorType): boolean {
    return [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR'
    ].includes(type);
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(type: ApplicationErrorType, originalMessage: string): string {
    switch (type) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Your session has expired. Please log in again.';
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND_ERROR':
        return 'The requested resource could not be found.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'STORAGE_ERROR':
        return 'Unable to save data. Please try again.';
      case 'SERVER_ERROR':
        return 'A server error occurred. Our team has been notified.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session ID
   */
  private getSessionId(): string {
    // Try to get session ID from various sources
    try {
      return sessionStorage.getItem('sessionId') || 
             localStorage.getItem('sessionId') || 
             `SESSION_${Date.now()}`;
    } catch {
      return `SESSION_${Date.now()}`;
    }
  }

  /**
   * Log error to console and external services
   */
  private logError(error: ApplicationError): void {
    // Console logging with appropriate level
    switch (error.severity) {
      case 'critical':
        console.error('CRITICAL ERROR:', error);
        break;
      case 'high':
        console.error('HIGH SEVERITY ERROR:', error);
        break;
      case 'medium':
        console.warn('MEDIUM SEVERITY ERROR:', error);
        break;
      default:
        console.log('LOW SEVERITY ERROR:', error);
    }

    // Send to external monitoring service (implement as needed)
    // this.sendToMonitoringService(error);
  }

  /**
   * Display error to user
   */
  private displayError(error: ApplicationError, recoveryActions: ErrorRecoveryAction[]): void {
    // Don't show toast for low severity errors unless they need user action
    if (error.severity === 'low' && recoveryActions.length === 0) {
      return;
    }

    // Use appropriate toast type based on severity
    switch (error.severity) {
      case 'critical':
      case 'high':
        toast.error(error.userMessage, {
          duration: 0, // Don't auto-dismiss critical errors
          action: recoveryActions.length > 0 ? {
            label: recoveryActions[0].label,
            onClick: recoveryActions[0].action
          } : undefined
        });
        break;
      case 'medium':
        toast.error(error.userMessage, {
          duration: 8000
        });
        break;
      default:
        toast.warning(error.userMessage, {
          duration: 5000
        });
    }
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: ApplicationError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener: (error: ApplicationError) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Get all errors
   */
  getErrors(): ApplicationError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ApplicationError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get recent errors (last hour)
   */
  getRecentErrors(): ApplicationError[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.errors.filter(error => new Date(error.timestamp) > oneHourAgo);
  }
}

/**
 * Convenience function to handle errors
 */
export function handleError(
  error: Error | string | ApplicationError,
  context: ErrorContext = {},
  recoveryActions: ErrorRecoveryAction[] = []
): ApplicationError {
  return ErrorHandler.getInstance().handleError(error, context, recoveryActions);
}

/**
 * Convenience function to handle async errors
 */
export async function handleAsyncError<T>(
  asyncOperation: () => Promise<T>,
  context: ErrorContext = {},
  recoveryActions: ErrorRecoveryAction[] = []
): Promise<T | null> {
  try {
    return await asyncOperation();
  } catch (error) {
    handleError(error as Error, context, recoveryActions);
    return null;
  }
}

/**
 * Error boundary hook for React components
 */
export function useErrorHandler() {
  return (error: Error | string, context: ErrorContext = {}) => {
    return handleError(error, context);
  };
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();