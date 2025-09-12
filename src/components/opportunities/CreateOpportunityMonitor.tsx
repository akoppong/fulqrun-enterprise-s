import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Monitor, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Info,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Target,
  Clock,
  Bug,
  Eye,
  Database,
  Zap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MonitoringEvent {
  id: string;
  timestamp: number;
  type: 'click' | 'render' | 'state_change' | 'error' | 'performance' | 'user_action';
  component: string;
  action: string;
  data?: any;
  duration?: number;
  level: 'info' | 'warning' | 'error' | 'success';
}

interface PerformanceMetrics {
  clickResponseTime: number[];
  renderTime: number[];
  memoryUsage: number[];
  dialogOpenTime: number[];
  errorCount: number;
  successfulClicks: number;
  totalClicks: number;
}

interface RealTimeStats {
  currentMemory: number;
  avgResponseTime: number;
  errorRate: number;
  successRate: number;
  peakResponseTime: number;
  lastUpdateTime: number;
}

export function CreateOpportunityMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    clickResponseTime: [],
    renderTime: [],
    memoryUsage: [],
    dialogOpenTime: [],
    errorCount: 0,
    successfulClicks: 0,
    totalClicks: 0
  });
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    currentMemory: 0,
    avgResponseTime: 0,
    errorRate: 0,
    successRate: 0,
    peakResponseTime: 0,
    lastUpdateTime: Date.now()
  });
  const [alertThresholds, setAlertThresholds] = useState({
    maxResponseTime: 200, // ms
    maxMemoryUsage: 50, // MB
    maxErrorRate: 10 // %
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  const addEvent = useCallback((
    type: MonitoringEvent['type'], 
    component: string, 
    action: string, 
    data?: any, 
    duration?: number,
    level: MonitoringEvent['level'] = 'info'
  ) => {
    const event: MonitoringEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      component,
      action,
      data,
      duration,
      level
    };
    
    setEvents(prev => [event, ...prev].slice(0, 500)); // Keep last 500 events
    
    // Update metrics based on event type
    if (type === 'click' && component === 'CreateButton') {
      setMetrics(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        clickResponseTime: duration ? [...prev.clickResponseTime, duration].slice(-100) : prev.clickResponseTime
      }));
    }
    
    if (type === 'error') {
      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    }
    
    if (level === 'success' && type === 'click') {
      setMetrics(prev => ({
        ...prev,
        successfulClicks: prev.successfulClicks + 1
      }));
    }
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMB = memory.usedJSHeapSize / 1024 / 1024;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: [...prev.memoryUsage, memoryMB].slice(-100)
      }));
      
      setRealTimeStats(prev => ({
        ...prev,
        currentMemory: memoryMB
      }));
      
      if (memoryMB > alertThresholds.maxMemoryUsage) {
        addEvent('performance', 'MemoryMonitor', 'high_memory_usage', { memoryMB }, undefined, 'warning');
        toast.warning(`High memory usage detected: ${memoryMB.toFixed(2)}MB`);
      }
    }
  }, [alertThresholds.maxMemoryUsage, addEvent]);

  const calculateRealTimeStats = useCallback(() => {
    setRealTimeStats(prev => {
      const avgResponseTime = metrics.clickResponseTime.length > 0 
        ? metrics.clickResponseTime.reduce((a, b) => a + b, 0) / metrics.clickResponseTime.length 
        : 0;
      
      const errorRate = metrics.totalClicks > 0 
        ? (metrics.errorCount / metrics.totalClicks) * 100 
        : 0;
      
      const successRate = metrics.totalClicks > 0 
        ? (metrics.successfulClicks / metrics.totalClicks) * 100 
        : 0;
      
      const peakResponseTime = metrics.clickResponseTime.length > 0 
        ? Math.max(...metrics.clickResponseTime) 
        : 0;
      
      return {
        ...prev,
        avgResponseTime,
        errorRate,
        successRate,
        peakResponseTime,
        lastUpdateTime: Date.now()
      };
    });
  }, [metrics]);

  const setupButtonMonitoring = useCallback(() => {
    const findCreateButton = () => {
      return document.querySelector('[data-testid="create-opportunity-button"]') || 
             Array.from(document.querySelectorAll('button')).find(btn => 
               btn.textContent?.includes('Create Opportunity')
             );
    };

    const button = findCreateButton();
    if (!button) {
      addEvent('error', 'ButtonMonitor', 'button_not_found', null, undefined, 'error');
      return;
    }

    // Monitor button clicks
    const originalClickHandler = (button as any).__clickHandler;
    const clickStartTime = new Map();
    
    const handleClick = (event: Event) => {
      const startTime = performance.now();
      clickStartTime.set(event, startTime);
      
      addEvent('click', 'CreateButton', 'click_initiated', { 
        target: event.target,
        timestamp: startTime 
      });
      
      // Monitor for dialog opening
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (dialogs.length > 0) {
          addEvent('state_change', 'Dialog', 'opened', { 
            dialogCount: dialogs.length,
            openTime: duration 
          }, duration, 'success');
          
          setMetrics(prev => ({
            ...prev,
            dialogOpenTime: [...prev.dialogOpenTime, duration].slice(-100),
            successfulClicks: prev.successfulClicks + 1
          }));
          
          if (duration > alertThresholds.maxResponseTime) {
            addEvent('performance', 'CreateButton', 'slow_response', { duration }, duration, 'warning');
            toast.warning(`Slow response time: ${duration.toFixed(2)}ms`);
          }
        } else {
          addEvent('error', 'Dialog', 'failed_to_open', { duration }, duration, 'error');
        }
      }, 50);
    };

    button.addEventListener('click', handleClick);
    
    addEvent('info', 'ButtonMonitor', 'monitoring_started', { buttonExists: true });
    
    return () => {
      button.removeEventListener('click', handleClick);
    };
  }, [addEvent, alertThresholds.maxResponseTime]);

  const setupDOMObserver = useCallback(() => {
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for dialog additions/removals
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.getAttribute('role') === 'dialog' || 
                  element.querySelector('[role="dialog"]')) {
                addEvent('render', 'Dialog', 'dom_added', { nodeName: element.nodeName });
              }
            }
          });
          
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.getAttribute('role') === 'dialog' || 
                  element.querySelector('[role="dialog"]')) {
                addEvent('render', 'Dialog', 'dom_removed', { nodeName: element.nodeName });
              }
            }
          });
        }
        
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.getAttribute('data-testid') === 'create-opportunity-button') {
            addEvent('state_change', 'CreateButton', 'attribute_changed', { 
              attribute: mutation.attributeName,
              newValue: target.getAttribute(mutation.attributeName!) 
            });
          }
        }
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'disabled', 'aria-disabled']
    });
  }, [addEvent]);

  const setupPerformanceObserver = useCallback(() => {
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            addEvent('performance', 'PerformanceAPI', entry.entryType, {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            }, entry.duration);
          }
        });
      });
      
      try {
        performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        addEvent('error', 'PerformanceObserver', 'setup_failed', error, undefined, 'error');
      }
    }
  }, [addEvent]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    addEvent('info', 'Monitor', 'started', { timestamp: Date.now() });
    
    // Setup various monitoring systems
    const cleanupButton = setupButtonMonitoring();
    setupDOMObserver();
    setupPerformanceObserver();
    
    // Start periodic monitoring
    monitoringIntervalRef.current = setInterval(() => {
      measureMemoryUsage();
      calculateRealTimeStats();
    }, 1000);
    
    toast.success('Monitoring started');
    
    return () => {
      if (cleanupButton) cleanupButton();
    };
  }, [isMonitoring, addEvent, setupButtonMonitoring, setupDOMObserver, setupPerformanceObserver, measureMemoryUsage, calculateRealTimeStats]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }
    
    addEvent('info', 'Monitor', 'stopped', { timestamp: Date.now() });
    toast.info('Monitoring stopped');
  }, [addEvent]);

  const clearData = () => {
    setEvents([]);
    setMetrics({
      clickResponseTime: [],
      renderTime: [],
      memoryUsage: [],
      dialogOpenTime: [],
      errorCount: 0,
      successfulClicks: 0,
      totalClicks: 0
    });
    setRealTimeStats({
      currentMemory: 0,
      avgResponseTime: 0,
      errorRate: 0,
      successRate: 0,
      peakResponseTime: 0,
      lastUpdateTime: Date.now()
    });
    addEvent('info', 'Monitor', 'data_cleared', { timestamp: Date.now() });
  };

  const testButtonClick = () => {
    const button = document.querySelector('[data-testid="create-opportunity-button"]') || 
                   Array.from(document.querySelectorAll('button')).find(btn => 
                     btn.textContent?.includes('Create Opportunity')
                   );
    
    if (button) {
      addEvent('user_action', 'Tester', 'manual_click_test', null, undefined, 'info');
      (button as HTMLButtonElement).click();
    } else {
      addEvent('error', 'Tester', 'button_not_found', null, undefined, 'error');
      toast.error('Create Opportunity button not found');
    }
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  const getEventIcon = (type: MonitoringEvent['type'], level: MonitoringEvent['level']) => {
    if (level === 'error') return <XCircle size={16} className="text-red-600" />;
    if (level === 'warning') return <Warning size={16} className="text-amber-600" />;
    if (level === 'success') return <CheckCircle size={16} className="text-green-600" />;
    
    switch (type) {
      case 'click': return <Target size={16} className="text-blue-600" />;
      case 'render': return <Eye size={16} className="text-purple-600" />;
      case 'state_change': return <RefreshCw size={16} className="text-indigo-600" />;
      case 'performance': return <Zap size={16} className="text-orange-600" />;
      case 'user_action': return <Activity size={16} className="text-green-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor size={20} />
                Create Opportunity Live Monitor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring and debugging of Create Opportunity functionality
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                  id="auto-refresh"
                />
                <label htmlFor="auto-refresh" className="text-sm">Auto-refresh</label>
              </div>
              <Button
                onClick={testButtonClick}
                variant="outline"
                size="sm"
              >
                <Target size={16} className="mr-2" />
                Test Click
              </Button>
              <Button
                onClick={clearData}
                variant="outline"
                size="sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Clear Data
              </Button>
              <Button 
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                className="min-w-32"
              >
                {isMonitoring ? (
                  <>
                    <Pause size={16} className="mr-2" />
                    Stop Monitor
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Start Monitor
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{metrics.totalClicks}</div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.successfulClicks}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeStats.avgResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeStats.currentMemory.toFixed(1)}MB
              </div>
              <div className="text-sm text-muted-foreground">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeStats.successRate.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} />
              Response Time Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Average: {realTimeStats.avgResponseTime.toFixed(2)}ms</span>
                <span>Peak: {realTimeStats.peakResponseTime.toFixed(2)}ms</span>
              </div>
              <Progress 
                value={Math.min((realTimeStats.avgResponseTime / alertThresholds.maxResponseTime) * 100, 100)} 
                className="h-2" 
              />
              <div className="text-xs text-muted-foreground">
                Target: Under {alertThresholds.maxResponseTime}ms
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={18} />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Current: {realTimeStats.currentMemory.toFixed(2)}MB</span>
                <span>Limit: {alertThresholds.maxMemoryUsage}MB</span>
              </div>
              <Progress 
                value={(realTimeStats.currentMemory / alertThresholds.maxMemoryUsage) * 100} 
                className="h-2" 
              />
              <div className="text-xs text-muted-foreground">
                {(realTimeStats.currentMemory / alertThresholds.maxMemoryUsage * 100).toFixed(1)}% of limit
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              Live Event Stream
              <Badge variant="outline">{events.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-sm text-muted-foreground">
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {events.length > 0 ? (
                events.slice(0, 100).map((event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded border text-sm",
                      event.level === 'error' && "bg-red-50 border-red-200",
                      event.level === 'warning' && "bg-amber-50 border-amber-200",
                      event.level === 'success' && "bg-green-50 border-green-200",
                      event.level === 'info' && "bg-blue-50 border-blue-200"
                    )}
                  >
                    {getEventIcon(event.type, event.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{event.component}</span>
                        <span>•</span>
                        <span>{event.action}</span>
                        {event.duration && (
                          <>
                            <span>•</span>
                            <span>{event.duration.toFixed(2)}ms</span>
                          </>
                        )}
                      </div>
                      {event.data && (
                        <details className="mt-1">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-20">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No events captured yet. {!isMonitoring && 'Start monitoring to see events.'}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {isMonitoring && (realTimeStats.errorRate > alertThresholds.maxErrorRate || 
                        realTimeStats.avgResponseTime > alertThresholds.maxResponseTime ||
                        realTimeStats.currentMemory > alertThresholds.maxMemoryUsage) && (
        <Alert className="border-amber-200 bg-amber-50">
          <Warning size={16} />
          <AlertDescription>
            Performance issues detected:
            {realTimeStats.errorRate > alertThresholds.maxErrorRate && (
              <div>• Error rate above threshold: {realTimeStats.errorRate.toFixed(1)}%</div>
            )}
            {realTimeStats.avgResponseTime > alertThresholds.maxResponseTime && (
              <div>• Response time above threshold: {realTimeStats.avgResponseTime.toFixed(2)}ms</div>
            )}
            {realTimeStats.currentMemory > alertThresholds.maxMemoryUsage && (
              <div>• Memory usage above threshold: {realTimeStats.currentMemory.toFixed(2)}MB</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}