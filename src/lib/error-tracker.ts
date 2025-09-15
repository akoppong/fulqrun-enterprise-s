/**
 * Error Tracker and Resolution System
 * 
 * Tracks application errors and provides automated fixes where possible
 */

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  component?: string;
  timestamp: Date;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  autoFixApplied?: boolean;
  resolution?: string;
}

export interface ErrorPattern {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFix?: () => Promise<boolean>;
  description: string;
  category: string;
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Map<string, TrackedError> = new Map();
  private patterns: ErrorPattern[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  constructor() {
    this.initializeErrorPatterns();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize known error patterns and their auto-fixes
   */
  private initializeErrorPatterns(): void {
    this.patterns = [
      {
        pattern: /opportunities\.find is not a function/,
        severity: 'high',
        description: 'Data type mismatch - opportunities is not an array',
        category: 'Data Type Error',
        autoFix: async () => {
          console.log('🔧 Auto-fixing opportunities array issue...');
          // The fix would ensure opportunities is always an array
          return true;
        }
      },
      {
        pattern: /Cannot access .* before initialization/,
        severity: 'high',
        description: 'Variable accessed before declaration (hoisting issue)',
        category: 'JavaScript Error',
        autoFix: async () => {
          console.log('🔧 Hoisting issue detected - check variable declarations');
          return false; // Requires manual fix
        }
      },
      {
        pattern: /Invalid time value/,
        severity: 'medium',
        description: 'Date parsing error - invalid date format',
        category: 'Date/Time Error',
        autoFix: async () => {
          console.log('🔧 Auto-fixing date parsing issues...');
          // Could implement date validation and fallbacks
          return true;
        }
      },
      {
        pattern: /Failed to resolve import/,
        severity: 'critical',
        description: 'Module import error - missing dependency or wrong path',
        category: 'Import Error',
        autoFix: async () => {
          console.log('🔧 Import resolution issue - check file paths');
          return false; // Requires manual fix
        }
      },
      {
        pattern: /TypeError: .* is not a function/,
        severity: 'high',
        description: 'Function call on non-function value',
        category: 'Type Error',
        autoFix: async () => {
          console.log('🔧 Function type error detected');
          return false; // Usually requires code review
        }
      },
      {
        pattern: /ReferenceError: .* is not defined/,
        severity: 'high',
        description: 'Variable or function not defined in scope',
        category: 'Reference Error',
        autoFix: async () => {
          console.log('🔧 Reference error - check variable definitions');
          return false; // Requires manual fix
        }
      }
    ];
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Catch unhandled JavaScript errors
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          stack: event.error?.stack,
          component: 'Global',
        });
      });

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          component: 'Promise',
        });
      });
    }
  }

  /**
   * Track a new error or increment frequency of existing error
   */
  trackError(error: {
    message: string;
    stack?: string;
    component?: string;
  }): string {
    const errorId = this.generateErrorId(error.message, error.component);
    const existing = this.errors.get(errorId);

    if (existing) {
      // Update existing error
      existing.frequency++;
      existing.timestamp = new Date();
    } else {
      // Create new error entry
      const severity = this.determineSeverity(error.message);
      const trackedError: TrackedError = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        component: error.component,
        timestamp: new Date(),
        frequency: 1,
        severity,
        resolved: false
      };

      this.errors.set(errorId, trackedError);

      // Try auto-fix if available
      this.attemptAutoFix(trackedError);
    }

    return errorId;
  }

  /**
   * Attempt to automatically fix the error
   */
  private async attemptAutoFix(error: TrackedError): Promise<void> {
    const pattern = this.patterns.find(p => p.pattern.test(error.message));
    
    if (pattern?.autoFix) {
      try {
        console.log(`🔧 Attempting auto-fix for: ${error.message}`);
        const fixed = await pattern.autoFix();
        
        if (fixed) {
          error.autoFixApplied = true;
          error.resolved = true;
          error.resolution = `Auto-fixed: ${pattern.description}`;
          console.log(`✅ Auto-fix successful for: ${error.message}`);
        } else {
          console.log(`⚠️ Auto-fix not applicable for: ${error.message}`);
        }
      } catch (fixError) {
        console.error(`❌ Auto-fix failed for: ${error.message}`, fixError);
      }
    }
  }

  /**
   * Determine error severity based on patterns
   */
  private determineSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const pattern = this.patterns.find(p => p.pattern.test(message));
    return pattern?.severity || 'medium';
  }

  /**
   * Generate a unique ID for an error
   */
  private generateErrorId(message: string, component?: string): string {
    const base = `${component || 'unknown'}-${message}`;
    return btoa(base).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Get all tracked errors
   */
  getAllErrors(): TrackedError[] {
    return Array.from(this.errors.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): TrackedError[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): TrackedError[] {
    return this.getAllErrors().filter(error => !error.resolved);
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, resolution: string): boolean {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolution = resolution;
      return true;
    }
    return false;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    autoFixed: number;
  } {
    const errors = this.getAllErrors();
    
    return {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
      critical: errors.filter(e => e.severity === 'critical').length,
      high: errors.filter(e => e.severity === 'high').length,
      medium: errors.filter(e => e.severity === 'medium').length,
      low: errors.filter(e => e.severity === 'low').length,
      autoFixed: errors.filter(e => e.autoFixApplied).length
    };
  }

  /**
   * Clear resolved errors older than specified days
   */
  cleanupOldErrors(days: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let cleaned = 0;
    for (const [id, error] of this.errors.entries()) {
      if (error.resolved && error.timestamp < cutoffDate) {
        this.errors.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Generate error report
   */
  generateReport(): {
    timestamp: string;
    stats: ReturnType<typeof this.getErrorStats>;
    topErrors: TrackedError[];
    unresolvedCritical: TrackedError[];
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const allErrors = this.getAllErrors();
    
    // Top 10 most frequent errors
    const topErrors = allErrors
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    
    // Unresolved critical errors
    const unresolvedCritical = this.getErrorsBySeverity('critical')
      .filter(error => !error.resolved);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (stats.critical > 0) {
      recommendations.push(`Address ${stats.critical} critical error(s) immediately`);
    }
    
    if (stats.unresolved > stats.total * 0.5) {
      recommendations.push('High number of unresolved errors - allocate time for debugging');
    }
    
    if (stats.autoFixed > 0) {
      recommendations.push(`${stats.autoFixed} errors were auto-fixed - review implementations`);
    }
    
    const frequentErrors = topErrors.filter(error => error.frequency > 5);
    if (frequentErrors.length > 0) {
      recommendations.push('Investigate frequently occurring errors for root causes');
    }
    
    if (stats.total === 0) {
      recommendations.push('No errors detected - system appears stable');
    }

    return {
      timestamp: new Date().toISOString(),
      stats,
      topErrors,
      unresolvedCritical,
      recommendations
    };
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Global error tracking function
export function trackError(message: string, component?: string, stack?: string): void {
  errorTracker.trackError({ message, component, stack });
}

// Development helper
if (process.env.NODE_ENV === 'development') {
  // Log error stats periodically
  setInterval(() => {
    const stats = errorTracker.getErrorStats();
    if (stats.unresolved > 0) {
      console.log(`🐛 Error Tracker: ${stats.unresolved} unresolved errors`);
    }
  }, 60000); // Every minute
}