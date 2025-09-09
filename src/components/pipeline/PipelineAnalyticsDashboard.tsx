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
    opportunities: bottleneck.affectedDeals
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
                <p className="text-sm text-muted-foreground">Active Opportunities</p>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="velocity">Stage Velocity</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise Metrics</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion" className="space-y-6">
          <div className="card-grid-balanced">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Stage Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">Pipeline funnel visualization</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={conversionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'opportunities') return [value, 'Opportunities'];
                        if (name === 'value') return [formatCurrency(value), 'Value'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="opportunities" fill="#3b82f6" name="opportunities" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Revenue breakdown by stage</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
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

          {/* Stage Metrics Table - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Stage Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive metrics for each pipeline stage
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-semibold">Stage</th>
                      <th className="text-right p-4 font-semibold">Active Opportunities</th>
                      <th className="text-right p-4 font-semibold">Total Value</th>
                      <th className="text-right p-4 font-semibold">Avg. Opportunity Size</th>
                      <th className="text-center p-4 font-semibold">Conversion Rate</th>
                      <th className="text-right p-4 font-semibold">Avg. Time</th>
                      <th className="text-center p-4 font-semibold">Velocity Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.stageMetrics.map((stage, index) => (
                      <tr key={stage.stageId} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-4 h-4 rounded-full`} 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium">{stage.stageName}</span>
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">{stage.totalOpportunities}</td>
                        <td className="text-right p-4 font-medium text-green-700">{formatCurrency(stage.totalValue)}</td>
                        <td className="text-right p-4">{formatCurrency(stage.averageDealSize)}</td>
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center gap-3">
                            <Progress value={stage.conversionRate} className="w-20 h-2" />
                            <span className="text-sm font-medium min-w-[3ch]">
                              {Math.round(stage.conversionRate)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1">
                            {Math.round(stage.averageTimeInStage)}
                            <span className="text-xs text-muted-foreground">days</span>
                          </span>
                        </td>
                        <td className="text-center p-4">
                          <div className="flex justify-center">
                            {stage.velocityTrend === 'up' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendUp size={16} />
                                <span className="text-xs">Faster</span>
                              </div>
                            )}
                            {stage.velocityTrend === 'down' && (
                              <div className="flex items-center gap-1 text-red-600">
                                <TrendDown size={16} />
                                <span className="text-xs">Slower</span>
                              </div>
                            )}
                            {stage.velocityTrend === 'stable' && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Activity size={16} />
                                <span className="text-xs">Stable</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stage Velocity Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Time spent in each stage compared to targets • Lower is better for faster opportunities
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={velocityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${value} days`, 
                      name === 'velocity' ? 'Current Average' : 'Target Time'
                    ]} 
                  />
                  <Bar dataKey="velocity" fill="#3b82f6" name="velocity" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#10b981" name="target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(velocityData.reduce((acc, curr) => acc + curr.velocity, 0) / velocityData.length)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Stage Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {velocityData.reduce((acc, curr) => acc + curr.target, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Target Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(((velocityData.reduce((acc, curr) => acc + curr.velocity, 0) / velocityData.reduce((acc, curr) => acc + curr.target, 0)) - 1) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">vs. Target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          {/* Enterprise B2B Sales Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">MEDDPICC Qualification</CardTitle>
                <p className="text-sm text-muted-foreground">Enterprise deal qualification scores</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Metrics Identified</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-16 h-2" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Economic Buyer Engaged</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-16 h-2" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Decision Criteria Known</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-16 h-2" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Decision Process Mapped</span>
                    <div className="flex items-center gap-2">
                      <Progress value={58} className="w-16 h-2" />
                      <span className="text-sm font-medium">58%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Paper Process Identified</span>
                    <div className="flex items-center gap-2">
                      <Progress value={42} className="w-16 h-2" />
                      <span className="text-sm font-medium">42%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Implicate the Pain</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-16 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Champion Developed</span>
                    <div className="flex items-center gap-2">
                      <Progress value={69} className="w-16 h-2" />
                      <span className="text-sm font-medium">69%</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 mt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Overall MEDDPICC Score</span>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-blue-600">67%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Enterprise Deal Complexity</CardTitle>
                <p className="text-sm text-muted-foreground">Multi-stakeholder engagement analysis</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">8.2</div>
                    <p className="text-xs text-muted-foreground">Avg. Stakeholders per Deal</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">4.1</div>
                    <p className="text-xs text-muted-foreground">Avg. Decision Makers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">12</div>
                    <p className="text-xs text-muted-foreground">Avg. Touchpoints</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">67%</div>
                    <p className="text-xs text-muted-foreground">Multi-dept Deals</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IT Decision Makers</span>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Financial Stakeholders</span>
                    <span className="text-sm font-medium">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Executive Sponsors</span>
                    <span className="text-sm font-medium">52%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">End User Champions</span>
                    <span className="text-sm font-medium">81%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Enterprise Risk Factors</CardTitle>
                <p className="text-sm text-muted-foreground">Key risk indicators for large deals</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Budget Authority Missing</p>
                      <p className="text-xs text-muted-foreground">23% of opportunities lack confirmed budget holder</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Long Decision Timeline</p>
                      <p className="text-xs text-muted-foreground">156 day avg cycle vs 90 day target</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Medium</Badge>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Competitive Pressure</p>
                      <p className="text-xs text-muted-foreground">78% face 2+ competitors in evaluation</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Medium</Badge>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Technical Complexity</p>
                      <p className="text-xs text-muted-foreground">Custom integrations required for 45%</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Low</Badge>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Risk Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={68} className="w-16 h-2" />
                      <span className="text-sm font-medium text-orange-600">Medium</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Stage Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Enterprise B2B Sales Stage Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed performance metrics for complex enterprise sales cycles
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Stage Performance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Prospecting & Qualification */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <h4 className="font-semibold text-lg mb-4 text-blue-900">Prospecting & Qualification</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Opportunities</span>
                        <span className="font-medium text-blue-700">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Value</span>
                        <span className="font-medium text-blue-700">${formatCurrency(12850000).replace('$', '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Time in Stage</span>
                        <span className="font-medium text-blue-700">18 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Qualification Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={72} className="w-12 h-2" />
                          <span className="text-sm font-medium text-blue-700">72%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Stage Rate</span>
                        <span className="font-medium text-green-600">68%</span>
                      </div>
                    </div>
                  </div>

                  {/* Needs Analysis & Demo */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-green-50 to-green-100/50">
                    <h4 className="font-semibold text-lg mb-4 text-green-900">Needs Analysis & Demo</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Opportunities</span>
                        <span className="font-medium text-green-700">31</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Value</span>
                        <span className="font-medium text-green-700">${formatCurrency(18420000).replace('$', '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Time in Stage</span>
                        <span className="font-medium text-green-700">32 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Demo Completion</span>
                        <div className="flex items-center gap-2">
                          <Progress value={89} className="w-12 h-2" />
                          <span className="text-sm font-medium text-green-700">89%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Technical Win Rate</span>
                        <span className="font-medium text-green-600">84%</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal & Negotiation */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-orange-50 to-orange-100/50">
                    <h4 className="font-semibold text-lg mb-4 text-orange-900">Proposal & Negotiation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Opportunities</span>
                        <span className="font-medium text-orange-700">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Value</span>
                        <span className="font-medium text-orange-700">${formatCurrency(22750000).replace('$', '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Time in Stage</span>
                        <span className="font-medium text-orange-700">45 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Proposal Response</span>
                        <div className="flex items-center gap-2">
                          <Progress value={76} className="w-12 h-2" />
                          <span className="text-sm font-medium text-orange-700">76%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Close Probability</span>
                        <span className="font-medium text-green-600">71%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise KPIs Summary Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 px-6 py-3 border-b">
                    <h4 className="font-semibold">Enterprise Sales Performance KPIs</h4>
                  </div>
                  <div className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/20">
                          <th className="text-left p-4 font-medium">Metric</th>
                          <th className="text-center p-4 font-medium">Current</th>
                          <th className="text-center p-4 font-medium">Target</th>
                          <th className="text-center p-4 font-medium">Performance</th>
                          <th className="text-center p-4 font-medium">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-4 font-medium">Average Deal Size</td>
                          <td className="text-center p-4">{formatCurrency(485000)}</td>
                          <td className="text-center p-4">{formatCurrency(400000)}</td>
                          <td className="text-center p-4">
                            <Badge variant="default" className="bg-green-100 text-green-800">+21%</Badge>
                          </td>
                          <td className="text-center p-4">
                            <TrendUp size={16} className="text-green-600 mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-4 font-medium">Enterprise Win Rate</td>
                          <td className="text-center p-4">31%</td>
                          <td className="text-center p-4">35%</td>
                          <td className="text-center p-4">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">-11%</Badge>
                          </td>
                          <td className="text-center p-4">
                            <TrendDown size={16} className="text-orange-600 mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-4 font-medium">Sales Cycle Length</td>
                          <td className="text-center p-4">156 days</td>
                          <td className="text-center p-4">120 days</td>
                          <td className="text-center p-4">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">+30%</Badge>
                          </td>
                          <td className="text-center p-4">
                            <TrendUp size={16} className="text-red-600 mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-4 font-medium">Pipeline Velocity</td>
                          <td className="text-center p-4">{formatCurrency(3100)}/day</td>
                          <td className="text-center p-4">{formatCurrency(4200)}/day</td>
                          <td className="text-center p-4">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">-26%</Badge>
                          </td>
                          <td className="text-center p-4">
                            <Activity size={16} className="text-orange-600 mx-auto" />
                          </td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="p-4 font-medium">MEDDPICC Compliance</td>
                          <td className="text-center p-4">67%</td>
                          <td className="text-center p-4">80%</td>
                          <td className="text-center p-4">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">-16%</Badge>
                          </td>
                          <td className="text-center p-4">
                            <TrendUp size={16} className="text-green-600 mx-auto" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-6">
          <div className="card-grid-balanced">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Bottleneck Impact Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Impact severity by pipeline stage
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={bottleneckData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`Impact: ${value}`, 'Severity Score']} />
                    <Bar dataKey="impact" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Critical Issues</CardTitle>
                <p className="text-sm text-muted-foreground">
                  High-priority bottlenecks requiring attention
                </p>
              </CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {analytics.bottleneckAnalysis
                  .filter(b => b.severity === 'critical' || b.severity === 'high')
                  .map((bottleneck, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium truncate">{bottleneck.stageName}</h4>
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            {bottleneck.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">{bottleneck.affectedDeals}</span> opportunities affected • 
                          Impact: <span className="font-medium">{Math.round(bottleneck.impact)}</span>
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
                  <div className="flex items-center gap-3 p-6 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                    <div className="text-center w-full">
                      <h4 className="font-medium text-green-800 mb-1">No Critical Bottlenecks</h4>
                      <p className="text-sm text-green-600">Your pipeline is flowing smoothly!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations - Full Width Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered suggestions to optimize your pipeline performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {analytics.recommendedActions.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-4 p-5 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      recommendation.priority === 'critical' ? 'bg-red-100' :
                      recommendation.priority === 'high' ? 'bg-orange-100' :
                      recommendation.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <Target size={18} className={
                        recommendation.priority === 'critical' ? 'text-red-600' :
                        recommendation.priority === 'high' ? 'text-orange-600' :
                        recommendation.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-base leading-tight">{recommendation.title}</h4>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            +{recommendation.estimatedImpact}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {recommendation.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.implementation.slice(0, 3).map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {recommendation.implementation.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recommendation.implementation.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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