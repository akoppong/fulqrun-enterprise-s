import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { 
  Opportunity, 
  DealMovement, 
  PipelineConfiguration, 
  PipelineAnalytics,
  StageMetrics,
  BottleneckAnalysis
} from '@/lib/types';
import { 
  createDefaultPipelineConfiguration, 
  generatePipelineAnalytics 
} from '@/lib/pipeline-utils';
import { formatCurrency } from '@/lib/crm-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendUp, 
  TrendDown, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  Users,
  Calendar
} from '@phosphor-icons/react';

export function PipelineAnalyticsDashboard() {
  const [opportunities] = useKV<Opportunity[]>('opportunities', []);
  const [dealMovements] = useKV<DealMovement[]>('deal-movements', []);
  const [pipelineConfig] = useKV<PipelineConfiguration>('active-pipeline', createDefaultPipelineConfiguration());
  const [analytics, setAnalytics] = useState<PipelineAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    const analyticsData = generatePipelineAnalytics(
      opportunities,
      dealMovements,
      pipelineConfig,
      selectedPeriod
    );
    setAnalytics(analyticsData);
  }, [opportunities, dealMovements, pipelineConfig, selectedPeriod]);

  if (!analytics) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const conversionData = analytics.stageMetrics.map((stage, index) => ({
    name: stage.stageName,
    opportunities: stage.totalOpportunities,
    value: stage.totalValue,
    conversionRate: stage.conversionRate,
    avgTime: stage.averageTimeInStage
  }));

  const velocityData = analytics.stageMetrics.map(stage => ({
    name: stage.stageName,
    velocity: stage.averageTimeInStage,
    target: 14 // Target days per stage
  }));

  const bottleneckData = analytics.bottleneckAnalysis.map(bottleneck => ({
    stage: bottleneck.stageName,
    impact: bottleneck.impact,
    severity: bottleneck.severity,
    deals: bottleneck.affectedDeals
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pipeline Analytics</h2>
          <p className="text-muted-foreground">Deep insights into your sales pipeline performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="last-30">Last 30 Days</SelectItem>
              <SelectItem value="last-90">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-3xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendUp size={16} className="text-green-600" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-3xl font-bold">{analytics.totalOpportunities}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendUp size={16} className="text-green-600" />
                  <span className="text-sm text-green-600">+5%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Sales Cycle</p>
                <p className="text-3xl font-bold">{Math.round(analytics.averageSalesCycle)}d</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendDown size={16} className="text-green-600" />
                  <span className="text-sm text-green-600">-3d</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{Math.round(analytics.overallConversionRate)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendUp size={16} className="text-green-600" />
                  <span className="text-sm text-green-600">+2%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="velocity">Stage Velocity</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={conversionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'opportunities') return [value, 'Deals'];
                        if (name === 'value') return [formatCurrency(value), 'Value'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="opportunities" fill="#3b82f6" name="opportunities" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Stage Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Stage</th>
                      <th className="text-right p-3">Deals</th>
                      <th className="text-right p-3">Value</th>
                      <th className="text-right p-3">Avg. Deal Size</th>
                      <th className="text-right p-3">Conversion Rate</th>
                      <th className="text-right p-3">Avg. Time</th>
                      <th className="text-center p-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.stageMetrics.map((stage, index) => (
                      <tr key={stage.stageId} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                            {stage.stageName}
                          </div>
                        </td>
                        <td className="text-right p-3 font-medium">{stage.totalOpportunities}</td>
                        <td className="text-right p-3 font-medium">{formatCurrency(stage.totalValue)}</td>
                        <td className="text-right p-3">{formatCurrency(stage.averageDealSize)}</td>
                        <td className="text-right p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={stage.conversionRate} className="w-16 h-2" />
                            {Math.round(stage.conversionRate)}%
                          </div>
                        </td>
                        <td className="text-right p-3">{Math.round(stage.averageTimeInStage)}d</td>
                        <td className="text-center p-3">
                          {stage.velocityTrend === 'up' && <TrendUp size={16} className="text-green-600" />}
                          {stage.velocityTrend === 'down' && <TrendDown size={16} className="text-red-600" />}
                          {stage.velocityTrend === 'stable' && <Activity size={16} className="text-gray-600" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stage Velocity Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Time spent in each stage compared to targets
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [`${value} days`, name === 'velocity' ? 'Actual' : 'Target']} />
                  <Bar dataKey="velocity" fill="#3b82f6" name="velocity" />
                  <Bar dataKey="target" fill="#10b981" name="target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bottleneck Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bottleneckData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impact" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.bottleneckAnalysis
                  .filter(b => b.severity === 'critical' || b.severity === 'high')
                  .map((bottleneck, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{bottleneck.stageName}</h4>
                          <Badge variant="destructive" className="text-xs">
                            {bottleneck.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {bottleneck.affectedDeals} deals affected • 
                          Impact score: {Math.round(bottleneck.impact)}
                        </p>
                        <div className="space-y-1">
                          {bottleneck.causes.slice(0, 2).map((cause, idx) => (
                            <p key={idx} className="text-xs text-red-700">• {cause}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {analytics.bottleneckAnalysis.filter(b => b.severity === 'critical' || b.severity === 'high').length === 0 && (
                  <div className="flex items-center gap-3 p-6 bg-green-50 rounded-lg text-center">
                    <CheckCircle size={24} className="text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">No Critical Bottlenecks</h4>
                      <p className="text-sm text-green-600">Your pipeline is flowing smoothly!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.recommendedActions.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    recommendation.priority === 'critical' ? 'bg-red-100' :
                    recommendation.priority === 'high' ? 'bg-orange-100' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <Target size={16} className={
                      recommendation.priority === 'critical' ? 'text-red-600' :
                      recommendation.priority === 'high' ? 'text-orange-600' :
                      recommendation.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Impact: {recommendation.estimatedImpact}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {recommendation.implementation.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4" />
                  <p>Historical trend analysis</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4" />
                  <p>AI-powered revenue forecasting</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}