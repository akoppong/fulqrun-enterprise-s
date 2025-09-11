/**
 * Responsive Auto-Fix Engine
 * Automatically detects and applies fixes for common responsive design problems
 */

import { ResponsiveIssue, ResponsiveValidator, ResponsiveUtils, STANDARD_BREAKPOINTS } from './responsive-validator';
import { ResponsiveRecommendation, RESPONSIVE_RECOMMENDATIONS } from './responsive-recommendations';

export interface AutoFixRule {
  id: string;
  name: string;
  category: 'layout' | 'typography' | 'interaction' | 'accessibility' | 'performance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detector: (element: Element) => AutoFixIssue | null;
  fixer: (element: Element, issue: AutoFixIssue) => AutoFixResult;
  validator?: (element: Element) => boolean;
  affectedBreakpoints?: string[];
}

export interface AutoFixIssue {
  ruleId: string;
  element: Element;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  currentValue?: string;
  recommendedValue?: string;
  cssProperty?: string;
  selector?: string;
}

export interface AutoFixResult {
  success: boolean;
  applied: boolean;
  cssChanges?: { property: string; oldValue: string; newValue: string }[];
  classChanges?: { added: string[]; removed: string[] };
  structuralChanges?: { type: string; description: string }[];
  error?: string;
}

export interface AutoFixSession {
  id: string;
  timestamp: Date;
  rulesApplied: string[];
  totalIssuesFound: number;
  totalIssuesFixed: number;
  results: Map<string, AutoFixResult>;
  warnings: string[];
  summary: string;
}

// Core auto-fix rules for responsive design issues
export const AUTO_FIX_RULES: AutoFixRule[] = [
  // Critical Layout Fixes
  {
    id: 'horizontal-overflow',
    name: 'Fix Horizontal Overflow',
    category: 'layout',
    priority: 'critical',
    description: 'Automatically fixes elements that extend beyond viewport width',
    detector: (element: Element) => {
      const rect = element.getBoundingClientRect();
      const viewport = ResponsiveUtils.getViewportDimensions();
      
      if (rect.right > viewport.width + 10) { // 10px tolerance
        return {
          ruleId: 'horizontal-overflow',
          element,
          severity: 'critical',
          description: `Element extends ${Math.round(rect.right - viewport.width)}px beyond viewport`,
          currentValue: `width: ${rect.width}px`,
          recommendedValue: 'max-width: 100%'
        };
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const currentClasses = Array.from(htmlElement.classList);
        
        // Apply responsive width classes
        const responsiveClasses = ['w-full', 'max-w-full', 'overflow-x-auto'];
        const addedClasses: string[] = [];
        
        responsiveClasses.forEach(cls => {
          if (!htmlElement.classList.contains(cls)) {
            htmlElement.classList.add(cls);
            addedClasses.push(cls);
          }
        });
        
        // Remove fixed width classes that might cause issues
        const removedClasses: string[] = [];
        const problematicClasses = ['w-auto', 'min-w-max', 'whitespace-nowrap'];
        
        problematicClasses.forEach(cls => {
          if (htmlElement.classList.contains(cls)) {
            htmlElement.classList.remove(cls);
            removedClasses.push(cls);
          }
        });
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: removedClasses }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix horizontal overflow: ${error}`
        };
      }
    },
    affectedBreakpoints: ['Mobile Portrait', 'Mobile Landscape', 'Small Tablet']
  },

  {
    id: 'small-touch-targets',
    name: 'Fix Small Touch Targets',
    category: 'interaction',
    priority: 'high',
    description: 'Ensures interactive elements meet minimum 44px touch target size',
    detector: (element: Element) => {
      const interactiveSelectors = 'button, a, input[type="button"], input[type="submit"], [role="button"], [tabindex]';
      
      if (element.matches(interactiveSelectors)) {
        const rect = element.getBoundingClientRect();
        const minSize = 44;
        
        if (rect.width < minSize || rect.height < minSize) {
          return {
            ruleId: 'small-touch-targets',
            element,
            severity: 'high',
            description: `Touch target is ${Math.round(Math.min(rect.width, rect.height))}px, should be minimum ${minSize}px`,
            currentValue: `${Math.round(rect.width)}×${Math.round(rect.height)}px`,
            recommendedValue: `${minSize}×${minSize}px minimum`
          };
        }
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const addedClasses: string[] = [];
        
        // Add touch-friendly classes
        if (!htmlElement.classList.contains('touch-target')) {
          htmlElement.classList.add('touch-target');
          addedClasses.push('touch-target');
        }
        
        // Ensure minimum padding for small elements
        if (!htmlElement.classList.contains('p-3') && !htmlElement.classList.contains('p-4')) {
          htmlElement.classList.add('p-3');
          addedClasses.push('p-3');
        }
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: [] }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix touch target size: ${error}`
        };
      }
    },
    affectedBreakpoints: ['All Mobile', 'All Tablet']
  },

  {
    id: 'unresponsive-grid',
    name: 'Fix Unresponsive Grid Layout',
    category: 'layout',
    priority: 'high',
    description: 'Converts fixed grids to responsive layouts',
    detector: (element: Element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      
      if (computedStyle.display === 'grid') {
        const gridCols = computedStyle.gridTemplateColumns;
        
        // Check for fixed column grids that don't adapt
        if (gridCols && gridCols.includes('repeat(') && !gridCols.includes('minmax') && !gridCols.includes('auto-fit')) {
          return {
            ruleId: 'unresponsive-grid',
            element,
            severity: 'high',
            description: 'Grid layout uses fixed columns that don\'t adapt to screen size',
            currentValue: gridCols,
            recommendedValue: 'responsive grid with auto-fit or media queries'
          };
        }
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const currentClasses = Array.from(htmlElement.classList);
        const addedClasses: string[] = [];
        const removedClasses: string[] = [];
        
        // Remove fixed grid classes
        const fixedGridClasses = currentClasses.filter(cls => 
          cls.startsWith('grid-cols-') && !cls.includes(':')
        );
        
        fixedGridClasses.forEach(cls => {
          htmlElement.classList.remove(cls);
          removedClasses.push(cls);
        });
        
        // Add responsive grid classes
        if (!htmlElement.classList.contains('grid-cols-1')) {
          htmlElement.classList.add('grid-cols-1');
          addedClasses.push('grid-cols-1');
        }
        
        if (!htmlElement.classList.contains('md:grid-cols-2')) {
          htmlElement.classList.add('md:grid-cols-2');
          addedClasses.push('md:grid-cols-2');
        }
        
        if (!htmlElement.classList.contains('lg:grid-cols-3')) {
          htmlElement.classList.add('lg:grid-cols-3');
          addedClasses.push('lg:grid-cols-3');
        }
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: removedClasses }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix grid layout: ${error}`
        };
      }
    }
  },

  {
    id: 'small-text-mobile',
    name: 'Fix Small Text on Mobile',
    category: 'typography',
    priority: 'medium',
    description: 'Increases text size for better mobile readability',
    detector: (element: Element) => {
      const textElements = ['p', 'span', 'div', 'label', 'li'];
      
      if (textElements.includes(element.tagName.toLowerCase())) {
        const computedStyle = window.getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        const viewport = ResponsiveUtils.getViewportDimensions();
        
        // Check for small text on mobile viewports
        if (viewport.width <= 768 && fontSize < 14) {
          return {
            ruleId: 'small-text-mobile',
            element,
            severity: 'medium',
            description: `Text size ${fontSize}px is too small for mobile devices`,
            currentValue: `${fontSize}px`,
            recommendedValue: '14px minimum for mobile'
          };
        }
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const addedClasses: string[] = [];
        
        // Add responsive text size class if not already present
        const hasTextSizeClass = Array.from(htmlElement.classList).some(cls => 
          cls.startsWith('text-') && (cls.includes('sm') || cls.includes('base') || cls.includes('lg'))
        );
        
        if (!hasTextSizeClass) {
          htmlElement.classList.add('text-sm', 'md:text-base');
          addedClasses.push('text-sm', 'md:text-base');
        }
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: [] }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix text size: ${error}`
        };
      }
    },
    affectedBreakpoints: ['All Mobile']
  },

  {
    id: 'missing-responsive-images',
    name: 'Fix Non-Responsive Images',
    category: 'layout',
    priority: 'medium',
    description: 'Makes images responsive and prevents overflow',
    detector: (element: Element) => {
      if (element.tagName.toLowerCase() === 'img') {
        const htmlElement = element as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlElement);
        
        if (computedStyle.maxWidth !== '100%' && !htmlElement.classList.contains('w-full')) {
          return {
            ruleId: 'missing-responsive-images',
            element,
            severity: 'medium',
            description: 'Image is not responsive and may cause overflow',
            currentValue: 'Fixed or unconstrained width',
            recommendedValue: 'max-width: 100% with responsive classes'
          };
        }
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const addedClasses: string[] = [];
        
        // Add responsive image classes
        const responsiveClasses = ['max-w-full', 'h-auto'];
        
        responsiveClasses.forEach(cls => {
          if (!htmlElement.classList.contains(cls)) {
            htmlElement.classList.add(cls);
            addedClasses.push(cls);
          }
        });
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: [] }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix image responsiveness: ${error}`
        };
      }
    }
  },

  {
    id: 'inadequate-spacing-mobile',
    name: 'Fix Inadequate Mobile Spacing',
    category: 'layout',
    priority: 'medium',
    description: 'Adjusts padding and margins for better mobile experience',
    detector: (element: Element) => {
      const viewport = ResponsiveUtils.getViewportDimensions();
      
      if (viewport.width <= 768) {
        const computedStyle = window.getComputedStyle(element);
        const padding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        
        // Check for elements that might need better mobile spacing
        if (element.matches('.card, .dialog-content, .form-container, [role="dialog"]')) {
          if (padding < 16) {
            return {
              ruleId: 'inadequate-spacing-mobile',
              element,
              severity: 'medium',
              description: 'Element has insufficient padding for mobile touch interaction',
              currentValue: `${padding}px total horizontal padding`,
              recommendedValue: '16px minimum for mobile'
            };
          }
        }
      }
      return null;
    },
    fixer: (element: Element, issue: AutoFixIssue) => {
      try {
        const htmlElement = element as HTMLElement;
        const addedClasses: string[] = [];
        
        // Add responsive padding classes
        if (!htmlElement.classList.contains('p-4') && !htmlElement.classList.contains('px-4')) {
          htmlElement.classList.add('p-4', 'md:p-6');
          addedClasses.push('p-4', 'md:p-6');
        }
        
        return {
          success: true,
          applied: true,
          classChanges: { added: addedClasses, removed: [] }
        };
      } catch (error) {
        return {
          success: false,
          applied: false,
          error: `Failed to fix mobile spacing: ${error}`
        };
      }
    },
    affectedBreakpoints: ['All Mobile']
  }
];

export class ResponsiveAutoFixer {
  private static instance: ResponsiveAutoFixer;
  private sessions: Map<string, AutoFixSession> = new Map();
  private rules: AutoFixRule[] = AUTO_FIX_RULES;
  private isRunning = false;

  static getInstance(): ResponsiveAutoFixer {
    if (!ResponsiveAutoFixer.instance) {
      ResponsiveAutoFixer.instance = new ResponsiveAutoFixer();
    }
    return ResponsiveAutoFixer.instance;
  }

  /**
   * Run auto-fix on the entire document
   */
  async runAutoFix(options: {
    selector?: string;
    categories?: AutoFixRule['category'][];
    priorities?: AutoFixRule['priority'][];
    dryRun?: boolean;
  } = {}): Promise<AutoFixSession> {
    if (this.isRunning) {
      throw new Error('Auto-fix is already running');
    }

    this.isRunning = true;
    const session: AutoFixSession = {
      id: `autofix-${Date.now()}`,
      timestamp: new Date(),
      rulesApplied: [],
      totalIssuesFound: 0,
      totalIssuesFixed: 0,
      results: new Map(),
      warnings: [],
      summary: ''
    };

    try {
      // Filter rules based on options
      const activeRules = this.rules.filter(rule => {
        if (options.categories && !options.categories.includes(rule.category)) return false;
        if (options.priorities && !options.priorities.includes(rule.priority)) return false;
        return true;
      });

      // Get elements to check
      const selector = options.selector || 'body *';
      const elements = Array.from(document.querySelectorAll(selector));

      console.log(`Running auto-fix with ${activeRules.length} rules on ${elements.length} elements`);

      // Apply each rule to each element
      for (const rule of activeRules) {
        let ruleIssuesFound = 0;
        let ruleIssuesFixed = 0;

        for (const element of elements) {
          try {
            const issue = rule.detector(element);
            
            if (issue) {
              session.totalIssuesFound++;
              ruleIssuesFound++;

              if (!options.dryRun) {
                const result = rule.fixer(element, issue);
                session.results.set(`${rule.id}-${elements.indexOf(element)}`, result);

                if (result.success && result.applied) {
                  session.totalIssuesFixed++;
                  ruleIssuesFixed++;
                }

                if (!result.success && result.error) {
                  session.warnings.push(`${rule.name}: ${result.error}`);
                }
              }
            }
          } catch (error) {
            session.warnings.push(`Error applying rule ${rule.name}: ${error}`);
          }
        }

        if (ruleIssuesFound > 0) {
          session.rulesApplied.push(rule.id);
          console.log(`Rule ${rule.name}: Found ${ruleIssuesFound} issues, fixed ${ruleIssuesFixed}`);
        }
      }

      // Generate summary
      session.summary = this.generateSessionSummary(session, options.dryRun || false);
      
      // Store session
      this.sessions.set(session.id, session);

      console.log('Auto-fix completed:', session.summary);
      return session;

    } catch (error) {
      session.warnings.push(`Auto-fix failed: ${error}`);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run auto-fix on a specific element
   */
  async runAutoFixOnElement(element: Element, options: {
    categories?: AutoFixRule['category'][];
    priorities?: AutoFixRule['priority'][];
    dryRun?: boolean;
  } = {}): Promise<AutoFixResult[]> {
    const results: AutoFixResult[] = [];

    // Filter rules based on options
    const activeRules = this.rules.filter(rule => {
      if (options.categories && !options.categories.includes(rule.category)) return false;
      if (options.priorities && !options.priorities.includes(rule.priority)) return false;
      return true;
    });

    for (const rule of activeRules) {
      try {
        const issue = rule.detector(element);
        
        if (issue) {
          if (!options.dryRun) {
            const result = rule.fixer(element, issue);
            results.push(result);
          } else {
            results.push({
              success: true,
              applied: false // Dry run, so no actual changes
            });
          }
        }
      } catch (error) {
        results.push({
          success: false,
          applied: false,
          error: `Error applying rule ${rule.name}: ${error}`
        });
      }
    }

    return results;
  }

  /**
   * Test auto-fix across different viewport sizes
   */
  async runResponsiveAutoFix(options: {
    breakpoints?: typeof STANDARD_BREAKPOINTS;
    dryRun?: boolean;
  } = {}): Promise<Map<string, AutoFixSession>> {
    const breakpoints = options.breakpoints || STANDARD_BREAKPOINTS.slice(0, 6); // Test key breakpoints
    const sessions = new Map<string, AutoFixSession>();

    for (const breakpoint of breakpoints) {
      try {
        // Simulate viewport resize
        await ResponsiveUtils.simulateViewportResize(breakpoint.width, breakpoint.height);
        
        // Run auto-fix for this viewport
        const session = await this.runAutoFix({
          dryRun: options.dryRun,
          categories: ['layout', 'interaction', 'typography'] // Focus on responsive categories
        });

        sessions.set(breakpoint.name, session);
        
        // Small delay between viewport changes
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to run auto-fix for ${breakpoint.name}:`, error);
      }
    }

    return sessions;
  }

  /**
   * Add custom auto-fix rule
   */
  addRule(rule: AutoFixRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove auto-fix rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all available rules
   */
  getRules(): AutoFixRule[] {
    return [...this.rules];
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: AutoFixRule['category']): AutoFixRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  /**
   * Get session history
   */
  getSessionHistory(): AutoFixSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get specific session
   */
  getSession(sessionId: string): AutoFixSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clear session history
   */
  clearHistory(): void {
    this.sessions.clear();
  }

  /**
   * Generate comprehensive fix recommendations
   */
  generateFixRecommendations(): {
    criticalFixes: ResponsiveRecommendation[];
    quickFixes: ResponsiveRecommendation[];
    automatedFixes: string[];
    manualFixes: string[];
  } {
    const automated = this.rules.map(rule => rule.name);
    const manual = RESPONSIVE_RECOMMENDATIONS
      .filter(rec => !automated.some(auto => rec.solution.toLowerCase().includes(auto.toLowerCase())))
      .slice(0, 10);

    return {
      criticalFixes: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'critical'),
      quickFixes: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.estimatedEffort === 'low'),
      automatedFixes: automated,
      manualFixes: manual.map(rec => rec.solution)
    };
  }

  /**
   * Generate session summary
   */
  private generateSessionSummary(session: AutoFixSession, dryRun: boolean): string {
    const mode = dryRun ? 'Dry run analysis' : 'Auto-fix session';
    const fixed = dryRun ? 'would fix' : 'fixed';
    
    return `${mode} completed: Found ${session.totalIssuesFound} issues, ${fixed} ${session.totalIssuesFixed}. Applied ${session.rulesApplied.length} rules with ${session.warnings.length} warnings.`;
  }

  /**
   * Validate fixes
   */
  async validateFixes(sessionId: string): Promise<{
    validationScore: number;
    remainingIssues: ResponsiveIssue[];
    improvements: string[];
  }> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Re-run validation to check improvements
    const validator = ResponsiveValidator.getInstance();
    const analysis = await validator.analyzeComponent(
      'Auto-fix Validation',
      'Validation after auto-fix application',
      'body'
    );

    const remainingCritical = analysis.criticalIssues.filter(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    );

    const improvements = [
      `Fixed ${session.totalIssuesFixed} out of ${session.totalIssuesFound} detected issues`,
      `Applied ${session.rulesApplied.length} auto-fix rules`,
      `Reduced critical issues by ${Math.max(0, session.totalIssuesFound - remainingCritical.length)}`,
    ];

    return {
      validationScore: analysis.overallScore,
      remainingIssues: remainingCritical,
      improvements
    };
  }
}

// Export singleton instance
export const responsiveAutoFixer = ResponsiveAutoFixer.getInstance();

// Export types and utilities
export type { AutoFixRule, AutoFixIssue, AutoFixResult, AutoFixSession };
export { AUTO_FIX_RULES };