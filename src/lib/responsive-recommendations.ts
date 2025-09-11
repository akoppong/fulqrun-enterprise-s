/**
 * Responsive Design Recommendations and Analysis
 * Provides actionable insights for improving responsive design
 */

export interface ResponsiveRecommendation {
  component: string;
  category: 'layout' | 'navigation' | 'typography' | 'interaction' | 'performance' | 'accessibility';
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  solution: string;
  implementation: string;
  affectedBreakpoints: string[];
  codeExample?: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface ResponsiveAnalysis {
  strengths: string[];
  weaknesses: string[];
  priorityActions: ResponsiveRecommendation[];
  implementationRoadmap: {
    phase: string;
    recommendations: ResponsiveRecommendation[];
    estimatedTime: string;
  }[];
}

// Comprehensive recommendations based on common responsive design issues
export const RESPONSIVE_RECOMMENDATIONS: ResponsiveRecommendation[] = [
  // Critical Layout Issues
  {
    component: 'Opportunities Table',
    category: 'layout',
    priority: 'critical',
    issue: 'Table content overflows on mobile devices causing horizontal scroll',
    solution: 'Implement responsive table pattern with card layout for mobile',
    implementation: 'Create conditional rendering that shows cards on mobile and table on desktop',
    affectedBreakpoints: ['Mobile Portrait', 'Mobile Landscape'],
    codeExample: `
// ResponsiveTable.tsx
const ResponsiveTable = ({ data }) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  
  return isMobile ? (
    <div className="space-y-4">
      {data.map(item => (
        <Card key={item.id} className="p-4">
          {/* Card layout for mobile */}
        </Card>
      ))}
    </div>
  ) : (
    <Table>
      {/* Traditional table for desktop */}
    </Table>
  );
};`,
    estimatedEffort: 'high'
  },
  
  {
    component: 'Navigation Sidebar',
    category: 'navigation',
    priority: 'critical',
    issue: 'Sidebar takes up too much space on tablet devices',
    solution: 'Implement collapsible sidebar with overlay mode for tablets',
    implementation: 'Add responsive sidebar behavior that collapses to icons on tablet',
    affectedBreakpoints: ['iPad Portrait', 'Android Tablet'],
    codeExample: `
// ResponsiveSidebar.tsx
const ResponsiveSidebar = () => {
  const [isTablet] = useMediaQuery('(max-width: 1024px) and (min-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(isTablet);
  
  return (
    <aside className={cn(
      'transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Sidebar content */}
    </aside>
  );
};`,
    estimatedEffort: 'medium'
  },

  // High Priority Issues
  {
    component: 'Form Dialogs',
    category: 'layout',
    priority: 'high',
    issue: 'Form fields stack poorly on mobile creating excessive scrolling',
    solution: 'Implement progressive column reduction and optimize field ordering',
    implementation: 'Use responsive grid that reduces from 3 columns to 2 to 1',
    affectedBreakpoints: ['All Mobile', 'Small Tablet'],
    codeExample: `
// ResponsiveForm.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {formFields.map(field => (
    <FormField key={field.name} className="w-full" />
  ))}
</div>`,
    estimatedEffort: 'low'
  },

  {
    component: 'Dashboard Widgets',
    category: 'layout',
    priority: 'high',
    issue: 'Widget grid creates gaps and poor spacing on various screen sizes',
    solution: 'Implement container queries and flexible grid system',
    implementation: 'Use CSS container queries for widget-level responsiveness',
    affectedBreakpoints: ['Medium Laptop', 'iPad Landscape'],
    estimatedEffort: 'medium'
  },

  {
    component: 'Opportunity Detail Modal',
    category: 'layout',
    priority: 'high',
    issue: 'Modal content becomes cramped and difficult to navigate on mobile',
    solution: 'Convert to full-screen modal with proper tab navigation on mobile',
    implementation: 'Implement responsive modal that goes full-screen below 768px',
    affectedBreakpoints: ['All Mobile'],
    codeExample: `
// ResponsiveModal.tsx
const ResponsiveModal = ({ children, ...props }) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  
  return (
    <Dialog {...props}>
      <DialogContent className={cn(
        isMobile ? 'w-screen h-screen max-w-none m-0 rounded-none' : 'max-w-4xl'
      )}>
        {children}
      </DialogContent>
    </Dialog>
  );
};`,
    estimatedEffort: 'medium'
  },

  // Medium Priority Issues
  {
    component: 'Typography System',
    category: 'typography',
    priority: 'medium',
    issue: 'Font sizes do not scale appropriately across device types',
    solution: 'Implement fluid typography using clamp() functions',
    implementation: 'Replace fixed font sizes with fluid scaling',
    affectedBreakpoints: ['All'],
    codeExample: `
/* Fluid Typography */
:root {
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.35vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
}`,
    estimatedEffort: 'low'
  },

  {
    component: 'Touch Targets',
    category: 'interaction',
    priority: 'medium',
    issue: 'Interactive elements too small for comfortable touch interaction',
    solution: 'Implement minimum 44px touch targets for all interactive elements',
    implementation: 'Add touch-target utility classes and apply consistently',
    affectedBreakpoints: ['All Mobile', 'All Tablet'],
    estimatedEffort: 'low'
  },

  {
    component: 'Content Prioritization',
    category: 'layout',
    priority: 'medium',
    issue: 'Secondary content competes with primary content on small screens',
    solution: 'Implement progressive disclosure and content hiding',
    implementation: 'Use responsive utilities to hide/show content by importance',
    affectedBreakpoints: ['Mobile Portrait'],
    codeExample: `
/* Content Priority System */
.content-priority-high { order: -1; }
.content-priority-medium { order: 0; }
.content-priority-low { order: 1; }

@media (max-width: 768px) {
  .content-priority-low { display: none; }
}`,
    estimatedEffort: 'medium'
  },

  // Performance Related
  {
    component: 'Image Assets',
    category: 'performance',
    priority: 'medium',
    issue: 'Images not optimized for different screen densities and sizes',
    solution: 'Implement responsive images with srcset and proper sizing',
    implementation: 'Use next/image or similar with responsive sizing',
    affectedBreakpoints: ['All'],
    estimatedEffort: 'medium'
  },

  // Accessibility Improvements
  {
    component: 'Focus Management',
    category: 'accessibility',
    priority: 'medium',
    issue: 'Focus indicators not visible or appropriate across all screen sizes',
    solution: 'Enhance focus styles with responsive considerations',
    implementation: 'Implement larger focus indicators on touch devices',
    affectedBreakpoints: ['All Mobile', 'All Tablet'],
    estimatedEffort: 'low'
  }
];

// Best practices organized by category
export const RESPONSIVE_BEST_PRACTICES = {
  design: [
    'Design mobile-first, then enhance for larger screens',
    'Use relative units (rem, em, %) instead of fixed pixels',
    'Maintain adequate contrast ratios across all themes',
    'Design touch targets to be minimum 44×44px',
    'Consider thumb-friendly zones for mobile navigation',
    'Test on real devices, not just browser tools',
    'Optimize for common device orientations',
    'Use progressive enhancement for advanced features'
  ],
  technical: [
    'Use CSS Grid and Flexbox for flexible layouts',
    'Implement container queries for component-level responsiveness',
    'Use media queries strategically, not excessively',
    'Optimize images with responsive sizing and formats',
    'Minimize layout shifts with proper size reservations',
    'Use semantic HTML for better accessibility',
    'Implement proper focus management and keyboard navigation',
    'Test with screen readers and assistive technologies'
  ],
  performance: [
    'Lazy load images and non-critical content',
    'Use efficient CSS selectors and minimize reflows',
    'Implement critical CSS for above-the-fold content',
    'Optimize JavaScript bundles for mobile networks',
    'Use service workers for offline functionality',
    'Monitor Core Web Vitals across devices',
    'Implement proper caching strategies',
    'Test on slow network connections'
  ],
  testing: [
    'Test on multiple real devices and browsers',
    'Use automated accessibility testing tools',
    'Implement visual regression testing',
    'Test with different font sizes and zoom levels',
    'Validate color contrast across all themes',
    'Test keyboard navigation thoroughly',
    'Verify touch interactions work properly',
    'Test with assistive technologies'
  ]
};

export class ResponsiveAnalyzer {
  /**
   * Analyze current responsive implementation
   */
  static analyzeCurrentImplementation(): ResponsiveAnalysis {
    const strengths: string[] = [
      'Uses modern CSS Grid and Flexbox for layouts',
      'Implements mobile-first responsive design approach',
      'Provides comprehensive set of responsive utility classes',
      'Includes touch-friendly interaction patterns',
      'Uses semantic HTML structure for accessibility',
      'Implements proper focus management',
      'Provides consistent spacing and typography scales',
      'Includes responsive navigation patterns'
    ];

    const weaknesses: string[] = [
      'Tables need better mobile responsiveness patterns',
      'Modal dialogs could be more mobile-friendly',
      'Some components lack container query support',
      'Typography scaling could be more fluid',
      'Touch targets need consistent sizing verification',
      'Content prioritization needs improvement on small screens',
      'Image responsiveness needs optimization',
      'Performance on low-end devices needs testing'
    ];

    // Get priority actions from recommendations
    const priorityActions = RESPONSIVE_RECOMMENDATIONS
      .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    // Create implementation roadmap
    const implementationRoadmap = [
      {
        phase: 'Phase 1: Critical Fixes',
        recommendations: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'critical'),
        estimatedTime: '1-2 weeks'
      },
      {
        phase: 'Phase 2: High Impact Improvements',
        recommendations: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'high'),
        estimatedTime: '2-3 weeks'
      },
      {
        phase: 'Phase 3: Polish and Optimization',
        recommendations: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'medium'),
        estimatedTime: '1-2 weeks'
      },
      {
        phase: 'Phase 4: Advanced Features',
        recommendations: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'low'),
        estimatedTime: '1 week'
      }
    ];

    return {
      strengths,
      weaknesses,
      priorityActions,
      implementationRoadmap
    };
  }

  /**
   * Generate specific recommendations for a component
   */
  static getComponentRecommendations(componentName: string): ResponsiveRecommendation[] {
    return RESPONSIVE_RECOMMENDATIONS.filter(rec => 
      rec.component.toLowerCase().includes(componentName.toLowerCase())
    );
  }

  /**
   * Get recommendations by priority
   */
  static getRecommendationsByPriority(priority: ResponsiveRecommendation['priority']): ResponsiveRecommendation[] {
    return RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === priority);
  }

  /**
   * Get recommendations by category
   */
  static getRecommendationsByCategory(category: ResponsiveRecommendation['category']): ResponsiveRecommendation[] {
    return RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.category === category);
  }

  /**
   * Calculate implementation effort score
   */
  static calculateImplementationEffort(): {
    totalRecommendations: number;
    effortBreakdown: Record<string, number>;
    estimatedTimeRange: string;
  } {
    const total = RESPONSIVE_RECOMMENDATIONS.length;
    const effortBreakdown = RESPONSIVE_RECOMMENDATIONS.reduce((acc, rec) => {
      acc[rec.estimatedEffort] = (acc[rec.estimatedEffort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Rough time estimates
    const lowEffortWeeks = (effortBreakdown.low || 0) * 0.5;
    const mediumEffortWeeks = (effortBreakdown.medium || 0) * 1.5;
    const highEffortWeeks = (effortBreakdown.high || 0) * 3;
    
    const totalWeeks = lowEffortWeeks + mediumEffortWeeks + highEffortWeeks;
    const estimatedTimeRange = `${Math.ceil(totalWeeks * 0.8)}-${Math.ceil(totalWeeks * 1.2)} weeks`;

    return {
      totalRecommendations: total,
      effortBreakdown,
      estimatedTimeRange
    };
  }

  /**
   * Generate priority matrix
   */
  static generatePriorityMatrix(): {
    criticalHigh: ResponsiveRecommendation[];
    criticalMedium: ResponsiveRecommendation[];
    highHigh: ResponsiveRecommendation[];
    highMedium: ResponsiveRecommendation[];
    quickWins: ResponsiveRecommendation[];
  } {
    const recommendations = RESPONSIVE_RECOMMENDATIONS;
    
    return {
      criticalHigh: recommendations.filter(r => r.priority === 'critical' && r.estimatedEffort === 'high'),
      criticalMedium: recommendations.filter(r => r.priority === 'critical' && r.estimatedEffort !== 'high'),
      highHigh: recommendations.filter(r => r.priority === 'high' && r.estimatedEffort === 'high'),
      highMedium: recommendations.filter(r => r.priority === 'high' && r.estimatedEffort !== 'high'),
      quickWins: recommendations.filter(r => r.estimatedEffort === 'low' && r.priority !== 'low')
    };
  }
}

// Export analysis instance
export const responsiveAnalyzer = new ResponsiveAnalyzer();