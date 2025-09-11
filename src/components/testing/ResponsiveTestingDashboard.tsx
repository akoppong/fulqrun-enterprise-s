import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ResponsiveAutoFixInterface } from './ResponsiveAutoFixInterface';
import { QuickAutoFixActions } from './QuickAutoFixActions';
import { 
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Monitor,
  CheckCircle,
  Warning,
  XCircle,
  Eye,
  TestTube,
  BugBeetle,
  Lightbulb,
  ArrowLeft,
  Target,
  TrendUp,
  Clock,
  Users,
  Gauge,
  List,
  Code,
  Wrench,
  Star,
  Lightning,
  ShieldCheck,
  Zap
} from '@phosphor-icons/react';
import { 
  ResponsiveValidator, 
  STANDARD_BREAKPOINTS, 
  ResponsiveUtils,
  type ComponentResponsiveAnalysis,
  type ResponsiveBreakpoint
} from '@/lib/responsive-validator';
import { 
  ResponsiveAnalyzer,
  RESPONSIVE_RECOMMENDATIONS,
  RESPONSIVE_BEST_PRACTICES,
  type ResponsiveRecommendation
} from '@/lib/responsive-recommendations';

// Comprehensive test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Component Visibility',
    description: 'Test if components remain visible and accessible across screen sizes',
    testFunction: 'visibility'
  },
  {
    name: 'Touch Interaction',
    description: 'Verify touch targets are adequately sized for mobile interaction',
    testFunction: 'touchTargets'
  },
  {
    name: 'Content Overflow',
    description: 'Check for horizontal overflow and layout breaking',
    testFunction: 'overflow'
  },
  {
    name: 'Navigation Usability',
    description: 'Test navigation patterns across different devices',
    testFunction: 'navigation'
  },
  {
    name: 'Form Usability',
    description: 'Verify form layouts and input accessibility',
    testFunction: 'forms'
  },
  {
    name: 'Typography Readability',
    description: 'Test text readability and sizing across viewports',
    testFunction: 'typography'
  }
];

// Critical components that need thorough testing
const CRITICAL_COMPONENTS = [
  {
    name: 'Primary Navigation',
    selector: '.sidebar-container, nav',
    priority: 'critical',
    description: 'Main application navigation and menu system'
  },
  {
    name: 'Data Tables',
    selector: '.opportunities-table, table',
    priority: 'critical',
    description: 'Opportunities and data display tables'
  },
  {
    name: 'Modal Dialogs',
    selector: '[data-radix-dialog-content]',
    priority: 'high',
    description: 'Create, edit and detail view modals'
  },
  {
    name: 'Dashboard Layout',
    selector: '.dashboard-grid, .main-content-area',
    priority: 'high',
    description: 'Main dashboard and content areas'
  },
  {
    name: 'Form Components',
    selector: '.form-container, form',
    priority: 'medium',
    description: 'All form inputs and field layouts'
  },
  {
    name: 'Widget System',
    selector: '.widget-container, .react-grid-item',
    priority: 'medium',
    description: 'Dashboard widgets and KPI cards'
  }
];

interface TestProgress {
  currentComponent: string;
  currentBreakpoint: string;
  currentScenario: string;
  progress: number;
  isComplete: boolean;
}

export function ResponsiveTestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    currentComponent: '',
    currentBreakpoint: '',
    currentScenario: '',
    progress: 0,
    isComplete: false
  });
  const [testResults, setTestResults] = useState<ComponentResponsiveAnalysis[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [currentViewport, setCurrentViewport] = useState(STANDARD_BREAKPOINTS[0]);
  const [liveTestMode, setLiveTestMode] = useState(false);

  const validator = ResponsiveValidator.getInstance();
  const analysis = ResponsiveAnalyzer.analyzeCurrentImplementation();

  // Real-time viewport tracking
  const [viewportInfo, setViewportInfo] = useState({
    width: 0,
    height: 0,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    orientation: 'landscape' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const updateViewportInfo = () => {
      const dimensions = ResponsiveUtils.getViewportDimensions();
      setViewportInfo({
        width: dimensions.width,
        height: dimensions.height,
        deviceType: ResponsiveUtils.getCurrentDeviceType(),
        orientation: dimensions.width > dimensions.height ? 'landscape' : 'portrait'
      });
    };

    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    return () => window.removeEventListener('resize', updateViewportInfo);
  }, []);

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    validator.clearResults();
    
    const totalTests = CRITICAL_COMPONENTS.length * STANDARD_BREAKPOINTS.length * TEST_SCENARIOS.length;
    let completedTests = 0;

    for (const component of CRITICAL_COMPONENTS) {
      setTestProgress(prev => ({ ...prev, currentComponent: component.name }));
      
      try {
        const analysis = await validator.analyzeComponent(
          component.name,
          component.description,
          component.selector
        );
        
        setTestResults(prev => [...prev, analysis]);
        
        for (const breakpoint of STANDARD_BREAKPOINTS) {
          setTestProgress(prev => ({ ...prev, currentBreakpoint: breakpoint.name }));
          
          for (const scenario of TEST_SCENARIOS) {
            setTestProgress(prev => ({ ...prev, currentScenario: scenario.name }));
            
            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, 200));
            
            completedTests++;
            setTestProgress(prev => ({ 
              ...prev, 
              progress: (completedTests / totalTests) * 100 
            }));
          }
        }
      } catch (error) {
        console.error(`Error testing ${component.name}:`, error);
      }
    }
    
    setTestProgress(prev => ({ ...prev, isComplete: true }));
    setIsRunning(false);
  };

  const getOverallScore = () => {
    if (testResults.length === 0) return 0;
    return Math.round(testResults.reduce((sum, result) => sum + result.overallScore, 0) / testResults.length);
  };

  const getCriticalIssuesCount = () => {
    return testResults.reduce((count, result) => 
      count + result.criticalIssues.filter(issue => 
        issue.severity === 'critical' || issue.severity === 'high'
      ).length, 0
    );
  };

  const getDeviceBreakdown = () => {
    const breakdown: Record<string, { score: number; issues: number }> = {};
    
    for (const device of ['mobile', 'tablet', 'laptop', 'desktop']) {
      const deviceResults = testResults.flatMap(result => 
        result.testResults.filter(test => test.breakpoint.device === device)
      );
      
      if (deviceResults.length > 0) {
        const avgScore = Math.round(
          deviceResults.reduce((sum, test) => sum + test.score, 0) / deviceResults.length
        );
        const issueCount = deviceResults.reduce((sum, test) => sum + test.issues.length, 0);
        
        breakdown[device] = { score: avgScore, issues: issueCount };
      }
    }
    
    return breakdown;
  };

  const getPriorityMatrix = () => {
    return ResponsiveAnalyzer.generatePriorityMatrix();
  };

  const getStatusColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return DeviceMobile;
    if (device.toLowerCase().includes('tablet')) return DeviceTablet;
    return device.toLowerCase().includes('laptop') ? Desktop : Monitor;
  };

  const overallScore = getOverallScore();
  const criticalIssues = getCriticalIssuesCount();
  const deviceBreakdown = getDeviceBreakdown();
  const priorityMatrix = getPriorityMatrix();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Quick Test
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comprehensive Responsive Analysis</h1>
            <p className="text-muted-foreground">
              In-depth testing and recommendations for responsive design optimization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {testResults.length > 0 && (
            <Badge className={`${getStatusColor(overallScore)} font-semibold text-lg px-3 py-1`}>
              {overallScore}% Overall Score
            </Badge>
          )}
          <Button
            onClick={runComprehensiveTests}
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <TestTube size={16} className="mr-2 animate-pulse" />
                Running Tests...
              </>
            ) : (
              <>
                <Lightning size={16} className="mr-2" />
                Run Full Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Viewport Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Live Viewport Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Size:</span>
              <Badge variant="outline" className="font-mono">
                {viewportInfo.width} × {viewportInfo.height}px
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Device Type:</span>
              <Badge className="capitalize">
                {viewportInfo.deviceType}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Orientation:</span>
              <Badge variant="outline" className="capitalize">
                {viewportInfo.orientation}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Touch Device:</span>
              <Badge variant={ResponsiveUtils.isTouchDevice() ? 'default' : 'outline'}>
                {ResponsiveUtils.isTouchDevice() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={liveTestMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLiveTestMode(!liveTestMode)}
              >
                <Target size={16} className="mr-2" />
                {liveTestMode ? 'Live Mode On' : 'Enable Live Mode'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Testing: {testProgress.currentComponent}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(testProgress.progress)}% Complete
                </span>
              </div>
              <Progress value={testProgress.progress} className="w-full h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Component: </span>
                  <span className="font-medium">{testProgress.currentComponent}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Breakpoint: </span>
                  <span className="font-medium">{testProgress.currentBreakpoint}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Scenario: </span>
                  <span className="font-medium">{testProgress.currentScenario}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="autofix">Auto-Fix</TabsTrigger>
          <TabsTrigger value="devices">Device Analysis</TabsTrigger>
          <TabsTrigger value="components">Component Deep Dive</TabsTrigger>
          <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
          <TabsTrigger value="bestpractices">Best Practices</TabsTrigger>
          <TabsTrigger value="live">Live Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {testResults.length > 0 ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Gauge size={32} className="mx-auto mb-2 text-primary" />
                      <div className="text-3xl font-bold">{overallScore}%</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BugBeetle size={32} className="mx-auto mb-2 text-red-500" />
                      <div className="text-3xl font-bold">{criticalIssues}</div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <List size={32} className="mx-auto mb-2 text-blue-500" />
                      <div className="text-3xl font-bold">{testResults.length}</div>
                      <div className="text-sm text-muted-foreground">Components Tested</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <ShieldCheck size={32} className="mx-auto mb-2 text-green-500" />
                      <div className="text-3xl font-bold">{STANDARD_BREAKPOINTS.length}</div>
                      <div className="text-sm text-muted-foreground">Breakpoints Tested</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Summary */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      Current Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.slice(0, 5).map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Star size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warning size={20} className="text-yellow-600" />
                      Priority Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.priorityActions.slice(0, 5).map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Warning size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{action.component}</div>
                            <div className="text-muted-foreground">{action.issue}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TestTube size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready for Comprehensive Testing</h3>
                <p className="text-muted-foreground mb-6">
                  Run a full responsive analysis across {CRITICAL_COMPONENTS.length} components, 
                  {STANDARD_BREAKPOINTS.length} breakpoints, and {TEST_SCENARIOS.length} test scenarios.
                </p>
                <Button onClick={runComprehensiveTests} size="lg">
                  <Lightning size={20} className="mr-2" />
                  Start Comprehensive Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Device Analysis Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(deviceBreakdown).map(([device, data]) => {
              const Icon = getDeviceIcon(device);
              return (
                <Card key={device}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Icon size={32} className="mx-auto mb-3" />
                      <div className="text-lg font-semibold capitalize">{device}</div>
                      <div className={`text-2xl font-bold mt-2 ${getStatusColor(data.score)}`}>
                        {data.score}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {data.issues} issues found
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Breakpoint Details */}
          <Card>
            <CardHeader>
              <CardTitle>Breakpoint Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {STANDARD_BREAKPOINTS.map((breakpoint) => {
                  const Icon = getDeviceIcon(breakpoint.name);
                  const testData = testResults.flatMap(result => 
                    result.testResults.filter(test => test.breakpoint.name === breakpoint.name)
                  );
                  const avgScore = testData.length > 0 
                    ? Math.round(testData.reduce((sum, test) => sum + test.score, 0) / testData.length)
                    : 0;
                  
                  return (
                    <div
                      key={breakpoint.name}
                      className={`p-3 rounded-lg border-2 ${
                        avgScore >= 85 ? 'border-green-200 bg-green-50' :
                        avgScore >= 70 ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="text-center">
                        <Icon size={20} className="mx-auto mb-1" />
                        <div className="text-xs font-medium">{breakpoint.name}</div>
                        <div className="text-xs text-muted-foreground">{breakpoint.width}px</div>
                        <div className="text-sm font-semibold mt-1">{avgScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Fix Tab */}
        <TabsContent value="autofix" className="space-y-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Auto-Fix Actions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  One-click fixes for common responsive design issues
                </p>
              </CardHeader>
              <CardContent>
                <QuickAutoFixActions 
                  onComplete={() => {
                    // Refresh test results after fixes are applied
                    setSelectedTab('overview');
                    setTimeout(() => runTests(), 1000);
                  }}
                />
              </CardContent>
            </Card>

            {/* Advanced Auto-Fix Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Advanced Auto-Fix
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed analysis and customized auto-fix options
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveAutoFixInterface />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor size={20} />
                Device Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                Responsive performance across different device types
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {STANDARD_BREAKPOINTS.map((breakpoint) => {
                  const Icon = getDeviceIcon(breakpoint.name);
                  const testData = testResults.flatMap(result => 
                    result.testResults.filter(test => test.breakpoint.name === breakpoint.name)
                  );
                  const avgScore = testData.length > 0 
                    ? Math.round(testData.reduce((sum, test) => sum + test.score, 0) / testData.length)
                    : 0;
                  
                  return (
                    <div
                      key={breakpoint.name}
                      className={`p-3 rounded-lg border-2 ${
                        avgScore >= 85 ? 'border-green-200 bg-green-50' :
                        avgScore >= 70 ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="text-center">
                        <Icon size={20} className="mx-auto mb-1" />
                        <div className="text-xs font-medium">{breakpoint.name}</div>
                        <div className="text-xs text-muted-foreground">{breakpoint.width}px</div>
                        <div className="text-sm font-semibold mt-1">{avgScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid gap-6">
            {testResults.map((result) => (
              <Card key={result.componentName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{result.componentName}</CardTitle>
                    <Badge className={`${getStatusColor(result.overallScore)} font-semibold`}>
                      {result.overallScore}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Breakpoint Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {result.testResults.map((test) => {
                        const Icon = getDeviceIcon(test.breakpoint.name);
                        return (
                          <div
                            key={test.breakpoint.name}
                            className="p-2 rounded border text-center"
                          >
                            <Icon size={16} className="mx-auto mb-1" />
                            <div className="text-xs font-medium">{test.breakpoint.name}</div>
                            <div className="text-sm font-semibold">{test.score}%</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Critical Issues */}
                    {result.criticalIssues.length > 0 && (
                      <Alert>
                        <BugBeetle size={16} />
                        <AlertTitle>Critical Issues ({result.criticalIssues.length})</AlertTitle>
                        <AlertDescription>
                          <ul className="mt-2 space-y-1">
                            {result.criticalIssues.slice(0, 3).map((issue, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {issue.description}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Implementation Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <div className="space-y-6">
            {analysis.implementationRoadmap.map((phase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} />
                    {phase.phase}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{phase.estimatedTime}</Badge>
                    <Badge>{phase.recommendations.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {phase.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{rec.component}</h4>
                            <p className="text-sm text-muted-foreground">{rec.issue}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={
                              rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.estimatedEffort} effort</Badge>
                          </div>
                        </div>
                        <div className="bg-muted p-3 rounded">
                          <p className="text-sm">
                            <strong>Solution:</strong> {rec.solution}
                          </p>
                          <p className="text-sm mt-1">
                            <strong>Implementation:</strong> {rec.implementation}
                          </p>
                        </div>
                        {rec.codeExample && (
                          <details className="mt-2">
                            <summary className="text-sm font-medium cursor-pointer">
                              View Code Example
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                              <code>{rec.codeExample}</code>
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="bestpractices" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {Object.entries(RESPONSIVE_BEST_PRACTICES).map(([category, practices]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {practices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Testing Tab */}
        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Live Responsive Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Lightbulb size={16} />
                  <AlertTitle>Interactive Testing Mode</AlertTitle>
                  <AlertDescription>
                    Resize your browser window or use device simulation to test responsive behavior in real-time.
                    The system will automatically detect layout issues and provide feedback.
                  </AlertDescription>
                </Alert>

                {/* Viewport Simulator */}
                <div>
                  <h4 className="font-semibold mb-3">Simulate Common Devices</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {STANDARD_BREAKPOINTS.slice(0, 12).map((breakpoint) => {
                      const Icon = getDeviceIcon(breakpoint.name);
                      return (
                        <Button
                          key={breakpoint.name}
                          variant="outline"
                          className="flex flex-col gap-2 h-auto py-3"
                          onClick={() => {
                            // In a real implementation, this would trigger viewport simulation
                            setCurrentViewport(breakpoint);
                          }}
                        >
                          <Icon size={20} />
                          <span className="text-xs font-medium">{breakpoint.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {breakpoint.width}×{breakpoint.height}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Feedback */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Viewport Width:</span>
                          <Badge variant="outline" className="font-mono">
                            {viewportInfo.width}px
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Device Category:</span>
                          <Badge className="capitalize">{viewportInfo.deviceType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Touch Support:</span>
                          <Badge variant={ResponsiveUtils.isTouchDevice() ? 'default' : 'outline'}>
                            {ResponsiveUtils.isTouchDevice() ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                          Test with real devices when possible
                        </li>
                        <li className="flex items-start gap-2">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                          Check both portrait and landscape orientations
                        </li>
                        <li className="flex items-start gap-2">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                          Verify touch targets are at least 44px
                        </li>
                        <li className="flex items-start gap-2">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                          Test with different zoom levels
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}