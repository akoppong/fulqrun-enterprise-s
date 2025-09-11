import React from 'react';

/**
 * Global error handlers for responsive design system
 * Handles ResizeObserver and other common errors gracefully
 */

export class ErrorHandler {
  private static instance: ErrorHandler;
  private suppressedErrors = new Set<string>();
  private errorCounts = new Map<string, number>();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle ResizeObserver loop errors
    window.addEventListener('error', (event) => {
      if (this.isResizeObserverError(event.error)) {
        // Suppress ResizeObserver loop errors as they're benign
        event.preventDefault();
        return false;
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isResizeObserverError(event.reason)) {
        event.preventDefault();
        return false;
      }
    });
  }

  private isResizeObserverError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message || error.toString();
    return message.includes('ResizeObserver loop completed with undelivered notifications') ||
           message.includes('ResizeObserver loop limit exceeded');
  }

  public suppressError(errorPattern: string): void {
    this.suppressedErrors.add(errorPattern);
  }

  public unsuppressError(errorPattern: string): void {
    this.suppressedErrors.delete(errorPattern);
  }

  public shouldSuppressError(error: Error): boolean {
    const message = error.message;
    
    // Always suppress ResizeObserver loop errors
    if (this.isResizeObserverError(error)) {
      return true;
    }

    // Check custom suppression patterns
    for (const pattern of this.suppressedErrors) {
      if (message.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  public trackError(error: Error): void {
    const key = error.message;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);

    // Log only if error count is reasonable to avoid spam
    if (count < 5) {
      console.warn('Tracked error:', error.message);
    }
  }

  public getErrorStats(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  public clearErrorStats(): void {
    this.errorCounts.clear();
  }
}

/**
 * Wrapper for ResizeObserver that handles errors gracefully
 */
export class SafeResizeObserver {
  private observer: ResizeObserver | null = null;
  private callback: ResizeObserverCallback;
  private errorHandler = ErrorHandler.getInstance();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      return;
    }

    this.observer = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to prevent loops
      requestAnimationFrame(() => {
        try {
          this.callback(entries, this.observer!);
        } catch (error) {
          if (error instanceof Error && !this.errorHandler.shouldSuppressError(error)) {
            this.errorHandler.trackError(error);
          }
        }
      });
    });
  }

  public observe(target: Element, options?: ResizeObserverOptions): void {
    try {
      this.observer?.observe(target, options);
    } catch (error) {
      if (error instanceof Error) {
        this.errorHandler.trackError(error);
      }
    }
  }

  public unobserve(target: Element): void {
    try {
      this.observer?.unobserve(target);
    } catch (error) {
      if (error instanceof Error) {
        this.errorHandler.trackError(error);
      }
    }
  }

  public disconnect(): void {
    try {
      this.observer?.disconnect();
    } catch (error) {
      if (error instanceof Error) {
        this.errorHandler.trackError(error);
      }
    }
  }
}

/**
 * Hook for safe ResizeObserver usage in React components
 */
export function useSafeResizeObserver(
  callback: ResizeObserverCallback,
  deps: React.DependencyList = []
): SafeResizeObserver | null {
  const [observer, setObserver] = React.useState<SafeResizeObserver | null>(null);

  React.useEffect(() => {
    const safeObserver = new SafeResizeObserver(callback);
    setObserver(safeObserver);

    return () => {
      safeObserver.disconnect();
    };
  }, deps);

  return observer;
}

// Initialize the global error handler
if (typeof window !== 'undefined') {
  ErrorHandler.getInstance();
}

export default ErrorHandler;