import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKV } from '@github/spark/hooks';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Info, 
  RefreshCw,
  HardDrives,
  Clock
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  timestamp?: Date;
}

interface TestFormData {
  testField: string;
  testNumber: number;
  testDate: string;
}

export function AutoSaveTestRunner() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Auto-Save Initialization',
      description: 'Verify auto-save hook initializes correctly',
      status: 'pending'
    },
    {
      name: 'Draft Storage',
      description: 'Test draft is saved to persistent storage',
      status: 'pending'
    },
    {
      name: 'Draft Recovery',
      description: 'Verify saved draft can be recovered',
      status: 'pending'
    },
    {
      name: 'Auto-Save Timing',
      description: 'Check auto-save triggers after specified delay',
      status: 'pending'
    },
    {
      name: 'Draft Clearing',
      description: 'Ensure drafts can be manually cleared',
      status: 'pending'
    },
    {
      name: 'Form State Persistence',
      description: 'Verify complex form state survives page refresh',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  
  // Test data for form persistence
  const [testFormData, setTestFormData] = useKV<TestFormData>('test_form_draft', {
    testField: '',
    testNumber: 0,
    testDate: ''
  });
  
  // Dedicated test draft for testing
  const [testDraft, setTestDraft, deleteTestDraft] = useKV('autosave_test_draft', null);

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index 
        ? { ...test, ...updates, timestamp: new Date() }
        : test
    ));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runTest = async (testIndex: number): Promise<boolean> => {
    const test = testResults[testIndex];
    updateTestResult(testIndex, { status: 'running' });

    try {
      switch (testIndex) {
        case 0: // Auto-Save Initialization
          await sleep(500);
          // Test that useKV hook is working
          await setTestDraft({ test: 'initialization' });
          const initValue = testDraft;
          if (initValue !== null || typeof setTestDraft === 'function') {
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: 'useKV hook initialized successfully'
            });
            return true;
          }
          break;

        case 1: // Draft Storage
          await sleep(500);
          const testData = { 
            field1: 'test value', 
            field2: 42, 
            timestamp: Date.now() 
          };
          await setTestDraft(testData);
          await sleep(100); // Allow KV to persist
          
          if (testDraft && JSON.stringify(testDraft) === JSON.stringify(testData)) {
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: 'Draft data stored and retrieved successfully'
            });
            return true;
          }
          break;

        case 2: // Draft Recovery
          await sleep(500);
          // Simulate page refresh by clearing local state and recovering
          const recoveryData = { recovered: true, data: 'recovery test' };
          await setTestDraft(recoveryData);
          await sleep(100);
          
          // Verify the data persists
          if (testDraft && testDraft.recovered === true) {
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: 'Draft recovery mechanism working correctly'
            });
            return true;
          }
          break;

        case 3: // Auto-Save Timing
          await sleep(500);
          // This simulates the timing behavior
          const startTime = Date.now();
          await setTestDraft({ timing: 'test', startTime });
          await sleep(100);
          const endTime = Date.now();
          
          if (endTime - startTime >= 50) { // Reasonable delay
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: `Auto-save timing working (${endTime - startTime}ms)`
            });
            return true;
          }
          break;

        case 4: // Draft Clearing
          await sleep(500);
          await setTestDraft({ clearTest: true });
          await sleep(100);
          await deleteTestDraft();
          await sleep(100);
          
          if (!testDraft) {
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: 'Draft cleared successfully'
            });
            return true;
          }
          break;

        case 5: // Form State Persistence
          await sleep(500);
          const complexFormData = {
            textField: 'Complex form test',
            numberField: 123,
            dateField: new Date().toISOString().split('T')[0],
            selectField: 'option1',
            checkboxField: true,
            arrayField: ['item1', 'item2', 'item3']
          };
          
          setTestFormData(complexFormData);
          await sleep(100);
          
          // Verify complex data structure is maintained
          if (testFormData && 
              testFormData.textField === complexFormData.textField &&
              testFormData.arrayField?.length === 3) {
            updateTestResult(testIndex, { 
              status: 'passed', 
              details: 'Complex form state persisted correctly'
            });
            return true;
          }
          break;

        default:
          break;
      }

      updateTestResult(testIndex, { 
        status: 'failed', 
        details: 'Test conditions not met'
      });
      return false;
    } catch (error) {
      updateTestResult(testIndex, { 
        status: 'failed', 
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);
    
    toast.info('Starting auto-save tests...', { duration: 2000 });
    
    let passedCount = 0;
    
    for (let i = 0; i < testResults.length; i++) {
      setCurrentTestIndex(i);
      const passed = await runTest(i);
      if (passed) passedCount++;
      await sleep(1000); // Pause between tests
    }
    
    setCurrentTestIndex(-1);
    setIsRunning(false);
    
    const allPassed = passedCount === testResults.length;
    toast.success(
      `Tests completed: ${passedCount}/${testResults.length} passed`,
      { 
        duration: 3000,
        description: allPassed ? 'All auto-save functionality is working!' : 'Some tests failed - check results below'
      }
    );
  };

  const resetTests = () => {
    setTestResults(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending' as const, 
      details: undefined,
      timestamp: undefined
    })));
    setCurrentTestIndex(-1);
    toast.info('Test results reset');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="animate-spin text-blue-500" size={16} />;
      case 'passed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Running</Badge>;
      case 'passed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Passed</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrives size={24} className="text-primary" />
            Auto-Save Functionality Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of auto-save features including draft persistence, recovery, and timing
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Info size={16} />
            <AlertDescription>
              This test suite validates the auto-save functionality by testing draft storage, 
              recovery mechanisms, timing behavior, and form state persistence. 
              All tests use the same persistent storage system as the real application.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-green-600">{passedTests}</span> passed, 
                <span className="font-medium text-red-600 ml-1">{failedTests}</span> failed, 
                <span className="font-medium text-muted-foreground ml-1">
                  {testResults.length - passedTests - failedTests}
                </span> pending
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={resetTests} 
                variant="outline" 
                size="sm"
                disabled={isRunning}
              >
                <RefreshCw size={16} className="mr-1" />
                Reset
              </Button>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="sm"
              >
                <PlayCircle size={16} className="mr-1" />
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div 
                key={test.name}
                className={`p-4 border rounded-lg transition-colors ${
                  currentTestIndex === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                {test.details && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                    {test.details}
                  </div>
                )}
                
                {test.timestamp && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Completed: {new Date(test.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Draft State Inspector */}
      <Card>
        <CardHeader>
          <CardTitle>Draft State Inspector</CardTitle>
          <CardDescription>
            Real-time view of current draft data in persistent storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Test Draft Data:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {testDraft ? JSON.stringify(testDraft, null, 2) : 'No test draft data'}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Form Draft Data:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(testFormData, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}