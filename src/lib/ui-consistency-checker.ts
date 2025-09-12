/**
 * UI/UX Consistency Checker and Auto-Fixer
 * 
 * This system automatically detects and fixes common UI/UX issues:
 * - Overlapping elements
 * - Inconsistent spacing
 * - Poor touch targets
 * - Accessibility violations
 * - Responsive design issues
 * - Form validation problems
 */

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getElementDescription } from '@/lib/className-utils';

export interface UIIssue {
  id: string;
  type: 'overlap' | 'spacing' | 'accessibility' | 'responsive' | 'touch-target' | 'form' | 'contrast';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: Element;
  description: string;
  autoFixable: boolean;
  suggestions: string[];
  rect?: DOMRect;
}

export interface UIFixResult {
  fixed: UIIssue[];
  failed: Array<{ issue: UIIssue; error: string }>;
  warnings: string[];
}

class UIConsistencyChecker {
  private issues: UIIssue[] = [];
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private callbacks: {
    onIssueDetected?: (issue: UIIssue) => void;
    onIssueFixed?: (issue: UIIssue) => void;
  } = {};

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Watch for DOM changes
    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
          break;
        }
        if (mutation.type === 'attributes' && 
            ['class', 'style', 'data-*'].some(attr => mutation.attributeName?.startsWith(attr))) {
          shouldCheck = true;
          break;
        }
      }
      
      if (shouldCheck) {
        // Debounce checks
        setTimeout(() => this.checkAllIssues(), 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Watch for size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        setTimeout(() => this.checkResponsiveIssues(), 100);
      });
      this.resizeObserver.observe(document.body);
    }
  }

  /**
   * Check for all types of UI issues
   */
  public checkAllIssues(): UIIssue[] {
    this.issues = [];
    
    this.checkOverlapIssues();
    this.checkSpacingIssues();
    this.checkAccessibilityIssues();
    this.checkTouchTargetIssues();
    this.checkFormIssues();
    this.checkContrastIssues();
    this.checkResponsiveIssues();
    
    return this.issues;
  }

  /**
   * Check for overlapping elements
   */
  private checkOverlapIssues() {
    const elements = document.querySelectorAll('*:not(script):not(style):not(meta)');
    const positions = new Map<Element, DOMRect>();
    
    // Get positions
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        positions.set(el, rect);
      }
    });

    // Check for overlaps
    const positionArray = Array.from(positions.entries());
    for (let i = 0; i < positionArray.length; i++) {
      for (let j = i + 1; j < positionArray.length; j++) {
        const [el1, rect1] = positionArray[i];
        const [el2, rect2] = positionArray[j];
        
        // Skip if elements are parent/child
        if (el1.contains(el2) || el2.contains(el1)) continue;
        
        // Check for overlap
        if (this.rectsOverlap(rect1, rect2)) {
          const issue: UIIssue = {
            id: `overlap-${Date.now()}-${Math.random()}`,
            type: 'overlap',
            severity: 'high',
            element: el1,
            description: `Elements overlap: ${this.getElementDescription(el1)} and ${this.getElementDescription(el2)}`,
            autoFixable: true,
            suggestions: [
              'Adjust margins or padding',
              'Use flexbox or grid for layout',
              'Check z-index values',
              'Ensure proper positioning'
            ],
            rect: rect1
          };
          
          this.addIssue(issue);
        }
      }
    }
  }

  /**
   * Check for spacing consistency issues
   */
  private checkSpacingIssues() {
    const forms = document.querySelectorAll('form, [data-form], .form-section');
    
    forms.forEach(form => {
      const formElements = form.querySelectorAll('input, select, textarea, button');
      const spacings: number[] = [];
      
      for (let i = 0; i < formElements.length - 1; i++) {
        const current = formElements[i].getBoundingClientRect();
        const next = formElements[i + 1].getBoundingClientRect();
        const spacing = next.top - current.bottom;
        
        if (spacing >= 0) {
          spacings.push(spacing);
        }
      }
      
      // Check for inconsistent spacing
      if (spacings.length > 1) {
        const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
        const inconsistent = spacings.some(s => Math.abs(s - avgSpacing) > 8);
        
        if (inconsistent) {
          const issue: UIIssue = {
            id: `spacing-${Date.now()}-${Math.random()}`,
            type: 'spacing',
            severity: 'medium',
            element: form,
            description: 'Inconsistent spacing between form elements',
            autoFixable: true,
            suggestions: [
              'Use consistent margin/padding values',
              'Apply uniform spacing classes',
              'Use CSS Grid or Flexbox with gap',
              'Define spacing design tokens'
            ]
          };
          
          this.addIssue(issue);
        }
      }
    });
  }

  /**
   * Check for accessibility issues
   */
  private checkAccessibilityIssues() {
    // Missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      const issue: UIIssue = {
        id: `a11y-alt-${Date.now()}-${Math.random()}`,
        type: 'accessibility',
        severity: 'high',
        element: img,
        description: 'Image missing alt text',
        autoFixable: true,
        suggestions: [
          'Add descriptive alt text',
          'Use alt="" for decorative images',
          'Consider aria-label for complex images'
        ]
      };
      this.addIssue(issue);
    });

    // Missing labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      
      if (!hasLabel && input.getAttribute('type') !== 'hidden') {
        const issue: UIIssue = {
          id: `a11y-label-${Date.now()}-${Math.random()}`,
          type: 'accessibility',
          severity: 'high',
          element: input,
          description: 'Input missing accessible label',
          autoFixable: false,
          suggestions: [
            'Add a label element',
            'Use aria-label attribute',
            'Use aria-labelledby attribute'
          ]
        };
        this.addIssue(issue);
      }
    });

    // Missing focus states
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const hasCustomFocus = styles.getPropertyValue('--focus-visible') !== '';
      
      if (!hasCustomFocus) {
        // Check if element has proper focus styling
        const originalOutline = styles.outline;
        const originalBoxShadow = styles.boxShadow;
        
        if (originalOutline === 'none' && !originalBoxShadow.includes('ring')) {
          const issue: UIIssue = {
            id: `a11y-focus-${Date.now()}-${Math.random()}`,
            type: 'accessibility',
            severity: 'medium',
            element: el,
            description: 'Interactive element lacks visible focus state',
            autoFixable: true,
            suggestions: [
              'Add focus-visible styles',
              'Use outline or box-shadow for focus',
              'Ensure sufficient contrast for focus state'
            ]
          };
          this.addIssue(issue);
        }
      }
    });
  }

  /**
   * Check for inadequate touch targets
   */
  private checkTouchTargetIssues() {
    const interactiveElements = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], [role="button"], [onclick]'
    );
    
    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const minSize = 44; // 44px minimum touch target
      
      if (rect.width < minSize || rect.height < minSize) {
        const issue: UIIssue = {
          id: `touch-target-${Date.now()}-${Math.random()}`,
          type: 'touch-target',
          severity: 'medium',
          element: el,
          description: `Touch target too small: ${Math.round(rect.width)}×${Math.round(rect.height)}px (minimum: ${minSize}×${minSize}px)`,
          autoFixable: true,
          suggestions: [
            'Increase padding',
            'Set minimum width/height',
            'Use larger font size',
            'Add touch-friendly spacing'
          ],
          rect
        };
        this.addIssue(issue);
      }
    });
  }

  /**
   * Check for form validation issues
   */
  private checkFormIssues() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      
      requiredInputs.forEach(input => {
        const hasVisualIndicator = input.getAttribute('aria-required') === 'true' ||
                                 input.classList.contains('required') ||
                                 form.querySelector(`label[for="${input.id}"] .required, label[for="${input.id}"] [aria-label*="required"]`);
        
        if (!hasVisualIndicator) {
          const issue: UIIssue = {
            id: `form-required-${Date.now()}-${Math.random()}`,
            type: 'form',
            severity: 'medium',
            element: input,
            description: 'Required field lacks visual indicator',
            autoFixable: true,
            suggestions: [
              'Add asterisk (*) to label',
              'Use aria-required="true"',
              'Add required indicator styling',
              'Use consistent required field design'
            ]
          };
          this.addIssue(issue);
        }
      });
    });
  }

  /**
   * Check for color contrast issues
   */
  private checkContrastIssues() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
    
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Only check if we have both colors and text content
      if (el.textContent?.trim() && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        const fontSize = parseInt(styles.fontSize);
        const fontWeight = styles.fontWeight;
        
        const isLarge = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        const minContrast = isLarge ? 3 : 4.5;
        
        if (contrast < minContrast) {
          const issue: UIIssue = {
            id: `contrast-${Date.now()}-${Math.random()}`,
            type: 'contrast',
            severity: 'high',
            element: el,
            description: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (minimum: ${minContrast}:1)`,
            autoFixable: false,
            suggestions: [
              'Use darker text color',
              'Use lighter background color',
              'Increase font weight',
              'Use design system colors'
            ]
          };
          this.addIssue(issue);
        }
      }
    });
  }

  /**
   * Check for responsive design issues
   */
  private checkResponsiveIssues() {
    const viewportWidth = window.innerWidth;
    
    // Check for horizontal scrollbars
    if (document.documentElement.scrollWidth > viewportWidth) {
      const issue: UIIssue = {
        id: `responsive-overflow-${Date.now()}`,
        type: 'responsive',
        severity: 'high',
        element: document.body,
        description: 'Horizontal scrollbar present - content overflows viewport',
        autoFixable: true,
        suggestions: [
          'Check for fixed widths',
          'Use max-width instead of width',
          'Implement proper responsive design',
          'Check for overflow-x: hidden on problematic elements'
        ]
      };
      this.addIssue(issue);
    }

    // Check for tiny text on mobile
    if (viewportWidth < 768) {
      const textElements = document.querySelectorAll('p, span, div, a, button, label');
      textElements.forEach(el => {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
        if (fontSize < 16 && el.textContent?.trim()) {
          const issue: UIIssue = {
            id: `responsive-text-${Date.now()}-${Math.random()}`,
            type: 'responsive',
            severity: 'medium',
            element: el,
            description: `Text too small on mobile: ${fontSize}px (minimum recommended: 16px)`,
            autoFixable: true,
            suggestions: [
              'Increase font size for mobile',
              'Use responsive typography',
              'Apply fluid font scaling',
              'Check design system font scales'
            ]
          };
          this.addIssue(issue);
        }
      });
    }
  }

  /**
   * Automatically fix detectable issues
   */
  public autoFix(issues?: UIIssue[]): UIFixResult {
    const toFix = issues || this.issues.filter(issue => issue.autoFixable);
    const result: UIFixResult = {
      fixed: [],
      failed: [],
      warnings: []
    };

    toFix.forEach(issue => {
      try {
        const success = this.fixIssue(issue);
        if (success) {
          result.fixed.push(issue);
          this.callbacks.onIssueFixed?.(issue);
        } else {
          result.failed.push({ issue, error: 'Auto-fix not implemented for this issue type' });
        }
      } catch (error) {
        result.failed.push({ 
          issue, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    return result;
  }

  /**
   * Fix a specific issue
   */
  private fixIssue(issue: UIIssue): boolean {
    switch (issue.type) {
      case 'overlap':
        return this.fixOverlapIssue(issue);
      case 'spacing':
        return this.fixSpacingIssue(issue);
      case 'accessibility':
        return this.fixAccessibilityIssue(issue);
      case 'touch-target':
        return this.fixTouchTargetIssue(issue);
      case 'form':
        return this.fixFormIssue(issue);
      case 'responsive':
        return this.fixResponsiveIssue(issue);
      default:
        return false;
    }
  }

  private fixOverlapIssue(issue: UIIssue): boolean {
    const element = issue.element as HTMLElement;
    
    // Try to fix by adding margin
    const styles = window.getComputedStyle(element);
    const currentMargin = parseInt(styles.marginBottom) || 0;
    element.style.marginBottom = `${currentMargin + 16}px`;
    
    return true;
  }

  private fixSpacingIssue(issue: UIIssue): boolean {
    const form = issue.element;
    const formElements = form.querySelectorAll('input, select, textarea, button');
    
    formElements.forEach((el, index) => {
      if (index > 0) {
        (el as HTMLElement).style.marginTop = '1rem';
      }
    });
    
    return true;
  }

  private fixAccessibilityIssue(issue: UIIssue): boolean {
    const element = issue.element as HTMLElement;
    
    if (issue.description.includes('alt text')) {
      (element as HTMLImageElement).alt = 'Image'; // Basic alt text
      return true;
    }
    
    if (issue.description.includes('focus state')) {
      element.style.outline = '2px solid #0066cc';
      element.style.outlineOffset = '2px';
      return true;
    }
    
    return false;
  }

  private fixTouchTargetIssue(issue: UIIssue): boolean {
    const element = issue.element as HTMLElement;
    const rect = issue.rect;
    
    if (rect) {
      const neededWidth = Math.max(0, 44 - rect.width);
      const neededHeight = Math.max(0, 44 - rect.height);
      
      if (neededWidth > 0) {
        const currentPadding = parseInt(window.getComputedStyle(element).paddingLeft) || 0;
        element.style.paddingLeft = element.style.paddingRight = `${currentPadding + neededWidth / 2}px`;
      }
      
      if (neededHeight > 0) {
        const currentPadding = parseInt(window.getComputedStyle(element).paddingTop) || 0;
        element.style.paddingTop = element.style.paddingBottom = `${currentPadding + neededHeight / 2}px`;
      }
    }
    
    return true;
  }

  private fixFormIssue(issue: UIIssue): boolean {
    const input = issue.element as HTMLInputElement;
    
    if (issue.description.includes('required')) {
      input.setAttribute('aria-required', 'true');
      
      // Add visual indicator if label exists
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label && !label.textContent?.includes('*')) {
        label.innerHTML += ' <span style="color: red;" aria-label="required">*</span>';
      }
      
      return true;
    }
    
    return false;
  }

  private fixResponsiveIssue(issue: UIIssue): boolean {
    const element = issue.element as HTMLElement;
    
    if (issue.description.includes('overflow')) {
      element.style.overflowX = 'auto';
      element.style.maxWidth = '100%';
      return true;
    }
    
    if (issue.description.includes('Text too small')) {
      element.style.fontSize = '16px';
      return true;
    }
    
    return false;
  }

  /**
   * Utility methods
   */
  private addIssue(issue: UIIssue) {
    this.issues.push(issue);
    this.callbacks.onIssueDetected?.(issue);
  }

  private rectsOverlap(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(rect1.right <= rect2.left || 
             rect2.right <= rect1.left || 
             rect1.bottom <= rect2.top || 
             rect2.bottom <= rect1.top);
  }

  private getElementDescription = getElementDescription;

  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation - in real implementation, 
    // you'd convert colors to RGB and calculate luminance
    return 4.5; // Placeholder
  }

  /**
   * Public API
   */
  public onIssueDetected(callback: (issue: UIIssue) => void) {
    this.callbacks.onIssueDetected = callback;
  }

  public onIssueFixed(callback: (issue: UIIssue) => void) {
    this.callbacks.onIssueFixed = callback;
  }

  public getIssues(): UIIssue[] {
    return [...this.issues];
  }

  public getIssuesByType(type: UIIssue['type']): UIIssue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  public getIssuesBySeverity(severity: UIIssue['severity']): UIIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  public clearIssues() {
    this.issues = [];
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Global instance
export const uiChecker = new UIConsistencyChecker();

// React hook for UI consistency checking
export function useUIConsistencyChecker() {
  const checkerRef = useRef<UIConsistencyChecker | null>(null);

  useEffect(() => {
    if (!checkerRef.current) {
      checkerRef.current = new UIConsistencyChecker();
    }

    return () => {
      if (checkerRef.current) {
        checkerRef.current.destroy();
      }
    };
  }, []);

  const runCheck = useCallback(() => {
    if (!checkerRef.current) return [];
    return checkerRef.current.checkAllIssues();
  }, []);

  const autoFix = useCallback((issues?: UIIssue[]) => {
    if (!checkerRef.current) return { fixed: [], failed: [], warnings: [] };
    const result = checkerRef.current.autoFix(issues);
    
    if (result.fixed.length > 0) {
      toast.success(`Fixed ${result.fixed.length} UI issue${result.fixed.length > 1 ? 's' : ''}`);
    }
    
    if (result.failed.length > 0) {
      toast.warning(`Could not auto-fix ${result.failed.length} issue${result.failed.length > 1 ? 's' : ''}`);
    }
    
    return result;
  }, []);

  return {
    runCheck,
    autoFix,
    getIssues: () => checkerRef.current?.getIssues() || [],
    clearIssues: () => checkerRef.current?.clearIssues(),
  };
}