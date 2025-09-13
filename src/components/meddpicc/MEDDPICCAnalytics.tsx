/**
 * MEDDPICC Analytics Dashboard
 * Comprehensive analytics and insights for MEDDPICC assessments
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

import { MEDDPICCService } from '@/services/meddpicc-service';
import { MEDDPICCAnalytics } from '@/types/meddpicc';
import { MEDDPICC_CONFIG } from '@/data/meddpicc-config';

const SCORE_COLORS = {
  strong: '#10b981',
  moderate: '#f59e0b', 
  weak: '#ef4444'
};

export function MEDDPICCAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<MEDDPICCAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Initialize sample data if needed
        MEDDPICCService.initializeSampleData();
        
        // Load analytics data
        const data = MEDDPICCService.generateAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load MEDDPICC analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">MEDDPICC Analytics</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for deal qualification
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Assessments"
          value={analytics.score_distribution.strong + analytics.score_distribution.moderate + analytics.score_distribution.weak}
          icon={Target}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Completion Rate"
          value={`${analytics.completion_rate.toFixed(1)}%`}
          icon={CheckCircle}
          trend="+5%"
          trendUp={true}
        />
        <MetricCard
          title="Avg. Completion Time"
          value={`${Math.round(analytics.average_time_to_complete / (1000 * 60))} min`}
          icon={Clock}
          trend="-8%"
          trendUp={true}
        />
        <MetricCard
          title="Strong Deals"
          value={`${analytics.score_distribution.strong}`}
          icon={Award}
          trend="+15%"
          trendUp={true}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pillars">Pillar Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of deal health scores across all assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Strong', value: analytics.score_distribution.strong, color: SCORE_COLORS.strong },
                          { name: 'Moderate', value: analytics.score_distribution.moderate, color: SCORE_COLORS.moderate },
                          { name: 'Weak', value: analytics.score_distribution.weak, color: SCORE_COLORS.weak }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Strong', value: analytics.score_distribution.strong, color: SCORE_COLORS.strong },
                          { name: 'Moderate', value: analytics.score_distribution.moderate, color: SCORE_COLORS.moderate },
                          { name: 'Weak', value: analytics.score_distribution.weak, color: SCORE_COLORS.weak }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Strong ({analytics.score_distribution.strong})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Moderate ({analytics.score_distribution.moderate})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Weak ({analytics.score_distribution.weak})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Win Rate by Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Win Rate by Score
                </CardTitle>
                <CardDescription>
                  Correlation between MEDDPICC scores and deal outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.win_rate_by_score}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="score_range" 
                        fontSize={12}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Win Rate']}
                        labelFormatter={(label) => `Score Range: ${label}`}
                      />
                      <Bar dataKey="win_rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pillar Analysis Tab */}
        <TabsContent value="pillars" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pillar Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pillar Performance
                </CardTitle>
                <CardDescription>
                  Average scores across all MEDDPICC pillars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.pillar_analysis} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 40]} />
                      <YAxis 
                        type="category" 
                        dataKey="pillar" 
                        width={100}
                        fontSize={12}
                        tickFormatter={(value) => value.replace('_', ' ').toUpperCase()}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(1), 'Average Score']}
                        labelFormatter={(label) => `Pillar: ${label.replace('_', ' ').toUpperCase()}`}
                      />
                      <Bar dataKey="average_score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pillar Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Pillar Strengths Radar</CardTitle>
                <CardDescription>
                  Visual representation of pillar performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analytics.pillar_analysis}>
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="pillar" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.replace('_', ' ').toUpperCase()}
                      />
                      <PolarRadiusAxis 
                        domain={[0, 40]} 
                        tick={{ fontSize: 10 }}
                      />
                      <Radar
                        name="Average Score"
                        dataKey="average_score"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(1), 'Average Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Gaps by Pillar
              </CardTitle>
              <CardDescription>
                Most frequent areas needing improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.pillar_analysis.map((pillar) => (
                  <div key={pillar.pillar} className="space-y-2">
                    <div className="font-medium text-sm">
                      {pillar.pillar.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      {pillar.common_gaps.slice(0, 3).map((gap, index) => (
                        <div key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {gap}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Improvement Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Improvement Rates</CardTitle>
                <CardDescription>
                  Rate of improvement over time by pillar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.pillar_analysis.map((pillar) => (
                    <div key={pillar.pillar} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {pillar.pillar.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">
                          +{pillar.improvement_rate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={pillar.improvement_rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Assessment Score</span>
                    <span className="text-lg font-bold">
                      {(analytics.pillar_analysis.reduce((sum, p) => sum + p.average_score, 0) / analytics.pillar_analysis.length).toFixed(1)}/40
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold">{analytics.completion_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Strong Deal Percentage</span>
                    <span className="text-lg font-bold">
                      {(analytics.score_distribution.strong / (analytics.score_distribution.strong + analytics.score_distribution.moderate + analytics.score_distribution.weak) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Time to Complete</span>
                    <span className="text-lg font-bold">
                      {Math.round(analytics.average_time_to_complete / (1000 * 60))} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Insights</CardTitle>
              <CardDescription>
                Key trends and insights from MEDDPICC data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Strongest Pillars</h4>
                    {analytics.pillar_analysis
                      .sort((a, b) => b.average_score - a.average_score)
                      .slice(0, 3)
                      .map((pillar, index) => (
                        <div key={pillar.pillar} className="flex items-center justify-between">
                          <span className="text-sm">
                            {index + 1}. {pillar.pillar.replace('_', ' ').toUpperCase()}
                          </span>
                          <Badge variant="secondary">
                            {pillar.average_score.toFixed(1)}/40
                          </Badge>
                        </div>
                      ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Areas for Improvement</h4>
                    {analytics.pillar_analysis
                      .sort((a, b) => a.average_score - b.average_score)
                      .slice(0, 3)
                      .map((pillar, index) => (
                        <div key={pillar.pillar} className="flex items-center justify-between">
                          <span className="text-sm">
                            {index + 1}. {pillar.pillar.replace('_', ' ').toUpperCase()}
                          </span>
                          <Badge variant="outline">
                            {pillar.average_score.toFixed(1)}/40
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Key Insights</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="text-sm font-medium text-blue-900">Deal Quality Trend</div>
                      <div className="text-sm text-blue-700">
                        Strong deals have increased by 15% this quarter, indicating improved qualification processes.
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="text-sm font-medium text-green-900">Champion Development</div>
                      <div className="text-sm text-green-700">
                        Champion pillar shows highest improvement rate at +{analytics.pillar_analysis.find(p => p.pillar === 'champion')?.improvement_rate.toFixed(1)}%, suggesting effective coaching.
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="text-sm font-medium text-orange-900">Economic Buyer Access</div>
                      <div className="text-sm text-orange-700">
                        Economic Buyer engagement remains a common gap across 45% of assessments.
                      </div>
                    </div>
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

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge 
                  variant={trendUp ? "default" : "destructive"} 
                  className="text-xs"
                >
                  {trend}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}