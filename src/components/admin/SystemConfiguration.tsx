import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKV } from '@github/spark/hooks';
import {
  Settings,
  Globe,
  Database,
  Envelope,
  Bell,
  Shield,
  Clock,
  Cpu,
  HardDrive,
  CloudCheck,
  Key,
  Warning,
  CheckCircle,
  Info
} from '@phosphor-icons/react';

interface SystemConfig {
  general: {
    systemName: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
    language: string;
    enableRegistration: boolean;
    maintenanceMode: boolean;
  };
  security: {
    passwordMinLength: number;
    requireMFA: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableAuditLogging: boolean;
    dataRetentionDays: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpSecurity: 'none' | 'ssl' | 'tls';
    enableEmailNotifications: boolean;
    fromAddress: string;
    fromName: string;
  };
  integrations: {
    enableSlack: boolean;
    enableMicrosoftTeams: boolean;
    enableSalesforce: boolean;
    enableHubspot: boolean;
    webhookUrl: string;
    apiRateLimit: number;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    enableCompression: boolean;
    maxFileUploadSize: number;
    backgroundJobsEnabled: boolean;
  };
}

export function SystemConfiguration() {
  const [config, setConfig] = useKV<SystemConfig>('system-config', {
    general: {
      systemName: 'FulQrun CRM',
      supportEmail: 'support@fulqrun.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      enableRegistration: false,
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 8,
      requireMFA: false,
      sessionTimeout: 480,
      maxLoginAttempts: 5,
      enableAuditLogging: true,
      dataRetentionDays: 365
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpSecurity: 'tls',
      enableEmailNotifications: true,
      fromAddress: 'noreply@fulqrun.com',
      fromName: 'FulQrun CRM'
    },
    integrations: {
      enableSlack: false,
      enableMicrosoftTeams: false,
      enableSalesforce: false,
      enableHubspot: false,
      webhookUrl: '',
      apiRateLimit: 1000
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 3600,
      enableCompression: true,
      maxFileUploadSize: 10,
      backgroundJobsEnabled: true
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(current => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveConfiguration = () => {
    // In a real app, this would make an API call
    setUnsavedChanges(false);
    // Show success message
  };

  const resetToDefaults = () => {
    // Reset to default configuration
    setUnsavedChanges(true);
  };

  const testEmailConfiguration = () => {
    // Test email settings
    console.log('Testing email configuration...');
  };

  const systemStatus = {
    uptime: '15 days, 6 hours',
    version: '2.0.1',
    database: 'Connected',
    cache: 'Active',
    background_jobs: 'Running',
    storage: '78% used (1.2TB / 1.5TB)'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset Defaults
          </Button>
          <Button onClick={saveConfiguration} disabled={!unsavedChanges}>
            <Settings size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {unsavedChanges && (
        <Alert>
          <Warning size={16} />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle size={16} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">Uptime: {systemStatus.uptime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
            <Info size={16} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.version}</div>
            <p className="text-xs text-muted-foreground">Latest stable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database size={16} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground">Response: 12ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive size={16} className="text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">1.2TB / 1.5TB used</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={16} />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={config.general.systemName}
                    onChange={(e) => updateConfig('general', 'systemName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.general.supportEmail}
                    onChange={(e) => updateConfig('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={config.general.timezone} 
                    onValueChange={(value) => updateConfig('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="CET">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={config.general.dateFormat} 
                    onValueChange={(value) => updateConfig('general', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable User Registration</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </div>
                  </div>
                  <Switch
                    checked={config.general.enableRegistration}
                    onCheckedChange={(checked) => updateConfig('general', 'enableRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable access for maintenance
                    </div>
                  </div>
                  <Switch
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={16} />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Minimum Password Length</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    min="6"
                    max="20"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="30"
                    max="1440"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Data Retention (days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    min="30"
                    max="2555"
                    value={config.security.dataRetentionDays}
                    onChange={(e) => updateConfig('security', 'dataRetentionDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Multi-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">
                      Force MFA for all user accounts
                    </div>
                  </div>
                  <Switch
                    checked={config.security.requireMFA}
                    onCheckedChange={(checked) => updateConfig('security', 'requireMFA', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Logging</Label>
                    <div className="text-sm text-muted-foreground">
                      Log all user actions for compliance
                    </div>
                  </div>
                  <Switch
                    checked={config.security.enableAuditLogging}
                    onCheckedChange={(checked) => updateConfig('security', 'enableAuditLogging', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Envelope size={16} />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={config.email.smtpHost}
                    onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.email.smtpPort}
                    onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromAddress">From Address</Label>
                  <Input
                    id="fromAddress"
                    type="email"
                    value={config.email.fromAddress}
                    onChange={(e) => updateConfig('email', 'fromAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={config.email.fromName}
                    onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpSecurity">Security</Label>
                  <Select 
                    value={config.email.smtpSecurity} 
                    onValueChange={(value: 'none' | 'ssl' | 'tls') => updateConfig('email', 'smtpSecurity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Send system notifications via email
                  </div>
                </div>
                <Switch
                  checked={config.email.enableEmailNotifications}
                  onCheckedChange={(checked) => updateConfig('email', 'enableEmailNotifications', checked)}
                />
              </div>

              <div className="pt-4">
                <Button onClick={testEmailConfiguration} variant="outline">
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudCheck size={16} />
                Third-party Integrations
              </CardTitle>
              <CardDescription>
                Configure external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Slack Integration</div>
                    <div className="text-sm text-muted-foreground">
                      Send notifications to Slack channels
                    </div>
                  </div>
                  <Switch
                    checked={config.integrations.enableSlack}
                    onCheckedChange={(checked) => updateConfig('integrations', 'enableSlack', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Microsoft Teams</div>
                    <div className="text-sm text-muted-foreground">
                      Integrate with Microsoft Teams
                    </div>
                  </div>
                  <Switch
                    checked={config.integrations.enableMicrosoftTeams}
                    onCheckedChange={(checked) => updateConfig('integrations', 'enableMicrosoftTeams', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Salesforce Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync data with Salesforce CRM
                    </div>
                  </div>
                  <Switch
                    checked={config.integrations.enableSalesforce}
                    onCheckedChange={(checked) => updateConfig('integrations', 'enableSalesforce', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">HubSpot Integration</div>
                    <div className="text-sm text-muted-foreground">
                      Connect with HubSpot marketing tools
                    </div>
                  </div>
                  <Switch
                    checked={config.integrations.enableHubspot}
                    onCheckedChange={(checked) => updateConfig('integrations', 'enableHubspot', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={config.integrations.webhookUrl}
                  onChange={(e) => updateConfig('integrations', 'webhookUrl', e.target.value)}
                  placeholder="https://your-webhook-url.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu size={16} />
                Performance Settings
              </CardTitle>
              <CardDescription>
                Optimize system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                  <Input
                    id="cacheTTL"
                    type="number"
                    min="300"
                    max="86400"
                    value={config.performance.cacheTTL}
                    onChange={(e) => updateConfig('performance', 'cacheTTL', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Upload (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={config.performance.maxFileUploadSize}
                    onChange={(e) => updateConfig('performance', 'maxFileUploadSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Caching</Label>
                    <div className="text-sm text-muted-foreground">
                      Cache frequently accessed data
                    </div>
                  </div>
                  <Switch
                    checked={config.performance.cacheEnabled}
                    onCheckedChange={(checked) => updateConfig('performance', 'cacheEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Compression</Label>
                    <div className="text-sm text-muted-foreground">
                      Compress responses to reduce bandwidth
                    </div>
                  </div>
                  <Switch
                    checked={config.performance.enableCompression}
                    onCheckedChange={(checked) => updateConfig('performance', 'enableCompression', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Background Jobs</Label>
                    <div className="text-sm text-muted-foreground">
                      Process tasks in the background
                    </div>
                  </div>
                  <Switch
                    checked={config.performance.backgroundJobsEnabled}
                    onCheckedChange={(checked) => updateConfig('performance', 'backgroundJobsEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}