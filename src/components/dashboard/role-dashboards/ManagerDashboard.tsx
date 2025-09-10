import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TeamPerformanceMetrics, SalesPerformanceMetrics } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  Trophy,
  Clock,
  Award,
  Crown,
  Warning
} from '@phosphor-icons/react';

interface ManagerDashboardProps {
  user: User;
}

export function ManagerDashboard({ user }: ManagerDashboardProps) {
  const [teamPerformance, setTeamPerformance] = useKV<TeamPerformanceMetrics>(`team-performance-${user.id}`, {
    teamId: user.teamId || 'team-1',
    managerId: user.id,
    period: 'monthly',
    team: {
      revenue: { actual: 1245000, target: 1350000, percentage: 92.2 },
      deals: { closed: 87, target: 105, percentage: 82.9 },
      pipeline: { value: 3850000, count: 156, velocity: 52 }
    },
    individual: [],
    topPerformers: [
      { userId: 'rep-1', name: 'Sarah Johnson', achievement: 125.5, metric: 'Revenue Attainment' },
      { userId: 'rep-2', name: 'Mike Chen', achievement: 118.2, metric: 'Deal Closure' },
      { userId: 'rep-3', name: 'Lisa Rodriguez', achievement: 110.8, metric: 'Pipeline Value' }
    ],
    underperformers: [
      { userId: 'rep-4', name: 'David Park', gap: -18.5, riskFactors: ['Low activity', 'Stalled deals'] },
      { userId: 'rep-5', name: 'Jennifer Kim', gap: -12.3, riskFactors: ['Poor conversion', 'Long sales cycle'] }
    ]
  });

  const [personalPerformance, setPersonalPerformance] = useKV<SalesPerformanceMetrics>(`performance-${user.id}`, {
    userId: user.id,
    period: 'monthly',
    revenue: { actual: 185000, target: 175000, percentage: 105.7 },
    deals: { closed: 8, target: 8, percentage: 100.0 },
    pipeline: { value: 425000, count: 18, velocity: 38 },
    activities: { calls: 65, emails: 98, meetings: 32, demos: 12 },
    conversion: { 
      leadToOpportunity: 28.5, 
      opportunityToClose: 22.2, 
      averageDealSize: 23125, 
      salesCycle: 58 
    },
    ranking: { position: 1, totalReps: 12, percentile: 95 }
  });

  const [teamMembers, setTeamMembers] = useKV('team-members', [
    { id: 'rep-1', name: 'Sarah Johnson', revenue: 162500, target: 150000, deals: 12, percentage: 108.3, trend: 'up' },
    { id: 'rep-2', name: 'Mike Chen', revenue: 145000, target: 150000, deals: 11, percentage: 96.7, trend: 'up' },
    { id: 'rep-3', name: 'Lisa Rodriguez', revenue: 158000, target: 145000, deals: 13, percentage: 109.0, trend: 'up' },
    { id: 'rep-4', name: 'David Park', revenue: 118500, target: 145000, deals: 8, percentage: 81.7, trend: 'down' },
    { id: 'rep-5', name: 'Jennifer Kim', revenue: 125000, target: 142500, deals: 9, percentage: 87.7, trend: 'stable' },
    { id: 'rep-6', name: 'Tom Wilson', revenue: 152000, target: 148000, deals: 14, percentage: 102.7, trend: 'up' },
    { id: 'rep-7', name: 'Amy Zhang', revenue: 139000, target: 140000, deals: 10, percentage: 99.3, trend: 'up' },
    { id: 'rep-8', name: 'Robert Lee', revenue: 156000, target: 152000, deals: 12, percentage: 102.6, trend: 'stable' }
  ]);

  const [upcomingReviews, setUpcomingReviews] = useKV('upcoming-reviews', [
    { rep: 'David Park', type: '1:1 Review', date: '2024-12-12', priority: 'high' },
    { rep: 'Jennifer Kim', type: 'Performance Check', date: '2024-12-13', priority: 'medium' },
    { rep: 'Team Meeting', type: 'Weekly Sync', date: '2024-12-14', priority: 'normal' }
  ]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Manager Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Manager Dashboard</h1>
          <p className="text-muted-foreground">Team performance and personal metrics overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {teamMembers.length} Team Members
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Crown className="w-4 h-4 mr-1" />
            Manager Level
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="personal">My Performance</TabsTrigger>
          <TabsTrigger value="insights">Team Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          {/* Team Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${teamPerformance.team.revenue.actual.toLocaleString()}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={getPerformanceColor(teamPerformance.team.revenue.percentage)}>
                    {teamPerformance.team.revenue.percentage >= 100 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {teamPerformance.team.revenue.percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">of ${teamPerformance.team.revenue.target.toLocaleString()}</span>
                </div>
                <Progress value={teamPerformance.team.revenue.percentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Pipeline</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${teamPerformance.team.pipeline.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {teamPerformance.team.pipeline.count} opportunities
                </div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{teamPerformance.team.pipeline.velocity} day avg velocity</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Deals</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamPerformance.team.deals.closed}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={getPerformanceColor(teamPerformance.team.deals.percentage)}>
                    {teamPerformance.team.deals.percentage >= 100 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {teamPerformance.team.deals.percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">of {teamPerformance.team.deals.target}</span>
                </div>
                <Progress value={teamPerformance.team.deals.percentage} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Team Members Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.deals} deals • ${member.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold ${getPerformanceColor(member.percentage)}`}>
                          {member.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: ${member.target.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(member.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {/* Personal Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${personalPerformance.revenue.actual.toLocaleString()}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={getPerformanceColor(personalPerformance.revenue.percentage)}>
                    <TrendingUp className="w-4 h-4" />
                    {personalPerformance.revenue.percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">of ${personalPerformance.revenue.target.toLocaleString()}</span>
                </div>
                <Progress value={personalPerformance.revenue.percentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Deals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalPerformance.deals.closed}</div>
                <div className="text-xs text-green-600">
                  ✓ {personalPerformance.deals.percentage.toFixed(1)}% of target
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Pipeline</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${personalPerformance.pipeline.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {personalPerformance.pipeline.count} opportunities
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Ranking</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{personalPerformance.ranking.position}</div>
                <div className="text-xs text-muted-foreground">
                  Top {personalPerformance.ranking.percentile}% performer
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.topPerformers.map((performer, index) => (
                    <div key={performer.userId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">{performer.metric}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {performer.achievement.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warning className="w-5 h-5 mr-2 text-red-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.underperformers.map((performer) => (
                    <div key={performer.userId} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {performer.riskFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-red-100 text-red-700">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {performer.gap.toFixed(1)}%
                        </Badge>
                        <Button variant="outline" size="sm" className="mt-2 text-xs">
                          Schedule 1:1
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Reviews & Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReviews.map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{review.rep}</p>
                      <p className="text-sm text-muted-foreground">{review.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={review.priority === 'high' ? 'destructive' : review.priority === 'medium' ? 'default' : 'outline'}
                      >
                        {review.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
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