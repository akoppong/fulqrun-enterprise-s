import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  Settings, 
  Globe, 
  Mail, 
  Clock, 
  Palette, 
  HardDrives,
  Server,
  Zap,
  Save
} from '@phosphor-icons/react';

interface SystemSettingsProps {
  hasAdminAccess: boolean;
}

export function SystemSettings({ hasAdminAccess }: SystemSettingsProps) {
  const [generalSettings, setGeneralSettings] = useKV('system-general-settings', {
    systemName: 'FulQrun CRM',
    systemDescription: 'Enterprise Sales Platform',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false,
    debugMode: false
  });

  const [emailSettings, setEmailSettings] = useKV('system-email-settings', {
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'FulQrun CRM',
    enableNotifications: true,
    enableDigests: true
  });

  const [performanceSettings, setPerformanceSettings] = useKV('system-performance-settings', {
    cacheEnabled: true,
    cacheTtl: '3600',
    maxFileSize: '10',
    sessionTimeout: '1440',
    rateLimitEnabled: true,
    rateLimitPerMinute: '100'
  });

  const handleSaveGeneral = () => {
    toast.success('General settings saved successfully');
  };

  const handleSaveEmail = () => {
    toast.success('Email settings saved successfully');
  };

  const handleSavePerformance = () => {
    toast.success('Performance settings saved successfully');
  };

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to modify system settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">System Settings</h3>
        <p className="text-muted-foreground">
          Configure core system parameters and global settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-blue-500" />
                General Configuration
              </CardTitle>
              <CardDescription>
                Basic system configuration and global preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="system-name">System Name</Label>
                  <Input
                    id="system-name"
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings(current => ({
                      ...current,
                      systemName: e.target.value
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="system-description">System Description</Label>
                  <Input
                    id="system-description"
                    value={generalSettings.systemDescription}
                    onChange={(e) => setGeneralSettings(current => ({
                      ...current,
                      systemDescription: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings(current => ({
                      ...current,
                      timezone: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => setGeneralSettings(current => ({
                      ...current,
                      dateFormat: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings(current => ({
                      ...current,
                      currency: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings(current => ({
                      ...current,
                      language: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">System Modes</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable system access for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings(current => ({
                      ...current,
                      maintenanceMode: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and error reporting
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.debugMode}
                    onCheckedChange={(checked) => setGeneralSettings(current => ({
                      ...current,
                      debugMode: checked
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral}>
                  <Save className="mr-2 h-4 w-4" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="text-green-500" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings and email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      smtpHost: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    placeholder="587"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      smtpPort: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="your-email@domain.com"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      smtpUser: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="••••••••"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      smtpPassword: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    placeholder="noreply@yourcompany.com"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      fromEmail: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    placeholder="FulQrun CRM"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(current => ({
                      ...current,
                      fromName: e.target.value
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automated email notifications for system events
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enableNotifications}
                    onCheckedChange={(checked) => setEmailSettings(current => ({
                      ...current,
                      enableNotifications: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Daily Digests</Label>
                    <p className="text-sm text-muted-foreground">
                      Send daily summary emails to users
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enableDigests}
                    onCheckedChange={(checked) => setEmailSettings(current => ({
                      ...current,
                      enableDigests: checked
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  Test Connection
                </Button>
                <Button onClick={handleSaveEmail}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-orange-500" />
                Performance Configuration
              </CardTitle>
              <CardDescription>
                Optimize system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Cache Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache frequently accessed data for better performance
                    </p>
                  </div>
                  <Switch
                    checked={performanceSettings.cacheEnabled}
                    onCheckedChange={(checked) => setPerformanceSettings(current => ({
                      ...current,
                      cacheEnabled: checked
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    value={performanceSettings.cacheTtl}
                    onChange={(e) => setPerformanceSettings(current => ({
                      ...current,
                      cacheTtl: e.target.value
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long cached data should be stored before expiring
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">File Upload Settings</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value={performanceSettings.maxFileSize}
                    onChange={(e) => setPerformanceSettings(current => ({
                      ...current,
                      maxFileSize: e.target.value
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Session Management</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={performanceSettings.sessionTimeout}
                    onChange={(e) => setPerformanceSettings(current => ({
                      ...current,
                      sessionTimeout: e.target.value
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long users can remain idle before being logged out
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Rate Limiting</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit API requests to prevent abuse
                    </p>
                  </div>
                  <Switch
                    checked={performanceSettings.rateLimitEnabled}
                    onCheckedChange={(checked) => setPerformanceSettings(current => ({
                      ...current,
                      rateLimitEnabled: checked
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Requests per Minute</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={performanceSettings.rateLimitPerMinute}
                    onChange={(e) => setPerformanceSettings(current => ({
                      ...current,
                      rateLimitPerMinute: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePerformance}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Performance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="text-red-500" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Advanced system settings - modify with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-orange-400 text-orange-600">
                      Warning
                    </Badge>
                    <span className="font-medium">Advanced Settings</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These settings can significantly impact system performance and stability. 
                    Only modify these settings if you understand their implications.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Database Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Database connection settings and optimization parameters
                  </p>
                  <Button variant="outline" disabled>
                    Configure Database (Coming Soon)
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">API Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    API endpoint management and security settings
                  </p>
                  <Button variant="outline" disabled>
                    Manage APIs (Coming Soon)
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">System Health</h4>
                  <p className="text-sm text-muted-foreground">
                    System diagnostics and health monitoring
                  </p>
                  <Button variant="outline" disabled>
                    Run Diagnostics (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}