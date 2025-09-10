import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ExecutiveDashboardMetrics } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Globe,
  AlertTriangle,
  Trophy,
  Clock,
  Award,
  Crown,
  MapPin,
  PieChart,
  BarChart,
  Activity,
  Briefcase,
  Calculator,
  ChartLine,
  Eye,
  Lightning,
  Handshake
} from '@phosphor-icons/react';

interface ExecutiveDashboardProps {
  user: User;
}

export function ExecutiveDashboard({ user }: ExecutiveDashboardProps) {
  const [executiveMetrics, setExecutiveMetrics] = useKV<ExecutiveDashboardMetrics>(`executive-metrics-${user.id}`, {
    period: 'yearly',
    global: {
      revenue: { actual: 65750000, target: 75000000, forecast: 72500000, growth: 18.5 },
      deals: { closed: 5247, pipeline: 8456, forecast: 6850 },
      performance: { attainment: 87.7, velocity: 52, conversion: 22.1 }
    },
    regions: [
      { id: 'na', name: 'North America', revenue: 32500000, target: 37500000, growth: 22.1 },
      { id: 'eu', name: 'Europe', revenue: 18750000, target: 22500000, growth: 15.8 },
      { id: 'apac', name: 'Asia-Pacific', revenue: 14500000, target: 15000000, growth: 28.3 }
    ],
    segments: [
      { id: 'enterprise', name: 'Enterprise', contribution: 52.3, growth: 25.2, opportunities: 456 },
      { id: 'midmarket', name: 'Mid-Market', contribution: 31.5, growth: 18.1, opportunities: 1234 },
      { id: 'smb', name: 'SMB', contribution: 16.2, growth: 12.8, opportunities: 2987 }
    ],
    trends: [
      { period: 'Q1', revenue: 14500000, deals: 1205, velocity: 55 },
      { period: 'Q2', revenue: 16200000, deals: 1287, velocity: 51 },
      { period: 'Q3', revenue: 17850000, deals: 1356, velocity: 49 },
      { period: 'Q4', revenue: 17200000, deals: 1399, velocity: 52 }
    ],
    risks: [
      { 
        type: 'market', 
        severity: 'high', 
        description: 'Economic headwinds affecting enterprise spending',
        impact: 92,
        mitigation: ['Diversify portfolio', 'Focus on ROI messaging', 'Extend payment terms']
      },
      { 
        type: 'competitive', 
        severity: 'critical', 
        description: 'New market entrant with disruptive pricing',
        impact: 87,
        mitigation: ['Accelerate innovation', 'Strengthen partnerships', 'Value-based selling']
      },
      { 
        type: 'pipeline', 
        severity: 'medium', 
        description: 'Pipeline velocity slower in APAC region',
        impact: 72,
        mitigation: ['Local hiring', 'Partner channel development', 'Process optimization']
      }
    ]
  });

  const [keyMetrics, setKeyMetrics] = useKV('executive-key-metrics', [
    { metric: 'Market Share', current: 23.5, target: 25.0, unit: '%', trend: 'up', change: 2.1 },
    { metric: 'Customer Acquisition Cost', current: 15750, target: 14000, unit: '$', trend: 'down', change: -8.5 },
    { metric: 'Customer Lifetime Value', current: 285000, target: 300000, unit: '$', trend: 'up', change: 12.3 },
    { metric: 'Net Revenue Retention', current: 118, target: 120, unit: '%', trend: 'up', change: 5.2 },
    { metric: 'Sales Efficiency', current: 4.2, target: 4.5, unit: 'x', trend: 'stable', change: 1.8 },
    { metric: 'Win Rate', current: 28.5, target: 30.0, unit: '%', trend: 'up', change: 3.7 }
  ]);

  const [boardMetrics, setBoardMetrics] = useKV('board-metrics', {
    annualRecurring: 45200000,
    grossMargin: 82.5,
    burnRate: 2850000,
    cashRunway: 18,
    employeeCount: 1247,
    customerCount: 8936,
    churnRate: 3.2,
    expansionRate: 125
  });

  const [strategicInitiatives, setStrategicInitiatives] = useKV('strategic-initiatives', [
    { name: 'Global Expansion', status: 'on-track', completion: 75, impact: 'high', owner: 'VP Global Sales' },
    { name: 'AI Integration', status: 'ahead', completion: 85, impact: 'high', owner: 'CTO' },
    { name: 'Partner Ecosystem', status: 'at-risk', completion: 45, impact: 'medium', owner: 'VP Partnerships' },
    { name: 'Digital Transformation', status: 'on-track', completion: 68, impact: 'high', owner: 'COO' }
  ]);

  const getPerformanceColor = (current: number, target: number, isHigherBetter: boolean = true) => {
    const ratio = current / target;
    if (isHigherBetter) {
      if (ratio >= 1.05) return 'text-green-600';
      if (ratio >= 0.95) return 'text-yellow-600';
      if (ratio >= 0.85) return 'text-orange-600';
      return 'text-red-600';
    } else {
      if (ratio <= 0.95) return 'text-green-600';
      if (ratio <= 1.05) return 'text-yellow-600';
      if (ratio <= 1.15) return 'text-orange-600';
      return 'text-red-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'behind': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executive Command Center</h1>
          <p className="text-muted-foreground">Strategic overview and business performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Eye className="w-4 h-4 mr-1" />
            Board Ready
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Crown className="w-4 h-4 mr-1" />
            C-Level Executive
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Executive Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial Health</TabsTrigger>
          <TabsTrigger value="market">Market Position</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Initiatives</TabsTrigger>
          <TabsTrigger value="board">Board Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(executiveMetrics.global.revenue.actual / 1000000).toFixed(1)}M</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{executiveMetrics.global.revenue.growth.toFixed(1)}% YoY
                  </span>
                </div>
                <Progress value={(executiveMetrics.global.revenue.actual / executiveMetrics.global.revenue.target) * 100} className="mt-2 h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  Target: ${(executiveMetrics.global.revenue.target / 1000000).toFixed(1)}M • Forecast: ${(executiveMetrics.global.revenue.forecast / 1000000).toFixed(1)}M
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Global Pipeline</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(executiveMetrics.global.deals.pipeline / 1000).toFixed(1)}K</div>
                <div className="text-xs text-muted-foreground">opportunities</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{executiveMetrics.global.performance.velocity} day velocity</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Forecast: {(executiveMetrics.global.deals.forecast / 1000).toFixed(1)}K deals
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Share</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keyMetrics[0]?.current.toFixed(1)}%</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    +{keyMetrics[0]?.change.toFixed(1)}% growth
                  </span>
                </div>
                <Progress value={(keyMetrics[0]?.current / keyMetrics[0]?.target) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{executiveMetrics.global.performance.conversion.toFixed(1)}%</div>
                <div className="text-xs text-green-600">
                  +{keyMetrics[5]?.change.toFixed(1)}% improvement
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {executiveMetrics.global.deals.closed.toLocaleString()} deals closed
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Global Regional Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {executiveMetrics.regions.map((region) => (
                  <div key={region.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{region.name}</h4>
                      <Badge variant="outline" className="text-green-700 bg-green-100">
                        +{region.growth.toFixed(1)}%
                      </Badge>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">${(region.revenue / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">
                        Target: ${(region.target / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <Progress value={(region.revenue / region.target) * 100} className="h-2" />
                    <div className="text-xs text-center">
                      {((region.revenue / region.target) * 100).toFixed(1)}% of target
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Risks */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Business Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executiveMetrics.risks.filter(r => r.severity === 'critical' || r.severity === 'high').map((risk, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className={risk.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                            {risk.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium capitalize">{risk.type} Risk</span>
                        </div>
                        <p className="text-sm text-gray-700">{risk.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-red-700">{risk.impact}</div>
                        <div className="text-xs text-red-600">Impact Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Financial Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARR</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(boardMetrics.annualRecurring / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-green-600">+22.5% YoY growth</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boardMetrics.grossMargin.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Industry leading</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boardMetrics.cashRunway}</div>
                <div className="text-xs text-muted-foreground">months remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Key Financial Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartLine className="w-5 h-5 mr-2" />
                Key Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{metric.metric}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {metric.unit === '$' ? '$' : ''}{metric.current.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                        </div>
                      </div>
                      <Badge variant="outline" className={metric.change >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {/* Market Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Market Segment Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executiveMetrics.segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {segment.opportunities.toLocaleString()} opportunities
                      </p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">{segment.contribution.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">market contribution</p>
                      </div>
                      <Badge variant="outline" className="text-green-700 bg-green-100">
                        +{segment.growth.toFixed(1)}% growth
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold">{boardMetrics.customerCount.toLocaleString()}</div>
                <div className="text-xs text-green-600">+15.8% growth</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold">{boardMetrics.churnRate}%</div>
                <div className="text-xs text-green-600">-0.8% improvement</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-sm font-medium">Expansion Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold">{boardMetrics.expansionRate}%</div>
                <div className="text-xs text-green-600">+5.2% growth</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold">{boardMetrics.employeeCount.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Global workforce</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          {/* Strategic Initiatives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Strategic Initiative Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategicInitiatives.map((initiative, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{initiative.name}</h4>
                        <p className="text-sm text-muted-foreground">Owner: {initiative.owner}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getStatusColor(initiative.status)}>
                          {initiative.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={initiative.impact === 'high' ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100'}>
                          {initiative.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{initiative.completion}%</span>
                      </div>
                      <Progress value={initiative.completion} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board" className="space-y-6">
          {/* Board-Ready Summary */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Board Summary - Q4 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Financial Performance</h4>
                  <div className="text-3xl font-bold text-green-600">${(executiveMetrics.global.revenue.actual / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-muted-foreground">
                    {((executiveMetrics.global.revenue.actual / executiveMetrics.global.revenue.target) * 100).toFixed(1)}% of ${(executiveMetrics.global.revenue.target / 1000000).toFixed(1)}M target
                  </div>
                  <div className="text-sm text-green-600">
                    +{executiveMetrics.global.revenue.growth.toFixed(1)}% YoY Growth
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Market Position</h4>
                  <div className="text-3xl font-bold text-blue-600">{keyMetrics[0]?.current.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Market Share</div>
                  <div className="text-sm text-blue-600">
                    +{keyMetrics[0]?.change.toFixed(1)}% expansion
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Operational Excellence</h4>
                  <div className="text-3xl font-bold text-purple-600">{executiveMetrics.global.performance.attainment.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Global Attainment</div>
                  <div className="text-sm text-purple-600">
                    {boardMetrics.churnRate}% churn rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Trends for Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartLine className="w-5 h-5 mr-2" />
                Quarterly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {executiveMetrics.trends.map((trend) => (
                  <div key={trend.period} className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{trend.period} 2024</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xl font-bold">${(trend.revenue / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{trend.deals.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Deals</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{trend.velocity}d</div>
                        <div className="text-xs text-muted-foreground">Velocity</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Executive Actions Required */}
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700">
                <Lightning className="w-5 h-5 mr-2" />
                Executive Actions Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Q1 2025 Strategic Planning</h4>
                      <p className="text-sm text-muted-foreground">
                        Board presentation and budget approval required for APAC expansion
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      HIGH PRIORITY
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Competitive Response Strategy</h4>
                      <p className="text-sm text-muted-foreground">
                        Market disruption requiring strategic positioning adjustment
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      STRATEGIC
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Partnership Opportunities</h4>
                      <p className="text-sm text-muted-foreground">
                        Three strategic partnership proposals requiring executive review
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      OPPORTUNITY
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}