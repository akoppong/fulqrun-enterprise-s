import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Users, 
  Shield, 
  HardDrives, 
  FileText, 
  Code, 
  Bell, 
  HardDrive, 
  Activity,
  Workflow,
  Plug,
  TestTube,
  Wrench,
  Lock,
  UserCheck,
  Server,
  AlertTriangle,
  BarChart3
} from '@phosphor-icons/react';

// Import existing components that will be moved here
import { AdvancedPipelineBuilder } from '@/components/pipeline/AdvancedPipelineBuilder';
import { IntegrationHub } from '@/components/dashboard/IntegrationHub';
import { ValidationTestingDemo } from '@/components/dashboard/ValidationTestingDemo';
import { AutoSaveTestRunner } from '@/components/dashboard/AutoSaveTestRunner';
import { ComprehensiveValidationTestSuite } from '@/components/dashboard/ComprehensiveValidationTestSuite';
import { FieldTypeTestingLab } from '@/components/dashboard/FieldTypeTestingLab';

// Import new real-time data integration components
import { RealTimeDataHub } from '@/components/integrations/RealTimeDataHub';
import { DataQualityDashboard } from '@/components/integrations/DataQualityDashboard';
import { AutomationWorkflows } from '@/components/integrations/AutomationWorkflows';

// Import administration sub-components
import { SystemSettings } from './SystemSettings';
import { UserManagement } from './UserManagement';
import { SecuritySettings } from './SecuritySettings';
import { DataManagement } from './DataManagement';
import { SystemLogs } from './SystemLogs';
import { ApiManagement } from './ApiManagement';
import { NotificationSettings } from './NotificationSettings';
import { BackupAndRecovery } from './BackupAndRecovery';
import { SystemMonitoring } from './SystemMonitoring';

interface AdministrationModuleProps {
  userRole: string;
  isOwner?: boolean;
  initialView?: string;
}

export function AdministrationModule({ userRole, isOwner = false, initialView = 'overview' }: AdministrationModuleProps) {
  const [activeSection, setActiveSection] = useState(initialView);

  // Check if user has admin access
  const hasAdminAccess = isOwner || userRole === 'admin';
  const hasManagerAccess = hasAdminAccess || userRole === 'manager';

  if (!hasManagerAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-red-500" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have sufficient permissions to access the Administration Module. 
            Please contact your system administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administration Module</h2>
          <p className="text-muted-foreground">
            Enterprise-grade system configuration and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasAdminAccess ? "default" : "secondary"}>
            {hasAdminAccess ? "Full Admin Access" : "Manager Access"}
          </Badge>
          {isOwner && (
            <Badge variant="outline" className="border-emerald-500 text-emerald-600">
              <UserCheck className="w-3 h-3 mr-1" />
              Owner
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">99.9% uptime</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Plug className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">All connections active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A+</div>
            <p className="text-xs text-muted-foreground">Excellent security posture</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Administration Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-1 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 p-3 text-xs">
            <BarChart3 size={16} />
            <span>Overview</span>
          </TabsTrigger>
          
          <TabsTrigger value="system-settings" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Settings size={16} />
            <span>System</span>
          </TabsTrigger>
          
          <TabsTrigger value="users" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Users size={16} />
            <span>Users</span>
          </TabsTrigger>
          
          <TabsTrigger value="security" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Shield size={16} />
            <span>Security</span>
          </TabsTrigger>
          
          <TabsTrigger value="pipeline-config" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Workflow size={16} />
            <span>Pipelines</span>
          </TabsTrigger>
          
          <TabsTrigger value="integrations-config" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Plug size={16} />
            <span>Integrations</span>
          </TabsTrigger>
          
          <TabsTrigger value="testing" className="flex flex-col items-center gap-1 p-3 text-xs">
            <TestTube size={16} />
            <span>Testing</span>
          </TabsTrigger>
          
          <TabsTrigger value="data" className="flex flex-col items-center gap-1 p-3 text-xs">
            <HardDrives size={16} />
            <span>Data</span>
          </TabsTrigger>
          
          <TabsTrigger value="logs" className="flex flex-col items-center gap-1 p-3 text-xs">
            <FileText size={16} />
            <span>Logs</span>
          </TabsTrigger>
          
          <TabsTrigger value="monitoring" className="flex flex-col items-center gap-1 p-3 text-xs">
            <Activity size={16} />
            <span>Monitor</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="text-blue-500" />
                  Administration Tools
                </CardTitle>
                <CardDescription>
                  Quick access to key administration features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveSection('pipeline-config')}
                >
                  <Workflow className="mr-2 h-4 w-4" />
                  Advanced Pipeline Builder
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveSection('integrations-config')}
                >
                  <Plug className="mr-2 h-4 w-4" />
                  Integration Hub Management
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveSection('testing')}
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Testing & Validation Suite
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveSection('users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Recent system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System Health Check</p>
                      <p className="text-xs text-muted-foreground">All systems operational</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      OK
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Server className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Backup Completed</p>
                      <p className="text-xs text-muted-foreground">Daily backup successful</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      INFO
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security Scan</p>
                      <p className="text-xs text-muted-foreground">Weekly scan scheduled</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      PENDING
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Administrative Activity</CardTitle>
              <CardDescription>Latest configuration changes and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">User Role Updated</p>
                    <p className="text-sm text-muted-foreground">
                      John Smith promoted to Team Lead • 2 hours ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Workflow className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Pipeline Configuration</p>
                    <p className="text-sm text-muted-foreground">
                      Sales Pipeline automation updated • 4 hours ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium">Security Policy</p>
                    <p className="text-sm text-muted-foreground">
                      Password policy updated • 1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system-settings">
          <SystemSettings hasAdminAccess={hasAdminAccess} />
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <UserManagement hasAdminAccess={hasAdminAccess} />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <SecuritySettings hasAdminAccess={hasAdminAccess} />
        </TabsContent>

        {/* Pipeline Builder Configuration */}
        <TabsContent value="pipeline-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="text-blue-500" />
                Advanced Pipeline Builder
              </CardTitle>
              <CardDescription>
                Configure and manage sales pipeline templates, automation rules, and stage workflows
              </CardDescription>
            </CardHeader>
          </Card>
          <AdvancedPipelineBuilder />
        </TabsContent>

        {/* Integration Hub Configuration */}
        <TabsContent value="integrations-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="text-green-500" />
                Real-Time Data Integration Hub
              </CardTitle>
              <CardDescription>
                Configure external integrations, API connections, data synchronization, and automation workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="data-hub" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="data-hub">Data Hub</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
              <TabsTrigger value="legacy-hub">Legacy Hub</TabsTrigger>
            </TabsList>

            <TabsContent value="data-hub">
              <RealTimeDataHub />
            </TabsContent>

            <TabsContent value="automation">
              <AutomationWorkflows />
            </TabsContent>

            <TabsContent value="data-quality">
              <DataQualityDashboard />
            </TabsContent>

            <TabsContent value="legacy-hub">
              <IntegrationHub />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Testing & Validation Suite */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="text-purple-500" />
                Testing & Validation Suite
              </CardTitle>
              <CardDescription>
                Comprehensive testing tools for system validation, data integrity, and performance monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="validation-demo" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="validation-demo">Validation Demo</TabsTrigger>
              <TabsTrigger value="autosave-test">AutoSave Tests</TabsTrigger>
              <TabsTrigger value="validation-suite">Validation Suite</TabsTrigger>
              <TabsTrigger value="field-testing">Field Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="validation-demo">
              <ValidationTestingDemo />
            </TabsContent>

            <TabsContent value="autosave-test">
              <AutoSaveTestRunner />
            </TabsContent>

            <TabsContent value="validation-suite">
              <ComprehensiveValidationTestSuite />
            </TabsContent>

            <TabsContent value="field-testing">
              <FieldTypeTestingLab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <DataManagement hasAdminAccess={hasAdminAccess} />
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs">
          <SystemLogs hasAdminAccess={hasAdminAccess} />
        </TabsContent>

        {/* System Monitoring */}
        <TabsContent value="monitoring">
          <SystemMonitoring hasAdminAccess={hasAdminAccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}