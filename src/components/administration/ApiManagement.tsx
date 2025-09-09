import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Key, Settings } from '@phosphor-icons/react';

interface ApiManagementProps {
  hasAdminAccess: boolean;
}

export function ApiManagement({ hasAdminAccess }: ApiManagementProps) {
  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to manage APIs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">API Management</h3>
        <p className="text-muted-foreground">
          Manage API keys, endpoints, and integration settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="text-blue-500" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Configure external API connections and manage authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-blue-400 text-blue-600">
                  Coming Soon
                </Badge>
                <span className="font-medium">API Management</span>
              </div>
              <p className="text-sm text-blue-700">
                Comprehensive API management features will be available in Phase 3. 
                This will include API key management, rate limiting, and webhook configuration.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                <Key className="mr-2 h-4 w-4" />
                Manage API Keys
              </Button>
              <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Configure Webhooks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}