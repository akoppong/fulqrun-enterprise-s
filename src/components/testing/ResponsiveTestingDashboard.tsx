import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  TestTube,
  ArrowsOutCardinal,
  PlayCircle,
  PauseCircle,
  StopCircle,
  BugBeetle,
  Lightbulb
} from '@phosphor-icons/react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex } from '../layout/EnhancedResponsiveLayout';
import { 
  ResponsiveRecommendation, 
  RESPONSIVE_RECOMMENDATIONS, 
  RESPONSIVE_BEST_PRACTICES,
  ResponsiveAnalyzer 
} from '@/lib/responsive-recommendations';

interface ResponsiveTestResult {
  breakpoint: string;
  width: number;
  height: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  score: number;
  issues: ResponsiveIssue[];
  timestamp: Date;
}

interface ResponsiveIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'layout' | 'typography' | 'navigation' | 'content' | 'interaction';
  description: string;
  element?: string;
  recommendation?: string;
}

interface ComponentTestResult {
  componentName: string;
  description: string;
  testResults: ResponsiveTestResult[];
  overallScore: number;
  recommendations: string[];
}

const BREAKPOINTS = [
  { name: 'Mobile S', width: 320, height: 568, device: 'mobile' as const },
  { name: 'Mobile M', width: 375, height: 667, device: 'mobile' as const },
  { name: 'Mobile L', width: 425, height: 812, device: 'mobile' as const },
  { name: 'Tablet Portrait', width: 768, height: 1024, device: 'tablet' as const },
  { name: 'Tablet Landscape', width: 1024, height: 768, device: 'tablet' as const },
  { name: 'Desktop', width: 1440, height: 900, device: 'desktop' as const },
  { name: 'Large Desktop', width: 1920, height: 1080, device: 'desktop' as const },
];

export function ResponsiveTestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [testResults, setTestResults] = useState<ComponentTestResult[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [currentViewport, setCurrentViewport] = useState(BREAKPOINTS[0]);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Real-time viewport monitoring
  const [viewportInfo, setViewportInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    deviceType: getDeviceType(window.innerWidth)
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: getDeviceType(window.innerWidth)
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  const runResponsiveTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    const components = [
      { name: 'Header Navigation', description: 'Top navigation with user menu' },
      { name: 'Sidebar Navigation', description: 'Collapsible sidebar menu' },
      { name: 'Opportunities Table', description: 'Data table with responsive behavior' },
      { name: 'Opportunity Modal', description: 'Full-screen modal dialog' },
      { name: 'Dashboard Widgets', description: 'KPI cards and charts' },
      { name: 'Forms', description: 'Create/edit forms' }
    ];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      setCurrentTest(component.name);

      const testResults: ResponsiveTestResult[] = [];

      for (const breakpoint of BREAKPOINTS) {
        // Simulate testing at different breakpoints
        const issues = await testComponentAtBreakpoint(component.name, breakpoint);
        const score = calculateScore(issues);

        testResults.push({
          breakpoint: breakpoint.name,
          width: breakpoint.width,
          height: breakpoint.height,
          deviceType: breakpoint.device,
          score,
          issues,
          timestamp: new Date()
        });

        // Update progress
        const overallProgress = ((i * BREAKPOINTS.length + testResults.length) / (components.length * BREAKPOINTS.length)) * 100;
        setProgress(overallProgress);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const overallScore = Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length);
      const recommendations = generateRecommendations(component.name, testResults);

      setTestResults(prev => [...prev, {
        componentName: component.name,
        description: component.description,
        testResults,
        overallScore,
        recommendations
      }]);
    }

    setIsRunning(false);
    setCurrentTest('');
  };

  const testComponentAtBreakpoint = async (componentName: string, breakpoint: typeof BREAKPOINTS[0]): Promise<ResponsiveIssue[]> => {
    const issues: ResponsiveIssue[] = [];

    // Simulate component-specific testing logic
    switch (componentName) {
      case 'Header Navigation':
        if (breakpoint.width < 768) {
          issues.push({
            severity: 'high',
            category: 'navigation',
            description: 'Navigation menu should collapse on mobile devices',
            recommendation: 'Implement hamburger menu for mobile navigation'
          });
        }
        break;

      case 'Opportunities Table':
        if (breakpoint.width < 1024) {
          issues.push({
            severity: 'medium',
            category: 'layout',
            description: 'Table requires horizontal scrolling on smaller screens',
            recommendation: 'Consider card layout or responsive table design'
          });
        }
        if (breakpoint.width < 768) {
          issues.push({
            severity: 'high',
            category: 'content',
            description: 'Table content not easily accessible on mobile',
            recommendation: 'Switch to card-based layout for mobile devices'
          });
        }
        break;

      case 'Opportunity Modal':
        if (breakpoint.width < 768) {
          issues.push({
            severity: 'critical',
            category: 'layout',
            description: 'Modal dialog not properly sized for mobile screens',
            recommendation: 'Use full-screen modal on mobile devices'
          });
        }
        break;

      case 'Forms':
        if (breakpoint.width < 768) {
          issues.push({
            severity: 'medium',
            category: 'layout',
            description: 'Multi-column form layout cramped on mobile',
            recommendation: 'Stack form fields vertically on mobile devices'
          });
        }
        break;
    }

    return issues;
  };

  const calculateScore = (issues: ResponsiveIssue[]): number => {
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    return Math.max(0, score);
  };

  const generateRecommendations = (componentName: string, results: ResponsiveTestResult[]): string[] => {
    const recommendations: string[] = [];
    const allIssues = results.flatMap(r => r.issues);

    if (allIssues.some(issue => issue.category === 'navigation')) {
      recommendations.push('Implement responsive navigation patterns');
    }
    if (allIssues.some(issue => issue.category === 'layout')) {
      recommendations.push('Optimize layout for smaller screens');
    }
    if (allIssues.some(issue => issue.severity === 'critical')) {
      recommendations.push('Address critical responsive issues immediately');
    }

    return recommendations;
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return DeviceMobile;
    if (device.toLowerCase().includes('tablet')) return DeviceTablet;
    return device.toLowerCase().includes('desktop') ? Desktop : Monitor;
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
    }
  };

  const overallScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, test) => sum + test.overallScore, 0) / testResults.length)
    : 0;

  const analysis = ResponsiveAnalyzer.analyzeCurrentImplementation();

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Responsive Design Assessment
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of responsive behavior across devices and screen sizes
        </p>
      </div>

      {/* Current Status */}
      <ResponsiveGrid cols={{ default: 1, md: 2, lg: 4 }} gap="md" className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{viewportInfo.width}×{viewportInfo.height}</div>
              <div className="text-sm text-muted-foreground">Current Viewport</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 capitalize">{viewportInfo.deviceType}</div>
              <div className="text-sm text-muted-foreground">Device Type</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{testResults.length}</div>
              <div className="text-sm text-muted-foreground">Components Tested</div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Test Controls */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Responsive Testing</CardTitle>
            <Button 
              onClick={runResponsiveTests}
              disabled={isRunning}
              className="min-w-[140px]"
            >
              {isRunning ? (
                <>
                  <TestTube size={16} className="mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <PlayCircle size={16} className="mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isRunning && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentTest ? `Testing: ${currentTest}` : 'Preparing tests...'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {testResults.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
              {testResults.map((result) => (
                <Card key={result.componentName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.componentName}</CardTitle>
                      <Badge className={getScoreColor(result.overallScore)}>
                        {result.overallScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {result.testResults.slice(0, 6).map((test) => {
                        const Icon = getDeviceIcon(test.deviceType);
                        const status = test.score >= 85 ? 'pass' : test.score >= 70 ? 'warning' : 'fail';
                        return (
                          <div
                            key={test.breakpoint}
                            className={`p-2 rounded text-center border ${
                              status === 'pass' ? 'bg-green-50 border-green-200' :
                              status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-red-50 border-red-200'
                            }`}
                          >
                            <Icon size={16} className="mx-auto mb-1" />
                            <div className="text-xs font-medium">{test.score}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Components</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-2">
                      {testResults.map((result) => (
                        <Button
                          key={result.componentName}
                          variant={selectedComponent === result.componentName ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedComponent(result.componentName)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">{result.componentName}</span>
                            <Badge className={`${getScoreColor(result.overallScore)} text-xs`}>
                              {result.overallScore}%
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedComponent || 'Select a component'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedComponent ? (
                    <div className="space-y-4">
                      {testResults
                        .find(t => t.componentName === selectedComponent)
                        ?.testResults.map((result) => {
                          const Icon = getDeviceIcon(result.deviceType);
                          return (
                            <div key={result.breakpoint} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Icon size={20} />
                                  <div>
                                    <span className="font-medium">{result.breakpoint}</span>
                                    <div className="text-sm text-muted-foreground">
                                      {result.width}×{result.height}px
                                    </div>
                                  </div>
                                </div>
                                <Badge className={getScoreColor(result.score)}>
                                  {result.score}%
                                </Badge>
                              </div>
                              
                              {result.issues.length > 0 && (
                                <div className="space-y-2">
                                  {result.issues.map((issue, index) => (
                                    <Alert key={index} className={getSeverityColor(issue.severity)}>
                                      <BugBeetle size={16} />
                                      <AlertDescription>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-medium capitalize">{issue.severity}</span>
                                          <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                                        </div>
                                        <p className="text-sm">{issue.description}</p>
                                        {issue.recommendation && (
                                          <p className="text-xs italic mt-1">💡 {issue.recommendation}</p>
                                        )}
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
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

          <TabsContent value="recommendations" className="space-y-6">
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Current Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
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
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Warning size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} />
                  Priority Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <Alert key={index} className={getSeverityColor(rec.priority)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <h4 className="font-medium">{rec.component}</h4>
                          <p className="text-sm mt-1">{rec.issue}</p>
                          <div className="bg-muted p-2 rounded text-sm mt-2">
                            <strong>Solution:</strong> {rec.solution}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
              <Card>
                <CardHeader>
                  <CardTitle>Design Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {RESPONSIVE_BEST_PRACTICES.design.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {RESPONSIVE_BEST_PRACTICES.technical.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {RESPONSIVE_BEST_PRACTICES.accessibility.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {RESPONSIVE_BEST_PRACTICES.performance.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>
        </Tabs>
      )}
    </ResponsiveContainer>
  );
}