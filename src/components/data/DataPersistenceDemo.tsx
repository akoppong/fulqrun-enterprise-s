/**
 * Data Persistence Demo Component
 * 
 * Demonstrates enterprise-grade data persistence with real-time updates,
 * backup/restore capabilities, and data health monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Shield,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { dataIntegration, type SyncResult, type DataHealthReport } from '@/lib/data-integration';
import { db } from '@/lib/database';
import { formatNumber, formatDistanceToNow } from '@/lib/utils';
import { toast } from 'sonner';

export function DataPersistenceDemo() {
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [healthReport, setHealthReport] = useState<DataHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [demoData, setDemoData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    opportunityTitle: '',
    opportunityValue: '',
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    loadHealthReport();
    
    // Subscribe to sync events
    const unsubscribe = dataIntegration.onDataSync((result) => {
      setSyncStatus(result);
      setLastActivity(new Date());
      if (result.success) {
        toast.success(`Data synced: ${result.recordsProcessed} records processed`);
      } else {
        toast.error(`Sync failed: ${result.errors.join(', ')}`);
      }
    });

    return unsubscribe;
  }, []);

  const loadHealthReport = async () => {
    try {
      const report = await dataIntegration.getDataHealthReport();
      setHealthReport(report);
    } catch (error) {
      console.error('Failed to load health report:', error);
    }
  };

  const handleForceSync = async () => {
    setLoading(true);
    try {
      const result = await dataIntegration.syncAllData();
      setSyncStatus(result);
      await loadHealthReport();
      
      if (result.success) {
        toast.success('Data synchronization completed successfully');
      } else {
        toast.error('Data synchronization failed');
      }
    } catch (error) {
      toast.error('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const result = await dataIntegration.createBackup();
      
      if (result.success) {
        toast.success(`Backup created: ${result.backupId}`);
        await loadHealthReport();
      } else {
        toast.error('Failed to create backup');
      }
    } catch (error) {
      toast.error('Backup creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoData = async () => {
    if (!demoData.companyName || !demoData.contactName) {
      toast.error('Please fill in at least company name and contact name');
      return;
    }

    setLoading(true);
    try {
      // Create company
      const company = await db.companies.create({
        name: demoData.companyName,
        industry: 'Technology',
        size: 'Medium',
        region: 'North America',
        country: 'United States',
        created_by: 'demo-user'
      });

      // Create contact
      const contact = await db.contacts.create({
        company_id: company.id,
        first_name: demoData.contactName.split(' ')[0] || demoData.contactName,
        last_name: demoData.contactName.split(' ')[1] || '',
        email: demoData.contactEmail || `${demoData.contactName.toLowerCase().replace(' ', '.')}@${demoData.companyName.toLowerCase().replace(' ', '')}.com`,
        region: 'North America',
        country: 'United States',
        is_primary: true,
        created_by: 'demo-user'
      });

      // Create opportunity if specified
      if (demoData.opportunityTitle) {
        const opportunity = await db.opportunities.create({
          title: demoData.opportunityTitle,
          company_id: company.id,
          primary_contact_id: contact.id,
          assigned_to: 'demo-user',
          value: parseFloat(demoData.opportunityValue) || 50000,
          currency: 'USD',
          stage: 'prospect',
          probability: 25,
          expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'demo',
          description: demoData.notes || 'Created via persistence demo',
          priority: 'medium',
          created_by: 'demo-user'
        });

        // Add a note if specified
        if (demoData.notes) {
          await db.notes.create({
            opportunity_id: opportunity.id,
            content: demoData.notes,
            type: 'general',
            is_private: false,
            created_by: 'demo-user'
          });
        }
      }

      // Force sync to ensure persistence
      await dataIntegration.syncAllData();
      await loadHealthReport();

      toast.success('Demo data created and persisted successfully!');
      
      // Clear form
      setDemoData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        opportunityTitle: '',
        opportunityValue: '',
        notes: ''
      });

    } catch (error) {
      console.error('Failed to create demo data:', error);
      toast.error('Failed to create demo data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Data Persistence</h1>
          <p className="text-muted-foreground">
            Demonstrate normalized database with real-time sync and enterprise-grade persistence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={healthReport?.overall === 'healthy' ? 'default' : 'destructive'}>
            {getStatusIcon(healthReport?.overall || 'unknown')}
            <span className="ml-1">{healthReport?.overall || 'checking...'}</span>
          </Badge>
          <Button
            onClick={handleForceSync}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Force Sync
          </Button>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Data Demo</TabsTrigger>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="sync">Sync Monitor</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Create Demo Data
              </CardTitle>
              <CardDescription>
                Create sample data to test persistence across page refreshes and sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={demoData.companyName}
                      onChange={(e) => setDemoData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g., Acme Technologies"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={demoData.contactName}
                      onChange={(e) => setDemoData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={demoData.contactEmail}
                      onChange={(e) => setDemoData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="opportunityTitle">Opportunity Title (Optional)</Label>
                    <Input
                      id="opportunityTitle"
                      value={demoData.opportunityTitle}
                      onChange={(e) => setDemoData(prev => ({ ...prev, opportunityTitle: e.target.value }))}
                      placeholder="e.g., Enterprise Software License"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opportunityValue">Opportunity Value (USD)</Label>
                    <Input
                      id="opportunityValue"
                      type="number"
                      value={demoData.opportunityValue}
                      onChange={(e) => setDemoData(prev => ({ ...prev, opportunityValue: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={demoData.notes}
                      onChange={(e) => setDemoData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional information..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleCreateDemoData}
                  disabled={loading || !demoData.companyName || !demoData.contactName}
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Create & Persist Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Persistence Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Data Persistence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">How to Test</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Create demo data using the form above</li>
                    <li>Navigate to Companies or Contacts to see your new data</li>
                    <li>Refresh the page - your data should persist</li>
                    <li>Close and reopen the browser tab - data still there</li>
                    <li>Monitor the sync status and health reports below</li>
                  </ol>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Enterprise Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>Normalized database with proper foreign key relationships</li>
                    <li>Automatic background synchronization every 5 minutes</li>
                    <li>Real-time data validation and error recovery</li>
                    <li>Comprehensive backup and restore capabilities</li>
                    <li>Health monitoring with proactive alerts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {healthReport && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Overall Health
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="mb-4">
                      {getStatusIcon(healthReport.overall)}
                    </div>
                    <Badge className={getStatusColor(healthReport.overall)}>
                      {healthReport.overall.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sync Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Last Sync</span>
                      <span>{healthReport.lastSync}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Backup</span>
                      <span>{healthReport.lastBackup}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Last activity: {formatDistanceToNow(lastActivity)} ago
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Table Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(healthReport.tables).map(([tableName, tableInfo]) => (
                      <div key={tableName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {tableName.replace('_', ' ')}
                          </span>
                          {getStatusIcon(tableInfo.status)}
                        </div>
                        <div className="text-lg font-bold">
                          {formatNumber(tableInfo.recordCount)}
                        </div>
                        <div className="text-xs text-muted-foreground">records</div>
                        {tableInfo.issues.length > 0 && (
                          <div className="mt-2">
                            {tableInfo.issues.map((issue, index) => (
                              <div key={index} className="text-xs text-red-600">{issue}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {healthReport.recommendations.length > 0 && (
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {healthReport.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Synchronization Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of data synchronization processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Sync Result</span>
                    <Badge variant={syncStatus.success ? 'default' : 'destructive'}>
                      {syncStatus.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Timestamp</div>
                      <div className="text-muted-foreground">
                        {new Date(syncStatus.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Records Processed</div>
                      <div className="text-muted-foreground">
                        {formatNumber(syncStatus.recordsProcessed)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Tables Updated</div>
                      <div className="text-muted-foreground">
                        {syncStatus.tablesUpdated.length}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Errors</div>
                      <div className="text-muted-foreground">
                        {syncStatus.errors.length}
                      </div>
                    </div>
                  </div>
                  {syncStatus.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium text-red-600">Errors:</div>
                      {syncStatus.errors.map((error, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="font-medium">Tables Updated:</div>
                    <div className="flex flex-wrap gap-2">
                      {syncStatus.tablesUpdated.map((table) => (
                        <Badge key={table} variant="outline">{table}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No sync data available. Click "Force Sync" to perform a manual synchronization.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Create Backup
                </CardTitle>
                <CardDescription>
                  Create a complete backup of all CRM data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Recovery Options
                </CardTitle>
                <CardDescription>
                  Restore from backup or recover corrupted data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" disabled className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Restore from Backup
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    Backup restoration feature available in production
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Automated Backups</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Daily automated backups</li>
                    <li>• Incremental backup support</li>
                    <li>• 30-day retention policy</li>
                    <li>• Encrypted backup storage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recovery Options</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Point-in-time recovery</li>
                    <li>• Selective data restoration</li>
                    <li>• Cross-environment migration</li>
                    <li>• Disaster recovery procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}