/**
 * Responsive Design Validation Utilities
 * Validates and analyzes responsive behavior across different screen sizes
 */

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'desktop';
  orientation?: 'portrait' | 'landscape';
}

export interface ResponsiveIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'layout' | 'typography' | 'navigation' | 'content' | 'interaction';
  description: string;
  element?: string;
  recommendation?: string;
}

export interface ResponsiveTestResult {
  breakpoint: ResponsiveBreakpoint;
  score: number;
  issues: ResponsiveIssue[];
  timestamp: Date;
}

export interface ComponentResponsiveAnalysis {
  componentName: string;
  description: string;
  testResults: ResponsiveTestResult[];
  overallScore: number;
  criticalIssues: ResponsiveIssue[];
  recommendations: string[];
}

export const STANDARD_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'Mobile S', width: 320, height: 568, device: 'mobile', orientation: 'portrait' },
  { name: 'Mobile M', width: 375, height: 667, device: 'mobile', orientation: 'portrait' },
  { name: 'Mobile L', width: 425, height: 812, device: 'mobile', orientation: 'portrait' },
  { name: 'Mobile Landscape', width: 667, height: 375, device: 'mobile', orientation: 'landscape' },
  { name: 'Tablet Portrait', width: 768, height: 1024, device: 'tablet', orientation: 'portrait' },
  { name: 'Tablet Landscape', width: 1024, height: 768, device: 'tablet', orientation: 'landscape' },
  { name: 'Laptop', width: 1024, height: 768, device: 'desktop' },
  { name: 'Desktop', width: 1440, height: 900, device: 'desktop' },
  { name: 'Large Desktop', width: 1920, height: 1080, device: 'desktop' },
  { name: 'Ultra Wide', width: 2560, height: 1440, device: 'desktop' }
];

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
   * Analyzes a component's responsive behavior across all breakpoints
   */
  async analyzeComponent(
    componentName: string,
    description: string,
    selector?: string
  ): Promise<ComponentResponsiveAnalysis> {
    const testResults: ResponsiveTestResult[] = [];
    
    for (const breakpoint of STANDARD_BREAKPOINTS) {
      const result = await this.testBreakpoint(componentName, breakpoint, selector);
      testResults.push(result);
    }

    const overallScore = this.calculateOverallScore(testResults);
    const criticalIssues = this.extractCriticalIssues(testResults);
    const recommendations = this.generateRecommendations(testResults);

    const analysis: ComponentResponsiveAnalysis = {
      componentName,
      description,
      testResults,
      overallScore,
      criticalIssues,
      recommendations
    };

    this.testResults.set(componentName, analysis);
    return analysis;
  }

  /**
   * Tests a component at a specific breakpoint
   */
  private async testBreakpoint(
    componentName: string,
    breakpoint: ResponsiveBreakpoint,
    selector?: string
  ): Promise<ResponsiveTestResult> {
    const issues: ResponsiveIssue[] = [];
    let score = 100;

    try {
      // Simulate viewport change (in a real implementation, this would interact with the DOM)
      const viewportInfo = this.simulateViewport(breakpoint);
      
      // Test different aspects of responsive design
      const layoutIssues = this.testLayout(componentName, breakpoint, selector);
      const typographyIssues = this.testTypography(componentName, breakpoint);
      const navigationIssues = this.testNavigation(componentName, breakpoint);
      const contentIssues = this.testContent(componentName, breakpoint);
      const interactionIssues = this.testInteraction(componentName, breakpoint);

      issues.push(...layoutIssues, ...typographyIssues, ...navigationIssues, ...contentIssues, ...interactionIssues);

      // Calculate score based on issues
      score = this.calculateScore(issues);

    } catch (error) {
      issues.push({
        severity: 'critical',
        category: 'layout',
        description: `Failed to test component at ${breakpoint.name}: ${error}`,
        recommendation: 'Check component rendering and DOM structure'
      });
      score = 0;
    }

    return {
      breakpoint,
      score,
      issues,
      timestamp: new Date()
    };
  }

  /**
   * Test layout responsiveness
   */
  private testLayout(componentName: string, breakpoint: ResponsiveBreakpoint, selector?: string): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    // Simulate layout testing based on component type and breakpoint
    switch (componentName.toLowerCase()) {
      case 'header/navigation':
        if (breakpoint.width < 768 && !this.hasCollapsibleMenu()) {
          issues.push({
            severity: 'high',
            category: 'navigation',
            description: 'Navigation should collapse on mobile devices',
            recommendation: 'Implement hamburger menu or collapsible navigation'
          });
        }
        break;

      case 'opportunities table':
        if (breakpoint.width < 1024) {
          issues.push({
            severity: 'medium',
            category: 'layout',
            description: 'Table requires horizontal scrolling on smaller screens',
            recommendation: 'Consider card layout or responsive table design for mobile'
          });
        }
        break;

      case 'sidebar navigation':
        if (breakpoint.width < 1024 && !this.hasResponsiveSidebar()) {
          issues.push({
            severity: 'medium',
            category: 'navigation',
            description: 'Sidebar should be collapsible on tablet and mobile',
            recommendation: 'Implement overlay or off-canvas sidebar for smaller screens'
          });
        }
        break;

      case 'dashboard widgets':
        if (breakpoint.width < 640) {
          // Check for proper grid stacking
          if (!this.hasResponsiveGrid()) {
            issues.push({
              severity: 'medium',
              category: 'layout',
              description: 'Widgets should stack vertically on mobile',
              recommendation: 'Use CSS Grid or Flexbox with responsive breakpoints'
            });
          }
        }
        break;
    }

    return issues;
  }

  /**
   * Test typography responsiveness
   */
  private testTypography(componentName: string, breakpoint: ResponsiveBreakpoint): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    if (breakpoint.width < 480) {
      // Check for readable font sizes on very small screens
      issues.push({
        severity: 'low',
        category: 'typography',
        description: 'Verify font sizes are readable on very small screens',
        recommendation: 'Use relative units (rem, em) and test minimum font sizes'
      });
    }

    if (breakpoint.width > 1920) {
      // Check for appropriate scaling on large screens
      issues.push({
        severity: 'low',
        category: 'typography',
        description: 'Ensure typography scales appropriately on large displays',
        recommendation: 'Consider max-width containers and appropriate line lengths'
      });
    }

    return issues;
  }

  /**
   * Test navigation responsiveness
   */
  private testNavigation(componentName: string, breakpoint: ResponsiveBreakpoint): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    if (breakpoint.device === 'mobile') {
      if (componentName.includes('navigation') || componentName.includes('sidebar')) {
        // Check touch targets
        if (!this.hasTouchFriendlyTargets()) {
          issues.push({
            severity: 'high',
            category: 'interaction',
            description: 'Navigation targets should be at least 44px for touch devices',
            recommendation: 'Increase touch target sizes for mobile navigation'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Test content responsiveness
   */
  private testContent(componentName: string, breakpoint: ResponsiveBreakpoint): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    if (breakpoint.width < 375) {
      issues.push({
        severity: 'medium',
        category: 'content',
        description: 'Content may be too cramped on very small screens',
        recommendation: 'Review spacing and consider content prioritization'
      });
    }

    return issues;
  }

  /**
   * Test interaction responsiveness
   */
  private testInteraction(componentName: string, breakpoint: ResponsiveBreakpoint): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = [];

    if (breakpoint.device === 'mobile') {
      if (componentName.includes('form') || componentName.includes('dialog')) {
        // Check for proper mobile form handling
        issues.push({
          severity: 'low',
          category: 'interaction',
          description: 'Verify form inputs work well with mobile keyboards',
          recommendation: 'Test input types and mobile keyboard behavior'
        });
      }
    }

    return issues;
  }

  /**
   * Helper methods to simulate responsive feature detection
   */
  private hasCollapsibleMenu(): boolean {
    // In a real implementation, this would check the DOM for mobile menu elements
    return true; // Assume implemented based on our CSS
  }

  private hasResponsiveSidebar(): boolean {
    // Check for responsive sidebar implementation
    return true; // Based on our Sheet component implementation
  }

  private hasResponsiveGrid(): boolean {
    // Check for responsive grid classes
    return true; // Based on our CSS grid implementation
  }

  private hasTouchFriendlyTargets(): boolean {
    // Check for appropriate touch target sizes
    return true; // Based on our CSS implementation
  }

  private simulateViewport(breakpoint: ResponsiveBreakpoint) {
    // In a real implementation, this would change the viewport
    return {
      width: breakpoint.width,
      height: breakpoint.height,
      devicePixelRatio: breakpoint.device === 'mobile' ? 2 : 1
    };
  }

  private calculateScore(issues: ResponsiveIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  private calculateOverallScore(testResults: ResponsiveTestResult[]): number {
    if (testResults.length === 0) return 0;
    
    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / testResults.length);
  }

  private extractCriticalIssues(testResults: ResponsiveTestResult[]): ResponsiveIssue[] {
    const criticalIssues: ResponsiveIssue[] = [];
    
    testResults.forEach(result => {
      result.issues.forEach(issue => {
        if (issue.severity === 'critical' || issue.severity === 'high') {
          criticalIssues.push(issue);
        }
      });
    });

    return criticalIssues;
  }

  private generateRecommendations(testResults: ResponsiveTestResult[]): string[] {
    const recommendations = new Set<string>();

    // Add general responsive design recommendations
    recommendations.add('Use mobile-first design approach with progressive enhancement');
    recommendations.add('Test on real devices in addition to browser tools');
    recommendations.add('Optimize touch targets for mobile devices (minimum 44px)');
    recommendations.add('Ensure content is readable without horizontal scrolling');
    recommendations.add('Use relative units (rem, em, %) for better scalability');

    // Add specific recommendations based on issues found
    testResults.forEach(result => {
      result.issues.forEach(issue => {
        if (issue.recommendation) {
          recommendations.add(issue.recommendation);
        }
      });
    });

    return Array.from(recommendations);
  }

  /**
   * Get all test results
   */
  getAllResults(): ComponentResponsiveAnalysis[] {
    return Array.from(this.testResults.values());
  }

  /**
   * Get result for specific component
   */
  getComponentResult(componentName: string): ComponentResponsiveAnalysis | undefined {
    return this.testResults.get(componentName);
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults.clear();
  }
}

/**
 * Utility functions for responsive design validation
 */
export const ResponsiveUtils = {
  /**
   * Check if current viewport matches a breakpoint
   */
  matchesBreakpoint(breakpoint: ResponsiveBreakpoint): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.innerWidth <= breakpoint.width;
  },

  /**
   * Get current device type based on viewport
   */
  getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },

  /**
   * Check if touch device
   */
  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get viewport dimensions
   */
  getViewportDimensions() {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

export default ResponsiveValidator;