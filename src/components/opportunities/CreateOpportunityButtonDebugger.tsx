import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Bug, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Info,
  Plus,
  Clock,
  Activity,
  Settings,
  Eye
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DebugLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
  component?: string;
  action?: string;
}

interface ButtonState {
  isEnabled: boolean;
  isVisible: boolean;
  hasClickHandler: boolean;
  className: string;
  position: DOMRect | null;
  computedStyle: any;
}

interface CreateOpportunityButtonDebuggerProps {
  onCreateClick: () => void;
  isDialogOpen: boolean;
  className?: string;
}

export function CreateOpportunityButtonDebugger({ 
  onCreateClick, 
  isDialogOpen,
  className = ''
}: CreateOpportunityButtonDebuggerProps) {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const addDebugLog = (level: DebugLog['level'], message: string, data?: any, component?: string, action?: string) => {
    const log: DebugLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      message,
      data,
      component,
      action
    };
    
    setDebugLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
    
    // Also log to console with appropriate level
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[CreateButton Debug] ${message}`, data);
  };

  const analyzeButtonState = () => {
    if (!buttonRef.current) {
      addDebugLog('error', 'Button reference not found', null, 'ButtonAnalyzer', 'analyzeState');
      return;
    }

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(button);

    const state: ButtonState = {
      isEnabled: !button.disabled,
      isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
      hasClickHandler: button.onclick !== null || button.getAttribute('onclick') !== null,
      className: button.className,
      position: rect,
      computedStyle: {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        pointerEvents: computedStyle.pointerEvents,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position,
        width: computedStyle.width,
        height: computedStyle.height,
        backgroundColor: computedStyle.backgroundColor,
        border: computedStyle.border,
        cursor: computedStyle.cursor
      }
    };

    setButtonState(state);
    addDebugLog('info', 'Button state analyzed', state, 'ButtonAnalyzer', 'analyzeState');
    
    return state;
  };

  const runButtonTests = async () => {
    addDebugLog('info', 'Starting comprehensive button tests', null, 'ButtonTester', 'runTests');
    const results: any[] = [];

    try {
      // Test 1: Button existence
      const buttonExists = buttonRef.current !== null;
      results.push({
        test: 'Button Existence',
        passed: buttonExists,
        details: buttonExists ? 'Button element found' : 'Button element not found'
      });

      if (!buttonExists) {
        setTestResults(results);
        return;
      }

      // Test 2: Button visibility
      const state = analyzeButtonState();
      const isVisible = state?.isVisible && state.position!.width > 0 && state.position!.height > 0;
      results.push({
        test: 'Button Visibility',
        passed: isVisible,
        details: isVisible ? 'Button is visible' : 'Button is hidden or has no dimensions'
      });

      // Test 3: Button enabled state
      results.push({
        test: 'Button Enabled',
        passed: state?.isEnabled || false,
        details: state?.isEnabled ? 'Button is enabled' : 'Button is disabled'
      });

      // Test 4: Click handler presence
      const hasHandler = typeof onCreateClick === 'function';
      results.push({
        test: 'Click Handler',
        passed: hasHandler,
        details: hasHandler ? 'onClick handler is present' : 'onClick handler missing'
      });

      // Test 5: CSS styling check
      const hasProperStyling = state?.computedStyle.cursor === 'pointer' || state?.computedStyle.cursor === 'default';
      results.push({
        test: 'CSS Styling',
        passed: hasProperStyling,
        details: `Cursor style: ${state?.computedStyle.cursor}`
      });

      // Test 6: Z-index check
      const zIndex = parseInt(state?.computedStyle.zIndex || '0');
      const hasProperZIndex = !isNaN(zIndex) && zIndex >= 0;
      results.push({
        test: 'Z-Index',
        passed: hasProperZIndex,
        details: `Z-index: ${state?.computedStyle.zIndex}`
      });

      // Test 7: Position check
      const isPositioned = state?.position && state.position.top >= 0 && state.position.left >= 0;
      results.push({
        test: 'Position',
        passed: isPositioned || false,
        details: isPositioned ? `Position: (${state?.position?.left}, ${state?.position?.top})` : 'Invalid position'
      });

      // Test 8: Event listener test
      let eventListenerWorking = false;
      const testHandler = () => { eventListenerWorking = true; };
      buttonRef.current?.addEventListener('click', testHandler);
      
      // Simulate click programmatically
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      buttonRef.current?.dispatchEvent(clickEvent);
      
      buttonRef.current?.removeEventListener('click', testHandler);
      
      results.push({
        test: 'Event Listener',
        passed: eventListenerWorking,
        details: eventListenerWorking ? 'Event listener responds to clicks' : 'Event listener not responding'
      });

      // Test 9: Dialog state integration
      results.push({
        test: 'Dialog Integration',
        passed: typeof isDialogOpen === 'boolean',
        details: `Dialog state: ${isDialogOpen ? 'open' : 'closed'}`
      });

      setTestResults(results);
      
      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      
      addDebugLog(
        passedTests === totalTests ? 'success' : 'warning', 
        `Tests completed: ${passedTests}/${totalTests} passed`,
        { results, passedTests, totalTests },
        'ButtonTester',
        'runTests'
      );

    } catch (error) {
      addDebugLog('error', 'Error running button tests', error, 'ButtonTester', 'runTests');
      results.push({
        test: 'Test Execution',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setTestResults(results);
    }
  };

  const testButtonClick = () => {
    addDebugLog('info', 'Testing button click manually', null, 'ManualTester', 'testClick');
    
    try {
      // Test the actual click handler
      onCreateClick();
      addDebugLog('success', 'Button click handler executed successfully', null, 'ManualTester', 'testClick');
      toast.success('Button click test successful!');
    } catch (error) {
      addDebugLog('error', 'Button click handler failed', error, 'ManualTester', 'testClick');
      toast.error('Button click test failed!');
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('info', 'Debug logs cleared', null, 'Debugger', 'clearLogs');
  };

  useEffect(() => {
    if (isDebugging) {
      addDebugLog('info', 'Debugger activated', null, 'Debugger', 'activate');
      analyzeButtonState();
    }
  }, [isDebugging]);

  useEffect(() => {
    addDebugLog('info', `Dialog state changed: ${isDialogOpen ? 'opened' : 'closed'}`, { isDialogOpen }, 'DialogWatcher', 'stateChange');
  }, [isDialogOpen]);

  const getLogIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return <CheckCircle size={16} className="text-green-600" />;
      case 'error': return <XCircle size={16} className="text-red-600" />;
      case 'warning': return <Warning size={16} className="text-amber-600" />;
      default: return <Info size={16} className="text-blue-600" />;
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Enhanced Create Button with Debug Capabilities */}
      <div className="flex items-center gap-3">
        <Button 
          ref={buttonRef}
          data-testid="create-opportunity-button"
          onClick={() => {
            addDebugLog('info', 'Create button clicked', null, 'CreateButton', 'click');
            onCreateClick();
          }} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md relative z-10"
          variant="default"
          size="default"
        >
          <Plus size={16} className="mr-2" />
          Create Opportunity
        </Button>

        <Button
          onClick={() => setIsDebugging(!isDebugging)}
          variant={isDebugging ? "destructive" : "outline"}
          size="sm"
        >
          <Bug size={16} className="mr-2" />
          {isDebugging ? 'Stop Debug' : 'Debug Mode'}
        </Button>

        {isDebugging && (
          <>
            <Button onClick={runButtonTests} variant="outline" size="sm">
              <Play size={16} className="mr-2" />
              Run Tests
            </Button>
            <Button onClick={testButtonClick} variant="outline" size="sm">
              <Activity size={16} className="mr-2" />
              Test Click
            </Button>
            <Button onClick={analyzeButtonState} variant="outline" size="sm">
              <Eye size={16} className="mr-2" />
              Analyze
            </Button>
          </>
        )}
      </div>

      {isDebugging && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Button State Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={18} />
                Button State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {buttonState ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Enabled:</span>
                      <Badge variant={buttonState.isEnabled ? "default" : "destructive"}>
                        {buttonState.isEnabled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Visible:</span>
                      <Badge variant={buttonState.isVisible ? "default" : "destructive"}>
                        {buttonState.isVisible ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has Handler:</span>
                      <Badge variant={buttonState.hasClickHandler ? "default" : "destructive"}>
                        {buttonState.hasClickHandler ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dialog State:</span>
                      <Badge variant={isDialogOpen ? "default" : "secondary"}>
                        {isDialogOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">CSS Properties</h4>
                    <div className="text-xs space-y-1 font-mono bg-muted p-2 rounded">
                      <div>Display: {buttonState.computedStyle.display}</div>
                      <div>Visibility: {buttonState.computedStyle.visibility}</div>
                      <div>Opacity: {buttonState.computedStyle.opacity}</div>
                      <div>Pointer Events: {buttonState.computedStyle.pointerEvents}</div>
                      <div>Z-Index: {buttonState.computedStyle.zIndex}</div>
                      <div>Cursor: {buttonState.computedStyle.cursor}</div>
                    </div>
                  </div>

                  {buttonState.position && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Position & Size</h4>
                      <div className="text-xs space-y-1 font-mono bg-muted p-2 rounded">
                        <div>Left: {buttonState.position.left}px</div>
                        <div>Top: {buttonState.position.top}px</div>
                        <div>Width: {buttonState.position.width}px</div>
                        <div>Height: {buttonState.position.height}px</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <Info size={16} />
                  <AlertDescription>
                    Click "Analyze" to examine button state
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Test Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={18} />
                Test Results
                {testResults.length > 0 && (
                  <Badge variant="outline">
                    {testResults.filter(r => r.passed).length}/{testResults.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded text-sm",
                          result.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                        )}
                      >
                        {getTestIcon(result.passed)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{result.test}</div>
                          <div className={cn(
                            "text-xs truncate",
                            result.passed ? "text-green-700" : "text-red-700"
                          )}>
                            {result.details}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <Play size={16} />
                  <AlertDescription>
                    Click "Run Tests" to start testing button functionality
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Debug Logs Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} />
                  Debug Logs
                  <Badge variant="outline">{debugLogs.length}</Badge>
                </CardTitle>
                <Button onClick={clearLogs} variant="outline" size="sm">
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {debugLogs.length > 0 ? (
                    debugLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-start gap-2 p-2 border rounded text-sm"
                      >
                        {getLogIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            {log.component && <span>• {log.component}</span>}
                            {log.action && <span>• {log.action}</span>}
                          </div>
                          <div className="font-medium">{log.message}</div>
                          {log.data && (
                            <details className="mt-1">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View Data
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No debug logs yet. Interact with the button to see logs here.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}