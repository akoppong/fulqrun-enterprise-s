/**
 * Enterprise Analytics Dashboard
 * 
 * Comprehensive analytics dashboard with real-time insights,
 * predictive analytics, and performance tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';
import { 
  performanceTracker, 
  type PerformanceMetrics, 
  type TeamPerformance 
} from '@/lib/analytics/performance-tracker';
import { 
  predictiveAnalytics,
  type DealPrediction,
  type ForecastPrediction
} from '@/lib/analytics/predictive-analytics';
import { dataIntegration, type DataHealthReport } from '@/lib/data-integration';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

interface AnalyticsData {
  realTimeDashboard: any;
  userPerformance: PerformanceMetrics;
  teamPerformance: TeamPerformance[];
  predictions: DealPrediction[];
  forecast: ForecastPrediction;
  dataHealth: DataHealthReport;
}

export function EnterpriseAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading enterprise analytics data...');

      const [
        realTimeDashboard,
        userPerformance,
        teamPerformance,
        forecast,
        dataHealth
      ] = await Promise.all([
        performanceTracker.getRealTimeDashboard(),
        performanceTracker.getUserPerformance('current-user'), // Would get current user ID
        performanceTracker.getTeamPerformance(),
        predictiveAnalytics.generateForecast('month'),
        dataIntegration.getDataHealthReport()
      ]);

      // Get deal predictions for high-value opportunities
      const highValueOpportunities = realTimeDashboard.topOpportunities.slice(0, 5);
      const predictions = await Promise.all(
        highValueOpportunities.map((opp: any) => 
          predictiveAnalytics.predictDealOutcome(opp.id)
        )
      );

      setData({
        realTimeDashboard,
        userPerformance,
        teamPerformance,
        predictions,
        forecast,
        dataHealth
      });

      setLastUpdated(new Date());
      console.log('✅ Analytics data loaded successfully');

    } catch (err) {
      console.error('❌ Failed to load analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    loadAnalyticsData();

    if (autoRefresh) {
      const interval = setInterval(loadAnalyticsData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = dataIntegration.onDataSync((result) => {
      if (result.success) {
        console.log('📊 Data sync completed, refreshing analytics...');
        loadAnalyticsData();
      }
    });

    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleForceSync = async () => {
    try {
      setLoading(true);
      await dataIntegration.syncAllData();
      await loadAnalyticsData();
    } catch (err) {
      setError('Failed to sync data');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading enterprise analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analytics Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={handleRefresh} className="ml-4" size="sm">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Analytics</h1>
          <p className="text-muted-foreground">
            Real-time insights, predictive analytics, and performance tracking
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceSync}
            disabled={loading}
          >
            <Database className="w-4 h-4 mr-2" />
            Force Sync
          </Button>
        </div>
      </div>

      {/* Data Health Status */}
      <DataHealthCard health={data.dataHealth} onForceSync={handleForceSync} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="team">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RealTimeDashboard data={data.realTimeDashboard} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceDashboard metrics={data.userPerformance} />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <PredictiveInsights predictions={data.predictions} />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <ForecastDashboard forecast={data.forecast} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamAnalytics teamPerformance={data.teamPerformance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Data Health Status Card
function DataHealthCard({ 
  health, 
  onForceSync 
}: { 
  health: DataHealthReport; 
  onForceSync: () => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Data Health Status
          {getStatusIcon(health.overall)}
        </CardTitle>
        <CardDescription>
          Database integrity and synchronization status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Overall Status</div>
            <Badge variant={health.overall === 'healthy' ? 'default' : 'destructive'}>
              {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Last Sync</div>
            <div className="text-sm text-muted-foreground">{health.lastSync}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Last Backup</div>
            <div className="text-sm text-muted-foreground">{health.lastBackup}</div>
          </div>
        </div>

        {/* Table Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {Object.entries(health.tables).map(([tableName, tableInfo]) => (
            <div key={tableName} className="p-2 border rounded">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium truncate">{tableName}</div>
                {getStatusIcon(tableInfo.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(tableInfo.recordCount)} records
              </div>
              <div className={`h-1 rounded mt-1 ${getStatusColor(tableInfo.status)}`} />
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {health.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recommendations</div>
            {health.recommendations.map((rec, index) => (
              <Alert key={index} className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{rec}</AlertDescription>
              </Alert>
            ))}
            <Button onClick={onForceSync} size="sm" className="mt-2">
              <Database className="w-4 h-4 mr-2" />
              Force Data Sync
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Real-time Dashboard
function RealTimeDashboard({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Progress value={data.achievement} className="w-full mr-2" />
            {formatPercentage(data.achievement)}% of target
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.pipelineValue)}</div>
          <p className="text-xs text-muted-foreground">
            Active opportunities
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deals Closed Today</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.dealsClosedToday}</div>
          <p className="text-xs text-muted-foreground">
            New wins today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activitiesCompletedToday}</div>
          <p className="text-xs text-muted-foreground">
            Today's engagement
          </p>
        </CardContent>
      </Card>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert: any, index: number) => (
                <Alert key={index} className={
                  alert.severity === 'error' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Performance Dashboard
function PerformanceDashboard({ metrics }: { metrics: PerformanceMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatCurrency(metrics.monthlyRevenue)}</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
            <div className="flex items-center gap-2">
              {metrics.revenueGrowth >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-500" /> :
                <TrendingDown className="w-4 h-4 text-red-500" />
              }
              <span className={metrics.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(Math.abs(metrics.revenueGrowth))} growth
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold">{formatCurrency(metrics.pipelineValue)}</div>
              <div className="text-sm text-muted-foreground">Pipeline Value</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatCurrency(metrics.averageDealSize)}</div>
              <div className="text-sm text-muted-foreground">Average Deal Size</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatPercentage(metrics.winRate)}</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Methodology Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">MEDDPICC Score</span>
                <span className="text-sm font-medium">{metrics.averageMEDDPICCScore.toFixed(1)}/80</span>
              </div>
              <Progress value={(metrics.averageMEDDPICCScore / 80) * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">PEAK Score</span>
                <span className="text-sm font-medium">{metrics.averagePEAKScore.toFixed(1)}/100</span>
              </div>
              <Progress value={metrics.averagePEAKScore} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Predictive Insights
function PredictiveInsights({ predictions }: { predictions: DealPrediction[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {predictions.map((prediction) => (
          <Card key={prediction.opportunityId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Deal Prediction</span>
                <Badge variant={
                  prediction.winProbability > 70 ? 'default' :
                  prediction.winProbability > 40 ? 'secondary' : 'destructive'
                }>
                  {formatPercentage(prediction.winProbability)} Win Probability
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Key Factors</h4>
                  <div className="space-y-2">
                    {prediction.factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span>{factor.factor}</span>
                          <span className="font-medium">{formatPercentage(factor.impact * 100)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{factor.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <div className="space-y-1">
                    {prediction.riskFactors.map((risk, index) => (
                      <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Next Best Actions</h4>
                  <div className="space-y-1">
                    {prediction.nextBestActions.map((action, index) => (
                      <div key={index} className="text-sm text-blue-600 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Forecast Dashboard
function ForecastDashboard({ forecast }: { forecast: ForecastPrediction }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast - {forecast.period}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(forecast.predictedRevenue)}</div>
              <div className="text-sm text-muted-foreground">Predicted Revenue</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence Range</span>
                <span>{formatCurrency(forecast.confidenceInterval.low)} - {formatCurrency(forecast.confidenceInterval.high)}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Optimistic</span>
              <span className="font-medium">{formatCurrency(forecast.scenarios.optimistic)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Realistic</span>
              <span className="font-medium">{formatCurrency(forecast.scenarios.realistic)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Pessimistic</span>
              <span className="font-medium">{formatCurrency(forecast.scenarios.pessimistic)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Key Forecast Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecast.keyDrivers.map((driver, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                {driver}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Team Analytics
function TeamAnalytics({ teamPerformance }: { teamPerformance: TeamPerformance[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.slice(0, 10).map((member) => (
              <div key={member.user.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{member.ranking}</Badge>
                  <div>
                    <div className="font-medium">{member.user.name}</div>
                    <div className="text-sm text-muted-foreground">{member.user.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(member.metrics.totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage(member.targetAchievement)}% to target
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}