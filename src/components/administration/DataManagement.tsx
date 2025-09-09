import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  Archive,
  HardDrive,
  FileText,
  Shield
} from '@phosphor-icons/react';

interface DataManagementProps {
  hasAdminAccess: boolean;
}

export function DataManagement({ hasAdminAccess }: DataManagementProps) {
  const [backups] = useKV('system-backups', [
    { id: '1', name: 'Daily Backup', date: '2024-01-15T02:00:00', size: '2.4 GB', type: 'Automated', status: 'Completed' },
    { id: '2', name: 'Weekly Backup', date: '2024-01-14T01:00:00', size: '2.3 GB', type: 'Automated', status: 'Completed' },
    { id: '3', name: 'Manual Backup', date: '2024-01-13T15:30:00', size: '2.2 GB', type: 'Manual', status: 'Completed' }
  ]);

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive a download link via email.');
  };

  const handleCreateBackup = () => {
    toast.success('Manual backup started. This may take several minutes.');
  };

  const handleRestoreBackup = (backupId: string) => {
    toast.success(`Restoration from backup ${backupId} initiated.`);
  };

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to access data management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Data Management</h3>
        <p className="text-muted-foreground">
          Manage backups, data exports, and storage optimization
        </p>
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
            <p className="text-xs text-muted-foreground">+120MB this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup Storage</CardTitle>
            <Archive className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.1 GB</div>
            <p className="text-xs text-muted-foreground">7 backups available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8 GB</div>
            <p className="text-xs text-muted-foreground">Documents & media</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">Automated daily backup</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="exports">Data Export</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup Management</CardTitle>
                  <CardDescription>
                    View, create, and restore system backups
                  </CardDescription>
                </div>
                <Button onClick={handleCreateBackup}>
                  <Archive className="mr-2 h-4 w-4" />
                  Create Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup: any) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.name}</TableCell>
                        <TableCell>{new Date(backup.date).toLocaleString()}</TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          <Badge variant={backup.type === 'Automated' ? 'default' : 'secondary'}>
                            {backup.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreBackup(backup.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Export system data for compliance, migration, or analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Complete Data Export</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export all system data including users, deals, contacts, and settings
                  </p>
                  <Button onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Selective Export</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export specific data sets or date ranges
                  </p>
                  <Button variant="outline" disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    Custom Export (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>
                Monitor and optimize storage usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Storage Optimization</h4>
                    <Badge variant="outline">Healthy</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    System storage is optimized and running efficiently
                  </p>
                  <Button variant="outline" disabled>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Optimize Storage (Coming Soon)
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Storage Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Database Data</span>
                      <span>2.4 GB (60%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>File Uploads</span>
                      <span>1.2 GB (30%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>System Files</span>
                      <span>0.4 GB (10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}