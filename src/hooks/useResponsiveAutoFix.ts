import { useEffect, useState, useCallback } from 'react';
import { 
  ResponsiveAutoFix, 
  ResponsiveValidator, 
  ResponsiveIssue, 
  ResponsiveMetrics, 
  ViewportInfo 
} from '@/lib/responsive-auto-fix';

export interface UseResponsiveAutoFixOptions {
  enabled?: boolean;
  autoFixCritical?: boolean;
  autoFixHigh?: boolean;
  watchForChanges?: boolean;
  performanceMode?: boolean;
}

export interface ResponsiveState {
  viewport: ViewportInfo;
  metrics: ResponsiveMetrics | null;
  issues: ResponsiveIssue[];
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
}

export function useResponsiveAutoFix(options: UseResponsiveAutoFixOptions = {}) {
  const {
    enabled = true,
    autoFixCritical = true,
    autoFixHigh = false,
    watchForChanges = true,
    performanceMode = false
  } = options;

  const [state, setState] = useState<ResponsiveState>({
    viewport: {
      width: 0,
      height: 0,
      aspectRatio: 1,
      orientation: 'landscape',
      deviceType: 'desktop',
      pixelRatio: 1
    },
    metrics: null,
    issues: [],
    isAnalyzing: false,
    lastAnalysis: null
  });

  const autoFix = ResponsiveAutoFix.getInstance();

  // Update viewport info
  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const viewport = autoFix.getViewportInfo();
    setState(prev => ({ ...prev, viewport }));
  }, [autoFix]);

  // Perform full analysis
  const analyzeResponsiveness = useCallback(async (): Promise<ResponsiveMetrics> => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      // Add small delay in performance mode to avoid blocking UI
      if (performanceMode) {
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      
      const metrics = autoFix.performFullAnalysis();
      const issues = autoFix.getIssues();
      
      setState(prev => ({
        ...prev,
        metrics,
        issues,
        isAnalyzing: false,
        lastAnalysis: new Date()
      }));
      
      // Auto-fix critical and high priority issues if enabled
      if (autoFixCritical) {
        autoFix.autoFixBySeverity('critical');
      }
      
      if (autoFixHigh) {
        autoFix.autoFixBySeverity('high');
      }
      
      return metrics;
    } catch (error) {
      console.error('Responsive analysis failed:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      throw error;
    }
  }, [autoFix, autoFixCritical, autoFixHigh, performanceMode]);

  // Auto-fix specific issue types
  const autoFixByType = useCallback((type: ResponsiveIssue['type']): number => {
    return autoFix.autoFixByType(type);
  }, [autoFix]);

  // Auto-fix specific severity levels
  const autoFixBySeverity = useCallback((severity: ResponsiveIssue['severity']): number => {
    return autoFix.autoFixBySeverity(severity);
  }, [autoFix]);

  // Auto-fix all issues
  const autoFixAll = useCallback((): number => {
    return autoFix.autoFixAll();
  }, [autoFix]);

  // Get filtered issues
  const getIssuesByType = useCallback((type: ResponsiveIssue['type']): ResponsiveIssue[] => {
    return state.issues.filter(issue => issue.type === type);
  }, [state.issues]);

  const getIssuesBySeverity = useCallback((severity: ResponsiveIssue['severity']): ResponsiveIssue[] => {
    return state.issues.filter(issue => issue.severity === severity);
  }, [state.issues]);

  // Generate comprehensive report
  const generateReport = useCallback(() => {
    return ResponsiveValidator.generateResponsiveReport();
  }, []);

  // Validate breakpoints
  const validateBreakpoints = useCallback((): boolean => {
    return ResponsiveValidator.validateBreakpoints();
  }, []);

  // Setup effects
  useEffect(() => {
    if (!enabled) {
      autoFix.disable();
      return;
    }

    autoFix.enable();
    updateViewport();

    // Initial analysis
    analyzeResponsiveness();

    // Setup listeners
    const handleIssuesUpdate = (issues: ResponsiveIssue[]) => {
      setState(prev => ({ ...prev, issues }));
    };

    autoFix.addListener(handleIssuesUpdate);

    // Setup viewport listeners
    const handleResize = () => {
      updateViewport();
      if (watchForChanges && !performanceMode) {
        analyzeResponsiveness();
      }
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        updateViewport();
        if (watchForChanges) {
          analyzeResponsiveness();
        }
      }, 500);
    };

    if (watchForChanges) {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    return () => {
      autoFix.removeListener(handleIssuesUpdate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [enabled, watchForChanges, performanceMode, autoFix, updateViewport, analyzeResponsiveness]);

  return {
    // State
    viewport: state.viewport,
    metrics: state.metrics,
    issues: state.issues,
    isAnalyzing: state.isAnalyzing,
    lastAnalysis: state.lastAnalysis,
    
    // Actions
    analyzeResponsiveness,
    autoFixAll,
    autoFixByType,
    autoFixBySeverity,
    
    // Queries
    getIssuesByType,
    getIssuesBySeverity,
    
    // Utilities
    generateReport,
    validateBreakpoints,
    
    // Stats
    stats: {
      totalIssues: state.issues.length,
      criticalIssues: state.issues.filter(i => i.severity === 'critical').length,
      highIssues: state.issues.filter(i => i.severity === 'high').length,
      autoFixableIssues: state.issues.filter(i => i.autoFixAvailable).length,
      overflowIssues: state.issues.filter(i => i.type === 'overflow').length,
      touchIssues: state.issues.filter(i => i.type === 'touch').length,
      accessibilityIssues: state.issues.filter(i => i.type === 'accessibility').length
    }
  };
}

// Specialized hooks for specific use cases

export function useResponsiveTableFix() {
  const autoFix = useResponsiveAutoFix({
    enabled: true,
    autoFixCritical: true,
    autoFixHigh: true,
    performanceMode: true
  });

  const fixTableOverflow = useCallback((tableContainer: HTMLElement) => {
    // Apply responsive table fixes
    tableContainer.style.overflowX = 'auto';
    tableContainer.style.maxWidth = '100%';
    
    const table = tableContainer.querySelector('table');
    if (table) {
      table.style.minWidth = 'max-content';
      table.style.width = '100%';
    }
  }, []);

  const fixTableColumns = useCallback((table: HTMLElement) => {
    const viewport = autoFix.viewport;
    const headers = table.querySelectorAll('th');
    
    if (viewport.deviceType === 'mobile' && headers.length > 4) {
      // Hide less important columns on mobile
      headers.forEach((header, index) => {
        if (index > 3) {
          (header as HTMLElement).style.display = 'none';
          const columnCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
          columnCells.forEach(cell => {
            (cell as HTMLElement).style.display = 'none';
          });
        }
      });
    }
  }, [autoFix.viewport]);

  return {
    ...autoFix,
    fixTableOverflow,
    fixTableColumns
  };
}

export function useResponsiveFormFix() {
  const autoFix = useResponsiveAutoFix({
    enabled: true,
    autoFixCritical: true,
    performanceMode: true
  });

  const fixFormLayout = useCallback((form: HTMLElement) => {
    const viewport = autoFix.viewport;
    
    // Convert multi-column forms to single column on mobile
    if (viewport.deviceType === 'mobile') {
      const gridElements = form.querySelectorAll('[class*="grid-cols-"]');
      gridElements.forEach(element => {
        (element as HTMLElement).style.gridTemplateColumns = '1fr';
      });
    }
    
    // Ensure form inputs are touch-friendly
    const inputs = form.querySelectorAll('input, textarea, select, button');
    inputs.forEach(input => {
      const element = input as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      if (rect.height < 44) {
        element.style.minHeight = '44px';
      }
    });
  }, [autoFix.viewport]);

  const fixFieldSpacing = useCallback((form: HTMLElement) => {
    const viewport = autoFix.viewport;
    const spacing = viewport.deviceType === 'mobile' ? '1rem' : '1.5rem';
    
    const fields = form.querySelectorAll('.form-field, .field-group');
    fields.forEach(field => {
      (field as HTMLElement).style.marginBottom = spacing;
    });
  }, [autoFix.viewport]);

  return {
    ...autoFix,
    fixFormLayout,
    fixFieldSpacing
  };
}

export function useResponsiveModalFix() {
  const autoFix = useResponsiveAutoFix({
    enabled: true,
    autoFixCritical: true,
    autoFixHigh: true
  });

  const fixModalSize = useCallback((modal: HTMLElement) => {
    const viewport = autoFix.viewport;
    
    if (viewport.deviceType === 'mobile') {
      // Full-screen modals on mobile
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.maxWidth = 'none';
      modal.style.maxHeight = 'none';
      modal.style.margin = '0';
      modal.style.borderRadius = '0';
    } else {
      // Responsive sizing for larger screens
      modal.style.width = 'min(90vw, 800px)';
      modal.style.maxHeight = '90vh';
      modal.style.margin = 'auto';
    }
  }, [autoFix.viewport]);

  const fixModalContent = useCallback((modal: HTMLElement) => {
    const content = modal.querySelector('[data-radix-dialog-content]') as HTMLElement;
    if (content) {
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.maxHeight = '100%';
      
      const scrollableArea = content.querySelector('.scroll-area, [data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollableArea) {
        scrollableArea.style.flex = '1';
        scrollableArea.style.minHeight = '0';
      }
    }
  }, []);

  return {
    ...autoFix,
    fixModalSize,
    fixModalContent
  };
}