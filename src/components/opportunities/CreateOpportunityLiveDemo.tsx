import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Play, 
  Settings, 
  Plus,
  Eye,
  Monitor,
  Clock,
  Activity
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ModernOpportunityEditForm } from './ModernOpportunityEditForm';

interface LiveDemoMetrics {
  totalClicks: number;
  successfulOpens: number;
  averageResponseTime: number;
  lastClickTime: number | null;
  dialogStates: Array<{ timestamp: number; state: 'opened' | 'closed' }>;
}

export function CreateOpportunityLiveDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<LiveDemoMetrics>({
    totalClicks: 0,
    successfulOpens: 0,
    averageResponseTime: 0,
    lastClickTime: null,
    dialogStates: []
  });

  const updateMetrics = (responseTime: number, successful: boolean) => {
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        successfulOpens: successful ? prev.successfulOpens + 1 : prev.successfulOpens,
        lastClickTime: Date.now(),
        dialogStates: [
          ...prev.dialogStates.slice(-10), // Keep last 10 states
          { timestamp: Date.now(), state: successful ? 'opened' as const : 'closed' as const }
        ]
      };

      // Calculate average response time
      const totalResponseTime = (prev.averageResponseTime * prev.totalClicks) + responseTime;
      newMetrics.averageResponseTime = totalResponseTime / newMetrics.totalClicks;

      return newMetrics;
    });
  };

  const handleCreateClick = () => {
    const startTime = performance.now();
    
    if (isMonitoring) {
      console.log('🔧 Create button clicked - monitoring active');
      toast.info('Create button clicked! Monitoring response...');
    }

    try {
      setIsDialogOpen(true);
      const responseTime = performance.now() - startTime;
      
      if (isMonitoring) {
        updateMetrics(responseTime, true);
        toast.success(`Dialog opened successfully in ${responseTime.toFixed(2)}ms`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      if (isMonitoring) {
        updateMetrics(responseTime, false);
        toast.error('Failed to open dialog');
      }
    }
  };

  const handleDialogClose = () => {
    if (isMonitoring) {
      console.log('🔧 Dialog closing - updating metrics');
      setMetrics(prev => ({
        ...prev,
        dialogStates: [
          ...prev.dialogStates.slice(-10),
          { timestamp: Date.now(), state: 'closed' }
        ]
      }));
    }
    setIsDialogOpen(false);
  };

  const handleSubmit = (data: any) => {
    console.log('🔧 Opportunity creation data:', data);
    toast.success('Opportunity created successfully!');
    handleDialogClose();
  };

  const resetMetrics = () => {
    setMetrics({
      totalClicks: 0,
      successfulOpens: 0,
      averageResponseTime: 0,
      lastClickTime: null,
      dialogStates: []
    });
    toast.info('Metrics reset');
  };

  const successRate = metrics.totalClicks > 0 ? 
    Math.round((metrics.successfulOpens / metrics.totalClicks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={20} />
            Create Opportunity Live Demo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Interactive demo with real-time monitoring and metrics collection
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Main Create Button */}
            <Button 
              onClick={handleCreateClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              size="lg"
            >
              <Plus size={18} className="mr-2" />
              Create Opportunity
            </Button>

            {/* Monitoring Toggle */}
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "outline"}
              size="default"
            >
              <Activity size={16} className="mr-2" />
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>

            {/* Dialog State Indicator */}
            <Badge variant={isDialogOpen ? "default" : "secondary"} className="px-3 py-1">
              Dialog: {isDialogOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Dashboard */}
      {isMonitoring && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Button activation count
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.successfulOpens}/{metrics.totalClicks} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.averageResponseTime.toFixed(1)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click to dialog open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.lastClickTime ? 
                  `${Math.round((Date.now() - metrics.lastClickTime) / 1000)}s` : 
                  'None'
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Time since last click
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monitoring Controls */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings size={18} />
                Monitoring Controls
              </CardTitle>
              <Button onClick={resetMetrics} variant="outline" size="sm">
                Reset Metrics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <div className="space-y-1">
                  {metrics.dialogStates.slice(-5).reverse().map((state, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {state.state === 'opened' ? 
                        <CheckCircle size={12} className="text-green-600" /> :
                        <Eye size={12} className="text-gray-600" />
                      }
                      <span>Dialog {state.state}</span>
                      <span className="text-muted-foreground">
                        {new Date(state.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {metrics.dialogStates.length === 0 && (
                    <p className="text-muted-foreground text-xs">No activity yet</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Performance Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Performance Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <Alert className={`p-2 ${metrics.averageResponseTime < 100 ? 'border-green-200 bg-green-50' : metrics.averageResponseTime < 500 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription>
                      <span className="font-medium">Response Time: </span>
                      <span className={metrics.averageResponseTime < 100 ? 'text-green-700' : metrics.averageResponseTime < 500 ? 'text-yellow-700' : 'text-red-700'}>
                        {metrics.averageResponseTime < 100 ? 'Excellent' : metrics.averageResponseTime < 500 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </AlertDescription>
                  </Alert>

                  <Alert className={`p-2 ${successRate >= 95 ? 'border-green-200 bg-green-50' : successRate >= 80 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription>
                      <span className="font-medium">Reliability: </span>
                      <span className={successRate >= 95 ? 'text-green-700' : successRate >= 80 ? 'text-yellow-700' : 'text-red-700'}>
                        {successRate >= 95 ? 'Excellent' : successRate >= 80 ? 'Good' : 'Poor'}
                      </span>
                    </AlertDescription>
                  </Alert>

                  <Alert className="p-2 border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <span className="font-medium">Status: </span>
                      <span className="text-blue-700">
                        {isDialogOpen ? 'Dialog Open' : 'Ready'}
                      </span>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play size={18} />
            Demo Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Basic Test:</strong> Click the "Create Opportunity" button to open the dialog</p>
            <p><strong>2. Monitoring:</strong> Enable monitoring to track performance metrics and success rates</p>
            <p><strong>3. Stress Test:</strong> Click multiple times rapidly to test responsiveness</p>
            <p><strong>4. Form Test:</strong> Complete the opportunity form to test end-to-end functionality</p>
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Monitor console for detailed logging when monitoring is active</p>
            <p>• Toast notifications provide real-time feedback</p>
            <p>• Metrics are automatically collected and displayed</p>
            <p>• All interactions are logged for debugging purposes</p>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Edit Form Dialog */}
      <ModernOpportunityEditForm
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}