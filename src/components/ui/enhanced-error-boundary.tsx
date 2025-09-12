/**
 * Enhanced Error Boundary with Advanced Recovery Mechanisms
 * 
 * Features:
 * - Automatic retry strategies
 * - Error categorization and severity assessment
 * - Component-specific error handling
 * - Performance monitoring integration
 * - User-friendly error reporting
 * - Development vs production error displays
 */

import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import { 
  Warning, 
  ArrowClockwise, 
  Bug, 
  Clock, 
  Info,
  ShieldCheck,
  Wrench
} from '@phosphor-icons/react';
import { errorHandler, type ErrorSeverity } from '@/lib/error-handling';
import { toast } from 'sonner';

// Safe JSON stringify that handles circular references
function safeStringify(obj: any, maxDepth: number = 3): string {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: any, depth = 0): any => {
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }
    
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    if (seen.has(value)) {
      return '[Circular Reference]';
    }
    
    seen.add(value);
    
    // Handle functions
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    // Handle React elements and other complex objects
    if (value.$$typeof || value._owner || value.props) {
      return '[React Element]';
    }
    
    // Recursively process objects and arrays
    if (Array.isArray(value)) {
      return value.map((item, index) => replacer(`${index}`, item, depth + 1));
    }
    
    const result: any = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = replacer(k, v, depth + 1);
    }
    return result;
  };
  
  try {
    return JSON.stringify(replacer('', obj));
  } catch (error) {
    return '[Stringify Error]';
  }
}

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  severity: ErrorSeverity;
  errorCategory: string;
  lastErrorTime: number;
  canRetry: boolean;
  isRecovering: boolean;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  context?: string;
  maxRetries?: number;
  retryDelay?: number;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  isolateComponent?: boolean;
  monitorPerformance?: boolean;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private lastProps: string = '';

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      severity: 'medium',
      errorCategory: 'unknown',
      lastErrorTime: 0,
      canRetry: true,
      isRecovering: false,
    };

    this.lastProps = safeStringify(props);
  }

  componentDidMount() {
    if (this.props.monitorPerformance && typeof window !== 'undefined') {
      this.setupPerformanceMonitoring();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps) {
    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange) {
      const currentProps = safeStringify(this.props);
      if (currentProps !== this.lastProps && this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: null,
          retryCount: 0,
          isRecovering: false,
        });
      }
      this.lastProps = currentProps;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const now = Date.now();
    const severity = EnhancedErrorBoundary.categorizeErrorSeverity(error);
    const category = EnhancedErrorBoundary.categorizeError(error);
    
    return {
      hasError: true,
      error,
      lastErrorTime: now,
      severity,
      errorCategory: category,
      canRetry: EnhancedErrorBoundary.canErrorBeRetried(error, category),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store error information
    this.setState({
      errorInfo,
      errorId,
    });

    // Report to error handler
    const appError = errorHandler.handleError(error, {
      context: this.props.context || 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundaryStack: errorInfo.errorBoundaryStack,
      retryCount: this.state.retryCount,
      errorCategory: this.state.errorCategory,
    }, this.state.severity);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  private static categorizeErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors that break the entire component
    if (
      message.includes('chunk') ||
      message.includes('network') ||
      message.includes('script error') ||
      stack.includes('invariant violation')
    ) {
      return 'critical';
    }

    // High severity errors that impact functionality
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      stack.includes('invariant')
    ) {
      return 'high';
    }

    // Medium severity for most render errors
    if (
      message.includes('render') ||
      message.includes('props') ||
      message.includes('state')
    ) {
      return 'medium';
    }

    return 'medium';
  }

  private static categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('chunk') || message.includes('loading')) return 'chunk-loading';
    if (message.includes('network') || name.includes('networkerror')) return 'network';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('permission') || message.includes('unauthorized')) return 'permission';
    if (message.includes('syntax') || name.includes('syntaxerror')) return 'syntax';
    if (message.includes('reference') || name.includes('referenceerror')) return 'reference';
    if (message.includes('type') || name.includes('typeerror')) return 'type';
    if (message.includes('range') || name.includes('rangeerror')) return 'range';
    if (message.includes('invariant')) return 'react-invariant';
    if (message.includes('hydrat')) return 'hydration';
    
    return 'general';
  }

  private static canErrorBeRetried(error: Error, category: string): boolean {
    // Don't retry syntax errors, type errors, or invariant violations
    const nonRetryableCategories = ['syntax', 'type', 'reference', 'react-invariant'];
    if (nonRetryableCategories.includes(category)) {
      return false;
    }

    // Don't retry permission errors
    if (category === 'permission') {
      return false;
    }

    return true;
  }

  private shouldAutoRetry(error: Error): boolean {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    const { retryCount, errorCategory, lastErrorTime } = this.state;

    // Don't auto-retry if we've exceeded max attempts
    if (retryCount >= maxRetries) {
      return false;
    }

    // Don't retry too frequently
    const timeSinceLastError = Date.now() - lastErrorTime;
    if (timeSinceLastError < retryDelay / 2) {
      return false;
    }

    // Only auto-retry for certain error types
    const autoRetryableCategories = ['chunk-loading', 'network', 'timeout'];
    return autoRetryableCategories.includes(errorCategory);
  }

  private scheduleRetry = () => {
    const { retryDelay = 2000 } = this.props;
    const delay = retryDelay * Math.pow(2, this.state.retryCount); // Exponential backoff

    this.setState({ isRecovering: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount <= maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: newRetryCount,
        isRecovering: false,
      });

      toast.info('Retrying...', {
        description: `Attempting to recover (attempt ${newRetryCount}/${maxRetries})`,
        duration: 2000,
      });
    } else {
      this.setState({
        canRetry: false,
        isRecovering: false,
      });
      
      toast.error('Recovery failed', {
        description: 'Maximum retry attempts reached. Please refresh the page.',
        duration: 5000,
      });
    }
  };

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'measure' && entry.duration > 100) {
            console.warn(`Slow component performance detected: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  private getErrorIcon() {
    switch (this.state.severity) {
      case 'critical':
        return <Bug className="w-5 h-5 text-red-500" />;
      case 'high':
        return <Warning className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'low':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      default:
        return <Warning className="w-5 h-5" />;
    }
  }

  private getSeverityColor() {
    switch (this.state.severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'secondary';
    }
  }

  private renderDevelopmentError() {
    const { error, errorInfo, errorId, errorCategory, severity } = this.state;
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Alert variant="destructive">
            <Bug className="w-4 h-4" />
            <AlertTitle className="flex items-center gap-2">
              Development Error Detected
              <Badge variant={this.getSeverityColor() as any}>
                {severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              An error occurred in the {this.props.context || 'component'}. 
              This detailed view is only shown in development mode.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Error Details
                  <Badge variant="outline">{errorCategory}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded border">
                    {error?.message}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Error ID</Label>
                  <p className="text-xs font-mono text-muted-foreground">{errorId}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Context</Label>
                  <p className="text-sm">{this.props.context || 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stack Trace</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {error?.stack}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {errorInfo && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Component Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                      {errorInfo.componentStack}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={this.handleRetry} disabled={!this.state.canRetry}>
              <ArrowClockwise className="w-4 h-4 mr-2" />
              Retry Component
            </Button>
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <ArrowClockwise className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private renderProductionError() {
    const { error, severity, canRetry, isRecovering } = this.state;
    
    return (
      <div className="min-h-[300px] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            {this.getErrorIcon()}
          </div>
          
          <Alert variant={severity === 'critical' || severity === 'high' ? 'destructive' : 'default'} className="mb-6">
            <AlertTitle className="flex items-center justify-center gap-2">
              Something went wrong
              <Badge variant={this.getSeverityColor() as any}>
                {severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {severity === 'critical' 
                ? "A critical error occurred. Please refresh the page."
                : severity === 'high'
                ? "An error occurred that may impact functionality."
                : "A minor issue was detected."
              }
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {canRetry && (
              <Button 
                onClick={this.handleRetry} 
                disabled={isRecovering}
                className="w-full"
              >
                {isRecovering ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <ArrowClockwise className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <ArrowClockwise className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          {this.state.retryCount > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Retry attempts: {this.state.retryCount}/{this.props.maxRetries || 3}
            </p>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Development vs production error display
      if (this.props.showErrorDetails || process.env.NODE_ENV === 'development') {
        return this.renderDevelopmentError();
      } else {
        return this.renderProductionError();
      }
    }

    return this.props.children;
  }
}

// Convenience wrapper for React components
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  context?: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

function Label({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: any }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<EnhancedErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...options}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default EnhancedErrorBoundary;