import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Settings } from '@phosphor-icons/react';

interface NotificationSettingsProps {
  hasAdminAccess: boolean;
}

export function NotificationSettings({ hasAdminAccess }: NotificationSettingsProps) {
  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to modify notification settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Notification Settings</h3>
        <p className="text-muted-foreground">
          Configure system notifications and alert preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-orange-500" />
            Notification Configuration
          </CardTitle>
          <CardDescription>
            Set up system-wide notification rules and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-orange-400 text-orange-600">
                  Coming Soon
                </Badge>
                <span className="font-medium">Advanced Notifications</span>
              </div>
              <p className="text-sm text-orange-700">
                Advanced notification management features will be available in Phase 3. 
                This will include email templates, push notifications, and custom alert rules.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Email Templates
              </Button>
              <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Alert Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}