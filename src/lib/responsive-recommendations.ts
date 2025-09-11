/**
 * Responsive Design Recommendations and Best Practices
 * Based on comprehensive analysis of the FulQrun CRM application
 */

export interface ResponsiveRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'layout' | 'typography' | 'navigation' | 'forms' | 'tables' | 'modals' | 'performance';
  component: string;
  issue: string;
  solution: string;
  implementation: string;
  affectedBreakpoints: string[];
  estimatedImpact: string;
}

export const RESPONSIVE_RECOMMENDATIONS: ResponsiveRecommendation[] = [
  // Critical Issues
  {
    id: 'nav-mobile-hamburger',
    priority: 'critical',
    category: 'navigation',
    component: 'Header Navigation',
    issue: 'Navigation menu not accessible on mobile devices',
    solution: 'Implement hamburger menu with proper accessibility',
    implementation: 'Add mobile menu toggle, off-canvas navigation, and proper ARIA labels',
    affectedBreakpoints: ['Mobile S', 'Mobile M', 'Mobile L'],
    estimatedImpact: 'High - Critical for mobile user experience'
  },
  {
    id: 'opportunity-modal-fullscreen',
    priority: 'critical',
    category: 'modals',
    component: 'Opportunity Detail Modal',
    issue: 'Modal content overflows and is not scrollable on mobile',
    solution: 'Full-screen modal layout with proper scrolling areas',
    implementation: 'Use full viewport dimensions with nested scroll areas',
    affectedBreakpoints: ['Mobile S', 'Mobile M', 'Mobile L', 'Tablet Portrait'],
    estimatedImpact: 'High - Core functionality broken on mobile'
  },
  {
    id: 'table-horizontal-scroll',
    priority: 'critical',
    category: 'tables',
    component: 'Opportunities Table',
    issue: 'Table data not accessible on mobile due to width constraints',
    solution: 'Responsive table with horizontal scroll and fixed columns',
    implementation: 'Add horizontal scroll container with sticky first column',
    affectedBreakpoints: ['Mobile S', 'Mobile M', 'Mobile L', 'Tablet Portrait'],
    estimatedImpact: 'High - Data visibility critical for business operations'
  },

  // High Priority Issues
  {
    id: 'sidebar-responsive-collapse',
    priority: 'high',
    category: 'navigation',
    component: 'Sidebar Navigation',
    issue: 'Sidebar takes too much space on tablet and mobile',
    solution: 'Collapsible sidebar with overlay on smaller screens',
    implementation: 'Auto-collapse below 1024px with overlay behavior',
    affectedBreakpoints: ['Tablet Portrait', 'Tablet Landscape', 'Mobile devices'],
    estimatedImpact: 'Medium - Improves content area usage'
  },
  {
    id: 'form-three-column-responsive',
    priority: 'high',
    category: 'forms',
    component: 'Opportunity Edit Form',
    issue: 'Three-column form layout cramped on smaller screens',
    solution: 'Progressive column reduction based on screen size',
    implementation: 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1 pattern',
    affectedBreakpoints: ['Tablet Portrait', 'Mobile devices'],
    estimatedImpact: 'Medium - Better form usability'
  },
  {
    id: 'dashboard-widget-stacking',
    priority: 'high',
    category: 'layout',
    component: 'Dashboard Widgets',
    issue: 'Widgets not stacking properly on mobile',
    solution: 'Responsive grid with proper widget stacking',
    implementation: 'CSS Grid with responsive columns and gap adjustments',
    affectedBreakpoints: ['Mobile S', 'Mobile M', 'Mobile L'],
    estimatedImpact: 'Medium - Dashboard usability on mobile'
  },

  // Medium Priority Issues
  {
    id: 'typography-scaling',
    priority: 'medium',
    category: 'typography',
    component: 'Global Typography',
    issue: 'Text sizes not optimized for different screen sizes',
    solution: 'Responsive typography scale with relative units',
    implementation: 'Use clamp() for fluid typography and proper line heights',
    affectedBreakpoints: ['All breakpoints'],
    estimatedImpact: 'Medium - Improved readability across devices'
  },
  {
    id: 'touch-targets',
    priority: 'medium',
    category: 'navigation',
    component: 'Interactive Elements',
    issue: 'Touch targets smaller than 44px on mobile',
    solution: 'Ensure minimum touch target sizes',
    implementation: 'Add min-height and min-width classes for touch elements',
    affectedBreakpoints: ['Mobile devices', 'Tablet Portrait'],
    estimatedImpact: 'Medium - Better mobile accessibility'
  },
  {
    id: 'card-spacing',
    priority: 'medium',
    category: 'layout',
    component: 'Card Components',
    issue: 'Inconsistent spacing and padding on different screen sizes',
    solution: 'Responsive padding and margin system',
    implementation: 'Use responsive padding classes (p-4 sm:p-6 lg:p-8)',
    affectedBreakpoints: ['All breakpoints'],
    estimatedImpact: 'Low - Visual consistency improvement'
  },

  // Low Priority Issues
  {
    id: 'image-optimization',
    priority: 'low',
    category: 'performance',
    component: 'Images and Media',
    issue: 'Images not optimized for different screen densities',
    solution: 'Responsive images with srcset and proper sizing',
    implementation: 'Use picture element with multiple source sizes',
    affectedBreakpoints: ['All breakpoints'],
    estimatedImpact: 'Low - Performance optimization'
  },
  {
    id: 'scroll-indicators',
    priority: 'low',
    category: 'navigation',
    component: 'Scrollable Areas',
    issue: 'No visual indication of scrollable content',
    solution: 'Add scroll indicators and better scrollbar styling',
    implementation: 'Custom scrollbar styles and scroll shadows',
    affectedBreakpoints: ['All breakpoints'],
    estimatedImpact: 'Low - UX enhancement'
  }
];

export const RESPONSIVE_BEST_PRACTICES = {
  design: [
    'Use mobile-first approach for CSS development',
    'Design with content hierarchy in mind',
    'Prioritize essential content for smaller screens',
    'Maintain consistent spacing ratios across breakpoints',
    'Consider thumb zones for mobile navigation',
    'Use progressive disclosure for complex interfaces'
  ],
  technical: [
    'Use CSS Grid and Flexbox for layout flexibility',
    'Implement proper viewport meta tag',
    'Use relative units (rem, em, %) instead of fixed pixels',
    'Leverage CSS custom properties for consistent theming',
    'Implement proper focus management for keyboard navigation',
    'Test with real devices, not just browser tools'
  ],
  accessibility: [
    'Ensure minimum 44px touch targets',
    'Maintain proper color contrast ratios',
    'Provide proper ARIA labels for responsive elements',
    'Test with screen readers across different viewports',
    'Implement proper heading hierarchy',
    'Ensure keyboard navigation works on all screen sizes'
  ],
  performance: [
    'Optimize images for different screen densities',
    'Use CSS containment for better performance',
    'Implement lazy loading for off-screen content',
    'Minimize layout shifts during responsive changes',
    'Use efficient CSS selectors and avoid deep nesting',
    'Monitor Core Web Vitals across different devices'
  ]
};

export const BREAKPOINT_STRATEGY = {
  mobile: {
    range: '320px - 767px',
    strategy: 'Single column layout, stacked content, touch-optimized interactions',
    considerations: [
      'Content prioritization critical',
      'Navigation must be accessible',
      'Forms should use full width',
      'Tables need alternative layouts'
    ]
  },
  tablet: {
    range: '768px - 1023px',
    strategy: 'Two-column layouts, hybrid navigation, optimized for both touch and mouse',
    considerations: [
      'Balance between mobile and desktop patterns',
      'Consider both portrait and landscape orientations',
      'Maintain touch target sizes',
      'Optimize for reading and data entry'
    ]
  },
  desktop: {
    range: '1024px+',
    strategy: 'Multi-column layouts, full feature visibility, mouse-optimized interactions',
    considerations: [
      'Utilize available screen real estate',
      'Support keyboard shortcuts',
      'Enable advanced features',
      'Optimize for productivity workflows'
    ]
  }
};

/**
 * Utility functions for responsive analysis
 */
export class ResponsiveAnalyzer {
  static analyzeCurrentImplementation(): {
    strengths: string[];
    weaknesses: string[];
    recommendations: ResponsiveRecommendation[];
  } {
    return {
      strengths: [
        'Mobile-first CSS approach implemented',
        'Consistent breakpoint system using Tailwind',
        'Flexible grid layouts with CSS Grid',
        'Responsive typography baseline established',
        'Accessibility considerations in navigation',
        'Progressive enhancement approach'
      ],
      weaknesses: [
        'Table layouts not mobile-optimized',
        'Modal dialogs need mobile improvements',
        'Form layouts could be more responsive',
        'Touch target sizes need verification',
        'Sidebar behavior needs tablet optimization',
        'Performance optimization opportunities exist'
      ],
      recommendations: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'critical' || rec.priority === 'high')
    };
  }

  static getImplementationPlan(): {
    phase1: ResponsiveRecommendation[];
    phase2: ResponsiveRecommendation[];
    phase3: ResponsiveRecommendation[];
  } {
    return {
      phase1: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'critical'),
      phase2: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'high'),
      phase3: RESPONSIVE_RECOMMENDATIONS.filter(rec => rec.priority === 'medium' || rec.priority === 'low')
    };
  }

  static getBreakpointRecommendations(width: number): string[] {
    if (width < 768) {
      return [
        'Prioritize essential content',
        'Use single-column layouts',
        'Implement touch-friendly navigation',
        'Ensure forms are thumb-accessible'
      ];
    } else if (width < 1024) {
      return [
        'Use two-column layouts where appropriate',
        'Balance touch and mouse interactions',
        'Consider both orientations',
        'Optimize for reading and data entry'
      ];
    } else {
      return [
        'Utilize full screen real estate',
        'Enable advanced features',
        'Optimize for productivity',
        'Support keyboard shortcuts'
      ];
    }
  }
}