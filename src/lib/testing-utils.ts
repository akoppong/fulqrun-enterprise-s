/**
 * Advanced testing utilities for opportunity detail views
 * Provides real performance monitoring, accessibility testing, and automated validation
 */

export interface TestMetrics {
  renderTime: number;
  memoryUsage: number;
  domComplexity: number;
  networkRequests: number;
  jsErrors: number;
  accessibility: AccessibilityMetrics;
  performance: PerformanceMetrics;
}

export interface AccessibilityMetrics {
  score: number;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  passes: number;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  nodes: string[];
}

export interface AccessibilityWarning {
  id: string;
  description: string;
  nodes: string[];
}

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Performance Monitor
 * Tracks real-time performance metrics for opportunity detail views
 */
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics = {
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0
  };

  start(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            this.metrics.largestContentfulPaint = entry.startTime;
            break;
          case 'first-input':
            this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              this.metrics.cumulativeLayoutShift += (entry as any).value;
            }
            break;
        }
      });
    });

    try {
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Failed to start performance monitoring:', error);
    }
  }

  stop(): PerformanceMetrics {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    return { ...this.metrics };
  }

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * Accessibility Checker
 * Performs automated accessibility testing using axe-core principles
 */
export class AccessibilityChecker {
  /**
   * Check accessibility of a DOM element and its children
   */
  async checkAccessibility(element: Element = document.body): Promise<AccessibilityMetrics> {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];
    let passes = 0;

    // Check for common accessibility issues
    const checks = [
      this.checkColorContrast,
      this.checkFormLabels,
      this.checkHeadingStructure,
      this.checkAriaLabels,
      this.checkKeyboardNavigation,
      this.checkFocusManagement,
      this.checkAltText,
      this.checkLandmarks
    ];

    for (const check of checks) {
      try {
        const result = await check.call(this, element);
        if (result.pass) {
          passes++;
        } else {
          if (result.severity === 'critical' || result.severity === 'serious') {
            violations.push({
              id: result.id,
              impact: result.severity,
              description: result.description,
              helpUrl: result.helpUrl || '',
              nodes: result.nodes || []
            });
          } else {
            warnings.push({
              id: result.id,
              description: result.description,
              nodes: result.nodes || []
            });
          }
        }
      } catch (error) {
        console.warn(`Accessibility check failed for ${check.name}:`, error);
      }
    }

    const totalChecks = checks.length;
    const score = Math.round((passes / totalChecks) * 100);

    return {
      score,
      violations,
      warnings,
      passes
    };
  }

  private async checkColorContrast(element: Element) {
    const textElements = element.querySelectorAll('*');
    const issues: string[] = [];

    textElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simple contrast check (in real implementation, would use proper contrast calculation)
      if (color && backgroundColor && color === backgroundColor) {
        issues.push(el.tagName.toLowerCase());
      }
    });

    return {
      id: 'color-contrast',
      pass: issues.length === 0,
      severity: issues.length > 0 ? 'serious' as const : 'minor' as const,
      description: 'Elements must have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      nodes: issues
    };
  }

  private async checkFormLabels(element: Element) {
    const inputs = element.querySelectorAll('input, textarea, select');
    const unlabeled: string[] = [];

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = element.querySelector(`label[for="${id}"]`);
        if (!label && !ariaLabel && !ariaLabelledby) {
          unlabeled.push(input.tagName.toLowerCase());
        }
      } else if (!ariaLabel && !ariaLabelledby) {
        unlabeled.push(input.tagName.toLowerCase());
      }
    });

    return {
      id: 'form-labels',
      pass: unlabeled.length === 0,
      severity: unlabeled.length > 0 ? 'critical' as const : 'minor' as const,
      description: 'Form inputs must have accessible labels',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
      nodes: unlabeled
    };
  }

  private async checkHeadingStructure(element: Element) {
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      if (level > lastLevel + 1) {
        issues.push(heading.tagName.toLowerCase());
      }
      lastLevel = level;
    });

    return {
      id: 'heading-structure',
      pass: issues.length === 0,
      severity: issues.length > 0 ? 'moderate' as const : 'minor' as const,
      description: 'Heading levels should not be skipped',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
      nodes: issues
    };
  }

  private async checkAriaLabels(element: Element) {
    const elementsWithAriaLabel = element.querySelectorAll('[aria-label]');
    const emptyLabels: string[] = [];

    elementsWithAriaLabel.forEach((el) => {
      const label = el.getAttribute('aria-label');
      if (!label || label.trim() === '') {
        emptyLabels.push(el.tagName.toLowerCase());
      }
    });

    return {
      id: 'aria-labels',
      pass: emptyLabels.length === 0,
      severity: emptyLabels.length > 0 ? 'serious' as const : 'minor' as const,
      description: 'ARIA labels must not be empty',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-valid-attr-value',
      nodes: emptyLabels
    };
  }

  private async checkKeyboardNavigation(element: Element) {
    const interactiveElements = element.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    const issues: string[] = [];

    interactiveElements.forEach((el) => {
      const tabindex = el.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push(el.tagName.toLowerCase());
      }
    });

    return {
      id: 'keyboard-navigation',
      pass: issues.length === 0,
      severity: issues.length > 0 ? 'serious' as const : 'minor' as const,
      description: 'Avoid positive tabindex values',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/tabindex',
      nodes: issues
    };
  }

  private async checkFocusManagement(element: Element) {
    // Check for focus traps in modals
    const modals = element.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
    const issues: string[] = [];

    modals.forEach((modal) => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        issues.push('modal');
      }
    });

    return {
      id: 'focus-management',
      pass: issues.length === 0,
      severity: issues.length > 0 ? 'serious' as const : 'minor' as const,
      description: 'Modals must contain focusable elements',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/focus-order-semantics',
      nodes: issues
    };
  }

  private async checkAltText(element: Element) {
    const images = element.querySelectorAll('img');
    const missingAlt: string[] = [];

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const ariaLabel = img.getAttribute('aria-label');
      const role = img.getAttribute('role');
      
      if (!alt && !ariaLabel && role !== 'presentation' && role !== 'none') {
        missingAlt.push('img');
      }
    });

    return {
      id: 'alt-text',
      pass: missingAlt.length === 0,
      severity: missingAlt.length > 0 ? 'critical' as const : 'minor' as const,
      description: 'Images must have alternative text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
      nodes: missingAlt
    };
  }

  private async checkLandmarks(element: Element) {
    const landmarks = element.querySelectorAll('main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
    const hasMain = element.querySelector('main, [role="main"]');

    return {
      id: 'landmarks',
      pass: !!hasMain,
      severity: !hasMain ? 'moderate' as const : 'minor' as const,
      description: 'Page must have a main landmark',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/landmark-one-main',
      nodes: hasMain ? [] : ['body']
    };
  }
}

/**
 * Data Validator
 * Validates opportunity data for completeness and business rule compliance
 */
export class DataValidator {
  /**
   * Validate opportunity data structure and business rules
   */
  validateOpportunity(opportunity: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Required field validation
    const requiredFields = ['id', 'title', 'description', 'value', 'stage', 'probability'];
    
    requiredFields.forEach(field => {
      if (!opportunity[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          severity: 'error',
          code: 'REQUIRED_FIELD'
        });
      }
    });

    // Business rule validation
    if (opportunity.value && opportunity.value <= 0) {
      errors.push({
        field: 'value',
        message: 'Opportunity value must be greater than 0',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    if (opportunity.probability && (opportunity.probability < 0 || opportunity.probability > 100)) {
      errors.push({
        field: 'probability',
        message: 'Probability must be between 0 and 100',
        severity: 'error',
        code: 'INVALID_PROBABILITY'
      });
    }

    // MEDDPICC validation
    if (opportunity.meddpicc) {
      const meddpiccFields = ['metrics', 'economicBuyer', 'decisionCriteria', 'decisionProcess', 'paperProcess', 'implicatePain', 'champion'];
      const incompleteMEDDPICC = meddpiccFields.filter(field => !opportunity.meddpicc[field]);
      
      if (incompleteMEDDPICC.length > 0) {
        warnings.push({
          field: 'meddpicc',
          message: `MEDDPICC incomplete: missing ${incompleteMEDDPICC.join(', ')}`,
          code: 'INCOMPLETE_MEDDPICC'
        });
        
        suggestions.push('Complete MEDDPICC qualification to improve deal probability assessment');
      }

      // MEDDPICC score validation
      if (opportunity.meddpicc.score && (opportunity.meddpicc.score < 0 || opportunity.meddpicc.score > 100)) {
        warnings.push({
          field: 'meddpicc.score',
          message: 'MEDDPICC score should be between 0 and 100',
          code: 'INVALID_MEDDPICC_SCORE'
        });
      }
    } else {
      warnings.push({
        field: 'meddpicc',
        message: 'MEDDPICC qualification data is missing',
        code: 'MISSING_MEDDPICC'
      });
      suggestions.push('Add MEDDPICC qualification data to improve sales process effectiveness');
    }

    // Date validation
    if (opportunity.expectedCloseDate) {
      const closeDate = new Date(opportunity.expectedCloseDate);
      const today = new Date();
      
      if (closeDate < today) {
        warnings.push({
          field: 'expectedCloseDate',
          message: 'Expected close date is in the past',
          code: 'PAST_CLOSE_DATE'
        });
        suggestions.push('Update expected close date or move opportunity to appropriate stage');
      }
    }

    // High-value opportunity validation
    if (opportunity.value > 1000000 && opportunity.probability < 50) {
      warnings.push({
        field: 'probability',
        message: 'High-value opportunity has low probability - review qualification',
        code: 'HIGH_VALUE_LOW_PROBABILITY'
      });
      suggestions.push('Review qualification criteria for high-value opportunities');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate company data
   */
  validateCompany(company: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Required fields
    const requiredFields = ['id', 'name', 'industry'];
    
    requiredFields.forEach(field => {
      if (!company[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          severity: 'error',
          code: 'REQUIRED_FIELD'
        });
      }
    });

    // Employee count validation
    if (company.employees && company.employees <= 0) {
      errors.push({
        field: 'employees',
        message: 'Employee count must be greater than 0',
        severity: 'error',
        code: 'INVALID_EMPLOYEE_COUNT'
      });
    }

    // Website URL validation
    if (company.website && !this.isValidUrl(company.website)) {
      warnings.push({
        field: 'website',
        message: 'Website URL appears to be invalid',
        code: 'INVALID_URL'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Test Automation Engine
 * Orchestrates all testing activities for opportunity detail views
 */
export class TestAutomationEngine {
  private performanceMonitor = new PerformanceMonitor();
  private accessibilityChecker = new AccessibilityChecker();
  private dataValidator = new DataValidator();

  /**
   * Run comprehensive test suite
   */
  async runComprehensiveTest(element: Element, testData: any): Promise<TestMetrics> {
    // Start performance monitoring
    this.performanceMonitor.start();

    // Measure initial metrics
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    // Wait for rendering to complete
    await this.waitForRender();

    // Get performance metrics
    const performance = this.performanceMonitor.stop();
    const renderTime = performance.now() - startTime;

    // Run accessibility check
    const accessibility = await this.accessibilityChecker.checkAccessibility(element);

    // Calculate final metrics
    const finalMemory = this.getMemoryUsage();
    const memoryUsage = finalMemory - initialMemory;

    // DOM complexity analysis
    const domComplexity = this.analyzeDOMComplexity(element);

    // Network analysis
    const networkRequests = this.getNetworkRequestCount();

    // JavaScript error count
    const jsErrors = this.getJSErrorCount();

    return {
      renderTime,
      memoryUsage,
      domComplexity,
      networkRequests,
      jsErrors,
      accessibility,
      performance
    };
  }

  private async waitForRender(): Promise<void> {
    return new Promise(resolve => {
      if (requestIdleCallback) {
        requestIdleCallback(resolve);
      } else {
        setTimeout(resolve, 100);
      }
    });
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private analyzeDOMComplexity(element: Element): number {
    const allElements = element.querySelectorAll('*');
    const depth = this.getMaxDepth(element);
    const uniqueSelectors = new Set();
    
    allElements.forEach(el => {
      uniqueSelectors.add(el.tagName.toLowerCase());
    });

    // Complexity score based on number of elements, depth, and variety
    return allElements.length + (depth * 10) + (uniqueSelectors.size * 5);
  }

  private getMaxDepth(element: Element, currentDepth = 0): number {
    const children = Array.from(element.children);
    if (children.length === 0) {
      return currentDepth;
    }

    return Math.max(...children.map(child => this.getMaxDepth(child, currentDepth + 1)));
  }

  private getNetworkRequestCount(): number {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      return resources.length;
    }
    return 0;
  }

  private getJSErrorCount(): number {
    // This would need to be tracked via error listeners in a real implementation
    return 0;
  }
}

// Export singleton instances for ease of use
export const performanceMonitor = new PerformanceMonitor();
export const accessibilityChecker = new AccessibilityChecker();
export const dataValidator = new DataValidator();
export const testAutomationEngine = new TestAutomationEngine();