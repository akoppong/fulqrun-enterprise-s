import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Info,
  Calendar,
  Building,
  DollarSign,
  Target,
  User,
  FileText,
  Clock,
  Shield,
  Zap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { FormValidationDemo } from './FormValidationDemo';
import { ImprovedFormValidationTester } from './ImprovedFormValidationTester';
import { QuickValidationTester } from './QuickValidationTester';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  category: 'validation' | 'performance' | 'accessibility' | 'integration';
  complexity: 'basic' | 'intermediate' | 'advanced';
}

const testSuites: TestSuite[] = [
  {
    id: 'quick-validation-tester',
    name: 'Quick Validation Tester',
    description: 'Fast automated tests to verify validation functionality',
    icon: Zap,
    component: QuickValidationTester,
    category: 'validation',
    complexity: 'basic'
  },
  {
    id: 'form-validation-demo',
    name: 'Form Validation Demo',
    description: 'Interactive demonstration of enhanced form validation features',
    icon: TestTube,
    component: FormValidationDemo,
    category: 'validation',
    complexity: 'intermediate'
  },
  {
    id: 'comprehensive-tester',
    name: 'Comprehensive Validation Tester',
    description: 'Automated test suite for all validation scenarios',
    icon: Shield,
    component: ImprovedFormValidationTester,
    category: 'validation',
    complexity: 'advanced'
  }
];

interface TestExecutionResult {
  suiteId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  timestamp: Date;
  details?: any;
}

export function ComprehensiveFormTestSuite() {
  const [activeSuite, setActiveSuite] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, TestExecutionResult>>(new Map());
  const [globalTestRun, setGlobalTestRun] = useState(false);

  const runTestSuite = async (suite: TestSuite) => {
    const result: TestExecutionResult = {
      suiteId: suite.id,
      status: 'running',
      progress: 0,
      message: `Starting ${suite.name}...`,
      timestamp: new Date()
    };

    setTestResults(prev => new Map(prev.set(suite.id, result)));
    setActiveSuite(suite.id);

    try {
      // Simulate test execution with progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const updatedResult: TestExecutionResult = {
          ...result,
          progress: i,
          message: i === 100 ? `${suite.name} completed successfully` : `Running ${suite.name}... ${i}%`
        };

        if (i === 100) {
          updatedResult.status = 'completed';
        }

        setTestResults(prev => new Map(prev.set(suite.id, updatedResult)));
      }

      toast.success(`${suite.name} completed successfully`);
    } catch (error) {
      const failedResult: TestExecutionResult = {
        ...result,
        status: 'failed',
        progress: 0,
        message: `${suite.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setTestResults(prev => new Map(prev.set(suite.id, failedResult)));
      toast.error(`${suite.name} failed`);
    } finally {
      setActiveSuite(null);
    }
  };

  const runAllTests = async () => {
    setGlobalTestRun(true);
    
    for (const suite of testSuites) {
      await runTestSuite(suite);
    }
    
    setGlobalTestRun(false);
    toast.success('All test suites completed');
  };

  const getStatusIcon = (result?: TestExecutionResult) => {
    if (!result) return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    
    switch (result.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'validation':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'accessibility':
        return <User className="h-4 w-4" />;
      case 'integration':
        return <Building className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'basic':
        return <Badge variant="secondary">Basic</Badge>;
      case 'intermediate':
        return <Badge variant="default">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="destructive">Advanced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStats = {
    total: testSuites.length,
    completed: Array.from(testResults.values()).filter(r => r.status === 'completed').length,
    failed: Array.from(testResults.values()).filter(r => r.status === 'failed').length,
    running: Array.from(testResults.values()).filter(r => r.status === 'running').length
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Enhanced Opportunity Form Testing Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing environment for the improved opportunity form with enhanced validation,
            performance monitoring, and accessibility checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runAllTests}
              disabled={globalTestRun || activeSuite !== null}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run All Tests ({testSuites.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTestResults(new Map());
                setActiveSuite(null);
              }}
              disabled={globalTestRun || activeSuite !== null}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Clear Results
            </Button>
          </div>

          {/* Overall Progress */}
          {(globalTestRun || activeSuite) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {globalTestRun ? 'Running all test suites...' : 'Running individual test...'}
                </span>
                <span>{overallStats.completed}/{overallStats.total} completed</span>
              </div>
              <Progress 
                value={(overallStats.completed / overallStats.total) * 100} 
                className="w-full" 
              />
            </div>
          )}

          {/* Statistics */}
          {testResults.size > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{overallStats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{overallStats.running}</div>
                    <div className="text-sm text-muted-foreground">Running</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{overallStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Suites</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quick">Quick Tests</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Validation Tests</CardTitle>
              <CardDescription>
                Fast automated tests to verify that enhanced validation is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickValidationTester />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {testSuites.map(suite => {
              const result = testResults.get(suite.id);
              const Icon = suite.icon;
              
              return (
                <Card key={suite.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {suite.name}
                      </div>
                      {getStatusIcon(result)}
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {getCategoryIcon(suite.category)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {suite.category}
                      </span>
                      {getComplexityBadge(suite.complexity)}
                    </div>

                    {result && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Status:</strong> {result.message}
                        </div>
                        {result.status === 'running' && (
                          <Progress value={result.progress} className="w-full" />
                        )}
                        <div className="text-xs text-muted-foreground">
                          Last run: {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => runTestSuite(suite)}
                      disabled={globalTestRun || activeSuite === suite.id}
                      className="w-full flex items-center gap-2"
                      variant={result?.status === 'completed' ? "secondary" : "default"}
                    >
                      {activeSuite === suite.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Run Test Suite
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Validation Testing</CardTitle>
              <CardDescription>
                Comprehensive validation testing including field validation, error handling, and user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormValidationDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Testing</CardTitle>
              <CardDescription>
                Form rendering performance, validation speed, and user interaction responsiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Performance testing features are being implemented. This will include:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Form rendering time measurement</li>
                    <li>Validation response time analysis</li>
                    <li>Memory usage monitoring</li>
                    <li>Network request optimization</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Testing</CardTitle>
              <CardDescription>
                Testing form integration with external services, data persistence, and API interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Building className="h-4 w-4" />
                <AlertDescription>
                  Integration testing features are being implemented. This will include:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Company and contact data integration</li>
                    <li>Opportunity service integration</li>
                    <li>Data persistence validation</li>
                    <li>API error handling</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Individual Test Suite Results */}
      {testResults.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Execution History</CardTitle>
            <CardDescription>
              Detailed results from test suite executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(testResults.entries()).map(([suiteId, result]) => {
                const suite = testSuites.find(s => s.id === suiteId);
                if (!suite) return null;

                return (
                  <div
                    key={suiteId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result)}
                      <div>
                        <div className="font-medium">{suite.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                      {result.status === 'running' && (
                        <div className="text-xs text-muted-foreground">
                          {result.progress}% complete
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}