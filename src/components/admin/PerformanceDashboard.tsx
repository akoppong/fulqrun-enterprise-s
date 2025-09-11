import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  performanceMonitor, 
  type PerformanceMetric, 
  type OptimizationOpportunity 
} from '@/lib/performance-monitor';
import { 
  ChartLine, 
  Memory, 
  Network, 
  Clock, 
  Warning, 
  CheckCircle, 
  Lightbulb,
  Trash,
  BarChart3,
  Activity
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      // Get current performance data
      const currentSummary = performanceMonitor.getPerformanceSummary();
      setSummary(currentSummary);
      
      // Set up real-time monitoring
      const handleMetric = (metric: PerformanceMetric) => {
        setMetrics(prev => [metric, ...prev.slice(0, 99)]); // Keep last 100 metrics
      };

      const handleOptimization = (opportunity: OptimizationOpportunity) => {
        setOpportunities(prev => [opportunity, ...prev.slice(0, 19)]); // Keep last 20 opportunities
      };

      performanceMonitor.onMetric(handleMetric);
      performanceMonitor.onOptimizationOpportunity(handleOptimization);

      return () => {
        // Clean up if possible (this would need to be implemented in performanceMonitor)
      };
    }
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <Warning className="w-4 h-4 text-red-500" />;
      case 'warning': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setMetrics([]);
    setOpportunities([]);
    setSummary(performanceMonitor.getPerformanceSummary());
    toast.success('Performance data cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg border shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Performance Monitor</h2>
              <p className="text-muted-foreground">Real-time application performance insights</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearMetrics}>
                <Trash className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            </TabsList>

            <div className="flex-1 p-6 overflow-hidden">
              <TabsContent value="overview" className="h-full m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Total Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.totalMetrics || 0}</div>
                      <p className="text-sm text-muted-foreground">Collected</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Warning className="w-4 h-4 text-red-500" />
                        Recent Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">{summary?.recentIssues || 0}</div>
                      <p className="text-sm text-muted-foreground">Last 5 minutes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Memory className="w-4 h-4" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {summary?.memoryMetrics?.length > 0 
                          ? formatBytes(summary.memoryMetrics[summary.memoryMetrics.length - 1].usedJSHeapSize)
                          : 'N/A'
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">Current usage</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {summary?.networkMetrics?.requestCount || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg: {summary?.networkMetrics?.averageResponseTime 
                          ? formatDuration(summary.networkMetrics.averageResponseTime)
                          : 'N/A'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {summary?.componentMetrics?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Component Performance</CardTitle>
                      <CardDescription>Render times and re-render counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-4">
                          {summary.componentMetrics.map((component: any) => (
                            <div key={component.componentName} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{component.componentName}</h4>
                                <Badge variant={component.slowRenders > 0 ? 'destructive' : 'default'}>
                                  {formatDuration(component.averageRenderTime)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Re-renders</p>
                                  <p className="font-medium">{component.reRenderCount}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Slow renders</p>
                                  <p className="font-medium text-red-500">{component.slowRenders}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Last render</p>
                                  <p className="font-medium">{formatDuration(component.lastRenderTime)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="metrics" className="h-full m-0">
                <div className="flex gap-4 mb-4">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedCategory === 'render' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('render')}
                  >
                    Render
                  </Button>
                  <Button
                    variant={selectedCategory === 'network' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('network')}
                  >
                    Network
                  </Button>
                  <Button
                    variant={selectedCategory === 'memory' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('memory')}
                  >
                    Memory
                  </Button>
                  <Button
                    variant={selectedCategory === 'interaction' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('interaction')}
                  >
                    Interaction
                  </Button>
                </div>

                <ScrollArea className="h-[calc(100%-4rem)]">
                  <div className="space-y-2">
                    {filteredMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(metric.severity)}
                            <span className="font-medium">{metric.name}</span>
                            <Badge variant={getSeverityColor(metric.severity) as any}>
                              {metric.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-mono">
                            {metric.value.toFixed(2)} {metric.unit}
                          </span>
                          {metric.context && (
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(metric.context).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredMetrics.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No metrics available for this category.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="components" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {summary?.componentMetrics?.map((component: any) => (
                      <Card key={component.componentName}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {component.componentName}
                            <Badge 
                              variant={component.slowRenders > 0 ? 'destructive' : 'default'}
                            >
                              {component.slowRenders > 0 ? 'Slow' : 'Good'}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Average Render Time</p>
                              <p className="text-xl font-bold">
                                {formatDuration(component.averageRenderTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Re-render Count</p>
                              <p className="text-xl font-bold">{component.reRenderCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Slow Renders</p>
                              <p className="text-xl font-bold text-red-500">
                                {component.slowRenders}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Last Render</p>
                              <p className="text-xl font-bold">
                                {formatDuration(component.lastRenderTime)}
                              </p>
                            </div>
                          </div>
                          
                          {component.slowRenders > 0 && (
                            <Alert className="mt-4">
                              <Warning className="w-4 h-4" />
                              <AlertDescription>
                                This component has {component.slowRenders} slow render(s). 
                                Consider optimizing props, using React.memo(), or checking for 
                                expensive computations.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No component performance data available.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="optimizations" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {opportunities.map((opportunity, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            {opportunity.description}
                            <Badge 
                              variant={
                                opportunity.severity === 'high' ? 'destructive' :
                                opportunity.severity === 'medium' ? 'secondary' : 'default'
                              }
                            >
                              {opportunity.severity} priority
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Type: {opportunity.type} • Impact: {opportunity.impact}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Suggested Actions:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {opportunity.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                          {opportunity.component && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">Affected Component:</span> {opportunity.component}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {opportunities.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Optimization Opportunities</h3>
                        <p className="text-muted-foreground">
                          Your application is performing well! Keep monitoring for potential improvements.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}