import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Info, 
  TestTube,
  Clock,
  Target,
  Zap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { FormValidator, ValidationSchema } from '@/lib/validation';

interface QuickTest {
  id: string;
  name: string;
  description: string;
  testFunction: () => Promise<{ success: boolean; message: string; details?: any }>;
  expectedDuration: number; // in milliseconds
}

const quickValidationTests: QuickTest[] = [
  {
    id: 'basic-validation',
    name: 'Basic Field Validation',
    description: 'Test required field validation and basic rules',
    expectedDuration: 500,
    testFunction: async () => {
      const schema: ValidationSchema = {
        title: { required: true, minLength: 3 },
        email: { required: true, email: true },
        value: { required: true, min: 0, max: 1000000 }
      };

      const validator = new FormValidator(schema);
      
      // Test empty fields
      const emptyResult = validator.validate({
        title: '',
        email: '',
        value: undefined
      });

      if (emptyResult.isValid) {
        return { success: false, message: 'Validation should fail for empty required fields' };
      }

      // Test valid data
      const validResult = validator.validate({
        title: 'Valid Title',
        email: 'test@example.com',
        value: 50000
      });

      if (!validResult.isValid) {
        return { 
          success: false, 
          message: 'Validation should pass for valid data',
          details: validResult.errors
        };
      }

      return { success: true, message: 'Basic validation working correctly' };
    }
  },
  {
    id: 'custom-validation',
    name: 'Custom Validation Rules',
    description: 'Test custom validation functions and complex rules',
    expectedDuration: 300,
    testFunction: async () => {
      const schema: ValidationSchema = {
        title: {
          required: true,
          custom: (value: string) => {
            if (value && /^\s+|\s+$/.test(value)) {
              return 'Title cannot start or end with spaces';
            }
            return null;
          }
        },
        probability: {
          required: true,
          min: 0,
          max: 100,
          custom: (value: number, data?: any) => {
            if (data?.stage === 'prospect' && value > 50) {
              return 'Probability too high for prospect stage';
            }
            return null;
          }
        }
      };

      const validator = new FormValidator(schema);
      
      // Test custom title validation
      const titleResult = validator.validate({
        title: '  Invalid Title  ',
        probability: 25
      });

      if (titleResult.isValid) {
        return { success: false, message: 'Should catch title with leading/trailing spaces' };
      }

      // Test custom probability validation
      const probResult = validator.validate({
        title: 'Valid Title',
        probability: 80,
        stage: 'prospect'
      });

      if (probResult.isValid) {
        return { success: false, message: 'Should catch high probability for prospect stage' };
      }

      return { success: true, message: 'Custom validation rules working correctly' };
    }
  },
  {
    id: 'date-validation',
    name: 'Date Validation',
    description: 'Test date parsing and validation logic',
    expectedDuration: 400,
    testFunction: async () => {
      const schema: ValidationSchema = {
        expectedCloseDate: {
          required: true,
          custom: (value: any) => {
            if (!value) return 'Date is required';
            
            let date: Date;
            try {
              date = new Date(value);
              if (isNaN(date.getTime())) {
                return 'Invalid date format';
              }
            } catch {
              return 'Invalid date';
            }

            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
            
            if (date < threeDaysAgo) {
              return 'Date cannot be more than 3 days in the past';
            }

            return null;
          }
        }
      };

      const validator = new FormValidator(schema);
      
      // Test invalid date
      const invalidResult = validator.validate({
        expectedCloseDate: 'invalid-date'
      });

      if (invalidResult.isValid) {
        return { success: false, message: 'Should reject invalid date format' };
      }

      // Test past date
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const pastResult = validator.validate({
        expectedCloseDate: pastDate
      });

      if (pastResult.isValid) {
        return { success: false, message: 'Should reject dates too far in the past' };
      }

      // Test valid future date
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const validResult = validator.validate({
        expectedCloseDate: futureDate
      });

      if (!validResult.isValid) {
        return { 
          success: false, 
          message: 'Should accept valid future date',
          details: validResult.errors
        };
      }

      return { success: true, message: 'Date validation working correctly' };
    }
  },
  {
    id: 'performance-test',
    name: 'Validation Performance',
    description: 'Test validation speed with complex rules',
    expectedDuration: 200,
    testFunction: async () => {
      const schema: ValidationSchema = {
        title: { required: true, minLength: 3, maxLength: 200 },
        description: { maxLength: 2000 },
        value: { required: true, min: 0, max: 1000000000 },
        probability: { required: true, min: 0, max: 100 },
        email: { email: true },
        custom1: { custom: (value: string) => value === 'test' ? null : 'Must be test' },
        custom2: { custom: (value: string) => value?.length > 5 ? null : 'Too short' },
        custom3: { custom: (value: number) => value > 0 ? null : 'Must be positive' }
      };

      const validator = new FormValidator(schema);
      const iterations = 100;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        validator.validate({
          title: `Test Title ${i}`,
          description: `Test description for item ${i}`,
          value: Math.random() * 100000,
          probability: Math.random() * 100,
          email: `test${i}@example.com`,
          custom1: 'test',
          custom2: 'valid value',
          custom3: i + 1
        });
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      if (avgTime > 10) {
        return { 
          success: false, 
          message: `Validation too slow: ${avgTime.toFixed(2)}ms per validation`,
          details: { duration, iterations, avgTime }
        };
      }

      return { 
        success: true, 
        message: `Performance acceptable: ${avgTime.toFixed(2)}ms per validation`,
        details: { duration, iterations, avgTime }
      };
    }
  }
];

export function QuickValidationTester() {
  const [results, setResults] = useState<Map<string, { success: boolean; message: string; duration: number; details?: any }>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const runSingleTest = async (test: QuickTest) => {
    setCurrentTest(test.id);
    const startTime = Date.now();

    try {
      const result = await test.testFunction();
      const duration = Date.now() - startTime;
      
      setResults(prev => new Map(prev.set(test.id, {
        ...result,
        duration
      })));

      return { ...result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      };

      setResults(prev => new Map(prev.set(test.id, result)));
      return result;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults(new Map());
    setOverallProgress(0);

    try {
      for (let i = 0; i < quickValidationTests.length; i++) {
        const test = quickValidationTests[i];
        await runSingleTest(test);
        setOverallProgress(((i + 1) / quickValidationTests.length) * 100);
      }

      const allResults = Array.from(results.values());
      const passed = allResults.filter(r => r.success).length;
      const failed = allResults.length - passed;

      if (failed === 0) {
        toast.success(`All ${passed} validation tests passed!`);
      } else {
        toast.warning(`${passed} tests passed, ${failed} tests failed`);
      }
    } catch (error) {
      toast.error('Test suite execution failed');
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
      setOverallProgress(0);
    }
  };

  const stats = {
    total: quickValidationTests.length,
    completed: results.size,
    passed: Array.from(results.values()).filter(r => r.success).length,
    failed: Array.from(results.values()).filter(r => !r.success).length
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Validation Tester
          </CardTitle>
          <CardDescription>
            Fast automated tests to verify enhanced form validation is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run All Tests ({quickValidationTests.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => setResults(new Map())}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running tests...</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  Current: {quickValidationTests.find(t => t.id === currentTest)?.name}
                </p>
              )}
            </div>
          )}

          {results.size > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {quickValidationTests.map(test => {
          const result = results.get(test.id);
          const isCurrentTest = currentTest === test.id;

          return (
            <Card key={test.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    {test.name}
                  </div>
                  {result ? (
                    result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )
                  ) : isCurrentTest ? (
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300" />
                  )}
                </CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Expected: {test.expectedDuration}ms
                  {result && (
                    <>
                      <span>•</span>
                      <span>Actual: {result.duration}ms</span>
                      {result.duration > test.expectedDuration && (
                        <Badge variant="outline" className="text-yellow-600">
                          Slower than expected
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {result && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="text-sm">
                        <strong>Result:</strong> {result.message}
                      </div>
                      {result.details && (
                        <div className="mt-2 text-xs">
                          <strong>Details:</strong>
                          <pre className="mt-1 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => runSingleTest(test)}
                  disabled={isRunning}
                  className="w-full"
                  variant={result?.success ? "secondary" : "default"}
                >
                  {isCurrentTest ? 'Running...' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}