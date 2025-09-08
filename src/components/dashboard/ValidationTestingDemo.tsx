import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  Play,
  TestTube,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Target,
  Shield,
  Clock,
  Activity,
  FlaskConical
} from '@phosphor-icons/react';

// Quick demo scenarios for immediate testing
const quickTestScenarios = [
  {
    name: 'Email Validation',
    testCases: [
      { input: 'user@example.com', expected: 'valid', description: 'Standard email' },
      { input: 'invalid-email', expected: 'invalid', description: 'Missing @ symbol' },
      { input: 'user@domain', expected: 'invalid', description: 'Missing TLD' },
      { input: 'user+tag@domain.co.uk', expected: 'valid', description: 'Complex valid email' },
      { input: '<script>alert("xss")</script>@domain.com', expected: 'invalid', description: 'Security threat' }
    ]
  },
  {
    name: 'Password Security',
    testCases: [
      { input: 'MyStr0ng!P@ssw0rd', expected: 'valid', description: 'Strong password' },
      { input: 'weak', expected: 'invalid', description: 'Too weak' },
      { input: 'password', expected: 'invalid', description: 'Common password' },
      { input: 'Password123!', expected: 'valid', description: 'Meets requirements' },
      { input: '12345678', expected: 'invalid', description: 'Only numbers' }
    ]
  },
  {
    name: 'Phone Numbers',
    testCases: [
      { input: '+1234567890', expected: 'valid', description: 'International format' },
      { input: '(555) 123-4567', expected: 'valid', description: 'US format' },
      { input: 'abc-def-ghij', expected: 'invalid', description: 'Letters in phone' },
      { input: '+44 20 7946 0958', expected: 'valid', description: 'UK format' },
      { input: '123', expected: 'invalid', description: 'Too short' }
    ]
  },
  {
    name: 'URL Validation',
    testCases: [
      { input: 'https://example.com', expected: 'valid', description: 'Standard HTTPS URL' },
      { input: 'example.com', expected: 'invalid', description: 'Missing protocol' },
      { input: 'javascript:alert("xss")', expected: 'invalid', description: 'Dangerous protocol' },
      { input: 'https://subdomain.example.co.uk/path', expected: 'valid', description: 'Complex valid URL' },
      { input: 'ftp://files.example.com', expected: 'valid', description: 'FTP protocol' }
    ]
  }
];

interface TestResult {
  scenario: string;
  testCase: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  responseTime: number;
  description: string;
  timestamp: Date;
}

export function ValidationTestingDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useKV<TestResult[]>('validation-demo-results', []);
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [testInput, setTestInput] = useState('');
  const [manualTestType, setManualTestType] = useState<string>('email');

  // Real-time validation functions
  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email) return { isValid: true, message: 'Empty email accepted' };
    
    const hasScript = /<script|javascript:|data:text\/html/i.test(email);
    const hasSqlInjection = /['";]|DROP\s+TABLE|SELECT\s+\*|UNION\s+SELECT/i.test(email);
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (hasScript || hasSqlInjection) {
      return { isValid: false, message: 'Security threat detected' };
    } else if (emailRegex.test(email) && email.length <= 254) {
      return { isValid: true, message: 'Valid email format' };
    } else {
      return { isValid: false, message: 'Invalid email format' };
    }
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) return { isValid: true, message: 'Empty password accepted' };
    
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    const isCommon = commonPasswords.includes(password.toLowerCase());
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (isCommon) {
      return { isValid: false, message: 'Common weak password detected' };
    } else if (hasLength && hasUpper && hasLower && hasNumber && hasSpecial) {
      return { isValid: true, message: 'Strong password' };
    } else {
      return { isValid: false, message: 'Password does not meet security requirements' };
    }
  };

  const validatePhone = (phone: string): { isValid: boolean; message: string } => {
    if (!phone) return { isValid: true, message: 'Empty phone accepted' };
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const isValid = phoneRegex.test(cleaned) && cleaned.length >= 7;
    
    return {
      isValid,
      message: isValid ? 'Valid phone format' : 'Invalid phone format'
    };
  };

  const validateUrl = (url: string): { isValid: boolean; message: string } => {
    if (!url) return { isValid: true, message: 'Empty URL accepted' };
    
    const dangerousProtocols = ['javascript:', 'data:text/html', 'file:'];
    const isDangerous = dangerousProtocols.some(proto => url.toLowerCase().startsWith(proto));
    
    if (isDangerous) {
      return { isValid: false, message: 'Dangerous protocol detected' };
    } else {
      try {
        new URL(url);
        return { isValid: true, message: 'Valid URL format' };
      } catch {
        return { isValid: false, message: 'Invalid URL format' };
      }
    }
  };

  // Validation dispatcher
  const validateInput = (input: string, type: string): { isValid: boolean; message: string; responseTime: number } => {
    const startTime = performance.now();
    let result;
    
    switch (type.toLowerCase()) {
      case 'email':
        result = validateEmail(input);
        break;
      case 'password':
        result = validatePassword(input);
        break;
      case 'phone':
        result = validatePhone(input);
        break;
      case 'url':
        result = validateUrl(input);
        break;
      default:
        result = { isValid: true, message: 'Unknown validation type' };
    }
    
    const endTime = performance.now();
    return { ...result, responseTime: endTime - startTime };
  };

  // Run automated tests
  const runAutomatedTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const newResults: TestResult[] = [];
    const scenariosToTest = selectedScenario === 'all' 
      ? quickTestScenarios 
      : quickTestScenarios.filter(s => s.name.toLowerCase().includes(selectedScenario));
    
    const totalTests = scenariosToTest.reduce((sum, scenario) => sum + scenario.testCases.length, 0);
    let completedTests = 0;
    
    for (const scenario of scenariosToTest) {
      setCurrentTest(scenario.name);
      
      for (const testCase of scenario.testCases) {
        const validation = validateInput(testCase.input, scenario.name.split(' ')[0].toLowerCase());
        const passed = (testCase.expected === 'valid') === validation.isValid;
        
        newResults.push({
          scenario: scenario.name,
          testCase: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: validation.isValid ? 'valid' : 'invalid',
          passed,
          responseTime: validation.responseTime,
          description: testCase.description,
          timestamp: new Date()
        });
        
        completedTests++;
        setProgress((completedTests / totalTests) * 100);
        
        // Small delay for visualization
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setResults(newResults);
    setIsRunning(false);
    setCurrentTest('');
    setProgress(100);
    
    const passRate = (newResults.filter(r => r.passed).length / newResults.length) * 100;
    toast.success(`Testing complete! Pass rate: ${passRate.toFixed(1)}% (${newResults.length} tests)`);
  };

  // Manual test
  const runManualTest = () => {
    if (!testInput.trim()) {
      toast.error('Please enter test input');
      return;
    }
    
    const validation = validateInput(testInput, manualTestType);
    const result: TestResult = {
      scenario: 'Manual Test',
      testCase: `${manualTestType} validation`,
      input: testInput,
      expected: 'unknown',
      actual: validation.isValid ? 'valid' : 'invalid',
      passed: true, // Manual tests are always considered "passed" for demonstration
      responseTime: validation.responseTime,
      description: validation.message,
      timestamp: new Date()
    };
    
    setResults(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 results
    
    toast.success(`Test complete: ${validation.message} (${validation.responseTime.toFixed(2)}ms)`);
  };

  const clearResults = () => {
    setResults([]);
    setProgress(0);
    toast.success('Results cleared');
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    passRate: results.length > 0 ? (results.filter(r => r.passed).length / results.length) * 100 : 0,
    avgResponseTime: results.length > 0 ? results.reduce((sum, r) => sum + r.responseTime, 0) / results.length : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Validation Testing Demo</h1>
            <p className="text-muted-foreground">
              Interactive demonstration of comprehensive field validation with real-time testing
            </p>
          </div>
        </div>
        
        {stats.total > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {stats.passRate.toFixed(1)}% Pass Rate
            </Badge>
            <Badge variant="outline">
              {stats.total} Tests Run
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="automated" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated">Automated Testing</TabsTrigger>
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Test Suite</CardTitle>
              <CardDescription>
                Run comprehensive validation tests across multiple scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Test Scenario</Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scenarios</SelectItem>
                      <SelectItem value="email">Email Validation</SelectItem>
                      <SelectItem value="password">Password Security</SelectItem>
                      <SelectItem value="phone">Phone Numbers</SelectItem>
                      <SelectItem value="url">URL Validation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={runAutomatedTests}
                      disabled={isRunning}
                      className="flex items-center gap-2"
                    >
                      {isRunning ? (
                        <>
                          <FlaskConical className="h-4 w-4 animate-pulse" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Run Tests
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearResults}
                      disabled={isRunning}
                    >
                      Clear Results
                    </Button>
                  </div>
                </div>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Testing: {currentTest}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickTestScenarios.map((scenario) => (
                  <Card key={scenario.name} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{scenario.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {scenario.testCases.length} test cases
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1 text-xs">
                        {scenario.testCases.slice(0, 3).map((testCase, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              testCase.expected === 'valid' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-muted-foreground truncate">
                              {testCase.description}
                            </span>
                          </div>
                        ))}
                        {scenario.testCases.length > 3 && (
                          <div className="text-muted-foreground">
                            +{scenario.testCases.length - 3} more...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Testing Interface</CardTitle>
              <CardDescription>
                Test individual inputs with real-time validation feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Validation Type</Label>
                  <Select value={manualTestType} onValueChange={setManualTestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Input</Label>
                  <Input
                    placeholder={`Enter ${manualTestType} to validate...`}
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        runManualTest();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={runManualTest} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Test Input
                  </Button>
                </div>
              </div>

              {/* Real-time validation preview */}
              {testInput && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Real-time Preview:</p>
                      {(() => {
                        const validation = validateInput(testInput, manualTestType);
                        return (
                          <div className={`flex items-center gap-2 p-2 rounded ${
                            validation.isValid 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {validation.isValid ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="text-sm">{validation.message}</span>
                            <Badge variant="outline" className="ml-auto">
                              {validation.responseTime.toFixed(2)}ms
                            </Badge>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Tests</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Time</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime.toFixed(1)}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>
                Latest test executions with detailed validation feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {results.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No test results yet. Run some tests to see results here.
                  </p>
                ) : (
                  results.slice(0, 20).map((result, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded border ${
                        result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{result.scenario}</p>
                          <p className="text-xs text-muted-foreground">{result.testCase}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {result.actual}
                          </Badge>
                          <span className="text-muted-foreground">
                            {result.responseTime.toFixed(1)}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Comprehensive Validation Testing</AlertTitle>
        <AlertDescription>
          This demo showcases real-time validation testing with security checks, performance monitoring,
          and comprehensive test coverage. All results are automatically saved and can be analyzed for patterns.
        </AlertDescription>
      </Alert>
    </div>
  );
}