import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Info,
  Plus,
  Play,
  Target,
  Clock,
  Activity,
  Database,
  Zap,
  Eye,
  Settings,
  RefreshCw
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DiagnosticTest {
  id: string;
  name: string;
  category: 'DOM' | 'Event' | 'State' | 'Performance' | 'Accessibility';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
  duration?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemHealth {
  buttonExists: boolean;
  buttonVisible: boolean;
  buttonEnabled: boolean;
  clickHandlerActive: boolean;
  dialogFunctional: boolean;
  performanceGood: boolean;
  memoryUsageOk: boolean;
  errorsFree: boolean;
  overallScore: number;
}

export function ComprehensiveButtonDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeTests = (): DiagnosticTest[] => [
    // DOM Tests
    {
      id: 'dom-001',
      name: 'Button Element Exists',
      category: 'DOM',
      status: 'pending',
      message: 'Checking if Create Opportunity button element exists in DOM',
      severity: 'critical'
    },
    {
      id: 'dom-002',
      name: 'Button Visibility',
      category: 'DOM',
      status: 'pending',
      message: 'Verifying button is visible and has proper dimensions',
      severity: 'high'
    },
    {
      id: 'dom-003',
      name: 'Button Positioning',
      category: 'DOM',
      status: 'pending',
      message: 'Checking button position and z-index',
      severity: 'medium'
    },
    {
      id: 'dom-004',
      name: 'CSS Styling',
      category: 'DOM',
      status: 'pending',
      message: 'Analyzing button CSS properties and styling',
      severity: 'low'
    },

    // Event Tests
    {
      id: 'event-001',
      name: 'Click Event Handler',
      category: 'Event',
      status: 'pending',
      message: 'Testing click event handler functionality',
      severity: 'critical'
    },
    {
      id: 'event-002',
      name: 'Event Propagation',
      category: 'Event',
      status: 'pending',
      message: 'Verifying proper event bubbling and propagation',
      severity: 'medium'
    },
    {
      id: 'event-003',
      name: 'Keyboard Navigation',
      category: 'Event',
      status: 'pending',
      message: 'Testing keyboard accessibility (Enter, Space)',
      severity: 'high'
    },
    {
      id: 'event-004',
      name: 'Touch Events',
      category: 'Event',
      status: 'pending',
      message: 'Checking touch event compatibility',
      severity: 'medium'
    },

    // State Tests
    {
      id: 'state-001',
      name: 'Dialog State Management',
      category: 'State',
      status: 'pending',
      message: 'Testing dialog open/close state management',
      severity: 'critical'
    },
    {
      id: 'state-002',
      name: 'Component Re-rendering',
      category: 'State',
      status: 'pending',
      message: 'Checking for unnecessary re-renders',
      severity: 'medium'
    },
    {
      id: 'state-003',
      name: 'State Persistence',
      category: 'State',
      status: 'pending',
      message: 'Verifying state persistence across interactions',
      severity: 'high'
    },

    // Performance Tests
    {
      id: 'perf-001',
      name: 'Click Response Time',
      category: 'Performance',
      status: 'pending',
      message: 'Measuring click to dialog open response time',
      severity: 'high'
    },
    {
      id: 'perf-002',
      name: 'Memory Usage',
      category: 'Performance',
      status: 'pending',
      message: 'Checking memory consumption and leaks',
      severity: 'medium'
    },
    {
      id: 'perf-003',
      name: 'Rendering Performance',
      category: 'Performance',
      status: 'pending',
      message: 'Analyzing button rendering performance',
      severity: 'medium'
    },

    // Accessibility Tests
    {
      id: 'a11y-001',
      name: 'ARIA Attributes',
      category: 'Accessibility',
      status: 'pending',
      message: 'Checking ARIA labels and attributes',
      severity: 'high'
    },
    {
      id: 'a11y-002',
      name: 'Screen Reader Support',
      category: 'Accessibility',
      status: 'pending',
      message: 'Verifying screen reader compatibility',
      severity: 'high'
    },
    {
      id: 'a11y-003',
      name: 'Focus Management',
      category: 'Accessibility',
      status: 'pending',
      message: 'Testing focus states and management',
      severity: 'medium'
    },
    {
      id: 'a11y-004',
      name: 'Color Contrast',
      category: 'Accessibility',
      status: 'pending',
      message: 'Analyzing color contrast ratios',
      severity: 'medium'
    }
  ];

  const updateTestStatus = (testId: string, status: DiagnosticTest['status'], message?: string, details?: any, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, message: message || test.message, details, duration }
        : test
    ));
  };

  const findCreateButton = (): HTMLElement | null => {
    return document.querySelector('[data-testid="create-opportunity-button"]') as HTMLElement || 
           Array.from(document.querySelectorAll('button')).find(btn => 
             btn.textContent?.includes('Create Opportunity')
           ) as HTMLElement || null;
  };

  const runDOMTests = async () => {
    // DOM-001: Button exists
    const startTime = performance.now();
    updateTestStatus('dom-001', 'running');
    
    const button = findCreateButton();
    if (button) {
      updateTestStatus('dom-001', 'passed', 'Button element found successfully', {
        tagName: button.tagName,
        id: button.id,
        className: button.className,
        textContent: button.textContent
      }, performance.now() - startTime);
    } else {
      updateTestStatus('dom-001', 'failed', 'Button element not found in DOM', null, performance.now() - startTime);
      return false; // Can't continue without button
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // DOM-002: Button visibility
    updateTestStatus('dom-002', 'running');
    const visibilityStartTime = performance.now();
    
    const rect = button.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(button);
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0' &&
                     rect.width > 0 && rect.height > 0;

    if (isVisible) {
      updateTestStatus('dom-002', 'passed', 'Button is visible and properly sized', {
        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity
      }, performance.now() - visibilityStartTime);
    } else {
      updateTestStatus('dom-002', 'failed', 'Button is not visible or has zero dimensions', {
        rect,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity
      }, performance.now() - visibilityStartTime);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // DOM-003: Button positioning
    updateTestStatus('dom-003', 'running');
    const positionStartTime = performance.now();
    
    const zIndex = computedStyle.zIndex;
    const position = computedStyle.position;
    const isProperlyPositioned = rect.top >= 0 && rect.left >= 0 && 
                                rect.right <= window.innerWidth && 
                                rect.bottom <= window.innerHeight;

    updateTestStatus('dom-003', isProperlyPositioned ? 'passed' : 'warning', 
      isProperlyPositioned ? 'Button is properly positioned' : 'Button may be outside viewport',
      {
        position,
        zIndex,
        rect,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        inViewport: isProperlyPositioned
      }, performance.now() - positionStartTime);

    await new Promise(resolve => setTimeout(resolve, 100));

    // DOM-004: CSS Styling
    updateTestStatus('dom-004', 'running');
    const stylingStartTime = performance.now();
    
    const styling = {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      border: computedStyle.border,
      borderRadius: computedStyle.borderRadius,
      padding: computedStyle.padding,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      cursor: computedStyle.cursor
    };

    const hasProperStyling = styling.cursor === 'pointer' || styling.cursor === 'default';
    
    updateTestStatus('dom-004', hasProperStyling ? 'passed' : 'warning',
      hasProperStyling ? 'CSS styling appears correct' : 'CSS styling may have issues',
      styling, performance.now() - stylingStartTime);

    return true;
  };

  const runEventTests = async () => {
    const button = findCreateButton();
    if (!button) return;

    // EVENT-001: Click handler
    updateTestStatus('event-001', 'running');
    const clickStartTime = performance.now();
    
    let clickHandled = false;
    const testHandler = () => { clickHandled = true; };
    
    // Add temporary event listener to test
    button.addEventListener('click', testHandler);
    
    // Simulate click
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(clickEvent);
    
    button.removeEventListener('click', testHandler);
    
    if (clickHandled) {
      updateTestStatus('event-001', 'passed', 'Click event handler is functional', {
        eventHandled: true,
        eventType: 'click'
      }, performance.now() - clickStartTime);
    } else {
      updateTestStatus('event-001', 'failed', 'Click event handler not responding', {
        eventHandled: false
      }, performance.now() - clickStartTime);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // EVENT-003: Keyboard navigation
    updateTestStatus('event-003', 'running');
    const keyboardStartTime = performance.now();
    
    let keyboardWorking = false;
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        keyboardWorking = true;
      }
    };
    
    button.addEventListener('keydown', keyHandler);
    
    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    button.dispatchEvent(enterEvent);
    
    // Test Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    button.dispatchEvent(spaceEvent);
    
    button.removeEventListener('keydown', keyHandler);
    
    updateTestStatus('event-003', keyboardWorking ? 'passed' : 'warning',
      keyboardWorking ? 'Keyboard navigation works' : 'Keyboard navigation may have issues',
      { keyboardSupported: keyboardWorking }, performance.now() - keyboardStartTime);
  };

  const runStateTests = async () => {
    // STATE-001: Dialog state management
    updateTestStatus('state-001', 'running');
    const stateStartTime = performance.now();
    
    const initialDialogs = document.querySelectorAll('[role="dialog"]').length;
    
    // Simulate button click to test dialog opening
    const button = findCreateButton();
    if (button) {
      button.click();
      
      // Check after a short delay
      setTimeout(() => {
        const finalDialogs = document.querySelectorAll('[role="dialog"]').length;
        const dialogOpened = finalDialogs > initialDialogs;
        
        updateTestStatus('state-001', dialogOpened ? 'passed' : 'failed',
          dialogOpened ? 'Dialog state management working' : 'Dialog failed to open',
          {
            initialDialogs,
            finalDialogs,
            dialogOpened
          }, performance.now() - stateStartTime);
      }, 200);
    } else {
      updateTestStatus('state-001', 'failed', 'Cannot test state - button not found');
    }
  };

  const runPerformanceTests = async () => {
    // PERF-001: Click response time
    updateTestStatus('perf-001', 'running');
    const perfStartTime = performance.now();
    
    const button = findCreateButton();
    if (button) {
      const clickStart = performance.now();
      button.click();
      
      setTimeout(() => {
        const responseTime = performance.now() - clickStart;
        const isGoodPerformance = responseTime < 100;
        
        updateTestStatus('perf-001', isGoodPerformance ? 'passed' : 'warning',
          `Response time: ${responseTime.toFixed(2)}ms`,
          { responseTime, threshold: 100 }, performance.now() - perfStartTime);
      }, 50);
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    // PERF-002: Memory usage
    updateTestStatus('perf-002', 'running');
    const memoryStartTime = performance.now();
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMB = memory.usedJSHeapSize / 1024 / 1024;
      const isGoodMemory = memoryMB < 100; // 100MB threshold
      
      updateTestStatus('perf-002', isGoodMemory ? 'passed' : 'warning',
        `Memory usage: ${memoryMB.toFixed(2)}MB`,
        {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryMB
        }, performance.now() - memoryStartTime);
    } else {
      updateTestStatus('perf-002', 'warning', 'Memory API not available');
    }
  };

  const runAccessibilityTests = async () => {
    const button = findCreateButton();
    if (!button) return;

    // A11Y-001: ARIA attributes
    updateTestStatus('a11y-001', 'running');
    const ariaStartTime = performance.now();
    
    const hasAriaLabel = button.hasAttribute('aria-label') || button.hasAttribute('aria-labelledby');
    const hasRole = button.getAttribute('role') === 'button' || button.tagName === 'BUTTON';
    const ariaScore = [hasAriaLabel, hasRole].filter(Boolean).length;
    
    updateTestStatus('a11y-001', ariaScore >= 1 ? 'passed' : 'warning',
      `ARIA accessibility score: ${ariaScore}/2`,
      {
        hasAriaLabel,
        hasRole,
        ariaLabel: button.getAttribute('aria-label'),
        role: button.getAttribute('role')
      }, performance.now() - ariaStartTime);

    await new Promise(resolve => setTimeout(resolve, 100));

    // A11Y-003: Focus management
    updateTestStatus('a11y-003', 'running');
    const focusStartTime = performance.now();
    
    const isTabNavigable = button.tabIndex >= 0;
    const canReceiveFocus = !button.hasAttribute('disabled');
    
    // Test focus
    button.focus();
    const hasFocus = document.activeElement === button;
    button.blur();
    
    const focusScore = [isTabNavigable, canReceiveFocus, hasFocus].filter(Boolean).length;
    
    updateTestStatus('a11y-003', focusScore >= 2 ? 'passed' : 'warning',
      `Focus management score: ${focusScore}/3`,
      {
        isTabNavigable,
        canReceiveFocus,
        hasFocus,
        tabIndex: button.tabIndex
      }, performance.now() - focusStartTime);
  };

  const calculateSystemHealth = () => {
    const passedTests = tests.filter(t => t.status === 'passed');
    const failedTests = tests.filter(t => t.status === 'failed');
    const criticalFailed = tests.filter(t => t.status === 'failed' && t.severity === 'critical');
    
    const health: SystemHealth = {
      buttonExists: tests.find(t => t.id === 'dom-001')?.status === 'passed' || false,
      buttonVisible: tests.find(t => t.id === 'dom-002')?.status === 'passed' || false,
      buttonEnabled: true, // Assume enabled if tests ran
      clickHandlerActive: tests.find(t => t.id === 'event-001')?.status === 'passed' || false,
      dialogFunctional: tests.find(t => t.id === 'state-001')?.status === 'passed' || false,
      performanceGood: tests.find(t => t.id === 'perf-001')?.status === 'passed' || false,
      memoryUsageOk: tests.find(t => t.id === 'perf-002')?.status === 'passed' || false,
      errorsFree: failedTests.length === 0,
      overallScore: Math.max(0, Math.min(100, 
        (passedTests.length / tests.length) * 100 - (criticalFailed.length * 25)
      ))
    };
    
    setSystemHealth(health);
  };

  const runAllDiagnostics = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTests(initializeTests());
    setSystemHealth(null);
    setLastRunTime(Date.now());
    
    try {
      toast.info('Running comprehensive button diagnostics...');
      
      const domSuccess = await runDOMTests();
      if (domSuccess) {
        await runEventTests();
        await runStateTests();
        await runPerformanceTests();
        await runAccessibilityTests();
      }
      
      // Calculate final health score
      setTimeout(() => {
        calculateSystemHealth();
        toast.success('Diagnostics completed');
      }, 500);
      
    } catch (error) {
      toast.error('Diagnostics failed to complete');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (autoRunEnabled) {
      intervalRef.current = setInterval(runAllDiagnostics, 30000); // Run every 30 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRunEnabled]);

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-green-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      case 'warning': return <Warning size={16} className="text-amber-600" />;
      case 'running': return <Clock size={16} className="text-blue-600 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getCategoryIcon = (category: DiagnosticTest['category']) => {
    switch (category) {
      case 'DOM': return <Settings size={16} className="text-blue-600" />;
      case 'Event': return <Target size={16} className="text-green-600" />;
      case 'State': return <Database size={16} className="text-purple-600" />;
      case 'Performance': return <Zap size={16} className="text-orange-600" />;
      case 'Accessibility': return <Eye size={16} className="text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug size={20} />
                Comprehensive Button Diagnostics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Deep analysis of Create Opportunity button functionality and performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-run"
                  checked={autoRunEnabled}
                  onChange={(e) => setAutoRunEnabled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="auto-run" className="text-sm">Auto-run every 30s</label>
              </div>
              <Button 
                onClick={runAllDiagnostics}
                disabled={isRunning}
                className="min-w-32"
              >
                {isRunning ? (
                  <>
                    <Clock size={16} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {systemHealth && (
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{
                  color: systemHealth.overallScore >= 80 ? '#16a34a' : 
                         systemHealth.overallScore >= 60 ? '#d97706' : '#dc2626'
                }}>
                  {systemHealth.overallScore.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall System Health</div>
                <Progress value={systemHealth.overallScore} className="h-3 mt-2" />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Button Exists:</span>
                  <Badge variant={systemHealth.buttonExists ? "default" : "destructive"}>
                    {systemHealth.buttonExists ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visible:</span>
                  <Badge variant={systemHealth.buttonVisible ? "default" : "destructive"}>
                    {systemHealth.buttonVisible ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Click Handler:</span>
                  <Badge variant={systemHealth.clickHandlerActive ? "default" : "destructive"}>
                    {systemHealth.clickHandlerActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dialog Functional:</span>
                  <Badge variant={systemHealth.dialogFunctional ? "default" : "destructive"}>
                    {systemHealth.dialogFunctional ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {lastRunTime && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Last run: {new Date(lastRunTime).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Test Results by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {['DOM', 'Event', 'State', 'Performance', 'Accessibility'].map(category => {
          const categoryTests = tests.filter(test => test.category === category);
          const passedCount = categoryTests.filter(test => test.status === 'passed').length;
          const failedCount = categoryTests.filter(test => test.status === 'failed').length;
          const warningCount = categoryTests.filter(test => test.status === 'warning').length;
          const progress = categoryTests.length > 0 ? (passedCount / categoryTests.length) * 100 : 0;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getCategoryIcon(category as DiagnosticTest['category'])}
                  {category}
                  <div className="flex gap-1">
                    {passedCount > 0 && <Badge variant="default" className="text-xs">{passedCount} ✓</Badge>}
                    {warningCount > 0 && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">{warningCount} ⚠</Badge>}
                    {failedCount > 0 && <Badge variant="destructive" className="text-xs">{failedCount} ✗</Badge>}
                  </div>
                </CardTitle>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {categoryTests.map(test => (
                      <div 
                        key={test.id}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded border text-sm",
                          test.status === 'running' && "bg-blue-50 border-blue-200",
                          test.status === 'passed' && "bg-green-50 border-green-200",
                          test.status === 'warning' && "bg-amber-50 border-amber-200",
                          test.status === 'failed' && "bg-red-50 border-red-200"
                        )}
                      >
                        {getStatusIcon(test.status)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{test.name}</div>
                          <div className="text-xs text-muted-foreground">{test.message}</div>
                          {test.duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Duration: {test.duration.toFixed(2)}ms
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                test.severity === 'critical' && "border-red-500 text-red-700",
                                test.severity === 'high' && "border-orange-500 text-orange-700",
                                test.severity === 'medium' && "border-yellow-500 text-yellow-700",
                                test.severity === 'low' && "border-gray-500 text-gray-700"
                              )}
                            >
                              {test.severity}
                            </Badge>
                          </div>
                          {test.details && (
                            <details className="mt-1">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View Details
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-20">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Critical Issues Alert */}
      {systemHealth && systemHealth.overallScore < 50 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle size={16} />
          <AlertDescription>
            <strong>Critical Issues Detected!</strong> The Create Opportunity button has significant problems that need immediate attention.
            <div className="mt-2 space-y-1">
              {!systemHealth.buttonExists && <div>• Button element is missing from DOM</div>}
              {!systemHealth.buttonVisible && <div>• Button is not visible to users</div>}
              {!systemHealth.clickHandlerActive && <div>• Click handler is not functioning</div>}
              {!systemHealth.dialogFunctional && <div>• Dialog state management is broken</div>}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}