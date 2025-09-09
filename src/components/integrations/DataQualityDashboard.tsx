import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  HardDrives,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface IntegrationMetric {
  timestamp: Date;
  recordsProcessed: number;
  successRate: number;
  latency: number;
  errors: number;
}

interface DataHealthMetric {
  source: string;
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  uniqueness: number;
}

export const DataQualityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useKV<IntegrationMetric[]>('integration-metrics', []);
  const [healthMetrics, setHealthMetrics] = useKV<DataHealthMetric[]>('data-health-metrics', [
    {
      source: 'Salesforce CRM',
      completeness: 96.5,
      accuracy: 94.2,
      timeliness: 98.8,
      consistency: 92.1,
      uniqueness: 97.3
    },
    {
      source: 'HubSpot CRM',
      completeness: 94.8,
      accuracy: 96.1,
      timeliness: 95.5,
      consistency: 93.7,
      uniqueness: 98.2
    },
    {
      source: 'QuickBooks',
      completeness: 99.2,
      accuracy: 98.7,
      timeliness: 97.3,
      consistency: 96.8,
      uniqueness: 99.1
    }
  ]);
  const [timeRange, setTimeRange] = useState('24h');

  // Generate mock metrics data
  useEffect(() => {
    const generateMetrics = () => {
      const now = new Date();
      const newMetrics = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
        recordsProcessed: Math.floor(Math.random() * 1000) + 500,
        successRate: 95 + Math.random() * 5,
        latency: Math.floor(Math.random() * 200) + 50,
        errors: Math.floor(Math.random() * 10)
      }));
      setMetrics(newMetrics);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [setMetrics, timeRange]);

  const latestMetric = metrics[metrics.length - 1];
  const avgSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  const totalRecords = metrics.reduce((sum, m) => sum + m.recordsProcessed, 0);
  const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;

  const getHealthScore = (metric: DataHealthMetric) => {
    return (metric.completeness + metric.accuracy + metric.timeliness + metric.consistency + metric.uniqueness) / 5;
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chartData = metrics.map(metric => ({
    time: metric.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    records: metric.recordsProcessed,
    successRate: metric.successRate,
    latency: metric.latency,
    errors: metric.errors
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Quality Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor integration performance and data quality metrics in real-time
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% vs yesterday
                </p>
              </div>
              <HardDrives className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +0.3% vs yesterday
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  +5ms vs yesterday
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Streams</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All systems operational
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Records Processed Over Time</CardTitle>
            <CardDescription>Hourly processing volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="records" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate & Latency</CardTitle>
            <CardDescription>Performance metrics correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Success Rate (%)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Latency (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Data Health by Source</CardTitle>
          <CardDescription>
            Comprehensive data quality assessment across all integrated systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {healthMetrics.map(metric => {
              const healthScore = getHealthScore(metric);
              return (
                <div key={metric.source} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{metric.source}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getHealthColor(healthScore)}`}>
                        {healthScore.toFixed(1)}%
                      </span>
                      <Badge 
                        variant="outline" 
                        className={healthScore >= 95 ? 'border-green-200 text-green-700' : 
                                  healthScore >= 90 ? 'border-yellow-200 text-yellow-700' : 
                                  'border-red-200 text-red-700'}
                      >
                        {healthScore >= 95 ? 'Excellent' : healthScore >= 90 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completeness</span>
                        <span>{metric.completeness.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.completeness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{metric.accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.accuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Timeliness</span>
                        <span>{metric.timeliness.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.timeliness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Consistency</span>
                        <span>{metric.consistency.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.consistency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uniqueness</span>
                        <span>{metric.uniqueness.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.uniqueness} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Error Distribution</CardTitle>
          <CardDescription>Analysis of integration errors over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <Button>
          Generate Report
        </Button>
      </div>
    </div>
  );
};