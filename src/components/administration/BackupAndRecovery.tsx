import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Download, ArrowClockwise as RefreshCw } from '@phosphor-icons/react';

interface BackupAndRecoveryProps {
  hasAdminAccess: boolean;
}

export function BackupAndRecovery({ hasAdminAccess }: BackupAndRecoveryProps) {
  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to manage backup and recovery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Backup & Recovery</h3>
        <p className="text-muted-foreground">
          Configure automated backups and disaster recovery procedures
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="text-green-500" />
            Backup & Recovery Management
          </CardTitle>
          <CardDescription>
            Set up automated backups and configure recovery procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-green-400 text-green-600">
                  Coming Soon
                </Badge>
                <span className="font-medium">Advanced Backup Management</span>
              </div>
              <p className="text-sm text-green-700">
                Advanced backup and recovery features will be available in Phase 3. 
                This will include automated backup scheduling, point-in-time recovery, and disaster recovery procedures.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" disabled>
                <RefreshCw className="mr-2 h-4 w-4" />
                Schedule Backups
              </Button>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Recovery Tools
              </Button>
              <Button variant="outline" disabled>
                <HardDrive className="mr-2 h-4 w-4" />
                Storage Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}