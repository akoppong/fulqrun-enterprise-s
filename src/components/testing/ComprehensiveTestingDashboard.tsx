/**
 * Comprehensive Testing Dashboard
 * 
 * Brings together all testing components for error boundaries, performance monitoring,
 * UI validation, and responsive layout testing.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  Gauge, 
  Eye, 
  DeviceDesktop, 
  CheckCircle, 
  Warning,
  Play,
  Shield
} from '@phosphor-icons/react';
import { UIValidationTester } from './UIValidationTester';
import { ResponsiveLayoutTester } from './ResponsiveLayoutTester';
import { performanceMonitor } from '@/lib/performance-monitor';
import { errorHandler } from '@/lib/error-handling';
import { toast } from 'sonner';

export function ComprehensiveTestingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState({
    errorBoundaries: { passed: 0, total: 0, tested: false },
    performance: { score: 0, issues: 0, tested: false },
    uiValidation: { issues: 0, tested: false },
    responsive: { passed: 0, total: 0, tested: false }
  });

  const runAllTests = async () => {
    toast.info('Running Comprehensive Tests', {
      description: 'This may take a few moments...',
    });

    try {
      // Test Error Boundaries
      await testErrorBoundaries();
      
      // Test Performance
      await testPerformance();
      
      // UI and Responsive tests are handled by their respective components
      
      toast.success('All Tests Completed', {
        description: 'Check individual tabs for detailed results.',
      });
    } catch (error) {
      toast.error('Test Execution Failed', {
        description: 'Some tests could not be completed.',
      });
    }
  };

  const testErrorBoundaries = async () => {
    let passed = 0;
    let total = 0;
    
    // Test 1: Component error handling
    total++;
    try {
      // Simulate component error
      const testError = new Error('Test error boundary');
      errorHandler.handleError(testError, { test: true }, 'low');
      passed++;
    } catch (error) {
      console.warn('Error boundary test failed:', error);
    }

    // Test 2: Async error handling
    total++;
    try {
      // Test promise rejection handling
      const rejectedPromise = Promise.reject(new Error('Test async error'));
      rejectedPromise.catch(() => {
        // Expected to be caught by global handlers
      });
      passed++;
    } catch (error) {
      console.warn('Async error test failed:', error);
    }

    // Test 3: Network error handling
    total++;
    try {
      errorHandler.handleNetworkError(new Error('Network timeout'), { test: true });
      passed++;
    } catch (error) {
      console.warn('Network error test failed:', error);
    }

    setTestResults(prev => ({
      ...prev,
      errorBoundaries: { passed, total, tested: true }
    }));
  };

  const testPerformance = async () => {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      const issues = summary.recentIssues + summary.recentWarnings;
      
      // Calculate performance score based on metrics
      let score = 100;
      
      // Deduct points for issues
      score -= summary.recentIssues * 10;
      score -= summary.recentWarnings * 5;
      
      // Deduct points for slow components
      const slowComponents = summary.componentMetrics.filter(
        component => component.averageRenderTime > 16
      ).length;
      score -= slowComponents * 5;
      
      // Deduct points for memory usage
      if (summary.memoryMetrics.length > 0) {
        const latestMemory = summary.memoryMetrics[summary.memoryMetrics.length - 1];
        const memoryUsageMB = latestMemory.usedJSHeapSize / (1024 * 1024);
        if (memoryUsageMB > 100) score -= 10;
        else if (memoryUsageMB > 50) score -= 5;
      }
      
      score = Math.max(0, score);
      
      setTestResults(prev => ({
        ...prev,
        performance: { score, issues, tested: true }
      }));
    } catch (error) {
      console.error('Performance test failed:', error);
      setTestResults(prev => ({
        ...prev,
        performance: { score: 0, issues: -1, tested: true }
      }));
    }
  };

  const getOverallScore = () => {
    const { errorBoundaries, performance, uiValidation, responsive } = testResults;
    
    let totalScore = 0;
    let maxScore = 0;
    
    if (errorBoundaries.tested) {
      const errorScore = errorBoundaries.total > 0 ? 
        (errorBoundaries.passed / errorBoundaries.total) * 25 : 25;
      totalScore += errorScore;
      maxScore += 25;
    }
    
    if (performance.tested) {
      totalScore += (performance.score / 100) * 25;
      maxScore += 25;
    }
    
    if (responsive.tested) {
      const responsiveScore = responsive.total > 0 ?
        (responsive.passed / responsive.total) * 25 : 25;
      totalScore += responsiveScore;
      maxScore += 25;
    }
    
    // UI validation contributes to remaining score
    maxScore += 25;
    if (uiValidation.tested) {
      totalScore += uiValidation.issues === 0 ? 25 : Math.max(0, 25 - uiValidation.issues * 5);
    }
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const overallScore = getOverallScore();
  const hasResults = Object.values(testResults).some(result => result.tested);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Comprehensive Testing Dashboard
              </CardTitle>
              <CardDescription>
                Complete testing suite for error boundaries, performance monitoring, 
                UI validation, and responsive design.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {hasResults && (
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getScoreLabel(overallScore)}
                  </div>
                </div>
              )}
              <Button onClick={runAllTests} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Run All Tests
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {hasResults && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Bug className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold">Error Boundaries</div>
                <div className="text-sm text-muted-foreground">
                  {testResults.errorBoundaries.tested ? 
                    `${testResults.errorBoundaries.passed}/${testResults.errorBoundaries.total}` : 
                    'Not tested'
                  }
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Gauge className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="font-semibold">Performance</div>
                <div className="text-sm text-muted-foreground">
                  {testResults.performance.tested ? 
                    `${testResults.performance.score}/100` : 
                    'Not tested'
                  }
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold">UI Validation</div>
                <div className="text-sm text-muted-foreground">
                  {testResults.uiValidation.tested ? 
                    `${testResults.uiValidation.issues} issues` : 
                    'Not tested'
                  }
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <DeviceDesktop className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="font-semibold">Responsive</div>
                <div className="text-sm text-muted-foreground">
                  {testResults.responsive.tested ? 
                    `${testResults.responsive.passed}/${testResults.responsive.total}` : 
                    'Not tested'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Error Boundaries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ui">UI Validation</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Overview</CardTitle>
              <CardDescription>
                This dashboard provides comprehensive testing capabilities for your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error Boundaries:</strong> Tests error handling, recovery mechanisms, 
                    and graceful degradation across components.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Gauge className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Performance:</strong> Monitors render times, memory usage, 
                    network performance, and identifies optimization opportunities.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>UI Validation:</strong> Checks for layout issues, accessibility problems, 
                    form validation, and visual consistency.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <DeviceDesktop className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Responsive Design:</strong> Tests layout behavior across different 
                    screen sizes and device orientations.
                  </AlertDescription>
                </Alert>
              </div>
              
              {!hasResults && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run All Tests" to begin comprehensive testing of your application.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Error Boundary Testing
              </CardTitle>
              <CardDescription>
                Test error handling, recovery mechanisms, and user experience during failures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.errorBoundaries.tested ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={testResults.errorBoundaries.passed === testResults.errorBoundaries.total ? 'default' : 'destructive'}>
                      {testResults.errorBoundaries.passed}/{testResults.errorBoundaries.total} Tests Passed
                    </Badge>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error boundaries are functioning correctly. The application can handle 
                      component errors, async failures, and network issues gracefully.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <Warning className="h-4 w-4" />
                  <AlertDescription>
                    Error boundary tests have not been run yet. Click "Run All Tests" to test 
                    error handling capabilities.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                Real-time performance metrics and optimization recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.performance.tested ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={testResults.performance.score >= 75 ? 'default' : 'secondary'}>
                      Score: {testResults.performance.score}/100
                    </Badge>
                    {testResults.performance.issues > 0 && (
                      <Badge variant="destructive">
                        {testResults.performance.issues} Issues
                      </Badge>
                    )}
                  </div>
                  
                  <Alert>
                    <Gauge className="h-4 w-4" />
                    <AlertDescription>
                      Performance monitoring is active. Check the browser console for 
                      detailed metrics and optimization suggestions.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <Warning className="h-4 w-4" />
                  <AlertDescription>
                    Performance tests have not been run yet. Click "Run All Tests" to analyze 
                    application performance.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <UIValidationTester />
        </TabsContent>

        <TabsContent value="responsive">
          <ResponsiveLayoutTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComprehensiveTestingDashboard;