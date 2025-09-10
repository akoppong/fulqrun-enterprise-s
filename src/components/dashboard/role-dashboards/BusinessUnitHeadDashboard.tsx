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
  Activity
} from '@phosphor-icons/react';

interface BusinessUnitHeadDashboardProps {
  user: User;
}

export function BusinessUnitHeadDashboard({ user }: BusinessUnitHeadDashboardProps) {
  const [globalMetrics, setGlobalMetrics] = useKV<ExecutiveDashboardMetrics>(`global-metrics-${user.id}`, {
    period: 'quarterly',
    global: {
      revenue: { actual: 15750000, target: 18000000, forecast: 17200000, growth: 12.5 },
      deals: { closed: 1247, pipeline: 2156, forecast: 1850 },
      performance: { attainment: 87.5, velocity: 58, conversion: 19.8 }
    },
    regions: [
      { id: 'na', name: 'North America', revenue: 8500000, target: 9500000, growth: 15.2 },
      { id: 'eu', name: 'Europe', revenue: 4250000, target: 5000000, growth: 8.7 },
      { id: 'apac', name: 'Asia-Pacific', revenue: 3000000, target: 3500000, growth: 22.1 }
    ],
    segments: [
      { id: 'strategic', name: 'Strategic Partners', contribution: 45.2, growth: 18.5, opportunities: 89 },
      { id: 'reference', name: 'Reference Customers', contribution: 35.8, growth: 12.3, opportunities: 156 },
      { id: 'vector', name: 'Vector Control', contribution: 19.0, growth: 8.9, opportunities: 234 }
    ],
    trends: [
      { period: 'Q1', revenue: 3800000, deals: 298, velocity: 62 },
      { period: 'Q2', revenue: 4200000, deals: 312, velocity: 59 },
      { period: 'Q3', revenue: 4150000, deals: 305, velocity: 55 },
      { period: 'Q4', revenue: 3600000, deals: 332, velocity: 58 }
    ],
    risks: [
      { 
        type: 'pipeline', 
        severity: 'high', 
        description: 'Q4 pipeline coverage at 2.1x vs 3x target',
        impact: 85,
        mitigation: ['Accelerate prospecting', 'Focus on high-value deals', 'Extend sales cycle']
      },
      { 
        type: 'competitive', 
        severity: 'medium', 
        description: 'Increased competition in APAC region',
        impact: 65,
        mitigation: ['Strengthen local partnerships', 'Enhance product positioning', 'Competitive pricing']
      },
      { 
        type: 'forecast', 
        severity: 'medium', 
        description: 'Revenue forecast variance 4.4% below target',
        impact: 70,
        mitigation: ['Pipeline acceleration', 'Deal size optimization', 'Close date management']
      }
    ]
  });

  const [teamManagers, setTeamManagers] = useKV('team-managers', [
    { id: 'mgr-1', name: 'Jessica Chen', team: 'Enterprise Sales', revenue: 5250000, target: 6000000, attainment: 87.5, teamSize: 8 },
    { id: 'mgr-2', name: 'Michael Rodriguez', team: 'Mid-Market', revenue: 3800000, target: 4200000, attainment: 90.5, teamSize: 12 },
    { id: 'mgr-3', name: 'Sarah Kim', team: 'SMB & Channel', revenue: 2650000, target: 2800000, attainment: 94.6, teamSize: 15 },
    { id: 'mgr-4', name: 'David Wilson', team: 'Strategic Accounts', revenue: 4050000, target: 5000000, attainment: 81.0, teamSize: 6 }
  ]);

  const [regionalPerformance, setRegionalPerformance] = useKV('regional-performance', [
    { region: 'North America', q1: 2100000, q2: 2250000, q3: 2150000, q4: 2000000, target: 9500000 },
    { region: 'Europe', q1: 950000, q2: 1100000, q3: 1050000, q4: 1150000, target: 5000000 },
    { region: 'Asia-Pacific', q1: 750000, q2: 850000, q3: 950000, q4: 450000, target: 3500000 }
  ]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* BU Head Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Sales Overview</h1>
          <p className="text-muted-foreground">Consolidated performance across all regions and teams</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Globe className="w-4 h-4 mr-1" />
            Global Operations
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Crown className="w-4 h-4 mr-1" />
            Business Unit Head
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Global Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional Performance</TabsTrigger>
          <TabsTrigger value="teams">Team Management</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Global Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Global Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${globalMetrics.global.revenue.actual.toLocaleString()}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={getPerformanceColor((globalMetrics.global.revenue.actual / globalMetrics.global.revenue.target) * 100)}>
                    {globalMetrics.global.revenue.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {((globalMetrics.global.revenue.actual / globalMetrics.global.revenue.target) * 100).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">of ${globalMetrics.global.revenue.target.toLocaleString()}</span>
                </div>
                <Progress value={(globalMetrics.global.revenue.actual / globalMetrics.global.revenue.target) * 100} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  Forecast: ${globalMetrics.global.revenue.forecast.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Global Pipeline</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalMetrics.global.deals.pipeline.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">opportunities</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{globalMetrics.global.performance.velocity} day avg velocity</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Forecast: {globalMetrics.global.deals.forecast} deals
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Global Attainment</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalMetrics.global.performance.attainment.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  {globalMetrics.global.deals.closed} deals closed
                </div>
                <Progress value={globalMetrics.global.performance.attainment} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalMetrics.global.performance.conversion.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">opportunity to close</div>
                <div className="text-xs mt-1">
                  Growth: +{globalMetrics.global.revenue.growth.toFixed(1)}% YoY
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Regional Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalMetrics.regions.map((region) => (
                  <div key={region.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{region.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${region.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold ${getPerformanceColor((region.revenue / region.target) * 100)}`}>
                          {((region.revenue / region.target) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: ${region.target.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={region.growth >= 15 ? 'text-green-700 bg-green-100' : region.growth >= 10 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'}>
                        +{region.growth.toFixed(1)}% YoY
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Customer Segments Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalMetrics.segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {segment.opportunities} opportunities
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold">{segment.contribution.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">contribution</p>
                      </div>
                      <Badge variant="outline" className="text-green-700 bg-green-100">
                        +{segment.growth.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          {/* Regional Quarter Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Regional Quarterly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regionalPerformance.map((region) => (
                  <div key={region.region} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{region.region}</h4>
                      <div className="text-sm text-muted-foreground">
                        Annual Target: ${region.target.toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold">${(region.q1 / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-muted-foreground">Q1</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold">${(region.q2 / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-muted-foreground">Q2</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold">${(region.q3 / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-muted-foreground">Q3</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold">${(region.q4 / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-muted-foreground">Q4</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <Progress 
                        value={((region.q1 + region.q2 + region.q3 + region.q4) / region.target) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Current: ${((region.q1 + region.q2 + region.q3 + region.q4) / 1000000).toFixed(1)}M</span>
                        <span>{(((region.q1 + region.q2 + region.q3 + region.q4) / region.target) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          {/* Team Managers Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Managers Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamManagers.map((manager) => (
                  <div key={manager.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{manager.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {manager.team} • {manager.teamSize} reps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-bold">${manager.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          ${manager.target.toLocaleString()} target
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${getPerformanceColor(manager.attainment)}`}>
                          {manager.attainment.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">attainment</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Strategic Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Strategic Risks & Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalMetrics.risks.map((risk, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getRiskColor(risk.severity)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${getRiskColor(risk.severity)} border-none`}>
                            {risk.severity.toUpperCase()}
                          </Badge>
                          <span className="capitalize font-medium">{risk.type} Risk</span>
                        </div>
                        <p className="mt-2 text-sm">{risk.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{risk.impact}</p>
                        <p className="text-xs text-muted-foreground">impact score</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Mitigation Strategies:</p>
                      <div className="flex flex-wrap gap-2">
                        {risk.mitigation.map((strategy, strategyIndex) => (
                          <Badge key={strategyIndex} variant="outline" className="text-xs">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Quarterly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {globalMetrics.trends.map((trend) => (
                  <div key={trend.period} className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium mb-3">{trend.period}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-lg font-bold">${(trend.revenue / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div>
                        <p className="font-medium">{trend.deals}</p>
                        <p className="text-xs text-muted-foreground">Deals</p>
                      </div>
                      <div>
                        <p className="font-medium">{trend.velocity}d</p>
                        <p className="text-xs text-muted-foreground">Velocity</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}