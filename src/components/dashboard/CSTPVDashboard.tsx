import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign, 
  Users,
  Award,
  Activity,
  BarChart3,
  Filter
} from '@phosphor-icons/react';
import { Opportunity, PerformanceMetrics, User } from '@/lib/types';
import { AIService } from '@/lib/ai-service';

interface CSTPVDashboardProps {
  opportunities: Opportunity[];
  currentUser: User;
  allUsers?: User[];
}

export function CSTPVDashboard({ opportunities, currentUser, allUsers = [] }: CSTPVDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('current-quarter');
  const [selectedUser, setSelectedUser] = useState(currentUser.id);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<PerformanceMetrics[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Calculate CSTPV metrics
  useEffect(() => {
    calculateMetrics();
  }, [opportunities, selectedUser, selectedPeriod]);

  const calculateMetrics = async () => {
    setLoading(true);
    
    const userOpportunities = opportunities.filter(o => 
      selectedUser === 'all' ? true : o.ownerId === selectedUser
    );

    // Filter by period (simplified for demo)
    const filteredOpportunities = userOpportunities; // In real app, filter by date

    const totalOpps = filteredOpportunities.length;
    const closedWon = filteredOpportunities.filter(o => o.stage === 'keep').length;
    const totalValue = filteredOpportunities.reduce((sum, o) => sum + o.value, 0);
    const avgDealSize = totalOpps > 0 ? totalValue / totalOpps : 0;
    
    // Calculate average sales cycle (simplified)
    const avgSalesCycle = filteredOpportunities.reduce((acc, o) => {
      const daysDiff = Math.floor((new Date().getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return acc + daysDiff;
    }, 0) / totalOpps || 0;

    const avgProbability = filteredOpportunities.reduce((sum, o) => sum + o.probability, 0) / totalOpps || 0;

    const calculatedMetrics: PerformanceMetrics = {
      userId: selectedUser,
      period: selectedPeriod,
      cstpv: {
        close: totalOpps > 0 ? (closedWon / totalOpps) * 100 : 0,
        size: avgDealSize,
        time: avgSalesCycle,
        probability: avgProbability,
        value: totalValue
      },
      activityMetrics: {
        calls: Math.floor(Math.random() * 50) + 20, // Mock data
        emails: Math.floor(Math.random() * 100) + 50,
        meetings: Math.floor(Math.random() * 30) + 10,
        demos: Math.floor(Math.random() * 20) + 5
      },
      kpis: {
        quota: 1000000, // $1M quota
        achieved: totalValue,
        attainment: (totalValue / 1000000) * 100,
        ranking: Math.floor(Math.random() * 10) + 1
      }
    };

    setMetrics(calculatedMetrics);

    // Generate AI insights
    try {
      const insights = await AIService.analyzePerformance(filteredOpportunities, selectedUser);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    }

    setLoading(false);
  };

  const renderMetricCard = (title: string, value: string | number, change: number, icon: React.ReactNode, format: 'currency' | 'percentage' | 'number' | 'days' = 'number') => {
    const formatValue = (val: string | number) => {
      if (format === 'currency') return `$${Number(val).toLocaleString()}`;
      if (format === 'percentage') return `${Number(val).toFixed(1)}%`;
      if (format === 'days') return `${Number(val).toFixed(0)} days`;
      return val.toString();
    };

    const isPositive = change > 0;
    const changeIcon = isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          <p className={`text-xs ${changeColor} flex items-center gap-1`}>
            {changeIcon}
            {Math.abs(change).toFixed(1)}% from last period
          </p>
        </CardContent>
      </Card>
    );
  };

  if (!metrics) {
    return <div className="p-6">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CSTPV Performance</h2>
          <p className="text-muted-foreground">
            Close, Size, Time, Probability, Value metrics and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          {currentUser.role !== 'rep' && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team</SelectItem>
                {allUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cstpv">CSTPV Deep Dive</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Attainment</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.kpis.attainment.toFixed(1)}%</div>
                <Progress value={metrics.kpis.attainment} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  ${metrics.kpis.achieved.toLocaleString()} of ${metrics.kpis.quota.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Ranking</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{metrics.kpis.ranking}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Out of {allUsers.length || 10} reps
                </p>
              </CardContent>
            </Card>

            {renderMetricCard(
              "Win Rate (Close)",
              metrics.cstpv.close,
              5.2,
              <Target className="h-4 w-4 text-muted-foreground" />,
              'percentage'
            )}

            {renderMetricCard(
              "Avg Deal Size",
              metrics.cstpv.size,
              12.5,
              <DollarSign className="h-4 w-4 text-muted-foreground" />,
              'currency'
            )}
          </div>

          {/* Pipeline Value Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Value by Stage</CardTitle>
              <CardDescription>Current pipeline distribution across PEAK stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['prospect', 'engage', 'acquire', 'keep'].map(stage => {
                  const stageOpps = opportunities.filter(o => o.stage === stage);
                  const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);
                  const percentage = metrics.cstpv.value > 0 ? (stageValue / metrics.cstpv.value) * 100 : 0;
                  
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium">{stage}</span>
                        <span className="text-sm text-muted-foreground">
                          ${stageValue.toLocaleString()} ({stageOpps.length} deals)
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cstpv" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {renderMetricCard(
              "Close Rate",
              metrics.cstpv.close,
              5.2,
              <Target className="h-4 w-4 text-muted-foreground" />,
              'percentage'
            )}
            {renderMetricCard(
              "Size (Avg Deal)",
              metrics.cstpv.size,
              12.5,
              <DollarSign className="h-4 w-4 text-muted-foreground" />,
              'currency'
            )}
            {renderMetricCard(
              "Time (Sales Cycle)",
              metrics.cstpv.time,
              -8.3,
              <Clock className="h-4 w-4 text-muted-foreground" />,
              'days'
            )}
            {renderMetricCard(
              "Probability (Avg)",
              metrics.cstpv.probability,
              3.1,
              <BarChart3 className="h-4 w-4 text-muted-foreground" />,
              'percentage'
            )}
            {renderMetricCard(
              "Value (Pipeline)",
              metrics.cstpv.value,
              15.7,
              <TrendingUp className="h-4 w-4 text-muted-foreground" />,
              'currency'
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CSTPV Trend Analysis</CardTitle>
              <CardDescription>Performance trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Chart visualization would go here (D3.js implementation)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {renderMetricCard(
              "Calls Made",
              metrics.activityMetrics.calls,
              8.5,
              <Activity className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Emails Sent",
              metrics.activityMetrics.emails,
              15.2,
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Meetings",
              metrics.activityMetrics.meetings,
              22.1,
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Demos",
              metrics.activityMetrics.demos,
              5.8,
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {aiInsights ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiInsights.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">✓</Badge>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiInsights.improvements?.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">!</Badge>
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {aiInsights.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Generating AI insights...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}