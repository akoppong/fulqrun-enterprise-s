/**
 * Comprehensive Responsive Design Validator
 * Tests components across multiple viewports and device types
 */

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'large-desktop';
  orientation?: 'portrait' | 'landscape';
  pixelRatio?: number;
}

export interface ResponsiveIssue {
  type: 'layout' | 'overflow' | 'accessibility' | 'performance' | 'usability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'spacing' | 'typography' | 'navigation' | 'content' | 'interaction' | 'visual';
  description: string;
  recommendation?: string;
  element?: string;
  cssProperty?: string;
}

export interface ViewportTestResult {
  breakpoint: ResponsiveBreakpoint;
  score: number;
  issues: ResponsiveIssue[];
  metrics: {
    contentVisibility: number;
    interactionTargets: number;
    textReadability: number;
    layoutStability: number;
    performanceScore: number;
  };
  recommendations: string[];
}

export interface ComponentResponsiveAnalysis {
  componentName: string;
  description: string;
  selector: string;
  testResults: ViewportTestResult[];
  overallScore: number;
  criticalIssues: ResponsiveIssue[];
  recommendations: string[];
}

// Standard testing breakpoints covering major device categories
export const STANDARD_BREAKPOINTS: ResponsiveBreakpoint[] = [
  // Mobile Devices (Portrait)
  { name: 'iPhone SE', width: 375, height: 667, device: 'mobile', orientation: 'portrait', pixelRatio: 2 },
  { name: 'iPhone 12/13', width: 390, height: 844, device: 'mobile', orientation: 'portrait', pixelRatio: 3 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, device: 'mobile', orientation: 'portrait', pixelRatio: 3 },
  { name: 'Android Small', width: 360, height: 640, device: 'mobile', orientation: 'portrait', pixelRatio: 2 },
  { name: 'Android Medium', width: 412, height: 915, device: 'mobile', orientation: 'portrait', pixelRatio: 2.6 },
  
  // Mobile Landscape
  { name: 'iPhone Landscape', width: 844, height: 390, device: 'mobile', orientation: 'landscape', pixelRatio: 3 },
  
  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, device: 'tablet', orientation: 'portrait', pixelRatio: 2 },
  { name: 'iPad Air', width: 820, height: 1180, device: 'tablet', orientation: 'portrait', pixelRatio: 2 },
  { name: 'iPad Pro 11"', width: 834, height: 1194, device: 'tablet', orientation: 'portrait', pixelRatio: 2 },
  { name: 'Android Tablet', width: 800, height: 1280, device: 'tablet', orientation: 'portrait', pixelRatio: 1.5 },
  
  // Tablet Landscape
  { name: 'iPad Landscape', width: 1024, height: 768, device: 'tablet', orientation: 'landscape', pixelRatio: 2 },
  
  // Laptops & Desktops
  { name: 'Small Laptop', width: 1366, height: 768, device: 'laptop', pixelRatio: 1 },
  { name: 'Medium Laptop', width: 1440, height: 900, device: 'laptop', pixelRatio: 1 },
  { name: 'Large Laptop', width: 1680, height: 1050, device: 'laptop', pixelRatio: 1 },
  { name: 'Desktop HD', width: 1920, height: 1080, device: 'desktop', pixelRatio: 1 },
  { name: 'Desktop QHD', width: 2560, height: 1440, device: 'desktop', pixelRatio: 1 },
  { name: 'Desktop 4K', width: 3840, height: 2160, device: 'large-desktop', pixelRatio: 1 },
];

export class ResponsiveUtils {
  /**
   * Get current viewport dimensions
   */
  static getViewportDimensions() {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 };
    }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Determine device type based on current viewport
   */
  static getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const { width } = this.getViewportDimensions();
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Check if device supports touch
   */
  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           // @ts-ignore
           navigator.msMaxTouchPoints > 0;
  }

  /**
   * Get CSS media query for breakpoint
   */
  static getMediaQuery(breakpoint: ResponsiveBreakpoint): string {
    return `(max-width: ${breakpoint.width}px)`;
  }

  /**
   * Test if element is visible in viewport
   */
  static isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportDimensions();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewport.height &&
      rect.right <= viewport.width
    );
  }

  /**
   * Calculate element visibility percentage
   */
  static getElementVisibilityPercentage(element: Element): number {
    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportDimensions();
    
    const visibleWidth = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0));
    const visibleHeight = Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
    
    const visibleArea = visibleWidth * visibleHeight;
    const totalArea = rect.width * rect.height;
    
    return totalArea > 0 ? (visibleArea / totalArea) * 100 : 0;
  }

  /**
   * Check if element has adequate touch target size
   */
  static hasAdequateTouchTargetSize(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG recommendation
    
    return rect.width >= minSize && rect.height >= minSize;
  }

  /**
   * Calculate text readability score
   */
  static calculateTextReadabilityScore(element: Element): number {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const lineHeight = parseFloat(styles.lineHeight);
    const textColor = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    let score = 100;
    
    // Font size check
    if (fontSize < 16) score -= 20;
    if (fontSize < 14) score -= 30;
    
    // Line height check
    const computedLineHeight = lineHeight / fontSize;
    if (computedLineHeight < 1.4) score -= 15;
    if (computedLineHeight > 1.8) score -= 10;
    
    // Basic contrast check (simplified)
    if (textColor === backgroundColor) score -= 50;
    
    return Math.max(0, score);
  }

  /**
   * Simulate viewport resize
   */
  static async simulateViewportResize(width: number, height: number): Promise<void> {
    // In a real browser environment, this would use browser dev tools API
    // For testing purposes, we'll simulate the resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Allow layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export class ResponsiveValidator {
  private static instance: ResponsiveValidator;
  private testResults: Map<string, ComponentResponsiveAnalysis> = new Map();

  static getInstance(): ResponsiveValidator {
    if (!ResponsiveValidator.instance) {
      ResponsiveValidator.instance = new ResponsiveValidator();
    }
    return ResponsiveValidator.instance;
  }

  /**
   * Analyze a component across all standard breakpoints
   */
  async analyzeComponent(
    componentName: string,
    description: string,
    selector: string
  ): Promise<ComponentResponsiveAnalysis> {
    const testResults: ViewportTestResult[] = [];
    const criticalIssues: ResponsiveIssue[] = [];
    const recommendations: string[] = [];

    // Test each breakpoint
    for (const breakpoint of STANDARD_BREAKPOINTS) {
      try {
        const result = await this.testComponentAtBreakpoint(
          selector,
          breakpoint
        );
        testResults.push(result);

        // Collect critical issues
        const critical = result.issues.filter(
          issue => issue.severity === 'critical' || issue.severity === 'high'
        );
        criticalIssues.push(...critical);

        // Collect recommendations
        recommendations.push(...result.recommendations);
      } catch (error) {
        console.warn(`Failed to test ${componentName} at ${breakpoint.name}:`, error);
      }
    }

    // Calculate overall score
    const overallScore = testResults.length > 0
      ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length)
      : 0;

    const analysis: ComponentResponsiveAnalysis = {
      componentName,
      description,
      selector,
      testResults,
      overallScore,
      criticalIssues: this.deduplicateIssues(criticalIssues),
      recommendations: this.deduplicateRecommendations(recommendations)
    };

    this.testResults.set(componentName, analysis);
    return analysis;
  }

  /**
   * Test component at specific breakpoint
   */
  private async testComponentAtBreakpoint(
    selector: string,
    breakpoint: ResponsiveBreakpoint
  ): Promise<ViewportTestResult> {
    // Simulate viewport resize
    await ResponsiveUtils.simulateViewportResize(breakpoint.width, breakpoint.height);

    const elements = document.querySelectorAll(selector);
    const issues: ResponsiveIssue[] = [];
    const recommendations: string[] = [];

    let contentVisibility = 100;
    let interactionTargets = 100;
    let textReadability = 100;
    let layoutStability = 100;
    let performanceScore = 100;

    if (elements.length === 0) {
      issues.push({
        type: 'layout',
        severity: 'high',
        category: 'content',
        description: `Component not found with selector "${selector}"`,
        recommendation: 'Verify component is rendered and selector is correct'
      });
      
      return {
        breakpoint,
        score: 0,
        issues,
        metrics: { contentVisibility: 0, interactionTargets: 0, textReadability: 0, layoutStability: 0, performanceScore: 0 },
        recommendations
      };
    }

    // Test each element
    for (const element of Array.from(elements)) {
      // Content visibility test
      const visibility = ResponsiveUtils.getElementVisibilityPercentage(element);
      if (visibility < 90) {
        contentVisibility = Math.min(contentVisibility, visibility);
        issues.push({
          type: 'layout',
          severity: visibility < 50 ? 'critical' : 'medium',
          category: 'content',
          description: `Content is ${Math.round(100 - visibility)}% hidden from view`,
          recommendation: 'Adjust layout to ensure content remains visible'
        });
      }

      // Check for horizontal overflow
      const rect = element.getBoundingClientRect();
      if (rect.right > breakpoint.width) {
        issues.push({
          type: 'overflow',
          severity: 'high',
          category: 'layout',
          description: 'Content extends beyond viewport width',
          recommendation: 'Implement responsive layout or horizontal scrolling'
        });
        layoutStability -= 20;
      }

      // Touch target size (for mobile devices)
      if (breakpoint.device === 'mobile') {
        const interactiveElements = element.querySelectorAll(
          'button, a, input, select, textarea, [role="button"], [tabindex]'
        );
        
        for (const interactive of Array.from(interactiveElements)) {
          if (!ResponsiveUtils.hasAdequateTouchTargetSize(interactive)) {
            interactionTargets -= 10;
            issues.push({
              type: 'accessibility',
              severity: 'high',
              category: 'interaction',
              description: 'Interactive element smaller than 44px touch target',
              recommendation: 'Increase padding or minimum size for touch-friendly interaction',
              element: interactive.tagName.toLowerCase()
            });
          }
        }
      }

      // Text readability
      const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label');
      for (const textEl of Array.from(textElements)) {
        const readabilityScore = ResponsiveUtils.calculateTextReadabilityScore(textEl);
        if (readabilityScore < 80) {
          textReadability = Math.min(textReadability, readabilityScore);
          issues.push({
            type: 'accessibility',
            severity: readabilityScore < 50 ? 'high' : 'medium',
            category: 'typography',
            description: 'Text may be difficult to read on this screen size',
            recommendation: 'Increase font size or improve contrast for better readability'
          });
        }
      }

      // Layout-specific tests based on device type
      if (breakpoint.device === 'mobile') {
        recommendations.push(
          'Consider stack layout for mobile devices',
          'Implement touch-friendly navigation',
          'Optimize content for single-column layout'
        );
      } else if (breakpoint.device === 'tablet') {
        recommendations.push(
          'Utilize two-column layouts where appropriate',
          'Consider hybrid navigation patterns',
          'Optimize for both portrait and landscape orientations'
        );
      }

      // Performance considerations
      if (breakpoint.device === 'mobile') {
        performanceScore -= 5; // Mobile generally has more performance constraints
        recommendations.push('Optimize images and resources for mobile networks');
      }
    }

    // Calculate final score
    const metrics = {
      contentVisibility: Math.max(0, contentVisibility),
      interactionTargets: Math.max(0, interactionTargets),
      textReadability: Math.max(0, textReadability),
      layoutStability: Math.max(0, layoutStability),
      performanceScore: Math.max(0, performanceScore)
    };

    const score = Math.round(
      (metrics.contentVisibility * 0.3 +
       metrics.interactionTargets * 0.25 +
       metrics.textReadability * 0.2 +
       metrics.layoutStability * 0.15 +
       metrics.performanceScore * 0.1)
    );

    return {
      breakpoint,
      score,
      issues: this.deduplicateIssues(issues),
      metrics,
      recommendations: this.deduplicateRecommendations(recommendations)
    };
  }

  /**
   * Get all test results
   */
  getAllResults(): ComponentResponsiveAnalysis[] {
    return Array.from(this.testResults.values());
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults.clear();
  }

  /**
   * Get specific component results
   */
  getComponentResults(componentName: string): ComponentResponsiveAnalysis | undefined {
    return this.testResults.get(componentName);
  }

  /**
   * Remove duplicate issues
   */
  private deduplicateIssues(issues: ResponsiveIssue[]): ResponsiveIssue[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.type}-${issue.severity}-${issue.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Remove duplicate recommendations
   */
  private deduplicateRecommendations(recommendations: string[]): string[] {
    return Array.from(new Set(recommendations));
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(): {
    totalComponents: number;
    averageScore: number;
    criticalIssuesCount: number;
    deviceBreakdown: Record<string, { components: number; averageScore: number }>;
    recommendationSummary: string[];
  } {
    const results = this.getAllResults();
    
    if (results.length === 0) {
      return {
        totalComponents: 0,
        averageScore: 0,
        criticalIssuesCount: 0,
        deviceBreakdown: {},
        recommendationSummary: []
      };
    }

    const totalComponents = results.length;
    const averageScore = Math.round(
      results.reduce((sum, result) => sum + result.overallScore, 0) / totalComponents
    );
    
    const criticalIssuesCount = results.reduce(
      (sum, result) => sum + result.criticalIssues.length, 0
    );

    // Device breakdown
    const deviceBreakdown: Record<string, { components: number; averageScore: number }> = {};
    
    for (const device of ['mobile', 'tablet', 'laptop', 'desktop']) {
      const deviceResults = results.map(result => {
        const deviceTests = result.testResults.filter(test => test.breakpoint.device === device);
        if (deviceTests.length === 0) return 0;
        return deviceTests.reduce((sum, test) => sum + test.score, 0) / deviceTests.length;
      }).filter(score => score > 0);

      if (deviceResults.length > 0) {
        deviceBreakdown[device] = {
          components: deviceResults.length,
          averageScore: Math.round(deviceResults.reduce((sum, score) => sum + score, 0) / deviceResults.length)
        };
      }
    }

    // Top recommendations
    const allRecommendations = results.flatMap(result => result.recommendations);
    const recommendationCounts = allRecommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendationSummary = Object.entries(recommendationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);

    return {
      totalComponents,
      averageScore,
      criticalIssuesCount,
      deviceBreakdown,
      recommendationSummary
    };
  }
}

// Export singleton instance
export const responsiveValidator = ResponsiveValidator.getInstance();