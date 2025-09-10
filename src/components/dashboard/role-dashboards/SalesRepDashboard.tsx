import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, SalesPerformanceMetrics } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Video,
  Clock,
  Award
} from '@phosphor-icons/react';

interface SalesRepDashboardProps {
  user: User;
}

export function SalesRepDashboard({ user }: SalesRepDashboardProps) {
  const [performance, setPerformance] = useKV<SalesPerformanceMetrics>(`performance-${user.id}`, {
    userId: user.id,
    period: 'monthly',
    revenue: { actual: 145000, target: 150000, percentage: 96.7 },
    deals: { closed: 12, target: 15, percentage: 80.0 },
    pipeline: { value: 485000, count: 24, velocity: 45 },
    activities: { calls: 87, emails: 142, meetings: 23, demos: 8 },
    conversion: { 
      leadToOpportunity: 24.5, 
      opportunityToClose: 18.2, 
      averageDealSize: 12083, 
      salesCycle: 67 
    },
    ranking: { position: 3, totalReps: 12, percentile: 75 }
  });

  const [todayActivities, setTodayActivities] = useKV('today-activities', [
    { type: 'call', time: '09:00', contact: 'Sarah Johnson - Acme Corp', status: 'scheduled' },
    { type: 'demo', time: '11:30', contact: 'Mike Chen - TechFlow Solutions', status: 'confirmed' },
    { type: 'follow-up', time: '14:00', contact: 'Lisa Rodriguez - Global Industries', status: 'pending' },
    { type: 'proposal', time: '16:00', contact: 'David Park - Innovation Labs', status: 'due' }
  ]);

  const [hotDeals, setHotDeals] = useKV('hot-deals', [
    { id: '1', company: 'Enterprise Solutions Inc', value: 75000, stage: 'Negotiation', probability: 85, closeDate: '2024-12-15' },
    { id: '2', company: 'Global Manufacturing Co', value: 125000, stage: 'Proposal', probability: 70, closeDate: '2024-12-20' },
    { id: '3', company: 'Tech Innovations Ltd', value: 95000, stage: 'Demo', probability: 60, closeDate: '2024-12-25' }
  ]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage: number) => {
    return percentage >= 100 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here's your performance overview for this month</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Award className="w-4 h-4 mr-1" />
          Rank #{performance.ranking.position} of {performance.ranking.totalReps}
        </Badge>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${performance.revenue.actual.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs">
              <span className={getPerformanceColor(performance.revenue.percentage)}>
                {getPerformanceIcon(performance.revenue.percentage)}
                {performance.revenue.percentage.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">of ${performance.revenue.target.toLocaleString()}</span>
            </div>
            <Progress value={performance.revenue.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.deals.closed}</div>
            <div className="flex items-center space-x-2 text-xs">
              <span className={getPerformanceColor(performance.deals.percentage)}>
                {getPerformanceIcon(performance.deals.percentage)}
                {performance.deals.percentage.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">of {performance.deals.target}</span>
            </div>
            <Progress value={performance.deals.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${performance.pipeline.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {performance.pipeline.count} opportunities
            </div>
            <div className="flex items-center space-x-1 text-xs mt-1">
              <Clock className="w-3 h-3" />
              <span>{performance.pipeline.velocity} day velocity</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.conversion.opportunityToClose.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Avg Deal: ${performance.conversion.averageDealSize.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg Cycle: {performance.conversion.salesCycle} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {activity.type === 'call' && <Phone className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'demo' && <Video className="w-4 h-4 text-green-600" />}
                  {activity.type === 'follow-up' && <Mail className="w-4 h-4 text-orange-600" />}
                  {activity.type === 'proposal' && <Target className="w-4 h-4 text-purple-600" />}
                  <div>
                    <p className="font-medium">{activity.contact}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge 
                  variant={activity.status === 'confirmed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Hot Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">{deal.company}</p>
                  <p className="text-sm text-muted-foreground">{deal.stage}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">${deal.value.toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {deal.probability}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{deal.closeDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{performance.activities.calls}</div>
            <div className="text-sm text-muted-foreground">Calls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{performance.activities.emails}</div>
            <div className="text-sm text-muted-foreground">Emails</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{performance.activities.meetings}</div>
            <div className="text-sm text-muted-foreground">Meetings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{performance.activities.demos}</div>
            <div className="text-sm text-muted-foreground">Demos</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}