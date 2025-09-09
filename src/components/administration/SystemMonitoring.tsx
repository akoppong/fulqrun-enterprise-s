import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, TrendingUp } from '@phosphor-icons/react';

interface SystemMonitoringProps {
  hasAdminAccess: boolean;
}

export function SystemMonitoring({ hasAdminAccess }: SystemMonitoringProps) {
  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to view system monitoring.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">System Monitoring</h3>
        <p className="text-muted-foreground">
          Monitor system performance, health metrics, and usage analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">CPU utilization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">RAM utilization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-blue-500" />
            System Health Monitoring
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics and health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-blue-400 text-blue-600">
                  Coming Soon
                </Badge>
                <span className="font-medium">Advanced Monitoring</span>
              </div>
              <p className="text-sm text-blue-700">
                Comprehensive system monitoring with real-time dashboards, alerting, 
                and performance analytics will be available in Phase 3.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" disabled>
                <Activity className="mr-2 h-4 w-4" />
                Performance Dashboard
              </Button>
              <Button variant="outline" disabled>
                <BarChart3 className="mr-2 h-4 w-4" />
                Usage Analytics
              </Button>
              <Button variant="outline" disabled>
                <TrendingUp className="mr-2 h-4 w-4" />
                Health Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}