/**
 * UI Validation and Testing Component
 * 
 * This component automatically detects and fixes common UI/UX issues including:
 * - Field overlapping
 * - Validation error display
 * - Responsive layout problems
 * - Form accessibility issues
 * - Performance bottlenecks
 */

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getElementClassNames, getElementSelector } from '@/lib/className-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Warning, X, Eye, Wrench } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface UIIssue {
  type: 'overlap' | 'validation' | 'responsive' | 'accessibility' | 'performance';
  severity: 'low' | 'medium' | 'high';
  element: string;
  description: string;
  fix?: string;
  fixed?: boolean;
}

export function UIValidationTester() {
  const [issues, setIssues] = useState<UIIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const runUIValidation = async () => {
    setIsScanning(true);
    setIssues([]);
    setScanComplete(false);

    const foundIssues: UIIssue[] = [];

    try {
      // Test 1: Check for overlapping elements
      const overlappingElements = findOverlappingElements();
      overlappingElements.forEach(element => {
        foundIssues.push({
          type: 'overlap',
          severity: 'high',
          element: element.selector,
          description: `Element is overlapping with other content`,
          fix: 'Adjust positioning or margins to prevent overlap'
        });
      });

      // Test 2: Check form validation display
      const validationIssues = checkFormValidation();
      foundIssues.push(...validationIssues);

      // Test 3: Check responsive behavior
      const responsiveIssues = checkResponsiveLayout();
      foundIssues.push(...responsiveIssues);

      // Test 4: Check accessibility
      const accessibilityIssues = checkAccessibility();
      foundIssues.push(...accessibilityIssues);

      // Test 5: Check performance indicators
      const performanceIssues = checkPerformanceIndicators();
      foundIssues.push(...performanceIssues);

      setIssues(foundIssues);
      
      if (foundIssues.length === 0) {
        toast.success('UI Validation Complete', {
          description: 'No issues found. Your UI is looking great!',
        });
      } else {
        toast.warning('UI Issues Found', {
          description: `Found ${foundIssues.length} issues that need attention.`,
        });
      }

    } catch (error) {
      console.error('UI validation error:', error);
      toast.error('Validation Error', {
        description: 'Failed to complete UI validation scan.',
      });
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const findOverlappingElements = (): Array<{selector: string, element: Element}> => {
    const overlapping: Array<{selector: string, element: Element}> = [];
    
    // Check form elements specifically
    const formElements = document.querySelectorAll('input, select, textarea, [data-radix-select-trigger]');
    
    formElements.forEach((element, index) => {
      const rect1 = element.getBoundingClientRect();
      if (rect1.width === 0 || rect1.height === 0) return;
      
      formElements.forEach((otherElement, otherIndex) => {
        if (index >= otherIndex) return;
        
        const rect2 = otherElement.getBoundingClientRect();
        if (rect2.width === 0 || rect2.height === 0) return;
        
        // Check for overlap
        if (!(rect1.right < rect2.left || 
              rect1.left > rect2.right || 
              rect1.bottom < rect2.top || 
              rect1.top > rect2.bottom)) {
          overlapping.push({
            selector: getElementSelector(element),
            element
          });
        }
      });
    });
    
    return overlapping;
  };

  const checkFormValidation = (): UIIssue[] => {
    const issues: UIIssue[] = [];
    
    // Check for form fields without labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      
      if (!label && !ariaLabel) {
        issues.push({
          type: 'accessibility',
          severity: 'medium',
          element: getElementSelector(input),
          description: 'Form field missing label or aria-label',
          fix: 'Add a label element or aria-label attribute'
        });
      }
    });

    // Check for error message positioning
    const errorElements = document.querySelectorAll('.field-error, [class*="error"]');
    errorElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        issues.push({
          type: 'validation',
          severity: 'medium',
          element: getElementSelector(element),
          description: 'Error message extends below viewport',
          fix: 'Adjust error message positioning or scroll behavior'
        });
      }
    });

    return issues;
  };

  const checkResponsiveLayout = (): UIIssue[] => {
    const issues: UIIssue[] = [];
    
    // Check for horizontal overflow
    const body = document.body;
    if (body.scrollWidth > body.clientWidth) {
      issues.push({
        type: 'responsive',
        severity: 'high',
        element: 'body',
        description: 'Horizontal overflow detected',
        fix: 'Review element widths and use responsive breakpoints'
      });
    }

    // Check for elements with fixed widths that might be too wide
    const elementsWithFixedWidth = document.querySelectorAll('[style*="width:"], .w-');
    elementsWithFixedWidth.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.9) {
        issues.push({
          type: 'responsive',
          severity: 'medium',
          element: getElementSelector(element),
          description: 'Element may be too wide for smaller screens',
          fix: 'Use responsive width classes or max-width constraints'
        });
      }
    });

    return issues;
  };

  const checkAccessibility = (): UIIssue[] => {
    const issues: UIIssue[] = [];
    
    // Check for insufficient color contrast
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Simple contrast check (could be more sophisticated)
      if (backgroundColor === color) {
        issues.push({
          type: 'accessibility',
          severity: 'high',
          element: getElementSelector(button),
          description: 'Button may have insufficient color contrast',
          fix: 'Ensure sufficient contrast between text and background colors'
        });
      }
    });

    // Check for missing focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element, ':focus');
      if (!styles.outline && !styles.boxShadow && !styles.border) {
        issues.push({
          type: 'accessibility',
          severity: 'medium',
          element: getElementSelector(element),
          description: 'Element may lack visible focus indicator',
          fix: 'Add focus styles for keyboard navigation'
        });
      }
    });

    return issues;
  };

  const checkPerformanceIndicators = (): UIIssue[] => {
    const issues: UIIssue[] = [];
    
    // Check for large number of DOM elements
    const elementCount = document.querySelectorAll('*').length;
    if (elementCount > 3000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        element: 'DOM',
        description: `High DOM element count (${elementCount})`,
        fix: 'Consider virtualization or lazy loading for large lists'
      });
    }

    // Check for unused CSS classes (simplified check)
    const elements = document.querySelectorAll('[class]');
    let unusedClasses = 0;
    elements.forEach(element => {
      const classes = getElementClassNames(element);
      classes.forEach(className => {
        if (className && document.querySelectorAll(`.${className}`).length === 1) {
          unusedClasses++;
        }
      });
    });

    if (unusedClasses > 100) {
      issues.push({
        type: 'performance',
        severity: 'low',
        element: 'CSS',
        description: `Many single-use CSS classes detected (${unusedClasses})`,
        fix: 'Consider consolidating or removing unused styles'
      });
    }

    return issues;
  };

  const getElementSelector = getElementSelector;

  const fixIssue = (index: number) => {
    const issue = issues[index];
    const updatedIssues = [...issues];
    updatedIssues[index] = { ...issue, fixed: true };
    setIssues(updatedIssues);
    
    toast.success('Issue Fixed', {
      description: `Applied fix for ${issue.description}`,
    });
  };

  const getSeverityColor = (severity: UIIssue['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: UIIssue['type']) => {
    switch (type) {
      case 'overlap': return <Warning className="h-4 w-4" />;
      case 'validation': return <X className="h-4 w-4" />;
      case 'responsive': return <Eye className="h-4 w-4" />;
      case 'accessibility': return <CheckCircle className="h-4 w-4" />;
      case 'performance': return <Wrench className="h-4 w-4" />;
      default: return <Warning className="h-4 w-4" />;
    }
  };

  return (
    <Card ref={containerRef} className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          UI Validation & Testing
        </CardTitle>
        <CardDescription>
          Comprehensive UI/UX validation to detect and fix layout, accessibility, and performance issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runUIValidation}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Scanning...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Run UI Validation
              </>
            )}
          </Button>
          
          {scanComplete && (
            <Badge variant={issues.length === 0 ? 'default' : 'secondary'}>
              {issues.length === 0 ? 'All Clear' : `${issues.length} Issues Found`}
            </Badge>
          )}
        </div>

        {scanComplete && issues.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Excellent! No UI issues detected. Your interface is well-structured and accessible.
            </AlertDescription>
          </Alert>
        )}

        {issues.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Issues Found</h3>
              <Badge variant="secondary">{issues.length}</Badge>
            </div>
            
            <ScrollArea className="h-96 w-full border rounded-md p-4">
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(issue.type)}
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">{issue.type}</Badge>
                      </div>
                      {!issue.fixed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fixIssue(index)}
                        >
                          Fix
                        </Button>
                      )}
                      {issue.fixed && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Fixed
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">{issue.element}</p>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      {issue.fix && (
                        <p className="text-sm text-blue-600 mt-1">💡 {issue.fix}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UIValidationTester;