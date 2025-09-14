import { useState } from 'react';
import { OpportunityDetailTestRunner } from '@/components/opportunities/OpportunityDetailTestRunner';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TestTube,
  Play,
  ArrowLeft,
  Bug,
  Target,
  ChartLineUp,
  ShieldCheck,
  Activity
} from '@phosphor-icons/react';

interface OpportunityDetailTestProps {
  onBack?: () => void;
}

export function OpportunityDetailTest({ onBack }: OpportunityDetailTestProps) {
  const [isTestRunnerActive, setIsTestRunnerActive] = useState(false);

  if (isTestRunnerActive) {
    return (
      <EnhancedErrorBoundary 
        context="OpportunityDetailTest"
        showErrorDetails={true}
        maxRetries={3}
        resetOnPropsChange={true}
        monitorPerformance={true}
      >
        <div className="h-full">
          <OpportunityDetailTestRunner />
          
          {/* Exit button */}
          <div className="fixed top-4 right-4 z-50">
            <Button 
              variant="outline" 
              onClick={() => setIsTestRunnerActive(false)}
              className="bg-background/80 backdrop-blur-sm border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Test Runner
            </Button>
          </div>
        </div>
      </EnhancedErrorBoundary>
    );
  }

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="flex-none bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-blue-600" />
                Opportunity Detail Testing Suite
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive testing for MEDDPICC integration and error handling
              </p>
            </div>
            
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview */}
          <Alert>
            <Bug className="w-4 h-4" />
            <AlertTitle>Test Suite Overview</AlertTitle>
            <AlertDescription>
              This test suite validates the opportunity detail view component with comprehensive 
              error handling, MEDDPICC integration, and responsive design testing.
            </AlertDescription>
          </Alert>

          {/* Features Being Tested */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Features Under Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">MEDDPICC Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Full B2B sales qualification methodology
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ChartLineUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sales Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        PEAK methodology progress tracking
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Bug className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Error Boundaries</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive error handling and recovery
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Safe handling of corrupted or missing data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Complete Data Test</h4>
                    <Badge className="bg-green-500">Low Risk</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tests the component with fully populated opportunity data including 
                    all MEDDPICC scores, activities, and contact information.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">All Fields</Badge>
                    <Badge variant="outline" className="text-xs">MEDDPICC Complete</Badge>
                    <Badge variant="outline" className="text-xs">Activities</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Minimal Data Test</h4>
                    <Badge className="bg-yellow-500">Medium Risk</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tests graceful handling of opportunities with only required fields,
                    missing optional data, and undefined MEDDPICC scores.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Required Only</Badge>
                    <Badge variant="outline" className="text-xs">Missing MEDDPICC</Badge>
                    <Badge variant="outline" className="text-xs">No Activities</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Corrupted Data Test</h4>
                    <Badge variant="destructive">High Risk</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tests error boundary activation with intentionally corrupted data
                    including invalid dates, malformed values, and type mismatches.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Invalid Types</Badge>
                    <Badge variant="outline" className="text-xs">Malformed Dates</Badge>
                    <Badge variant="outline" className="text-xs">Error Recovery</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Test Runner */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Ready to Test</h3>
                  <p className="text-muted-foreground">
                    Launch the interactive test runner to validate all components and scenarios
                  </p>
                </div>
                
                <Button 
                  onClick={() => setIsTestRunnerActive(true)}
                  size="lg"
                  className="flex items-center gap-2 px-8"
                >
                  <Play className="w-4 h-4" />
                  Launch Test Runner
                </Button>
                
                <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                  <span>✓ Error Boundaries Active</span>
                  <span>✓ Performance Monitoring</span>
                  <span>✓ Data Recovery</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OpportunityDetailTest;