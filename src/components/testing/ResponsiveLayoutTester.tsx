/**
 * Responsive Layout Testing Component
 * 
 * Tests layout behavior across different screen sizes and device orientations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceDesktop, DeviceTablet, DeviceMobile, Warning, CheckCircle } from '@phosphor-icons/react';

interface ResponsiveTest {
  device: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  issues: string[];
  passed: boolean;
}

const TEST_VIEWPORTS = [
  { device: 'mobile' as const, width: 375, height: 667, name: 'iPhone SE' },
  { device: 'mobile' as const, width: 390, height: 844, name: 'iPhone 12' },
  { device: 'mobile' as const, width: 360, height: 740, name: 'Galaxy S20' },
  { device: 'tablet' as const, width: 768, height: 1024, name: 'iPad' },
  { device: 'tablet' as const, width: 820, height: 1180, name: 'iPad Air' },
  { device: 'desktop' as const, width: 1024, height: 768, name: 'Small Desktop' },
  { device: 'desktop' as const, width: 1280, height: 720, name: 'Medium Desktop' },
  { device: 'desktop' as const, width: 1920, height: 1080, name: 'Large Desktop' },
];

export function ResponsiveLayoutTester() {
  const [tests, setTests] = useState<ResponsiveTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runResponsiveTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const results: ResponsiveTest[] = [];
    
    for (const viewport of TEST_VIEWPORTS) {
      setCurrentTest(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Simulate viewport resize
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      try {
        // Create test iframe for isolated viewport testing
        const testFrame = await createTestFrame(viewport.width, viewport.height);
        const issues = await runViewportTests(testFrame, viewport);
        
        results.push({
          device: viewport.device,
          width: viewport.width,
          height: viewport.height,
          issues,
          passed: issues.length === 0
        });
        
        // Clean up test frame
        testFrame.remove();
        
      } catch (error) {
        console.error(`Test failed for ${viewport.name}:`, error);
        results.push({
          device: viewport.device,
          width: viewport.width,
          height: viewport.height,
          issues: [`Test execution failed: ${error}`],
          passed: false
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTests(results);
    setIsRunning(false);
    setCurrentTest('');
  };

  const createTestFrame = (width: number, height: number): Promise<HTMLIFrameElement> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.border = 'none';
      iframe.src = window.location.href;
      
      iframe.onload = () => {
        resolve(iframe);
      };
      
      document.body.appendChild(iframe);
    });
  };

  const runViewportTests = async (frame: HTMLIFrameElement, viewport: any): Promise<string[]> => {
    const issues: string[] = [];
    const doc = frame.contentDocument || frame.contentWindow?.document;
    
    if (!doc) {
      issues.push('Unable to access frame document');
      return issues;
    }

    // Test 1: Check for horizontal overflow
    if (doc.body.scrollWidth > viewport.width + 5) { // 5px tolerance
      issues.push('Horizontal overflow detected');
    }

    // Test 2: Check for overlapping elements
    const formElements = doc.querySelectorAll('input, select, textarea, button');
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      if (rect.right > viewport.width) {
        issues.push(`Form element extends beyond viewport width`);
        break;
      }
      
      if (rect.width < 44 && element.tagName === 'BUTTON') {
        issues.push('Button smaller than minimum touch target (44px)');
      }
    }

    // Test 3: Check for readable text sizes
    const textElements = doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    for (const element of textElements) {
      const styles = frame.contentWindow?.getComputedStyle(element);
      if (styles) {
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize < 14 && viewport.device === 'mobile') {
          issues.push('Text size too small for mobile (< 14px)');
          break;
        }
      }
    }

    // Test 4: Check for proper spacing
    const cards = doc.querySelectorAll('[class*="card"], .card');
    cards.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      if (rect.left < 16 || rect.right > viewport.width - 16) {
        issues.push('Cards not properly spaced from viewport edges');
      }
    });

    // Test 5: Check navigation accessibility
    const nav = doc.querySelector('nav');
    if (nav && viewport.device === 'mobile') {
      const navHeight = nav.getBoundingClientRect().height;
      if (navHeight > viewport.height * 0.3) {
        issues.push('Navigation takes up too much vertical space on mobile');
      }
    }

    // Test 6: Check modal/dialog behavior
    const dialogs = doc.querySelectorAll('[data-radix-dialog-content], .dialog');
    dialogs.forEach((dialog) => {
      const rect = (dialog as HTMLElement).getBoundingClientRect();
      if (rect.width > viewport.width * 0.95) {
        issues.push('Dialog too wide for viewport');
      }
      if (rect.height > viewport.height * 0.95) {
        issues.push('Dialog too tall for viewport');
      }
    });

    return issues;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <DeviceMobile className="h-4 w-4" />;
      case 'tablet': return <DeviceTablet className="h-4 w-4" />;
      case 'desktop': return <DeviceDesktop className="h-4 w-4" />;
      default: return <DeviceDesktop className="h-4 w-4" />;
    }
  };

  const getTestStats = () => {
    const passed = tests.filter(t => t.passed).length;
    const total = tests.length;
    return { passed, total, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const stats = getTestStats();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DeviceDesktop className="h-5 w-5" />
          Responsive Layout Testing
        </CardTitle>
        <CardDescription>
          Test your application's layout behavior across different screen sizes and devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runResponsiveTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              'Run Responsive Tests'
            )}
          </Button>
          
          {tests.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant={stats.passed === stats.total ? 'default' : 'secondary'}>
                {stats.passed}/{stats.total} Passed ({stats.percentage}%)
              </Badge>
            </div>
          )}
        </div>

        {isRunning && currentTest && (
          <Alert>
            <DeviceDesktop className="h-4 w-4" />
            <AlertDescription>{currentTest}</AlertDescription>
          </Alert>
        )}

        {tests.length > 0 && (
          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="tablet">Tablet</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <div className="space-y-3">
                  {TEST_VIEWPORTS.map((viewport, index) => {
                    const test = tests.find(t => 
                      t.width === viewport.width && t.height === viewport.height
                    );
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(viewport.device)}
                            <span className="font-medium">{viewport.name}</span>
                            <Badge variant="outline">
                              {viewport.width}x{viewport.height}
                            </Badge>
                          </div>
                          {test && (
                            <Badge variant={test.passed ? 'default' : 'destructive'}>
                              {test.passed ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />Passed</>
                              ) : (
                                <><Warning className="h-3 w-3 mr-1" />Failed</>
                              )}
                            </Badge>
                          )}
                        </div>
                        
                        {test && test.issues.length > 0 && (
                          <div className="space-y-1">
                            {test.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="text-sm text-red-600 flex items-center gap-1">
                                <Warning className="h-3 w-3" />
                                {issue}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {test && test.passed && (
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            All tests passed for this viewport
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {['mobile', 'tablet', 'desktop'].map(device => (
              <TabsContent key={device} value={device} className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Showing results for {device} devices only
                </div>
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  <div className="space-y-3">
                    {tests
                      .filter(test => test.device === device)
                      .map((test, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(test.device)}
                              <Badge variant="outline">
                                {test.width}x{test.height}
                              </Badge>
                            </div>
                            <Badge variant={test.passed ? 'default' : 'destructive'}>
                              {test.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          
                          {test.issues.length > 0 ? (
                            <div className="space-y-1">
                              {test.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="text-sm text-red-600">
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-green-600">
                              All tests passed
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default ResponsiveLayoutTester;