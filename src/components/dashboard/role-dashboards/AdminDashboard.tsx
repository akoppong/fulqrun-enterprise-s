import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/types';
import { 
  Settings,
  Users,
  Shield,
  Database,
  Activity
} from '@phosphor-icons/react';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">Platform management and configuration</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-muted-foreground">Active users</div>
          </CardContent>
        </Card>

        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </CardContent>
        </Card>

        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3TB</div>
            <div className="text-xs text-muted-foreground">Used of 5TB</div>
          </CardContent>
        </Card>

        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="text-xs text-muted-foreground">Active configs</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Message */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the system administration dashboard. All administrative functions including user management, 
            system configuration, pipeline builder, and integration hub are available through the Administration 
            Module in the sidebar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}