import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Warning, RefreshCw, Bug, Copy } from '@phosphor-icons/react';
import { errorHandler } from '@/lib/error-handling';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class FormErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error using our error handling system
    const errorId = errorHandler.handleError(error, 'high', {
      ...errorInfo,
      context: this.props.context || 'FormErrorBoundary',
      retryCount: this.state.retryCount
    });

    this.setState({
      errorInfo,
      errorId,
      retryCount: this.state.retryCount + 1
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Auto-retry once after 3 seconds for certain errors
    if (this.state.retryCount === 0 && this.shouldAutoRetry(error)) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, 3000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (if enabled)
    if (this.props.resetOnPropsChange && 
        this.state.hasError && 
        prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private shouldAutoRetry = (error: Error): boolean => {
    // Auto-retry for certain types of errors
    const retryableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Network error',
      'Failed to fetch'
    ];
    
    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        toast.success('Error details copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy error details');
      });
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    if (!this.state.error) return 'medium';
    
    const error = this.state.error;
    
    // High severity errors
    if (error.name === 'ChunkLoadError' || 
        error.message.includes('Loading chunk')) {
      return 'high';
    }
    
    // Medium severity for most form errors
    return 'medium';
  };

  private getErrorTitle = (): string => {
    const severity = this.getErrorSeverity();
    
    switch (severity) {
      case 'high':
        return 'Application Error';
      case 'medium':
        return 'Form Error';
      default:
        return 'Something went wrong';
    }
  };

  private getErrorMessage = (): string => {
    if (!this.state.error) return 'An unexpected error occurred';
    
    const error = this.state.error;
    
    // Provide user-friendly messages for common errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'There was a problem loading part of the application. This usually happens after an update.';
    }
    
    if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('Validation')) {
      return 'There was a problem validating the form data. Please check your inputs and try again.';
    }
    
    // Fallback to original error message for development
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
    
    return 'An unexpected error occurred while processing the form.';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity();
      const title = this.getErrorTitle();
      const message = this.getErrorMessage();

      return (
        <div className="p-6 space-y-4">
          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {title}
              <Badge variant="destructive">
                {severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {message}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Error Recovery Options
              </CardTitle>
              <CardDescription>
                Try one of these options to resolve the issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                {this.props.showErrorDetails && (
                  <Button variant="outline" onClick={this.copyErrorDetails} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Error Details
                  </Button>
                )}
              </div>

              {this.state.errorId && (
                <div className="text-sm text-muted-foreground">
                  Error ID: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                </div>
              )}

              {this.props.showErrorDetails && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <strong>Error:</strong> {this.state.error.name}
                      </div>
                      <div>
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <FormErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </FormErrorBoundary>
    );
  };
}

// Hook for triggering error boundary from within components
export function useErrorBoundary() {
  return {
    captureError: (error: Error, context?: string) => {
      errorHandler.handleError(error, 'high', { context });
      // Re-throw to trigger error boundary
      throw error;
    }
  };
}