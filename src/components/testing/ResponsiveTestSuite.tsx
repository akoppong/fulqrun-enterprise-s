import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Monitor,
  CheckCircle,
  Warning,
  XCircle,
  Eye,
  Resize,
  Code,
  TestTube,
  BugBeetle,
  ArrowsOutCardinal,
  PlayCircle,
  PauseCircle,
  StopCircle
} from '@phosphor-icons/react';
import { 
  ResponsiveValidator, 
  STANDARD_BREAKPOINTS, 
  ResponsiveUtils,
  type ComponentResponsiveAnalysis,
  type ResponsiveBreakpoint,
  type ResponsiveIssue
} from '@/lib/responsive-validator';

// Components to test
const COMPONENTS_TO_TEST = [
  {
    name: 'Header/Navigation',
    description: 'Top navigation bar with user menu and branding',
    selector: 'header, .mobile-header'
  },
  {
    name: 'Sidebar Navigation',
    description: 'Collapsible sidebar with menu items and role-based visibility',
    selector: 'aside, .sidebar-container'
  },
  {
    name: 'Opportunities Table',
    description: 'Data table with horizontal scrolling and fixed column widths',
    selector: '.opportunities-table-container'
  },
  {
    name: 'Opportunity Detail Modal',
    description: 'Full-screen modal with responsive tabs and content sections',
    selector: '[data-radix-dialog-content]'
  },
  {
    name: 'Dashboard Widgets',
    description: 'KPI cards and charts with responsive grid layout',
    selector: '.dashboard-grid, .widget-container'
  },
  {
    name: 'Forms & Dialogs',
    description: 'Create/edit forms with responsive field layouts',
    selector: '.form-container, .dialog-content'
  }
];

export function ResponsiveTestSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [testResults, setTestResults] = useState<ComponentResponsiveAnalysis[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [currentViewport, setCurrentViewport] = useState(STANDARD_BREAKPOINTS[0]);
  const [progress, setProgress] = useState(0);
  const [currentlyTesting, setCurrentlyTesting] = useState<string>('');
  
  const validator = ResponsiveValidator.getInstance();

  // Real-time viewport information
  const [currentViewportInfo, setCurrentViewportInfo] = useState({
    width: 0,
    height: 0,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    isTouchDevice: false
  });

  useEffect(() => {
    const updateViewportInfo = () => {
      const dimensions = ResponsiveUtils.getViewportDimensions();
      setCurrentViewportInfo({
        width: dimensions.width,
        height: dimensions.height,
        deviceType: ResponsiveUtils.getCurrentDeviceType(),
        isTouchDevice: ResponsiveUtils.isTouchDevice()
      });
    };

    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    return () => window.removeEventListener('resize', updateViewportInfo);
  }, []);

  const runResponsiveTests = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setTestResults([]);
    validator.clearResults();
    
    const totalComponents = COMPONENTS_TO_TEST.length;
    
    for (let i = 0; i < totalComponents; i++) {
      if (isPaused) {
        break;
      }

      const component = COMPONENTS_TO_TEST[i];
      setCurrentlyTesting(component.name);
      
      try {
        const analysis = await validator.analyzeComponent(
          component.name,
          component.description,
          component.selector
        );
        
        setTestResults(prev => [...prev, analysis]);
        setProgress(((i + 1) / totalComponents) * 100);
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error testing ${component.name}:`, error);
      }
    }
    
    setIsRunning(false);
    setCurrentlyTesting('');
  };

  const pauseTests = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const stopTests = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentlyTesting('');
  };

  const getStatusFromScore = (score: number): 'pass' | 'warning' | 'fail' => {
    if (score >= 85) return 'pass';
    if (score >= 70) return 'warning';
    return 'fail';
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'fail':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <Warning size={16} className="text-yellow-600" />;
      case 'fail':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Eye size={16} className="text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: ResponsiveIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return DeviceMobile;
    if (device.toLowerCase().includes('tablet')) return DeviceTablet;
    return device.toLowerCase().includes('laptop') ? Desktop : Monitor;
  };

  const overallScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, test) => sum + test.overallScore, 0) / testResults.length)
    : 0;

  // Get critical issues across all components
  const allCriticalIssues = testResults.reduce((acc, result) => {
    return acc.concat(result.criticalIssues);
  }, [] as ResponsiveIssue[]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Responsive Design Test Suite</h1>
          <p className="text-muted-foreground mt-1">
            Validate responsive behavior across multiple screen sizes and devices
          </p>
        </div>
        <div className="flex items-center gap-4">
          {testResults.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Score:</span>
              <Badge className={`${getScoreColor(overallScore)} font-semibold`}>
                {overallScore}%
              </Badge>
            </div>
          )}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={runResponsiveTests}
                className="min-w-[140px]"
              >
                <PlayCircle size={16} className="mr-2" />
                Run Tests
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseTests}
                  variant="outline"
                  disabled={isPaused}
                >
                  <PauseCircle size={16} className="mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={stopTests}
                  variant="destructive"
                >
                  <StopCircle size={16} className="mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Viewport Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Current Viewport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Dimensions:</span>
              <Badge variant="outline">
                {currentViewportInfo.width} × {currentViewportInfo.height}px
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Device Type:</span>
              <Badge variant="outline">
                {currentViewportInfo.deviceType}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Touch Device:</span>
              <Badge variant={currentViewportInfo.isTouchDevice ? 'default' : 'outline'}>
                {currentViewportInfo.isTouchDevice ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Test Status:</span>
              <Badge variant={isRunning ? 'default' : 'outline'}>
                {isRunning ? 'Running' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentlyTesting ? `Testing: ${currentlyTesting}` : 'Preparing tests...'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewport Test Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowsOutCardinal size={20} />
            Test Viewports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            {STANDARD_BREAKPOINTS.map((viewport) => {
              const Icon = getDeviceIcon(viewport.name);
              const isSelected = currentViewport.name === viewport.name;
              const isCurrent = Math.abs(currentViewportInfo.width - viewport.width) < 50;
              
              return (
                <Button
                  key={viewport.name}
                  variant={isSelected ? 'default' : isCurrent ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentViewport(viewport)}
                  className="flex flex-col gap-1 h-auto py-3 text-xs"
                >
                  <Icon size={16} />
                  <span className="font-medium">{viewport.name}</span>
                  <span className="opacity-70">{viewport.width}px</span>
                  {isCurrent && (
                    <Badge className="text-xs h-4 px-1.5 mt-1">Current</Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Test Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="issues">Critical Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {testResults.map((test) => (
                <Card key={test.componentName} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.componentName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {test.description}
                        </p>
                      </div>
                      <Badge className={`${getScoreColor(test.overallScore)} font-semibold`}>
                        {test.overallScore}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {test.testResults.map((result) => {
                        const status = getStatusFromScore(result.score);
                        const Icon = getDeviceIcon(result.breakpoint.name);
                        
                        return (
                          <div
                            key={result.breakpoint.name}
                            className={`p-3 rounded-lg border-2 ${
                              status === 'pass' ? 'border-green-200 bg-green-50' :
                              status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                              'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon size={16} />
                                <span className="text-sm font-medium">{result.breakpoint.name}</span>
                              </div>
                              {getStatusIcon(status)}
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {result.breakpoint.width}×{result.breakpoint.height}px
                            </div>
                            <div className="text-sm font-semibold">
                              {result.score}%
                            </div>
                            {result.issues.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {result.issues.length} issue{result.issues.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Component Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Components</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-2">
                      {testResults.map((test) => (
                        <Button
                          key={test.componentName}
                          variant={selectedComponent === test.componentName ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedComponent(test.componentName)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">{test.componentName}</span>
                            <Badge className={`${getScoreColor(test.overallScore)} text-xs`}>
                              {test.overallScore}%
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedComponent || 'Select a component'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedComponent ? (
                    <div className="space-y-4">
                      {testResults
                        .find(t => t.componentName === selectedComponent)
                        ?.testResults.map((result) => {
                          const status = getStatusFromScore(result.score);
                          const Icon = getDeviceIcon(result.breakpoint.name);
                          
                          return (
                            <div key={result.breakpoint.name} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Icon size={20} />
                                  <div>
                                    <span className="font-medium">{result.breakpoint.name}</span>
                                    <div className="text-sm text-muted-foreground">
                                      {result.breakpoint.width}×{result.breakpoint.height}px • {result.breakpoint.device}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  <Badge className={`${getScoreColor(result.score)}`}>
                                    {result.score}%
                                  </Badge>
                                </div>
                              </div>
                              
                              {result.issues.length > 0 && (
                                <Alert className="mt-3">
                                  <BugBeetle size={16} />
                                  <AlertTitle>Issues Found ({result.issues.length})</AlertTitle>
                                  <AlertDescription>
                                    <div className="space-y-2 mt-2">
                                      {result.issues.map((issue, index) => (
                                        <div key={index} className={`p-2 rounded border ${getSeverityColor(issue.severity)}`}>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium capitalize">{issue.severity}</span>
                                            <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                                          </div>
                                          <p className="text-sm mb-1">{issue.description}</p>
                                          {issue.recommendation && (
                                            <p className="text-xs italic">💡 {issue.recommendation}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a component to view detailed test results
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {allCriticalIssues.length > 0 ? (
              <div className="space-y-4">
                <Alert>
                  <Warning size={16} />
                  <AlertTitle>Critical Issues Found</AlertTitle>
                  <AlertDescription>
                    {allCriticalIssues.length} critical or high-severity issues were found across components.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  {allCriticalIssues.map((issue, index) => (
                    <Card key={index} className={`border-l-4 ${
                      issue.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline">{issue.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        {issue.recommendation && (
                          <div className="bg-muted p-3 rounded text-sm">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Critical Issues Found</h3>
                  <p className="text-muted-foreground">
                    All components passed critical responsiveness tests
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : !isRunning && !isPaused ? (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Test</h3>
            <p className="text-muted-foreground mb-4">
              Run the responsive test suite to validate component behavior across {STANDARD_BREAKPOINTS.length} different screen sizes
            </p>
            <Button onClick={runResponsiveTests}>
              <PlayCircle size={16} className="mr-2" />
              Start Testing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <TestTube size={48} className="mx-auto text-primary" />
              <h3 className="text-lg font-semibold">
                {isPaused ? 'Tests Paused' : 'Running Responsive Tests...'}
              </h3>
              <p className="text-muted-foreground">
                {isPaused 
                  ? 'Tests have been paused. Click Resume to continue.'
                  : `Testing component behavior across ${STANDARD_BREAKPOINTS.length} different viewport sizes`
                }
              </p>
              {!isPaused && (
                <>
                  <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((progress / 100) * COMPONENTS_TO_TEST.length)} of {COMPONENTS_TO_TEST.length} components tested
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              Responsive Design Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Assessment */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{overallScore}%</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{testResults.length}</div>
                      <div className="text-sm text-muted-foreground">Components Tested</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{allCriticalIssues.length}</div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Best Practices */}
              <Alert>
                <CheckCircle size={16} />
                <AlertTitle>Responsive Design Best Practices</AlertTitle>
                <AlertDescription>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="font-medium mb-2">✅ Implemented:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Mobile-first responsive design approach</li>
                        <li>Flexible grid layouts with CSS Grid and Flexbox</li>
                        <li>Responsive typography with relative units</li>
                        <li>Touch-friendly interaction targets (44px minimum)</li>
                        <li>Progressive enhancement for advanced features</li>
                        <li>Accessible navigation patterns</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">🎯 Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Test on real devices in addition to browser tools</li>
                        <li>Consider content prioritization for small screens</li>
                        <li>Optimize images for different screen densities</li>
                        <li>Implement proper focus management</li>
                        <li>Test with different accessibility tools</li>
                        <li>Monitor performance across devices</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Specific Recommendations */}
              {testResults.some(result => result.recommendations.length > 0) && (
                <div>
                  <h4 className="font-medium mb-3">Component-Specific Recommendations:</h4>
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      result.recommendations.length > 0 && (
                        <Card key={result.componentName} className="bg-blue-50/50">
                          <CardContent className="pt-4">
                            <h5 className="font-medium mb-2">{result.componentName}</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {result.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}