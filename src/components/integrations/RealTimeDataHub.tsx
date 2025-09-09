import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HardDrives, 
  Zap, 
  Activity, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw,
  Plug,
  Shield,
  Eye,
  Play,
  Pause,
  Download,
  Upload
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  dataTypes: string[];
  metrics: {
    recordsProcessed: number;
    successRate: number;
    avgLatency: number;
  };
  config?: any;
}

interface DataStream {
  id: string;
  name: string;
  source: string;
  target: string;
  status: 'active' | 'paused' | 'error';
  recordsPerMinute: number;
  lastUpdate: Date;
  dataTypes: string[];
}

const integrationTemplates = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Sync leads, opportunities, and contacts in real-time',
    category: 'CRM',
    icon: HardDrives,
    dataTypes: ['leads', 'opportunities', 'contacts', 'accounts'],
    fields: [
      { name: 'instanceUrl', label: 'Instance URL', type: 'url', required: true },
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'username', label: 'Username', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Bidirectional sync with HubSpot CRM and Marketing Hub',
    category: 'CRM',
    icon: Users,
    dataTypes: ['contacts', 'companies', 'deals', 'tickets'],
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'portalId', label: 'Portal ID', type: 'text', required: true }
    ]
  },
  {
    id: 'tableau',
    name: 'Tableau',
    description: 'Push sales data to Tableau for advanced analytics',
    category: 'Analytics',
    icon: BarChart3,
    dataTypes: ['sales_metrics', 'pipeline_data', 'performance_kpis'],
    fields: [
      { name: 'serverUrl', label: 'Server URL', type: 'url', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'siteId', label: 'Site ID', type: 'text', required: false }
    ]
  },
  {
    id: 'powerbi',
    name: 'Microsoft Power BI',
    description: 'Real-time dashboards and business intelligence',
    category: 'Analytics',
    icon: TrendingUp,
    dataTypes: ['sales_data', 'customer_metrics', 'revenue_analytics'],
    fields: [
      { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'workspaceId', label: 'Workspace ID', type: 'text', required: true }
    ]
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Financial data integration and invoice synchronization',
    category: 'Financial',
    icon: DollarSign,
    dataTypes: ['invoices', 'customers', 'payments', 'expenses'],
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'redirectUri', label: 'Redirect URI', type: 'url', required: true }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier Webhooks',
    description: 'Connect to 5000+ apps through Zapier automation',
    category: 'Automation',
    icon: Zap,
    dataTypes: ['webhook_events', 'automated_workflows'],
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      { name: 'secret', label: 'Secret Key', type: 'password', required: false }
    ]
  }
];

export const RealTimeDataHub: React.FC = () => {
  const [integrations, setIntegrations] = useKV<Integration[]>('data-integrations', []);
  const [dataStreams, setDataStreams] = useKV<DataStream[]>('data-streams', []);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configForm, setConfigForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDataStreams(current => 
        current.map(stream => ({
          ...stream,
          recordsPerMinute: Math.floor(Math.random() * 100) + 10,
          lastUpdate: new Date()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [setDataStreams]);

  const handleConfigureIntegration = (templateId: string) => {
    const template = integrationTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedIntegration(templateId);
    setConfigForm({});
    setIsConfiguring(true);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    const template = integrationTemplates.find(t => t.id === selectedIntegration);
    if (!template) return;

    const newIntegration: Integration = {
      id: selectedIntegration + '-' + Date.now(),
      name: template.name,
      description: template.description,
      category: template.category,
      status: 'connected',
      lastSync: new Date(),
      dataTypes: template.dataTypes,
      metrics: {
        recordsProcessed: Math.floor(Math.random() * 10000),
        successRate: 95 + Math.random() * 5,
        avgLatency: Math.floor(Math.random() * 200) + 50
      },
      config: configForm
    };

    setIntegrations(current => [...current, newIntegration]);

    // Create corresponding data streams
    const newStreams = template.dataTypes.map(dataType => ({
      id: `${selectedIntegration}-${dataType}-${Date.now()}`,
      name: `${template.name} - ${dataType}`,
      source: template.name,
      target: 'FulQrun CRM',
      status: 'active' as const,
      recordsPerMinute: Math.floor(Math.random() * 50) + 5,
      lastUpdate: new Date(),
      dataTypes: [dataType]
    }));

    setDataStreams(current => [...current, ...newStreams]);
    setIsConfiguring(false);
    setSelectedIntegration(null);
    toast.success(`${template.name} integration configured successfully`);
  };

  const handleToggleStream = (streamId: string) => {
    setDataStreams(current =>
      current.map(stream =>
        stream.id === streamId
          ? { ...stream, status: stream.status === 'active' ? 'paused' : 'active' }
          : stream
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'syncing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalRecordsPerMinute = dataStreams
    .filter(s => s.status === 'active')
    .reduce((sum, stream) => sum + stream.recordsPerMinute, 0);

  const activeIntegrations = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Real-Time Data Hub</h1>
          <p className="text-muted-foreground mt-2">
            Connect and sync data with CRM systems and business intelligence tools in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {totalRecordsPerMinute} records/min
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Plug className="w-4 h-4" />
            {activeIntegrations} active
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="streams">Data Streams</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                    <p className="text-2xl font-bold">{activeIntegrations}</p>
                  </div>
                  <Plug className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Streams</p>
                    <p className="text-2xl font-bold">{dataStreams.filter(s => s.status === 'active').length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Records/Min</p>
                    <p className="text-2xl font-bold">{totalRecordsPerMinute}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Data Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {dataStreams.slice(0, 10).map(stream => (
                    <div key={stream.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(stream.status)}
                        <div>
                          <p className="font-medium">{stream.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {stream.source} → {stream.target}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stream.recordsPerMinute}/min</p>
                        <p className="text-sm text-muted-foreground">
                          {stream.lastUpdate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Available Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>
                Connect to popular CRM systems and business intelligence tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrationTemplates.map(template => {
                  const Icon = template.icon;
                  const isConfigured = integrations.some(i => i.name === template.name);
                  
                  return (
                    <Card key={template.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="w-8 h-8 text-primary" />
                          {isConfigured && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.dataTypes.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleConfigureIntegration(template.id)}
                          disabled={isConfigured}
                          className="w-full"
                          variant={isConfigured ? "outline" : "default"}
                        >
                          {isConfigured ? "Configured" : "Configure"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configured Integrations */}
          {integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Configured Integrations</CardTitle>
                <CardDescription>
                  Manage your active data integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {integration.lastSync.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <p>{integration.metrics.recordsProcessed.toLocaleString()} records</p>
                          <p>{integration.metrics.successRate.toFixed(1)}% success rate</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Streams</CardTitle>
              <CardDescription>
                Monitor and control individual data streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataStreams.map(stream => (
                  <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(stream.status)}
                        <div>
                          <h4 className="font-medium">{stream.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stream.source} → {stream.target}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">{stream.recordsPerMinute} records/min</p>
                        <p className="text-muted-foreground">
                          Updated: {stream.lastUpdate.toLocaleTimeString()}
                        </p>
                      </div>
                      <Switch
                        checked={stream.status === 'active'}
                        onCheckedChange={() => handleToggleStream(stream.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Rate Limits</span>
                  <Progress value={65} className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <Progress value={42} className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queue Depth</span>
                  <Progress value={18} className="w-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Latency</span>
                  <span className="text-sm font-medium">125ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Throughput</span>
                  <span className="text-sm font-medium">{totalRecordsPerMinute}/min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm font-medium">1.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Data Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duplicate Rate</span>
                  <span className="text-sm font-medium">0.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Validation Rate</span>
                  <span className="text-sm font-medium">99.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completeness</span>
                  <span className="text-sm font-medium">97.8%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Log */}
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>
                Real-time monitoring of integration events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                      </Badge>
                      <span className="text-muted-foreground">
                        Data sync completed for Salesforce CRM - 245 records processed
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Integration</DialogTitle>
            <DialogDescription>
              {selectedIntegration && 
                integrationTemplates.find(t => t.id === selectedIntegration)?.description
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedIntegration && 
              integrationTemplates.find(t => t.id === selectedIntegration)?.fields.map(field => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={configForm[field.name] || ''}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    required={field.required}
                  />
                </div>
              ))
            }
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfiguring(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIntegration}>
              Configure Integration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};