/**
 * React Hook for Responsive Auto-Fix
 * Provides reactive state management for auto-fix operations
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  responsiveAutoFixer, 
  AutoFixSession, 
  AutoFixRule, 
  AutoFixResult,
  type AutoFixIssue 
} from '@/lib/responsive-auto-fix';
import { responsiveValidator } from '@/lib/responsive-validator';

export interface UseResponsiveAutoFixOptions {
  autoRun?: boolean;
  categories?: AutoFixRule['category'][];
  priorities?: AutoFixRule['priority'][];
  dryRun?: boolean;
  onSuccess?: (session: AutoFixSession) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface ResponsiveAutoFixState {
  isRunning: boolean;
  currentSession: AutoFixSession | null;
  sessions: AutoFixSession[];
  progress: number;
  lastError: Error | null;
  validationResults: any;
}

export const useResponsiveAutoFix = (options: UseResponsiveAutoFixOptions = {}) => {
  const [state, setState] = useState<ResponsiveAutoFixState>({
    isRunning: false,
    currentSession: null,
    sessions: [],
    progress: 0,
    lastError: null,
    validationResults: null
  });

  // Load initial data
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-run if specified
  useEffect(() => {
    if (options.autoRun && !state.isRunning && state.sessions.length === 0) {
      runAutoFix();
    }
  }, [options.autoRun]);

  const loadSessions = useCallback(() => {
    try {
      const sessions = responsiveAutoFixer.getSessionHistory();
      setState(prev => ({ ...prev, sessions }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  const runAutoFix = useCallback(async (overrideOptions: Partial<UseResponsiveAutoFixOptions> = {}) => {
    if (state.isRunning) return;

    const mergedOptions = { ...options, ...overrideOptions };
    
    setState(prev => ({ 
      ...prev, 
      isRunning: true, 
      progress: 0, 
      lastError: null 
    }));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90)
        }));
        
        if (mergedOptions.onProgress) {
          mergedOptions.onProgress(Math.min(state.progress + 20, 90));
        }
      }, 300);

      const session = await responsiveAutoFixer.runAutoFix({
        categories: mergedOptions.categories,
        priorities: mergedOptions.priorities,
        dryRun: mergedOptions.dryRun ?? true
      });

      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        currentSession: session,
        progress: 100,
        isRunning: false
      }));

      // Validate results if fixes were applied
      if (!mergedOptions.dryRun && session.totalIssuesFixed > 0) {
        try {
          const validation = await responsiveAutoFixer.validateFixes(session.id);
          setState(prev => ({ ...prev, validationResults: validation }));
        } catch (validationError) {
          console.warn('Validation failed:', validationError);
        }
      }

      loadSessions();

      if (mergedOptions.onSuccess) {
        mergedOptions.onSuccess(session);
      }

      if (mergedOptions.onProgress) {
        mergedOptions.onProgress(100);
      }

      // Reset progress after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 2000);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        lastError: err,
        progress: 0
      }));

      if (mergedOptions.onError) {
        mergedOptions.onError(err);
      }
    }
  }, [state.isRunning, state.progress, options, loadSessions]);

  const runResponsiveAutoFix = useCallback(async (overrideOptions: Partial<UseResponsiveAutoFixOptions> = {}) => {
    if (state.isRunning) return;

    const mergedOptions = { ...options, ...overrideOptions };
    
    setState(prev => ({ 
      ...prev, 
      isRunning: true, 
      progress: 0, 
      lastError: null 
    }));

    try {
      const sessions = await responsiveAutoFixer.runResponsiveAutoFix({
        dryRun: mergedOptions.dryRun ?? true
      });

      const firstSession = Array.from(sessions.values())[0];
      
      setState(prev => ({
        ...prev,
        currentSession: firstSession,
        progress: 100,
        isRunning: false
      }));

      loadSessions();

      if (mergedOptions.onSuccess && firstSession) {
        mergedOptions.onSuccess(firstSession);
      }

      // Reset progress after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 2000);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        lastError: err,
        progress: 0
      }));

      if (mergedOptions.onError) {
        mergedOptions.onError(err);
      }
    }
  }, [state.isRunning, options, loadSessions]);

  const runAutoFixOnElement = useCallback(async (
    element: Element, 
    overrideOptions: Partial<UseResponsiveAutoFixOptions> = {}
  ): Promise<AutoFixResult[]> => {
    const mergedOptions = { ...options, ...overrideOptions };
    
    try {
      const results = await responsiveAutoFixer.runAutoFixOnElement(element, {
        categories: mergedOptions.categories,
        priorities: mergedOptions.priorities,
        dryRun: mergedOptions.dryRun ?? true
      });

      return results;
    } catch (error) {
      console.error('Failed to run auto-fix on element:', error);
      return [];
    }
  }, [options]);

  const clearHistory = useCallback(() => {
    responsiveAutoFixer.clearHistory();
    setState(prev => ({ 
      ...prev, 
      sessions: [], 
      currentSession: null,
      validationResults: null 
    }));
  }, []);

  const getSession = useCallback((sessionId: string) => {
    return responsiveAutoFixer.getSession(sessionId);
  }, []);

  const getRules = useCallback((filters?: {
    categories?: AutoFixRule['category'][];
    priorities?: AutoFixRule['priority'][];
  }) => {
    const allRules = responsiveAutoFixer.getRules();
    
    if (!filters) return allRules;

    return allRules.filter(rule => {
      if (filters.categories && !filters.categories.includes(rule.category)) return false;
      if (filters.priorities && !filters.priorities.includes(rule.priority)) return false;
      return true;
    });
  }, []);

  const validateCurrentPage = useCallback(async () => {
    try {
      const analysis = await responsiveValidator.analyzeComponent(
        'Current Page',
        'Validation of the current page responsive design',
        'body'
      );

      return analysis;
    } catch (error) {
      console.error('Page validation failed:', error);
      return null;
    }
  }, []);

  const getRecommendations = useCallback(() => {
    return responsiveAutoFixer.generateFixRecommendations();
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    runAutoFix,
    runResponsiveAutoFix,
    runAutoFixOnElement,
    clearHistory,
    loadSessions,
    validateCurrentPage,
    
    // Utilities
    getSession,
    getRules,
    getRecommendations,
    
    // Computed values
    hasResults: state.currentSession !== null,
    isSuccessful: state.currentSession?.totalIssuesFixed > 0,
    hasWarnings: state.currentSession?.warnings.length > 0,
    availableRules: getRules({
      categories: options.categories,
      priorities: options.priorities
    })
  };
};

// Specialized hooks for common use cases
export const useResponsiveAutoFixCritical = (autoRun = false) => {
  return useResponsiveAutoFix({
    priorities: ['critical'],
    categories: ['layout', 'interaction'],
    autoRun,
    dryRun: false
  });
};

export const useResponsiveAnalysis = (autoRun = true) => {
  return useResponsiveAutoFix({
    priorities: ['critical', 'high', 'medium'],
    categories: ['layout', 'interaction', 'typography', 'accessibility'],
    autoRun,
    dryRun: true
  });
};

export const useResponsiveAutoFixLayout = (autoRun = false) => {
  return useResponsiveAutoFix({
    categories: ['layout'],
    priorities: ['critical', 'high'],
    autoRun,
    dryRun: false
  });
};

export const useResponsiveAutoFixAccessibility = (autoRun = false) => {
  return useResponsiveAutoFix({
    categories: ['accessibility', 'interaction'],
    priorities: ['critical', 'high'],
    autoRun,
    dryRun: false
  });
};