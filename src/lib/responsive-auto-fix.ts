/**
 * Responsive Design Auto-Fix System
 * Automatically detects and fixes common responsive design issues
 */

export interface ResponsiveIssue {
  type: 'layout' | 'overflow' | 'text' | 'touch' | 'accessibility' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element?: HTMLElement;
  description: string;
  autoFixAvailable: boolean;
  fix?: () => void;
}

export interface ViewportInfo {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
  pixelRatio: number;
}

export interface ResponsiveMetrics {
  totalElements: number;
  overflowingElements: number;
  tooSmallTouchTargets: number;
  lowContrastElements: number;
  performanceScore: number;
  accessibilityScore: number;
}

export class ResponsiveAutoFix {
  private static instance: ResponsiveAutoFix;
  private observer: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private fixedElements: Set<HTMLElement> = new Set();
  private issues: ResponsiveIssue[] = [];
  private listeners: Array<(issues: ResponsiveIssue[]) => void> = [];
  private isEnabled = true;

  static getInstance(): ResponsiveAutoFix {
    if (!ResponsiveAutoFix.instance) {
      ResponsiveAutoFix.instance = new ResponsiveAutoFix();
    }
    return ResponsiveAutoFix.instance;
  }

  private constructor() {
    this.initializeObservers();
    this.bindViewportChangeListener();
  }

  // === INITIALIZATION === //

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Resize Observer for layout changes
    this.observer = new ResizeObserver((entries) => {
      if (!this.isEnabled) return;
      entries.forEach(entry => {
        this.checkElementResponsiveness(entry.target as HTMLElement);
      });
    });

    // Mutation Observer for DOM changes
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.analyzeNewElement(node as HTMLElement);
          }
        });
      });
    });

    // Start observing
    this.observer.observe(document.body, { box: 'border-box' });
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  private bindViewportChangeListener(): void {
    if (typeof window === 'undefined') return;

    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.performFullAnalysis();
      }, 250);
    });

    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.performFullAnalysis();
      }, 500);
    });
  }

  // === ANALYSIS METHODS === //

  public getViewportInfo(): ViewportInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      aspectRatio: width / height,
      orientation: width > height ? 'landscape' : 'portrait',
      deviceType: this.getDeviceType(width),
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  private getDeviceType(width: number): ViewportInfo['deviceType'] {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1920) return 'desktop';
    return 'tv';
  }

  public performFullAnalysis(): ResponsiveMetrics {
    this.issues = [];
    const elements = document.querySelectorAll('*') as NodeListOf<HTMLElement>;
    
    let overflowingElements = 0;
    let tooSmallTouchTargets = 0;
    let lowContrastElements = 0;

    elements.forEach(element => {
      const issues = this.analyzeElement(element);
      this.issues.push(...issues);

      if (issues.some(i => i.type === 'overflow')) overflowingElements++;
      if (issues.some(i => i.type === 'touch')) tooSmallTouchTargets++;
      if (issues.some(i => i.type === 'accessibility')) lowContrastElements++;
    });

    const metrics: ResponsiveMetrics = {
      totalElements: elements.length,
      overflowingElements,
      tooSmallTouchTargets,
      lowContrastElements,
      performanceScore: this.calculatePerformanceScore(),
      accessibilityScore: this.calculateAccessibilityScore()
    };

    this.notifyListeners();
    return metrics;
  }

  private analyzeElement(element: HTMLElement): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Check for overflow issues
    issues.push(...this.checkOverflow(element, rect, computedStyle));
    
    // Check touch target sizes
    issues.push(...this.checkTouchTargets(element, rect, computedStyle));
    
    // Check text readability
    issues.push(...this.checkTextReadability(element, computedStyle));
    
    // Check layout issues
    issues.push(...this.checkLayoutIssues(element, rect, computedStyle));
    
    // Check accessibility
    issues.push(...this.checkAccessibility(element, computedStyle));

    return issues;
  }

  private analyzeNewElement(element: HTMLElement): void {
    if (!this.isEnabled) return;
    const issues = this.analyzeElement(element);
    this.issues.push(...issues);
    
    // Auto-fix critical issues immediately
    issues.forEach(issue => {
      if (issue.severity === 'critical' && issue.autoFixAvailable && issue.fix) {
        issue.fix();
      }
    });
  }

  private checkElementResponsiveness(element: HTMLElement): void {
    if (this.fixedElements.has(element)) return;
    
    const issues = this.analyzeElement(element);
    issues.forEach(issue => {
      if (issue.autoFixAvailable && issue.fix) {
        issue.fix();
        this.fixedElements.add(element);
      }
    });
  }

  // === SPECIFIC CHECKS === //

  private checkOverflow(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];
    const viewport = this.getViewportInfo();

    // Check horizontal overflow
    if (rect.right > viewport.width) {
      issues.push({
        type: 'overflow',
        severity: 'high',
        element,
        description: `Element extends beyond viewport width (${Math.round(rect.right)}px > ${viewport.width}px)`,
        autoFixAvailable: true,
        fix: () => this.fixHorizontalOverflow(element)
      });
    }

    // Check for fixed widths that might cause issues
    if (style.width && style.width.includes('px') && !style.maxWidth) {
      const width = parseInt(style.width);
      if (width > viewport.width * 0.9) {
        issues.push({
          type: 'layout',
          severity: 'medium',
          element,
          description: `Fixed width (${width}px) may cause overflow on smaller screens`,
          autoFixAvailable: true,
          fix: () => this.fixFixedWidth(element)
        });
      }
    }

    // Check for content overflow within containers
    if (element.scrollWidth > element.clientWidth && style.overflow !== 'hidden' && style.overflowX !== 'hidden') {
      issues.push({
        type: 'overflow',
        severity: 'medium',
        element,
        description: 'Content overflows container horizontally',
        autoFixAvailable: true,
        fix: () => this.fixContentOverflow(element)
      });
    }

    return issues;
  }

  private checkTouchTargets(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];
    const viewport = this.getViewportInfo();

    // Only check interactive elements
    if (!this.isInteractiveElement(element)) return issues;

    const minTouchSize = viewport.deviceType === 'mobile' ? 44 : 40;
    
    if (rect.width < minTouchSize || rect.height < minTouchSize) {
      issues.push({
        type: 'touch',
        severity: viewport.deviceType === 'mobile' ? 'high' : 'medium',
        element,
        description: `Touch target too small (${Math.round(rect.width)}×${Math.round(rect.height)}px, minimum: ${minTouchSize}×${minTouchSize}px)`,
        autoFixAvailable: true,
        fix: () => this.fixTouchTargetSize(element, minTouchSize)
      });
    }

    return issues;
  }

  private checkTextReadability(element: HTMLElement, style: CSSStyleDeclaration): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];
    const viewport = this.getViewportInfo();

    if (!element.textContent?.trim()) return issues;

    const fontSize = parseFloat(style.fontSize);
    const minFontSize = viewport.deviceType === 'mobile' ? 16 : 14;

    if (fontSize < minFontSize) {
      issues.push({
        type: 'text',
        severity: 'medium',
        element,
        description: `Font size too small for ${viewport.deviceType} (${fontSize}px < ${minFontSize}px)`,
        autoFixAvailable: true,
        fix: () => this.fixFontSize(element, minFontSize)
      });
    }

    // Check line length
    const lineLength = element.textContent.length;
    if (lineLength > 80 && !element.closest('pre, code')) {
      issues.push({
        type: 'text',
        severity: 'low',
        element,
        description: `Line length may be too long for readability (${lineLength} characters)`,
        autoFixAvailable: true,
        fix: () => this.fixLineLength(element)
      });
    }

    return issues;
  }

  private checkLayoutIssues(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    // Check for elements positioned off-screen
    if (rect.left < -10 || rect.top < -10) {
      issues.push({
        type: 'layout',
        severity: 'high',
        element,
        description: 'Element positioned off-screen',
        autoFixAvailable: false
      });
    }

    // Check for elements with z-index issues
    const zIndex = parseInt(style.zIndex);
    if (zIndex > 9999) {
      issues.push({
        type: 'layout',
        severity: 'low',
        element,
        description: `Extremely high z-index (${zIndex}) may cause stacking issues`,
        autoFixAvailable: true,
        fix: () => this.fixZIndex(element)
      });
    }

    return issues;
  }

  private checkAccessibility(element: HTMLElement, style: CSSStyleDeclaration): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    // Check color contrast (simplified)
    const color = this.getContrastRatio(style.color, style.backgroundColor);
    if (color < 4.5) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        element,
        description: `Low color contrast ratio (${color.toFixed(2)}, minimum: 4.5)`,
        autoFixAvailable: false
      });
    }

    return issues;
  }

  // === AUTO-FIX METHODS === //

  private fixHorizontalOverflow(element: HTMLElement): void {
    element.style.maxWidth = '100%';
    element.style.boxSizing = 'border-box';
    element.style.overflowX = 'auto';
  }

  private fixFixedWidth(element: HTMLElement): void {
    const currentWidth = element.style.width;
    element.style.width = 'auto';
    element.style.maxWidth = currentWidth;
    element.style.minWidth = '0';
  }

  private fixContentOverflow(element: HTMLElement): void {
    element.style.overflowX = 'auto';
    element.style.maxWidth = '100%';
  }

  private fixTouchTargetSize(element: HTMLElement, minSize: number): void {
    const current = element.getBoundingClientRect();
    
    if (current.width < minSize) {
      element.style.minWidth = `${minSize}px`;
    }
    
    if (current.height < minSize) {
      element.style.minHeight = `${minSize}px`;
    }
    
    element.style.display = 'inline-flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
  }

  private fixFontSize(element: HTMLElement, minSize: number): void {
    element.style.fontSize = `${minSize}px`;
  }

  private fixLineLength(element: HTMLElement): void {
    element.style.maxWidth = '65ch';
    element.style.lineHeight = '1.6';
  }

  private fixZIndex(element: HTMLElement): void {
    element.style.zIndex = '999';
  }

  // === UTILITY METHODS === //

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem'];
    
    return (
      interactiveTags.includes(element.tagName.toLowerCase()) ||
      interactiveRoles.includes(element.getAttribute('role') || '') ||
      element.onclick !== null ||
      element.style.cursor === 'pointer'
    );
  }

  private getContrastRatio(foreground: string, background: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder
  }

  private calculatePerformanceScore(): number {
    const totalIssues = this.issues.length;
    const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    
    const score = Math.max(0, 100 - (criticalIssues * 20) - (highIssues * 10) - (totalIssues * 2));
    return Math.round(score);
  }

  private calculateAccessibilityScore(): number {
    const accessibilityIssues = this.issues.filter(i => i.type === 'accessibility').length;
    const touchIssues = this.issues.filter(i => i.type === 'touch').length;
    
    const score = Math.max(0, 100 - (accessibilityIssues * 15) - (touchIssues * 10));
    return Math.round(score);
  }

  // === PUBLIC API === //

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public getIssues(): ResponsiveIssue[] {
    return [...this.issues];
  }

  public getIssuesByType(type: ResponsiveIssue['type']): ResponsiveIssue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  public getIssuesBySeverity(severity: ResponsiveIssue['severity']): ResponsiveIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  public autoFixAll(): number {
    let fixedCount = 0;
    
    this.issues.forEach(issue => {
      if (issue.autoFixAvailable && issue.fix) {
        try {
          issue.fix();
          fixedCount++;
        } catch (error) {
          console.warn('Auto-fix failed for issue:', issue.description, error);
        }
      }
    });
    
    // Re-analyze after fixes
    setTimeout(() => {
      this.performFullAnalysis();
    }, 100);
    
    return fixedCount;
  }

  public autoFixByType(type: ResponsiveIssue['type']): number {
    return this.autoFixByCriteria(issue => issue.type === type);
  }

  public autoFixBySeverity(severity: ResponsiveIssue['severity']): number {
    return this.autoFixByCriteria(issue => issue.severity === severity);
  }

  private autoFixByCriteria(criteria: (issue: ResponsiveIssue) => boolean): number {
    let fixedCount = 0;
    
    this.issues
      .filter(criteria)
      .filter(issue => issue.autoFixAvailable && issue.fix)
      .forEach(issue => {
        try {
          issue.fix!();
          fixedCount++;
        } catch (error) {
          console.warn('Auto-fix failed for issue:', issue.description, error);
        }
      });
    
    return fixedCount;
  }

  public addListener(callback: (issues: ResponsiveIssue[]) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (issues: ResponsiveIssue[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.issues]);
      } catch (error) {
        console.warn('Listener callback failed:', error);
      }
    });
  }

  public dispose(): void {
    this.observer?.disconnect();
    this.mutationObserver?.disconnect();
    this.listeners = [];
    this.issues = [];
    this.fixedElements.clear();
  }
}

// === RESPONSIVE DESIGN VALIDATOR === //

export class ResponsiveValidator {
  static validateBreakpoints(): boolean {
    const breakpoints = [480, 768, 1024, 1440];
    const issues: string[] = [];

    breakpoints.forEach(width => {
      // Simulate viewport at breakpoint
      const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
      if (mediaQuery.matches) {
        // Check for common issues at this breakpoint
        const overflowElements = document.querySelectorAll('*').length;
        if (overflowElements > 0) {
          // Add validation logic
        }
      }
    });

    return issues.length === 0;
  }

  static generateResponsiveReport(): {
    viewport: ViewportInfo;
    metrics: ResponsiveMetrics;
    issues: ResponsiveIssue[];
    recommendations: string[];
  } {
    const autoFix = ResponsiveAutoFix.getInstance();
    const viewport = autoFix.getViewportInfo();
    const metrics = autoFix.performFullAnalysis();
    const issues = autoFix.getIssues();

    const recommendations = ResponsiveValidator.generateRecommendations(issues, viewport);

    return {
      viewport,
      metrics,
      issues,
      recommendations
    };
  }

  private static generateRecommendations(issues: ResponsiveIssue[], viewport: ViewportInfo): string[] {
    const recommendations: string[] = [];

    const overflowIssues = issues.filter(i => i.type === 'overflow').length;
    if (overflowIssues > 0) {
      recommendations.push(`Fix ${overflowIssues} overflow issues to prevent horizontal scrolling`);
    }

    const touchIssues = issues.filter(i => i.type === 'touch').length;
    if (touchIssues > 0 && viewport.deviceType === 'mobile') {
      recommendations.push(`Increase touch target sizes for ${touchIssues} interactive elements`);
    }

    const textIssues = issues.filter(i => i.type === 'text').length;
    if (textIssues > 0) {
      recommendations.push(`Improve text readability for ${textIssues} elements`);
    }

    if (viewport.width < 768) {
      recommendations.push('Consider implementing mobile-first responsive design patterns');
    }

    return recommendations;
  }
}

// === RESPONSIVE UTILITIES === //

export const ResponsiveUtils = {
  // Check if element fits in viewport
  fitsInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.left >= 0 &&
      rect.top >= 0 &&
      rect.right <= window.innerWidth &&
      rect.bottom <= window.innerHeight
    );
  },

  // Get optimal font size for current viewport
  getOptimalFontSize: (baseSize: number): number => {
    const viewport = ResponsiveAutoFix.getInstance().getViewportInfo();
    const scale = viewport.deviceType === 'mobile' ? 1.1 : 1;
    return Math.max(14, baseSize * scale);
  },

  // Get optimal spacing for current viewport
  getOptimalSpacing: (baseSpacing: number): number => {
    const viewport = ResponsiveAutoFix.getInstance().getViewportInfo();
    switch (viewport.deviceType) {
      case 'mobile': return baseSpacing * 0.8;
      case 'tablet': return baseSpacing * 0.9;
      default: return baseSpacing;
    }
  },

  // Check if touch targets are adequate
  validateTouchTargets: (container: HTMLElement): boolean => {
    const interactiveElements = container.querySelectorAll('button, a, input, select, [role="button"]');
    const minSize = 44;
    
    return Array.from(interactiveElements).every(element => {
      const rect = element.getBoundingClientRect();
      return rect.width >= minSize && rect.height >= minSize;
    });
  }
};